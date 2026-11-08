import type { Config } from '@netlify/functions';
import { getUser, verifyRequestOrigin } from '@netlify/identity';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { randomBytes, createHash } from 'node:crypto';
import { z } from 'zod';
import { database } from '../../db/index';
import { profiles, bookmarks, aiUsage, telegramLinks } from '../../db/schema';
import { ensureProfile, membership, stripeClient, telegram } from '../../src/lib/server/services';
import { generateAI, pitchInput, gradeInput } from '../../src/lib/server/ai';
import { fetchLiveRedditPosts } from '../../src/lib/server/feed';

const categorySchema = z.enum(['all', 'react-nextjs', 'video-editing', 'ai-llm', 'ui-ux', 'python-backend', 'copywriting', 'virtual-assistant']);
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });

const handler = async (req: Request) => {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (req.method === 'POST') verifyRequestOrigin(req);
    const user = await getUser();
    if (!user) return json({ error: 'Please log in to use this feature.' }, 401);
    if (!user.confirmedAt) return json({ error: 'Confirm your email before continuing.' }, 403);
    const action = new URL(req.url).pathname.split('/').pop();
    const db = database();
    let profile = await ensureProfile(user.id, user.name || '');
    if (req.method === 'GET' && action === 'account') {
      const tier = await membership(profile);
      const saved = await db.select().from(bookmarks).where(eq(bookmarks.userId, user.id));
      const [usage] = await db.select().from(aiUsage).where(and(eq(aiUsage.userId, user.id), eq(aiUsage.day, new Date().toISOString().slice(0, 10))));
      return json({ profile: { name: profile.name, email: user.email || '', roleTitle: profile.roleTitle, portfolioUrl: profile.portfolioUrl, tier, isLoggedIn: true }, savedGigs: saved.map(s => s.gig), trialEndsAt: profile.trialEndsAt?.toISOString() || null, pitchesUsedToday: usage?.count || 0, dailyLimit: tier === 'free' ? 2 : 50 });
    }
    if (req.method === 'GET' && action === 'telegram') {
      const [link] = await db.select().from(telegramLinks).where(eq(telegramLinks.userId, user.id));
      return json({ connected: !!link?.chatId, category: link?.category || 'all', minBudget: link?.minBudget || 0, configured: !!process.env.TELEGRAM_BOT_TOKEN });
    }
    if (req.method !== 'POST') return json({ error: 'Unknown endpoint' }, 404);
    if (Number(req.headers.get('content-length') || 0) > 20000) return json({ error: 'Request too large' }, 413);
    const raw = await req.text();
    if (raw.length > 20000) return json({ error: 'Request too large' }, 413);
    const body = JSON.parse(raw);
    if (action === 'profile') {
      const input = z.object({ name: z.string().trim().min(1).max(120), roleTitle: z.string().trim().max(200), portfolioUrl: z.string().max(500).refine(u => !u || /^https?:\/\//i.test(u) && URL.canParse(u), 'Use an HTTP or HTTPS URL') }).parse(body);
      await db.update(profiles).set(input).where(eq(profiles.id, user.id));
      return json({ success: true });
    }
    if (action === 'bookmark') {
      const { id, save } = z.object({ id: z.string().max(150), save: z.boolean() }).parse(body);
      if (save) {
        // Store a source-fetched record rather than accepting fabricated client-side content.
        const gig = (await fetchLiveRedditPosts()).find(g => g.id === id);
        if (!gig) return json({ error: 'This post is no longer in the current source feed.' }, 404);
        await db.insert(bookmarks).values({ userId: user.id, gigId: id, gig }).onConflictDoNothing();
      } else await db.delete(bookmarks).where(and(eq(bookmarks.userId, user.id), eq(bookmarks.gigId, id)));
      return json({ success: true });
    }
    if (action === 'trial') {
      if (await membership(profile) === 'pro') return json({ error: 'Your Pro subscription is already active.' }, 409);
      const result = await db.update(profiles).set({ trialEndsAt: new Date(Date.now() + 3 * 86400000) }).where(and(eq(profiles.id, user.id), isNull(profiles.trialEndsAt))).returning();
      if (!result.length) return json({ error: 'This account has already used its trial.' }, 409);
      return json({ success: true });
    }
    if (action === 'checkout') {
      const { cycle } = z.object({ cycle: z.enum(['monthly', 'annual']) }).parse(body);
      const stripe = stripeClient();
      if (await membership(profile) === 'pro') return json({ error: 'You already have a subscription. Use Manage billing.' }, 409);
      if (!profile.stripeCustomerId) {
        const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } }, { idempotencyKey: `customer-${user.id}` });
        [profile] = await db.update(profiles).set({ stripeCustomerId: customer.id }).where(eq(profiles.id, user.id)).returning();
      }
      const origin = new URL(req.url).origin;
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription', customer: profile.stripeCustomerId!, client_reference_id: user.id,
        line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: cycle === 'annual' ? 29000 : 2900, recurring: { interval: cycle === 'annual' ? 'year' : 'month' }, product_data: { name: 'GigMad Pro' } } }],
        subscription_data: { metadata: { userId: user.id } },
        success_url: `${origin}/dashboard?checkout_session={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/pricing?cancelled=1`,
      }, { idempotencyKey: `checkout-${user.id}-${cycle}-${Math.floor(Date.now() / 300000)}` });
      return json({ url: session.url });
    }
    if (action === 'confirm-checkout') {
      const { sessionId } = z.object({ sessionId: z.string().startsWith('cs_').max(300) }).parse(body);
      const stripe = stripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.client_reference_id !== user.id || session.customer !== profile.stripeCustomerId || session.status !== 'complete' || session.payment_status !== 'paid' || typeof session.subscription !== 'string') return json({ error: 'Payment is not yet confirmed.' }, 409);
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      if (subscription.status !== 'active' || subscription.metadata.userId !== user.id) return json({ error: 'The subscription is not active.' }, 409);
      await db.update(profiles).set({ stripeSubscriptionId: subscription.id }).where(eq(profiles.id, user.id));
      return json({ success: true });
    }
    if (action === 'billing-portal') {
      if (!profile.stripeCustomerId) return json({ error: 'No billing account exists yet.' }, 404);
      const stripe = stripeClient();
      const configurations = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
      let portalConfig = configurations.data.find(c => c.metadata?.app === 'gigmad');
      if (!portalConfig) portalConfig = await stripe.billingPortal.configurations.create({
        metadata: { app: 'gigmad' },
        business_profile: { headline: 'Manage your GigMad subscription' },
        features: { subscription_cancel: { enabled: true, mode: 'at_period_end' }, invoice_history: { enabled: true }, payment_method_update: { enabled: true } },
      });
      const portal = await stripe.billingPortal.sessions.create({ customer: profile.stripeCustomerId, configuration: portalConfig.id, return_url: `${new URL(req.url).origin}/dashboard` });
      return json({ url: portal.url });
    }
    if (action === 'telegram-disconnect') {
      await db.delete(telegramLinks).where(eq(telegramLinks.userId, user.id));
      return json({ success: true });
    }
    if (action === 'telegram-connect') {
      const input = z.object({ category: categorySchema, minBudget: z.number().int().min(0).max(1000000) }).parse(body);
      const bot = await telegram<{ username: string }>('getMe', {});
      const token = randomBytes(24).toString('hex');
      const values = { ...input, tokenHash: createHash('sha256').update(token).digest('hex'), tokenExpiresAt: new Date(Date.now() + 15 * 60000), chatId: null, linkedAt: null };
      await db.insert(telegramLinks).values({ userId: user.id, ...values }).onConflictDoUpdate({ target: telegramLinks.userId, set: values });
      return json({ url: `https://t.me/${bot.username}?start=${token}` });
    }
    if (action === 'pitch' || action === 'grade-pitch') {
      const input = action === 'pitch' ? pitchInput.parse(body) : gradeInput.parse(body);
      const tier = await membership(profile);
      const limit = tier === 'free' ? 2 : 50;
      const day = new Date().toISOString().slice(0, 10);
      const reserved = await db.insert(aiUsage).values({ userId: user.id, day, count: 1 }).onConflictDoUpdate({ target: [aiUsage.userId, aiUsage.day], set: { count: sql`${aiUsage.count} + 1` }, setWhere: sql`${aiUsage.count} < ${limit}` }).returning();
      if (!reserved.length) return json({ error: `Daily AI limit reached (${limit} requests). Try again tomorrow (UTC).` }, 429);
      try { return json(await generateAI(action, input, profile)); }
      catch {
        await db.update(aiUsage).set({ count: sql`GREATEST(0, ${aiUsage.count} - 1)` }).where(and(eq(aiUsage.userId, user.id), eq(aiUsage.day, day)));
        return json({ error: 'AI could not complete this request. Please try again; this request was not counted.' }, 502);
      }
    }
    return json({ error: 'Unknown endpoint' }, 404);
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ error: 'Please check the submitted fields.' }, 400);
    // Provider errors may contain credential-bearing request URLs. Never expose or log them.
    return json({ error: 'The service is unavailable. Please try again later.' }, 503);
  }
};
export default handler;
export const config: Config = { path: '/api/services/:action' };

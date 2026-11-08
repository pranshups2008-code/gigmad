import type { Config } from '@netlify/functions';
import { and, eq, isNotNull } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import { database } from '../../db/index';
import { telegramLinks, telegramDeliveries, serviceState } from '../../db/schema';
import { telegram } from '../../src/lib/server/services';
import { fetchLiveRedditPosts } from '../../src/lib/server/feed';

type Update = { update_id: number; message?: { text?: string; chat: { id: number; type: string } } };
const handler = async () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) return new Response('Telegram is not configured', { status: 503 });
  const db = database();
  try {
    const [state] = await db.select().from(serviceState).where(eq(serviceState.key, 'telegram_offset'));
    const updates = await telegram<Update[]>('getUpdates', { offset: Number(state?.value || 0), limit: 100, timeout: 0, allowed_updates: ['message'] });
    for (const update of updates) {
      const message = update.message;
      const token = message?.text?.match(/^\/start(?:@\w+)? ([a-f0-9]{48})$/)?.[1];
      if (token && message?.chat.type === 'private') {
        const hash = createHash('sha256').update(token).digest('hex');
        const [link] = await db.select().from(telegramLinks).where(eq(telegramLinks.tokenHash, hash));
        const [occupied] = await db.select().from(telegramLinks).where(eq(telegramLinks.chatId, String(message.chat.id)));
        if (link?.tokenExpiresAt && link.tokenExpiresAt > new Date() && (!occupied || occupied.userId === link.userId)) {
          // Consume the one-time token only after Telegram confirms the private chat.
          await db.update(telegramLinks).set({ chatId: String(message.chat.id), tokenHash: null, tokenExpiresAt: null, linkedAt: new Date() }).where(and(eq(telegramLinks.userId, link.userId), eq(telegramLinks.tokenHash, hash)));
        }
      }
      await db.insert(serviceState).values({ key: 'telegram_offset', value: String(update.update_id + 1) }).onConflictDoUpdate({ target: serviceState.key, set: { value: String(update.update_id + 1) } });
    }
    const links = await db.select().from(telegramLinks).where(isNotNull(telegramLinks.chatId));
    if (!links.length) return new Response('No connected chats');
    const gigs = await fetchLiveRedditPosts();
    let delivered = 0;
    for (const link of links) {
      const matches = gigs.filter(g => (link.category === 'all' || g.category === link.category) && g.budgetNumeric >= link.minBudget && link.linkedAt && g.postedAt && Date.parse(g.postedAt) >= link.linkedAt.getTime());
      for (const gig of matches) {
        // A unique database key prevents repeat delivery on subsequent scans.
        const claim = await db.insert(telegramDeliveries).values({ userId: link.userId, gigId: gig.id }).onConflictDoNothing().returning();
        if (!claim.length) continue;
        try {
          await telegram('sendMessage', { chat_id: link.chatId, text: `${gig.title}\n${gig.budget}\nPosted by ${gig.authorName}\n${gig.originalUrl}`, link_preview_options: { is_disabled: true } });
          delivered++;
        } catch {
          await db.delete(telegramDeliveries).where(and(eq(telegramDeliveries.userId, link.userId), eq(telegramDeliveries.gigId, gig.id)));
        }
        if (delivered >= 20) return new Response('Batch completed');
      }
    }
    return new Response('Scan completed');
  } catch {
    return new Response('Source or Telegram temporarily unavailable', { status: 503 });
  }
};
export default handler;
export const config: Config = { schedule: '*/5 * * * *' };

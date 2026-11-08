import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { z } from 'zod';
import { createRequire } from 'node:module';
const loadPackage = createRequire(import.meta.url);

function load(file, dependencies = {}, extras = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { exports, require: name => name in dependencies ? dependencies[name] : loadPackage(name), Response, Request, URL, AbortSignal, Buffer, process: { env: {} }, console, ...extras });
  return exports;
}
function api(overrides = {}) {
  let writes = 0;
  const profile = { id: 'owner', name: 'Account owner', roleTitle: '', portfolioUrl: '', stripeCustomerId: 'customer', trialEndsAt: null };
  const db = {
    update: () => { writes++; return { set: () => ({ where: () => ({ returning: async () => overrides.trialRows || [] }) }) }; },
    insert: () => ({ values: () => ({ onConflictDoUpdate: () => ({ returning: async () => [] }) }) }),
  };
  const tables = new Proxy({}, { get: (_, name) => new Proxy({}, { get: (_, field) => `${String(name)}.${String(field)}` }) });
  const handler = load('netlify/functions/services.mts', {
    '@netlify/identity': { getUser: async () => overrides.user === undefined ? { id: 'owner', confirmedAt: 'confirmed' } : overrides.user, verifyRequestOrigin: () => { if (overrides.badOrigin) throw new Response('Forbidden', { status: 403 }); } },
    'drizzle-orm': { and: (...args) => args, eq: (...args) => args, isNull: x => x, sql: () => '' },
    '../../db/index': { database: () => db }, '../../db/schema': tables,
    '../../src/lib/server/services': { ensureProfile: async () => profile, membership: async () => 'free', stripeClient: () => ({ checkout: { sessions: { retrieve: async () => overrides.session } }, subscriptions: { retrieve: async () => ({ id: 'subscription', status: 'active', metadata: { userId: 'owner' } }) } }) },
    '../../src/lib/server/ai': { pitchInput: z.object({ title: z.string() }), gradeInput: z.object({ pitchText: z.string().min(15) }), generateAI: () => { throw new Error('Must not invoke AI without quota'); } },
    '../../src/lib/server/feed': {},
  }).default;
  return { request: (action, body = {}, method = 'POST') => handler(new Request(`https://example.com/api/services/${action}`, { method, headers: { Origin: 'https://example.com' }, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}) })), writes: () => writes };
}

test('unauthenticated callers cannot access account data or write profiles', async () => {
  const app = api({ user: null });
  assert.equal((await app.request('account', {}, 'GET')).status, 401);
  assert.equal((await app.request('profile', { name: 'Impersonation' })).status, 401);
  assert.equal(app.writes(), 0);
});
test('unconfirmed accounts and cross-origin mutations fail closed', async () => {
  assert.equal((await api({ user: { id: 'owner' } }).request('trial')).status, 403);
  assert.equal((await api({ badOrigin: true }).request('trial')).status, 403);
});
test('used trials cannot be restarted', async () => {
  assert.equal((await api().request('trial')).status, 409);
  assert.equal((await api({ trialRows: [{}] }).request('trial')).status, 200);
});
test('AI is not invoked after the atomic quota reservation fails', async () => {
  assert.equal((await api().request('pitch', { title: 'A real source title' })).status, 429);
});
test('checkout cannot activate another account or an unpaid subscription', async () => {
  for (const session of [
    { client_reference_id: 'someone-else', customer: 'customer', status: 'complete', payment_status: 'paid', subscription: 'subscription' },
    { client_reference_id: 'owner', customer: 'customer', status: 'complete', payment_status: 'unpaid', subscription: 'subscription' },
  ]) {
    const app = api({ session });
    assert.equal((await app.request('confirm-checkout', { sessionId: 'cs_example' })).status, 409);
    assert.equal(app.writes(), 0);
  }
});
test('confirmed ownership and paid active subscription allow activation', async () => {
  const app = api({ session: { client_reference_id: 'owner', customer: 'customer', status: 'complete', payment_status: 'paid', subscription: 'subscription' } });
  assert.equal((await app.request('confirm-checkout', { sessionId: 'cs_example' })).status, 200);
  assert.equal(app.writes(), 1);
});
test('invalid profile URLs are rejected without writes', async () => {
  const app = api();
  assert.equal((await app.request('profile', { name: 'Account owner', roleTitle: '', portfolioUrl: 'javascript:alert(1)' })).status, 400);
  assert.equal(app.writes(), 0);
});

const fixture = { id: 'abc123', title: '[Hiring] React developer', selftext: 'Please share your portfolio.', author: 'source_author', permalink: '/r/forhire/comments/abc123/react_developer/', created_utc: Math.floor(Date.now()/1000) };
test('feed keeps real source links, excludes offers and deleted posts, invents no budget or verification', async () => {
  const feed = load('src/lib/server/feed.ts', {}, { fetch: async () => ({ ok: true, json: async () => ({ data: { children: [fixture, { ...fixture, title: '[For Hire] Developer' }, { ...fixture, author: '[deleted]' }].map(data => ({ data })) } }) }) });
  const gigs = await feed.fetchLiveRedditPosts();
  assert.equal(gigs.length, 1);
  assert.equal(gigs[0].originalUrl, 'https://www.reddit.com' + fixture.permalink);
  assert.equal(gigs[0].budgetNumeric, 0);
  assert.equal(gigs[0].budgetType, 'unknown');
  assert.equal(gigs[0].isVerifiedClient, false);
  assert.equal(gigs[0].requiredSkills.length, 0);
});
test('feed preserves stated hourly amounts without converting to a project total', async () => {
  const feed = load('src/lib/server/feed.ts', {}, { fetch: async () => ({ ok: true, json: async () => ({ data: { children: [{ data: { ...fixture, selftext: 'Budget: $25/hr' } }] } }) }) });
  const [gig] = await feed.fetchLiveRedditPosts();
  assert.equal(gig.budget, '$25/hr'); assert.equal(gig.budgetNumeric, 25); assert.equal(gig.budgetType, 'hourly');
});
test('empty source stays empty and upstream failures cannot generate fallback listings', async () => {
  const empty = load('src/lib/server/feed.ts', {}, { fetch: async () => ({ ok: true, json: async () => ({ data: { children: [] } }) }) });
  assert.equal((await empty.fetchLiveRedditPosts()).length, 0);
  const failed = load('src/lib/server/feed.ts', {}, { fetch: async () => ({ ok: false }) });
  await assert.rejects(() => failed.fetchLiveRedditPosts(), /unavailable/);
});

'use client';
import { useEffect, useState } from 'react';
import { service } from '@/lib/api';
export function TelegramAlertIntegration({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [connected, setConnected] = useState(false);
  const [category, setCategory] = useState('all');
  const [minBudget, setMinBudget] = useState(0);
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const status = await service<{ connected: boolean; category: string; minBudget: number }>('telegram');
    setConnected(status.connected); setCategory(status.category); setMinBudget(status.minBudget);
  }
  useEffect(() => {
    if (!isLoggedIn) return;
    const initial = setTimeout(() => { refresh().catch(() => setError('Unable to check your Telegram connection.')); }, 0);
    const timer = setInterval(() => { refresh().catch(() => {}); }, 15000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, [isLoggedIn]);
  async function connect() {
    setBusy(true); setError('');
    try { const data = await service<{ url: string }>('telegram-connect', { category, minBudget }); setLink(data.url); setConnected(false); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to connect Telegram.'); }
    finally { setBusy(false); }
  }
  return <section className="space-y-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-6"><h2 className="text-lg font-bold">Telegram alerts</h2><p className="text-sm text-zinc-400">{!isLoggedIn ? 'Log in to connect your Telegram account.' : connected ? 'Your private Telegram chat is connected. Only new matching source posts trigger alerts.' : 'Open the bot link and press Start to confirm your private chat. Connection checks run every five minutes on the production site.'}</p>
    {isLoggedIn && <><div className="flex flex-wrap gap-3"><label className="text-sm">Category<select disabled={connected} value={category} onChange={e => setCategory(e.target.value)} className="ml-2 rounded-lg bg-zinc-950 p-2">{[['all', 'All fields'], ['react-nextjs', 'React & Next.js'], ['video-editing', 'Video editing'], ['ai-llm', 'AI & LLMs'], ['ui-ux', 'UI/UX design'], ['python-backend', 'Python & backend'], ['copywriting', 'Copywriting'], ['virtual-assistant', 'Virtual assistant']].map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label className="text-sm">Minimum stated $ amount<input disabled={connected} type="number" min={0} max={1000000} value={minBudget} onChange={e => setMinBudget(Number(e.target.value))} className="ml-2 w-24 rounded-lg bg-zinc-950 p-2" /></label></div>
    {connected ? <button className="text-emerald-300 underline" onClick={async () => { try { await service('telegram-disconnect', {}); setConnected(false); setLink(''); } catch { setError('Unable to disconnect. Please try again.'); } }}>Disconnect / change filters</button> : <button disabled={busy} onClick={() => void connect()} className="rounded-xl bg-emerald-400 px-4 py-2 font-bold text-zinc-950">{busy ? 'Connecting…' : 'Get bot connection link'}</button>}
    {link && !connected && <p className="text-sm"><a className="text-emerald-300 underline" href={link} target="_blank" rel="noreferrer">Open Telegram and press Start</a><span className="text-zinc-400"> — Link expires in 15 minutes. Waiting for confirmation…</span></p>}</>}
    {error && <p role="alert" className="text-sm text-amber-300">{error}</p>}
  </section>;
}

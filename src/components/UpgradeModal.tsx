'use client';
import { useState } from 'react';
import { service } from '@/lib/api';
import type { UserTier } from '@/lib/types';

export function UpgradeModal({ isOpen, onClose, onSuccessUpgrade }: { isOpen: boolean; onClose: () => void; onSuccessUpgrade: (tier: UserTier) => void }) {
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  async function act(action: 'checkout' | 'trial' | 'billing-portal') {
    setBusy(true); setError('');
    try {
      const data = await service<{ url?: string }>(action, { cycle });
      if (data.url) window.location.assign(data.url);
      else { onSuccessUpgrade('trial'); onClose(); }
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to complete this request.'); }
    finally { setBusy(false); }
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/90 p-4"><section role="dialog" aria-modal="true" aria-label="Membership" className="w-full max-w-lg space-y-5 rounded-3xl border border-zinc-700 bg-zinc-900 p-7">
    <div className="flex justify-between"><h2 className="text-2xl font-bold">GigMad Pro</h2><button onClick={onClose} aria-label="Close">✕</button></div>
    <p className="text-zinc-300">50 AI requests per day, shared between pitch drafts and reviews. All plans include source links, saved gigs, and Telegram alerts for new matching posts.</p>
    <label className="block">Billing<select value={cycle} onChange={e => setCycle(e.target.value as 'monthly' | 'annual')} className="mt-2 w-full rounded-xl bg-zinc-950 p-3"><option value="monthly">$29 USD per month</option><option value="annual">$290 USD per year</option></select></label>
    <p className="text-sm text-zinc-400">Subscriptions renew until cancelled. Checkout shows the final amount. A three-day trial is available once per account without a card and does not renew automatically.</p>
    <p role="alert" className="text-sm text-amber-300">{error}</p>
    <button disabled={busy} onClick={() => void act('checkout')} className="w-full rounded-xl bg-emerald-400 p-3 font-bold text-zinc-950 disabled:opacity-50">{busy ? 'Working…' : 'Continue to secure checkout'}</button>
    <button disabled={busy} onClick={() => void act('trial')} className="w-full rounded-xl border border-zinc-600 p-3">Start three-day trial</button>
    <button disabled={busy} onClick={() => void act('billing-portal')} className="w-full text-sm text-emerald-300 underline">Manage billing or cancel subscription</button>
  </section></div>;
}

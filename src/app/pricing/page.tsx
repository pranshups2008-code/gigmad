'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UpgradeModal } from '@/components/UpgradeModal';
import { AuthModal } from '@/components/AuthModal';
import { getUser } from '@netlify/identity';

export default function PricingPage() {
  const router = useRouter();
  const [upgrade, setUpgrade] = useState(false);
  const [auth, setAuth] = useState(false);
  return <main className="mx-auto w-full max-w-4xl space-y-8 px-5 py-16"><Link href="/dashboard" className="text-emerald-300">← Back to dashboard</Link><h1 className="text-4xl font-bold">Choose your membership</h1><p className="text-zinc-400">Browse actual source posts. Pay for more AI requests when you need them.</p>
    <div className="grid gap-5 sm:grid-cols-2"><section className="space-y-4 rounded-3xl border border-zinc-700 bg-zinc-900 p-7"><h2 className="text-2xl font-bold">Free</h2><p className="text-3xl">$0</p><ul className="space-y-2 text-zinc-300"><li>Reddit hiring posts with exact source links</li><li>Profile and saved gigs</li><li>2 AI requests per day</li><li>Telegram alerts for new matching posts</li></ul><Link className="inline-block rounded-xl border border-zinc-600 px-5 py-3" href="/dashboard">Open dashboard</Link></section>
    <section className="space-y-4 rounded-3xl border border-emerald-600 bg-zinc-900 p-7"><h2 className="text-2xl font-bold">Pro</h2><p className="text-3xl">$29 <span className="text-sm">USD / month</span></p><p className="text-zinc-400">Or $290 USD / year</p><ul className="space-y-2 text-zinc-300"><li>Everything in Free</li><li>50 AI requests per day</li><li>Three-day trial, once per account</li><li>Manage or cancel through Stripe</li></ul><button onClick={async () => { if (await getUser()) setUpgrade(true); else setAuth(true); }} className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-zinc-950">Choose Pro</button></section></div>
    <p className="text-sm text-zinc-400">AI drafts and reviews share the daily limit, which resets at midnight UTC. AI feedback is subjective; it does not predict client responses. The feed checks Reddit once per minute while open. Telegram checks every five minutes on the production site. Source availability and hiring status can change.</p>
    <AuthModal isOpen={auth} onClose={() => setAuth(false)} onAuthSuccess={() => { setAuth(false); setUpgrade(true); }} />
    <UpgradeModal isOpen={upgrade} onClose={() => setUpgrade(false)} onSuccessUpgrade={() => router.push('/dashboard')} />
  </main>;
}

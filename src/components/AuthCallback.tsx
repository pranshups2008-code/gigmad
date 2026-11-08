'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleAuthCallback, acceptInvite, updateUser } from '@netlify/identity';

export function AuthCallback() {
  const router = useRouter();
  const [pending, setPending] = useState<{ type: string; token?: string } | null>(null);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    handleAuthCallback().then(result => {
      if (!result) return;
      if (result.type === 'invite' || result.type === 'recovery') setPending({ type: result.type, token: result.token });
      else router.replace('/dashboard');
    }).catch(() => setMessage('This account link could not be completed. Request a new link from the login form.'));
  }, [router]);
  if (!pending && !message) return null;
  async function complete(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      if (pending?.type === 'invite' && pending.token) await acceptInvite(pending.token, password);
      else await updateUser({ password });
      setPending(null); router.replace('/dashboard');
    } catch { setMessage('Unable to set your password. Request a new account link.'); }
    finally { setBusy(false); }
  }
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-zinc-950/95 p-5"><section className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-6"><h2 className="text-xl font-bold">Complete your account</h2>{pending && <form onSubmit={complete} className="space-y-4"><label>Choose a password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg bg-zinc-950 p-3" /></label><button disabled={busy} className="rounded-lg bg-emerald-400 p-3 text-zinc-950">{busy ? 'Saving…' : 'Save password'}</button></form>}<p role="status">{message}</p><a href="/dashboard" className="text-emerald-300">Return to dashboard</a></section></div>;
}

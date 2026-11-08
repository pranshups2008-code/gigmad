'use client';
import { useEffect, useState } from 'react';
import { getSettings, signup, login, getUser, oauthLogin, requestPasswordRecovery, type Settings, type AuthProvider } from '@netlify/identity';
import { service } from '@/lib/api';
import type { UserProfile } from '@/lib/types';

export function AuthModal({ isOpen, onClose, onAuthSuccess }: { isOpen: boolean; onClose: () => void; onAuthSuccess: (profile: UserProfile) => void }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { if (isOpen) { getSettings().then(setSettings).catch(() => setMessage('Account service is unavailable. Please try again later.')); } }, [isOpen]);
  if (!isOpen) return null;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      if (mode === 'reset') { await requestPasswordRecovery(email); setMessage('If this account exists, a password reset email is on its way.'); return; }
      if (mode === 'signup') {
        await signup(email, password, { full_name: name });
        if (!(await getUser())) { setMessage('Check your email to confirm your account, then log in.'); return; }
      } else await login(email, password);
      const account = await service<{ profile: UserProfile }>('account');
      onAuthSuccess(account.profile); onClose();
    } catch { setMessage('Unable to complete this request. Check your details and email confirmation, then try again.'); }
    finally { setBusy(false); }
  }
  const input = 'w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm';
  return <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/90 p-4"><section role="dialog" aria-modal="true" aria-label="Account" className="w-full max-w-md space-y-4 rounded-3xl border border-zinc-700 bg-zinc-900 p-7">
    <div className="flex justify-between"><h2 className="text-xl font-bold">{mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset password' : 'Log in'}</h2><button onClick={onClose} aria-label="Close">✕</button></div>
    <form onSubmit={submit} className="space-y-3">
      {mode === 'signup' && <label className="block text-sm">Name<input className={input} value={name} onChange={e => setName(e.target.value)} maxLength={120} required autoComplete="name" /></label>}
      <label className="block text-sm">Email<input className={input} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></label>
      {mode !== 'reset' && <label className="block text-sm">Password<input className={input} type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label>}
      <button disabled={busy || !settings || (mode === 'signup' && settings.disableSignup)} className="w-full rounded-xl bg-emerald-400 p-3 font-bold text-zinc-950 disabled:opacity-50">{busy ? 'Working…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset email' : 'Log in'}</button>
    </form>
    <p role="status" className="text-sm text-amber-300">{message}</p>
    <div className="flex flex-wrap gap-4 text-sm text-emerald-300"><button onClick={() => { setMode('login'); setMessage(''); }}>Log in</button>{settings && !settings.disableSignup && <button onClick={() => { setMode('signup'); setMessage(''); }}>Sign up</button>}<button onClick={() => { setMode('reset'); setMessage(''); }}>Forgot password</button></div>
    {settings && Object.entries(settings.providers).filter(([provider, enabled]) => enabled && provider !== 'email').map(([provider]) => <button className={input} key={provider} onClick={() => oauthLogin(provider as AuthProvider)}>Continue with {provider}</button>)}
  </section></div>;
}

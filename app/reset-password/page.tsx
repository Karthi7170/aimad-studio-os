'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { browserSupabase } from '@/lib/supabase/client';
export default function ResetPassword() {
  const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (password.length < 10) { setMessage('Use at least 10 characters.'); return; }
    setBusy(true); const { error } = await browserSupabase().auth.updateUser({ password });
    setBusy(false); if (error) setMessage(error.message); else { setMessage('Password updated. Redirecting…'); router.replace('/'); router.refresh(); }
  }
  return <main className="login-page"><form className="login-card" onSubmit={submit}><div className="brandLogo">AI × MAD</div><h1>Set new password</h1><p>Secure your new Studio OS account.</p><label htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" minLength={10} required value={password} onChange={e=>setPassword(e.target.value)}/>{message&&<p role="status" className="form-message">{message}</p>}<button disabled={busy} type="submit" className="primary-btn">{busy?'Updating…':'Save password'}</button></form></main>;
}

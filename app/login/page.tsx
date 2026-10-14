'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Mail, LockKeyhole } from 'lucide-react';
import { browserSupabase } from '@/lib/supabase/client';
import { configured } from '@/lib/supabase/config';
export default function Login() {
 const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
 const [busy, setBusy] = useState(false); const [reset, setReset] = useState(false); const [message, setMessage] = useState('');
 const router=useRouter();
 async function submit(e:React.FormEvent) {
   e.preventDefault(); setBusy(true); setMessage('');
   try {const client=browserSupabase();
    if (reset) {
     const base = window.location.origin;
     const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:base+'/auth/callback?next=/reset-password'});
     if(error) throw error;setMessage('If this email is registered, a password reset link has been sent.');
    } else {
     const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;
     router.replace('/');router.refresh();
    }
   } catch(e){setMessage(e instanceof Error?e.message:'Unable to continue');}
   finally{setBusy(false)}
 }
 return <main className="login-page"><div className="login-decoration" aria-hidden="true"/><form className="login-card" onSubmit={submit}>
    <div className="login-emblem">AM</div><div className="brandLogo">AI × MAD <span>STUDIO OS</span></div><div className="mini">PRIVATE WORKSPACE • SECURE ACCESS</div>
    <h1>{reset?'Recover access':'Welcome back.'}</h1><p>{reset?'Enter your account email to receive a recovery link.':'Manage leads, quotes and projects from one powerful workspace.'}</p>
    <label htmlFor="email"><Mail size={15}/> Business email</label><input id="email" type="email" inputMode="email" autoComplete="email" placeholder="you@business.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
    {!reset&&<><label htmlFor="password"><LockKeyhole size={15}/> Password</label><input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required/></>}
    {message&&<div role="status" className="form-message">{message}</div>}
    {!configured()&&<div className="form-message">Supabase credentials are not connected yet. Configure them before signing in.</div>}
    <button className="primary-btn login-submit" type="submit" disabled={busy||!configured()}>{busy?'Please wait…':reset?'Send recovery link':'Sign in to Studio OS'}<ArrowRight size={17}/></button>
    <button type="button" className="text-button" onClick={()=>{setReset(v=>!v);setMessage('')}}>{reset?'Back to sign in':'Forgot password?'}</button>
    <div className="login-note"><ShieldCheck size={17}/> Your business data is visible only to your account.</div>
    <div className="login-footer">Built for <strong>AI x MAD Studio</strong></div>
  </form></main>
}

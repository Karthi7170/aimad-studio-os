'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Mail, LockKeyhole } from 'lucide-react';
import { authClient } from '@/lib/auth/client';

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(''); const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const router=useRouter();
  const goHome = () => { router.replace('/'); router.refresh(); };
  async function submit(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      if (mode === 'otp') {
        if (!otpSent) {
          const {error} = await authClient.emailOtp.sendVerificationOtp({email, type:'sign-in'});
          if(error) throw error;setOtpSent(true);setMessage('Check your inbox for the one-time sign-in code.');
        } else {
          const {error} = await authClient.signIn.emailOtp({email, otp});
          if(error) throw error;goHome();
        }
      } else {
        const {error} = await authClient.signIn.email({email,password});
        if(error) throw error;goHome();
      }
    } catch(e){setMessage(e instanceof Error ? e.message : 'Unable to sign in.');}
    finally{setBusy(false)}
  }
  async function signInGoogle() {
    setBusy(true);setMessage('');
    try {
      const {error} = await authClient.signIn.social({provider:'google',callbackURL:window.location.origin+'/'});
      if(error) throw error;
    } catch(e){setMessage(e instanceof Error ? e.message:'Google sign-in is unavailable.');setBusy(false)}
  }
  return <main className="login-page"><div className="login-decoration" aria-hidden="true"/><form className="login-card" onSubmit={submit}>
    <div className="login-emblem">AM</div><div className="brandLogo">AI × MAD <span>STUDIO OS</span></div><div className="mini">PRIVATE WORKSPACE • SECURE ACCESS</div>
    <h1>Welcome back.</h1><p>Manage leads, quotations and client projects from your private studio workspace.</p>
    <label htmlFor="email"><Mail size={15}/> Business email</label><input id="email" type="email" inputMode="email" autoComplete="email" placeholder="you@business.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
    {mode==='password' ? <><label htmlFor="password"><LockKeyhole size={15}/> Password</label><input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required/></> :
    otpSent ? <><label htmlFor="otp">Email verification code</label><input id="otp" type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" minLength={4} maxLength={10} value={otp} onChange={e=>setOtp(e.target.value)} required/></> : null}
    {message&&<div role="status" className="form-message">{message}</div>}
    <button className="primary-btn login-submit" type="submit" disabled={busy}>{busy?'Please wait…':mode==='otp' ? otpSent?'Verify & sign in':'Email me a sign-in code':'Sign in to Studio OS'}<ArrowRight size={17}/></button>
    <button type="button" className="text-button" onClick={()=>{setMode(x=>x==='password'?'otp':'password');setOtpSent(false);setMessage('')}}>{mode==='password'?'Sign in with an email code':'Use password instead'}</button>
    <button type="button" className="outline-btn login-submit" onClick={()=>void signInGoogle()} disabled={busy}>Continue with Google</button>
    <div className="login-note"><ShieldCheck size={17}/> Only the designated studio owner can access client records.</div>
    <div className="login-footer">Built for <strong>AI x MAD Studio</strong></div>
  </form></main>;
}

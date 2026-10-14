import { NextResponse, type NextRequest } from 'next/server';
import { requireOwner, configured } from '@/lib/auth/server';
import { getSql } from '@/lib/db';
import type { Kind } from '@/lib/types';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const kinds = ['lead','proposal','project'];
const leadStages = ['New','Contacted','Proposal sent','Negotiation','Won','Lost'];
const phases = ['Planning','Build','QA','Delivered'];
const quoteStages = ['Draft','Approved','Sent','Accepted','Rejected'];
function err(message: string, status=400) { return NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}}); }
function safeText(v: unknown, length=400) { return typeof v === 'string' ? v.trim().slice(0,length) : ''; }
function sanitize(kind: Kind, data: unknown) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const d=data as Record<string,unknown>;
  if(kind==='lead') {
    const business=safeText(d.business,200),city=safeText(d.city,120),website=safeText(d.website,16);
    const category=safeText(d.category,160),contact=safeText(d.contact,240),notes=safeText(d.notes,4000);
    if(business.length<2||city.length<2||!['none','outdated','active'].includes(website)||!leadStages.includes(safeText(d.status,30))) return null;
    const score=Math.min(100,(website==='none'?45:website==='outdated'?30:15)+(contact?20:0)+(notes.length>=15?20:0)+15);
    return {business,city,website,category,contact,notes,score,status:safeText(d.status,30),created:safeText(d.created,50)||new Date().toISOString()};
  }
  if(kind==='proposal') {
    const client=safeText(d.client,200),service=safeText(d.service,200),description=safeText(d.description,4000),amount=Number(d.amount),status=safeText(d.status,30);
    if(client.length<2||!Number.isFinite(amount)||amount<=0||amount>100000000||!quoteStages.includes(status)) return null;
    return {client,service,description,amount,status};
  }
  const client=safeText(d.client,200),title=safeText(d.title,200),phase=safeText(d.phase,30),repo=safeText(d.repo,600),vercel=safeText(d.vercel,600);
  if(client.length<2||title.length<2||!phases.includes(phase)) return null;
  for(const url of [repo,vercel]) {
    if(!url)continue;
    try{if(new URL(url).protocol!=='https:')return null;}catch{return null;}
  }
  return {client,title,phase,repo,vercel};
}
async function owner() {
  if(!configured())return {error:err('Backend is not configured',503)} as const;
  try{const user=await requireOwner();return user ? {user} as const : {error:err('Unauthorized',401)} as const;}
  catch {return {error:err('Authentication unavailable',503)} as const;}
}
export async function GET() {
  const auth=await owner();if(auth.error)return auth.error;
  try {
    const sql=getSql();
    const rows=await sql`SELECT id, kind, data, user_id, created_at FROM public.studio_records WHERE user_id=${auth.user!.id} ORDER BY created_at DESC LIMIT 500`;
    return NextResponse.json({records:rows},{headers:{'Cache-Control':'private, no-store'}});
  }catch{return err('Unable to load studio records',503)}
}
export async function POST(request:NextRequest) {
  const auth=await owner();if(auth.error)return auth.error;
  const origin=request.headers.get('origin');
  if(!origin || origin!==new URL(request.url).origin)return err('Cross-origin action blocked',403);
  if(Number(request.headers.get('content-length')||0)>16000)return err('Payload too large',413);
  let body:Record<string,unknown>;
  try{body=await request.json();if(!body||typeof body!=='object'||Array.isArray(body))return err('Invalid request');}
  catch{return err('Malformed request body')}
  const sql=getSql(), userId=auth.user!.id, action=body.action;
  try{
    if(action==='create') {
      if(!kinds.includes(String(body.kind)))return err('Invalid record type');
      const kind=body.kind as Kind, data=sanitize(kind,body.data);if(!data)return err('Invalid record data');
      const rows=await sql`INSERT INTO public.studio_records (user_id,kind,data) VALUES (${userId},${kind},${JSON.stringify(data)}::jsonb) RETURNING id`;
      return NextResponse.json({success:true,id:rows[0].id});
    }
    if(action==='update') {
      if(typeof body.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(body.id))return err('Invalid record ID');
      const record=await sql`SELECT kind FROM public.studio_records WHERE id=${body.id}::uuid AND user_id=${userId}`;
      if(!record.length)return err('Record not found',404);
      const data=sanitize(record[0].kind as Kind,body.data);if(!data)return err('Invalid record data');
      const result=await sql`UPDATE public.studio_records SET data=${JSON.stringify(data)}::jsonb,updated_at=now() WHERE id=${body.id}::uuid AND user_id=${userId} RETURNING id`;
      return NextResponse.json({success:result.length>0});
    }
    if(action==='delete') {
      if(typeof body.id!=='string'||!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(body.id))return err('Invalid record ID');
      await sql`DELETE FROM public.studio_records WHERE id=${body.id}::uuid AND user_id=${userId}`;
      return NextResponse.json({success:true});
    }
    return err('Unsupported action');
  }catch{return err('Unable to save studio record',503)}
}

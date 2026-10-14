'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, ArrowRight, ArrowUpRight, Bot, BriefcaseBusiness, Check, ChevronDown, ChevronRight,
  CircleCheck, Clock3, Code2, Copy, FileText, Github, LayoutDashboard, LogOut, Menu,
  MoreHorizontal, Plus, Rocket, Search, ShieldCheck, Sparkles, Target, UsersRound, X
} from 'lucide-react';
import { authClient } from '@/lib/auth/client';
import {
  leadScore, leadStages, money, projectPhases,
  type LeadData, type LeadStatus, type ProjectData, type ProjectPhase, type ProposalData, type Kind, type StudioRecord
} from '@/lib/types';

type Section = 'home' | 'leads' | 'crm' | 'quotes' | 'projects' | 'deploy' | 'ai';
type Editing = Kind | null;
const nav = [
  { id: 'home', label: 'Overview', icon: LayoutDashboard },
  { id: 'leads', label: 'Lead Hunter', icon: Target },
  { id: 'crm', label: 'Client CRM', icon: UsersRound },
  { id: 'quotes', label: 'Proposals', icon: FileText },
  { id: 'projects', label: 'Projects', icon: BriefcaseBusiness },
  { id: 'deploy', label: 'Deployments', icon: Rocket },
  { id: 'ai', label: 'AI Workspace', icon: Bot }
] as const;
const phoneNav = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Target },
  { id: 'crm', label: 'CRM', icon: UsersRound },
  { id: 'quotes', label: 'Quotes', icon: FileText },
  { id: 'more', label: 'More', icon: MoreHorizontal }
] as const;
const blank = { business: '', city: 'Chennai', category: '', contact: '', website: 'none', notes: '', client: '', service: 'Business website', amount: '', description: '', title: '', repo: '', vercel: '' };

function safeExternal(href: string) { try { const url = new URL(href); return url.protocol === 'https:' ? url.href : null; } catch { return null; } }

export default function Dashboard({ userId }: { userId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Section>('home');
  const [more, setMore] = useState(false);
  const [records, setRecords] = useState<StudioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [editor, setEditor] = useState<Editing>(null);
  const [draft, setDraft] = useState({ ...blank });
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [syncError, setSyncError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const notify = useCallback((text: string) => { setToast(text); window.setTimeout(() => setToast(''), 4200); }, []);
  const r  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/studio', { cache: 'no-store', credentials: 'same-origin' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to fetch your studio records');
      setRecords(result.records as StudioRecord[]);
      setSyncError('');
    } catch (e) { setSyncError(e instanceof Error ? e.message : 'Could not load saved records.'); }
    finally { setLoading(false); }
  }, []);
ct(() => { void refresh(); }, [refresh]);

  const leads = useMemo(() => records.filter(r => r.kind === 'lead').map(r => ({ ...r, value: r.data as LeadData })), [records]);
  const proposals = useMemo(() => records.filter(r => r.kind === 'proposal').map(r => ({ ...r, value: r.data as ProposalData })), [records]);
  const projects = useMemo(() => records.filter(r => r.kind === 'project').map(r => ({ ...r, value: r.data as ProjectData })), [records]);
  const activeLeads = leads.filter(r => ['Contacted', 'Proposal sent', 'Negotiation', 'Won'].includes(r.value.status)).length;
  const pipeline = proposals.filter(r => r.value.status !== 'Rejected').reduce((sum, r) => sum + (Number(r.value.amount) || 0), 0);
  const selectTab = (next: Section) => { setTab(next); setMore(false); setQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const newRecord = (kind: Kind) => { setEditor(kind); setDraft({ ...blank }); setMore(false); };

  async function mutate(action: 'create' | 'update' | 'delete', payload: Record<string, unknown>) {
    const response = await fetch('/api/studio', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to save record.');
    return result;
  }

  async function insert() {
    if (!editor) return;
    const d = draft;
    let data: LeadData | ProposalData | ProjectData;
    if (editor === 'lead') {
      if (d.business.trim().length < 2 || d.city.trim().length < 2) return notify('Enter a business name and city.');
      data = { business: d.business.trim(), city: d.city.trim(), category: d.category.trim(), contact: d.contact.trim(), website: d.website as LeadData['website'], notes: d.notes.trim(), status: 'New', score: leadScore(d.website, d.contact, d.notes), created: new Date().toISOString() };
    } else if (editor === 'proposal') {
      const amount = Number(d.amount);
      if (d.client.trim().length < 2 || !Number.isFinite(amount) || amount <= 0 || amount > 100000000) return notify('Enter a client and a valid quotation amount.');
      data = { client: d.client.trim(), service: d.service.trim() || 'Business website', amount, description: d.description.trim(), status: 'Draft' };
    } else {
      if (d.title.trim().length < 2 || d.client.trim().length < 2) return notify('Enter the project and client names.');
      if ((d.repo && !safeExternal(d.repo)) || (d.vercel && !safeExternal(d.vercel))) return notify('Use valid https:// links for GitHub and Vercel.');
      data = { client: d.client.trim(), title: d.title.trim(), phase: 'Planning', repo: d.repo.trim(), vercel: d.vercel.trim() };
    }
    setWorking(true);
    try {
      await mutate('create', { kind: editor, data });
      setEditor(null); notify('Saved securely.'); await refresh();
    } catch (e) { notify(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setWorking(false); }
  }

  async function update(id: string, value: LeadData | ProposalData | ProjectData) {
    setWorking(true);
    try {
      await mutate('update', { id, data: value });
      await refresh();
    } catch (e) { notify(e instanceof Error ? e.message : 'Could not update this record.'); }
    finally { setWorking(false); }
  }
  async function remove(id: string) {
    setWorking(true);
    try {
      await mutate('delete', { id });
      await refresh(); setDeleting(null); notify('Record deleted.');
    } catch (e) { notify(e instanceof Error ? e.message : 'Could not delete record.'); }
    finally { setWorking(false); }
  }
  async function signOut() {
    await authClient.signOut(); router.replace('/login'); router.refresh();
  }
  async function copyQuote(q: ProposalData) {
    const content = `AI x MAD Studio — DRAFT QUOTATION\nClient: ${q.client}\nService: ${q.service}\nScope: ${q.description || 'To be agreed'}\nProposed amount: ${money(q.amount)}\n\nSubject to confirmation of scope, timeline and terms. This draft is not an invoice.`;
    try { await navigator.clipboard.writeText(content); notify('Draft copied. Review before sending.'); }
    catch { notify('Clipboard is unavailable in this browser.'); }
  }
  const filtered = leads.filter(r => [r.value.business, r.value.city, r.value.category, r.value.status].join(' ').toLowerCase().includes(query.toLowerCase()));
  const heading = nav.find(n => n.id === tab)?.label || 'Studio OS';
  const field = (key: keyof typeof blank, value: string) => setDraft(d => ({ ...d, [key]: value }));

  return <div className="app-shell">
    <aside className="desktop-sidebar">
      <div className="side-brand"><span className="brand-emblem">AM</span><span><strong>AI x MAD</strong><small>STUDIO OPERATING SYSTEM</small></span></div>
      <div className="sidebar-heading">WORKSPACE</div>
      <nav className="side-links" aria-label="Desktop navigation">
        {nav.map(n => <button type="button" key={n.id} aria-current={tab === n.id ? 'page' : undefined} className={tab === n.id ? 'selected' : ''} onClick={() => selectTab(n.id)}><n.icon size={19}/>{n.label}{tab === n.id && <ChevronRight size={15} className="arrow"/>}</button>)}
      </nav>
      <div className="sidebar-foot"><div className="online"><span/> Secure workspace</div><p>Studio operations, owned by AI x MAD. No automated outreach or releases.</p></div>
    </aside>
    <div className="app-main">
      <header className="app-topbar">
        <div className="mobile-brand"><span className="brand-emblem">AM</span><span><small>AI x MAD STUDIO</small><strong>{heading}</strong></span></div>
        <div className="desktop-breadcrumb">AI x MAD Studio <ChevronRight size={14}/> <b>{heading}</b></div>
        <div className="top-actions"><span className="private-label"><ShieldCheck size={14}/> PRIVATE WORKSPACE</span><button type="button" className="icon-button" aria-label="Sign out" onClick={() => void signOut()}><LogOut size={19}/></button></div>
      </header>
      <main className="app-content">
        {syncError && <div className="error-bar" role="alert"><ShieldCheck size={18}/><span>{syncError}</span><button onClick={()=>void refresh()}>Retry</button></div>}
        {tab === 'home' && <>
          <section className="desktop-title"><div className="eyebrow">STUDIO OPERATIONS / OVERVIEW</div><h1>Studio Command Center</h1><p>Your client acquisition, delivery and revenue pipeline.</p></section>
          <section className="hero-card"><div className="hero-eyebrow"><Sparkles size={15}/> YOUR BUSINESS HUB <span>STUDIO OS</span></div><h2>Stay on top of <em>everything.</em></h2><p>Your leads, projects and proposals, all in one place.</p><div className="hero-ctas"><button className="primary-btn" onClick={()=>newRecord('lead')}><Plus size={18}/> New lead</button><button className="outline-btn" onClick={()=>newRecord('proposal')}><FileText size={18}/> New quote</button></div><div className="hero-watermark">AI × MAD</div></section>
          <div className="stat-grid">
            <div className="stat"><span><Target size={16}/> TOTAL LEADS</span><strong>{leads.length}</strong><small>Added to your database</small></div>
            <div className="stat"><span><UsersRound size={16}/> ACTIVE OPPORTUNITIES</span><strong>{activeLeads}</strong><small>In sales pipeline</small></div>
            <div className="stat"><span><FileText size={16}/> PROPOSAL VALUE</span><strong>{money(pipeline)}</strong><small>Quoted, not revenue</small></div>
            <div className="stat"><span><Rocket size={16}/> ACTIVE PROJECTS</span><strong>{projects.filter(p => p.value.phase !== 'Delivered').length}</strong><small>Currently in progress</small></div>
          </div>
          <div className="two-panels"><section className="panel"><header className="panel-head"><h3>Sales pipeline</h3><small>Lead → Deal</small></header>{leadStages.filter(s=>s!=='Lost').map(s => <div className="pipeline-row" key={s}><span>{s}</span><div className="pipeline-track"><div style={{ width: (leads.length ? leads.filter(l=>l.value.status===s).length/leads.length*100 : 0)+'%' }}/></div><b>{leads.filter(l=>l.value.status===s).length}</b></div>)}</section>
          <section className="panel"><header className="panel-head"><h3>Quick actions</h3><small>Next priorities</small></header>{[
            { icon: Target, title: 'Build your lead list', description: 'Track real local business opportunities', tab: 'leads' as Section },
            { icon: FileText, title: 'Draft a quotation', description: 'Prepare scope and proposed pricing', tab: 'quotes' as Section },
            { icon: ShieldCheck, title: 'Review integrations', description: 'AI and deployment actions are not connected', tab: 'ai' as Section }
          ].map(a => <button key={a.title} className="action-row" onClick={()=>selectTab(a.tab)}><span className="action-icon"><a.icon size={19}/></span><span><b>{a.title}</b><small>{a.description}</small></span><ArrowUpRight size={18}/></button>)}</section></div>
        </>}
        {tab === 'leads' && <>
          <section className="page-title"><div><div className="eyebrow">CLIENT ACQUISITION</div><h1>Lead Hunter</h1><p>Save opportunities with verified business details. AI sourcing is not yet connected.</p></div><button className="primary-btn" onClick={()=>newRecord('lead')}><Plus size={17}/> New lead</button></section>
          <div className="stat-grid leads-stats"><div className="stat"><span>TOTAL</span><strong>{leads.length}</strong></div><div className="stat"><span>NEW</span><strong>{leads.filter(l=>l.value.status==='New').length}</strong></div><div className="stat"><span>CONTACTED</span><strong>{leads.filter(l=>l.value.status==='Contacted').length}</strong></div><div className="stat"><span>WON</span><strong>{leads.filter(l=>l.value.status==='Won').length}</strong></div></div>
          <section className="panel"><header className="panel-head wrap"><h3>Prospect database</h3><div className="search-box"><Search size={18}/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search prospects..." aria-label="Search prospects"/></div></header>
           {loading ? <div className="empty">Loading records…</div> : filtered.length ? filtered.map(l=> <article className="record lead-record" key={l.id}>
             <div className="record-icon"><Target size={20}/></div><div className="record-body"><strong>{l.value.business}</strong><small>{l.value.category || 'Local business'} · {l.value.city}</small><p>{l.value.notes || 'No research notes yet.'}</p>{l.value.contact && <small>Contact: {l.value.contact}</small>}</div><div className="record-score">Score {l.value.score ?? 0}</div>
             <div className="stage-picker"><span>Pipeline stage</span><select aria-label={'Stage for ' + l.value.business} value={l.value.status} disabled={working} onChange={e=>void update(l.id,{...l.value,status:e.target.value as LeadStatus})}>{leadStages.map(s=><option key={s}>{s}</option>)}</select></div>
             <button className="quiet-delete" aria-label={'Delete ' + l.value.business} onClick={()=>setDeleting(l.id)}>Delete</button>
           </article>) : <Empty icon={<Target size={34}/>} title={query?'No matching leads':'No leads added'} description={query?'Try a different search.':'Add your first researched business prospect; this app does not fabricate leads.'}/>}
          </section>
        </>}
        {tab === 'crm' && <>
          <section className="page-title"><div><div className="eyebrow">SALES PIPELINE</div><h1>Client CRM</h1><p>Keep every opportunity moving toward a deal.</p></div><button className="primary-btn" onClick={()=>newRecord('lead')}><Plus size={17}/> Add contact</button></section>
          <section className="panel"><header className="panel-head"><h3>Deal stages</h3><small>{leads.length} prospects</small></header><div className="swipe-hint">Swipe sideways to explore every stage <ArrowRight size={14}/></div>
          <div className="crm-grid">{leadStages.map(stage=><div className="crm-column" key={stage}><div className="crm-column-head"><b>{stage}</b><span>{leads.filter(l=>l.value.status===stage).length}</span></div>
            {leads.filter(l=>l.value.status===stage).length ? leads.filter(l=>l.value.status===stage).map(l=><article key={l.id} className="crm-item"><strong>{l.value.business}</strong><small>{l.value.city}</small><span>Score {l.value.score ?? 0}/100</span><button onClick={()=>selectTab('leads')}>View lead <ChevronRight size={13}/></button></article>) : <p className="crm-none">No opportunities</p>}
          </div>)}</div></section>
        </>}
        {tab === 'quotes' && <>
          <section className="page-title"><div><div className="eyebrow">CLIENT PROPOSALS</div><h1>Quotes & Proposals</h1><p>Prepare pricing drafts for client approval.</p></div><button className="primary-btn" onClick={()=>newRecord('proposal')}><Plus size={17}/> New quote</button></section>
          <section className="panel"><header className="panel-head"><h3>Quotation register</h3><small>{proposals.length} drafts / quotations</small></header>
            {proposals.length ? proposals.map(p=><article className="record quote-record" key={p.id}><div className="record-icon"><FileText size={20}/></div><div className="record-body"><strong>{p.value.client}</strong><small>{p.value.service}</small><p>{p.value.description || 'Scope to be finalized.'}</p></div><div className="quote-value">{money(p.value.amount)}</div><span className="tag">{p.value.status}</span><div className="record-buttons"><button className="outline-btn" onClick={()=>void copyQuote(p.value)}><Copy size={15}/> Copy draft</button><button className="quiet-delete" onClick={()=>setDeleting(p.id)}>Delete</button></div></article>) : <Empty icon={<FileText size={34}/>} title="No quotations yet" description="Create a proposal draft to track your pricing and project scope."/>}
          </section>
        </>}
        {tab === 'projects' && <>
          <section className="page-title"><div><div className="eyebrow">PROJECT DELIVERY</div><h1>Client Projects</h1><p>Organize website and application work, from planning to handoff.</p></div><button className="primary-btn" onClick={()=>newRecord('project')}><Plus size={17}/> New project</button></section>
          <section className="panel"><header className="panel-head"><h3>Delivery board</h3><small>Plan → Build → QA → Delivered</small></header>
            {projects.length ? projects.map(p=><article className="record project-record" key={p.id}><div className="record-icon"><Code2 size={20}/></div><div className="record-body"><strong>{p.value.title}</strong><small>{p.value.client}</small><div className="project-links">{p.value.repo && safeExternal(p.value.repo) && <a href={safeExternal(p.value.repo)!} target="_blank" rel="noopener noreferrer"><Github size={14}/> GitHub</a>}{p.value.vercel && safeExternal(p.value.vercel) && <a href={safeExternal(p.value.vercel)!} target="_blank" rel="noopener noreferrer"><Rocket size={14}/> Website</a>}</div></div><div className="stage-picker"><span>Delivery phase</span><select disabled={working} value={p.value.phase} onChange={e=>void update(p.id,{...p.value,phase:e.target.value as ProjectPhase})}>{projectPhases.map(s=><option key={s}>{s}</option>)}</select></div><button className="quiet-delete" onClick={()=>setDeleting(p.id)}>Delete</button></article>) : <Empty icon={<BriefcaseBusiness size={34}/>} title="No client projects" description="Add a project when your customer approves the work."/>}
          </section>
        </>}
        {tab === 'deploy' && <>
          <section className="page-title"><div><div className="eyebrow">RELEASE MANAGEMENT</div><h1>Deployments</h1><p>Keep deployments auditable and approved.</p></div></section>
          <div className="alert-banner"><ShieldCheck size={22}/><div><b>Human approval is required</b><p>No code is automatically pushed, merged or published by this app.</p></div></div>
          <div className="two-panels"><div className="panel feature-panel"><span className="feature-icon"><Github size={24}/></span><h3>GitHub</h3><p>Repo references can be stored with each project. Automated PR status and commit syncing are not connected yet.</p><span className="tag">Integration pending</span></div><div className="panel feature-panel"><span className="feature-icon"><Rocket size={24}/></span><h3>Vercel</h3><p>Release links can be saved to projects. Production deploy triggers are not enabled.</p><span className="tag">Integration pending</span></div></div>
        </>}
        {tab === 'ai' && <>
          <section className="page-title"><div><div className="eyebrow">STUDIO INTELLIGENCE</div><h1>AI Workspace</h1><p>Two engines, one approval-driven delivery workflow.</p></div></section>
          <div className="two-panels"><div className="panel feature-panel"><span className="feature-icon"><Bot size={24}/></span><h3>ChatGPT / OpenAI</h3><p>Lead briefs, client proposals, writing, planning and project quality reviews.</p><span className="tag">API not configured</span></div><div className="panel feature-panel"><span className="feature-icon"><Sparkles size={24}/></span><h3>Google Gemini</h3><p>Engineering research, code analysis, technical documentation and development assistance.</p><span className="tag">API not configured</span></div></div>
          <section className="panel"><header className="panel-head"><h3>Approval gates</h3></header>{['Verify prospect information before outreach','Review every quotation before sending','Obtain permission for WhatsApp messages','Approve production releases after testing','Keep all secret keys on the server'].map(t=><div className="approval-row" key={t}><CircleCheck size={18}/>{t}</div>)}</section>
        </>}
      </main>
    </div>
    <nav className="mobile-nav" aria-label="Mobile navigation">{phoneNav.map(n=><button key={n.id} type="button" className={(n.id==='more'?more||['projects','deploy','ai'].includes(tab):n.id===tab)?'active':''} aria-current={(n.id==='more'?more||['projects','deploy','ai'].includes(tab):n.id===tab)?'page':undefined} onClick={()=>n.id==='more'?setMore(s=>!s):selectTab(n.id as Section)}><n.icon size={22}/><span>{n.label}</span></button>)}</nav>
    {more&&<div className="sheet-overlay" onClick={()=>setMore(false)}><div className="sheet" role="dialog" aria-modal="true" aria-label="More tools" onClick={e=>e.stopPropagation()}><div className="sheet-handle"/><div className="sheet-title"><div><small>STUDIO WORKSPACE</small><h2>More tools</h2></div><button aria-label="Close menu" onClick={()=>setMore(false)}><X size={22}/></button></div>{nav.filter(n=>['projects','deploy','ai'].includes(n.id)).map(n=><button className="sheet-link" key={n.id} onClick={()=>selectTab(n.id)}><span><n.icon size={21}/></span>{n.label}<ChevronRight size={17}/></button>)}<div className="sheet-note"><ShieldCheck size={15}/> Protected studio workspace</div></div></div>}
    {editor&&<div className="modal-overlay" onClick={()=>setEditor(null)}><section className="modal" role="dialog" aria-modal="true" aria-label="New studio record" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><small>AI x MAD STUDIO</small><h2>{editor==='lead'?'Add new lead':editor==='proposal'?'Create quotation':'Create project'}</h2></div><button aria-label="Close form" onClick={()=>setEditor(null)}><X size={21}/></button></div><form onSubmit={e=>{e.preventDefault();void insert()}} className="record-form">
      {editor==='lead'&&<><label>Business name *<input required minLength={2} value={draft.business} onChange={e=>field('business',e.target.value)} placeholder="Real business name" maxLength={160}/></label><label>City / area *<input required minLength={2} value={draft.city} onChange={e=>field('city',e.target.value)} maxLength={100}/></label><label>Business category<input value={draft.category} onChange={e=>field('category',e.target.value)} placeholder="Bakery, tiles, salon..." maxLength={100}/></label><label>Public business contact<input value={draft.contact} onChange={e=>field('contact',e.target.value)} placeholder="Business phone or email" maxLength={250}/></label><label>Website situation<select value={draft.website} onChange={e=>field('website',e.target.value)}><option value="none">No website (reported)</option><option value="outdated">Outdated website</option><option value="active">Has active website</option></select></label><label>Research notes<textarea value={draft.notes} onChange={e=>field('notes',e.target.value)} maxLength={3000} rows={3} placeholder="Source, opportunity, business need…"/></label></>}
      {editor==='proposal'&&<><label>Client / business *<input required minLength={2} value={draft.client} onChange={e=>field('client',e.target.value)} maxLength={160}/></label><label>Service<input value={draft.service} onChange={e=>field('service',e.target.value)} maxLength={160}/></label><label>Quotation amount (₹) *<input required inputMode="decimal" type="number" min="1" max="100000000" value={draft.amount} onChange={e=>field('amount',e.target.value)}/></label><label>Project scope<textarea value={draft.description} onChange={e=>field('description',e.target.value)} rows={4} maxLength={12000} placeholder="Pages, features, timeline and exclusions"/></label></>}
      {editor==='project'&&<><label>Client / business *<input required minLength={2} value={draft.client} onChange={e=>field('client',e.target.value)} maxLength={160}/></label><label>Project title *<input required minLength={2} value={draft.title} onChange={e=>field('title',e.target.value)} maxLength={200}/></label><label>GitHub URL (optional)<input inputMode="url" type="url" value={draft.repo} onChange={e=>field('repo',e.target.value)} placeholder="https://github.com/..." maxLength={500}/></label><label>Website / Vercel URL (optional)<input inputMode="url" type="url" value={draft.vercel} onChange={e=>field('vercel',e.target.value)} placeholder="https://..." maxLength={500}/></label></>}
      <div className="modal-ctas"><button type="button" className="outline-btn" onClick={()=>setEditor(null)}>Cancel</button><button className="primary-btn" type="submit" disabled={working}>{working?'Saving…':'Save record'} <Check size={17}/></button></div>
    </form></section></div>}
    {deleting&&<div className="modal-overlay" onClick={()=>setDeleting(null)}><section className="confirm-card" role="alertdialog" aria-modal="true" aria-label="Confirm deletion" onClick={e=>e.stopPropagation()}><h2>Delete this record?</h2><p>This cannot be undone.</p><div className="modal-ctas"><button className="outline-btn" onClick={()=>setDeleting(null)}>Cancel</button><button className="danger-btn" disabled={working} onClick={()=>void remove(deleting)}>Delete permanently</button></div></section></div>}
    {toast&&<div role="status" className="toast"><CircleCheck size={18}/>{toast}</div>}
  </div>;
}

function Empty({icon,title,description}:{icon:React.ReactNode;title:string;description:string}) {
  return <div className="empty"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{description}</p></div>;
}

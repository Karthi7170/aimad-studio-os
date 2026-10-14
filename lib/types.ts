export type Kind = 'lead' | 'proposal' | 'project';
export type LeadStatus = 'New' | 'Contacted' | 'Proposal sent' | 'Negotiation' | 'Won' | 'Lost';
export type ProjectPhase = 'Planning' | 'Build' | 'QA' | 'Delivered';
export type LeadData = { business: string; city: string; category: string; contact: string; website: 'none' | 'outdated' | 'active'; status: LeadStatus; notes: string; score: number; created: string };
export type ProposalData = { client: string; service: string; amount: number; description: string; status: 'Draft' | 'Approved' | 'Sent' | 'Accepted' | 'Rejected' };
export type ProjectData = { client: string; title: string; phase: ProjectPhase; repo: string; vercel: string };
export type StudioRecord = { id: string; kind: Kind; data: LeadData | ProposalData | ProjectData; created_at: string; user_id: string };
export function leadScore(website: string, contact: string, notes: string) {
  return Math.min(100, (website === 'none' ? 45 : website === 'outdated' ? 30 : 15) + (contact.trim() ? 20 : 0) + (notes.trim().length >= 15 ? 20 : 0) + 15);
}
export const money = (n: number) => '₹' + n.toLocaleString('en-IN');
export const leadStages: LeadStatus[] = ['New', 'Contacted', 'Proposal sent', 'Negotiation', 'Won', 'Lost'];
export const projectPhases: ProjectPhase[] = ['Planning', 'Build', 'QA', 'Delivered'];

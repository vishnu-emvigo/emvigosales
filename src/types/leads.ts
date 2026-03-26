export type LeadStatus = 'not_assigned' | 'assigned' | 'mail_sent' | 'connection_sent' | 'request_accepted' | 'response_back';

export interface Lead {
  id: string;
  sr_no: number;
  linkedin_url: string;
  full_name: string;
  company: string;
  location: string;
  company_profile: string;
  person_summary: string;
  message_a: string;
  message_b: string;
  status: LeadStatus;
  assigned_to: string | null;
  selected_message: 'A' | 'B' | null;
  linkedin_profile_used: string | null;
  response_notes: string | null;
  reminder_date: string | null;
  batch_id: string;
  upload_date: string;
}

export interface Comment {
  id: string;
  lead_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  content: string;
  created_at: string;
}

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'on_leave';
  linkedin_profile: string;
  leads_count: number;
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  not_assigned: 'Not Assigned',
  assigned: 'Assigned',
  mail_sent: 'Mail Sent',
  connection_sent: 'Connection Sent',
  request_accepted: 'Request Accepted',
  response_back: 'Response Back',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  not_assigned: 'bg-muted text-muted-foreground',
  assigned: 'bg-blue-100 text-blue-700',
  mail_sent: 'bg-amber-100 text-amber-700',
  connection_sent: 'bg-orange-100 text-orange-700',
  request_accepted: 'bg-emerald-100 text-emerald-700',
  response_back: 'bg-green-100 text-green-700',
};

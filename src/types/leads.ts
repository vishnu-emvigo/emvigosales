export type LeadStatus = 'not_assigned' | 'assigned' | 'mail_sent' | 'connection_sent' | 'request_accepted' | 'response_back' | 'converted_to_customer';

export type PriorityColor = 'red' | 'amber' | 'green' | 'none';

export const PRIORITY_LABELS: Record<PriorityColor, string> = {
  red: 'High Priority',
  amber: 'Medium Priority',
  green: 'Low Priority',
  none: 'No Priority',
};

export interface Reminder {
  id: string;
  datetime: string; // ISO string e.g. "2026-03-26T10:00"
}

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
  reminders: Reminder[];
  batch_id: string;
  upload_date: string;
  priority_color: PriorityColor;
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
  converted_to_customer: 'Converted to Customer',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  not_assigned: 'bg-muted text-muted-foreground',
  assigned: 'bg-blue-100 text-blue-700',
  mail_sent: 'bg-amber-100 text-amber-700',
  connection_sent: 'bg-orange-100 text-orange-700',
  request_accepted: 'bg-emerald-100 text-emerald-700',
  response_back: 'bg-green-100 text-green-700',
  converted_to_customer: 'bg-teal-100 text-teal-700',
};

/** Check if a user can modify status/notes/reminders for a lead */
export const canModifyLead = (userName: string | undefined, lead: Lead): boolean => {
  if (!userName) return false;
  return lead.assigned_to === userName;
};

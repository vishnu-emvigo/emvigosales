import { Lead, Comment, SalesRep } from '@/types/leads';

const companies = ['TechCorp', 'InnovateCo', 'DataFlow', 'CloudScale', 'NextGen AI', 'FinServ Pro', 'GrowthHub', 'SaaS Solutions', 'Digital Ventures', 'SmartOps'];
const names = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis', 'Frank Wilson', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Martinez', 'Karen White', 'Leo Anderson', 'Mia Thomas', 'Noah Jackson', 'Olivia Garcia'];
const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL', 'Boston, MA', 'Denver, CO', 'Miami, FL', 'Portland, OR', 'Atlanta, GA'];
const statuses: Lead['status'][] = ['not_assigned', 'assigned', 'mail_sent', 'connection_sent', 'request_accepted', 'response_back'];

export const MOCK_REPS: SalesRep[] = [
  { id: 'rep1', name: 'John Sales', email: 'john@company.com', status: 'active', linkedin_profile: 'linkedin.com/in/johnsales', leads_count: 24 },
  { id: 'rep2', name: 'Jane Outreach', email: 'jane@company.com', status: 'active', linkedin_profile: 'linkedin.com/in/janeoutreach', leads_count: 18 },
  { id: 'rep3', name: 'Mike Connect', email: 'mike@company.com', status: 'on_leave', linkedin_profile: 'linkedin.com/in/mikeconnect', leads_count: 12 },
  { id: 'rep4', name: 'Sara Networker', email: 'sara@company.com', status: 'active', linkedin_profile: 'linkedin.com/in/saranetworker', leads_count: 21 },
];

export const generateMockLeads = (count: number = 80): Lead[] => {
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const rep = status !== 'not_assigned' ? MOCK_REPS[Math.floor(Math.random() * MOCK_REPS.length)] : null;
    return {
      id: `lead-${i + 1}`,
      sr_no: i + 1,
      linkedin_url: `https://linkedin.com/in/${names[i % names.length].toLowerCase().replace(' ', '')}`,
      full_name: names[i % names.length],
      company: companies[i % companies.length],
      location: locations[i % locations.length],
      company_profile: `${companies[i % companies.length]} is a leading provider of enterprise solutions, specializing in digital transformation and cloud-native technologies. Founded in 2015, they serve 500+ clients globally.`,
      person_summary: `${names[i % names.length]} is a senior decision-maker with 10+ years of experience in enterprise technology. Currently leading digital transformation initiatives at ${companies[i % companies.length]}.`,
      message_a: `Hi ${names[i % names.length].split(' ')[0]}, I noticed your work at ${companies[i % companies.length]} in digital transformation. We help companies like yours streamline operations — would love to connect and share insights.`,
      message_b: `Hello ${names[i % names.length].split(' ')[0]}, impressive growth at ${companies[i % companies.length]}! We've helped similar companies achieve 3x ROI on their outreach. Interested in a quick chat?`,
      status,
      assigned_to: rep?.name ?? null,
      selected_message: status !== 'not_assigned' ? (Math.random() > 0.5 ? 'A' : 'B') : null,
      linkedin_profile_used: rep?.linkedin_profile ?? null,
      response_notes: status === 'response_back' ? 'Interested in a demo call next week.' : null,
      reminder_date: Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 7 * 86400000).toISOString().split('T')[0] : null,
      batch_id: `BATCH-${String(Math.floor(i / 20) + 1).padStart(3, '0')}`,
      upload_date: new Date(Date.now() - Math.random() * 14 * 86400000).toISOString().split('T')[0],
    };
  });
};

export const MOCK_LEADS = generateMockLeads();

export const MOCK_COMMENTS: Comment[] = [
  { id: 'c1', lead_id: 'lead-1', user_id: '2', user_name: 'Sarah Manager', user_role: 'Sales Admin', content: 'Please prioritize this lead — they showed interest at the conference.', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'c2', lead_id: 'lead-1', user_id: '3', user_name: 'John Sales', user_role: 'Sales Rep', content: 'Got it! Sent connection request today.', created_at: new Date(Date.now() - 43200000).toISOString() },
  { id: 'c3', lead_id: 'lead-2', user_id: '1', user_name: 'Admin User', user_role: 'Admin', content: 'This company is a key target for Q1.', created_at: new Date(Date.now() - 172800000).toISOString() },
];

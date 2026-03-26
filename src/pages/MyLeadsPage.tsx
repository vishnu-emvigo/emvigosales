import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/contexts/LeadsContext';
import LeadsTable from '@/components/LeadsTable';
import LeadDetailDrawer from '@/components/LeadDetailDrawer';
import { Lead } from '@/types/leads';
import { motion } from 'framer-motion';

const MyLeadsPage = () => {
  const { user } = useAuth();
  const { leads } = useLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const myLeads = leads.filter(l => l.assigned_to === user?.name);
  const currentLead = selectedLead ? leads.find(l => l.id === selectedLead.id) || null : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">My Leads</h1>
      <p className="text-sm text-muted-foreground">Leads assigned to you — full control over status, notes, and reminders.</p>
      <LeadsTable leads={myLeads} onLeadClick={setSelectedLead} showMessages />
      <LeadDetailDrawer lead={currentLead} open={!!currentLead} onClose={() => setSelectedLead(null)} />
    </motion.div>
  );
};

export default MyLeadsPage;

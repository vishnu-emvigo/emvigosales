import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_LEADS } from '@/data/mockData';
import LeadsTable from '@/components/LeadsTable';
import LeadDetailDrawer from '@/components/LeadDetailDrawer';
import { Lead } from '@/types/leads';
import { motion } from 'framer-motion';

const MyLeadsPage = () => {
  const { user } = useAuth();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const myLeads = MOCK_LEADS.filter(l => l.assigned_to === user?.name);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">My Leads</h1>
      <LeadsTable leads={myLeads} onLeadClick={setSelectedLead} />
      <LeadDetailDrawer lead={selectedLead} open={!!selectedLead} onClose={() => setSelectedLead(null)} />
    </motion.div>
  );
};

export default MyLeadsPage;

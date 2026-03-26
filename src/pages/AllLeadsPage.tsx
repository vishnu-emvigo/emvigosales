import { useState } from 'react';
import { useLeads } from '@/contexts/LeadsContext';
import LeadsTable from '@/components/LeadsTable';
import LeadDetailDrawer from '@/components/LeadDetailDrawer';
import { Lead } from '@/types/leads';
import { motion } from 'framer-motion';

const AllLeadsPage = () => {
  const { leads } = useLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const currentLead = selectedLead ? leads.find(l => l.id === selectedLead.id) || null : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">All Leads</h1>
      <LeadsTable leads={leads} onLeadClick={setSelectedLead} />
      <LeadDetailDrawer lead={currentLead} open={!!currentLead} onClose={() => setSelectedLead(null)} />
    </motion.div>
  );
};

export default AllLeadsPage;

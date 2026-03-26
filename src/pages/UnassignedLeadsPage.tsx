import { useState } from 'react';
import { MOCK_LEADS, MOCK_REPS } from '@/data/mockData';
import LeadsTable from '@/components/LeadsTable';
import LeadDetailDrawer from '@/components/LeadDetailDrawer';
import { Lead } from '@/types/leads';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const UnassignedLeadsPage = () => {
  const { user } = useAuth();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignTo, setAssignTo] = useState('');

  const unassigned = MOCK_LEADS.filter(l => l.status === 'not_assigned');
  const isRep = user?.role === 'sales_rep';

  const handleAssign = () => {
    if (selectedIds.length === 0) return toast.error('Select leads first');
    if (isRep) {
      toast.success(`${selectedIds.length} leads assigned to you`);
    } else {
      if (!assignTo) return toast.error('Select a sales rep');
      toast.success(`${selectedIds.length} leads assigned to ${assignTo}`);
    }
    setSelectedIds([]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Unassigned Leads</h1>
      <LeadsTable
        leads={unassigned}
        onLeadClick={setSelectedLead}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        actions={
          <div className="flex items-center gap-2">
            {!isRep && (
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Assign to..." /></SelectTrigger>
                <SelectContent>
                  {MOCK_REPS.filter(r => r.status === 'active').map(r => (
                    <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button size="sm" className="h-9" onClick={handleAssign} disabled={selectedIds.length === 0}>
              {isRep ? 'Assign to Me' : `Assign (${selectedIds.length})`}
            </Button>
          </div>
        }
      />
      <LeadDetailDrawer lead={selectedLead} open={!!selectedLead} onClose={() => setSelectedLead(null)} />
    </motion.div>
  );
};

export default UnassignedLeadsPage;

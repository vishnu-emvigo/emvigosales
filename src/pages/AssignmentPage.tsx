import { useState } from 'react';
import { MOCK_LEADS, MOCK_REPS } from '@/data/mockData';
import LeadsTable from '@/components/LeadsTable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';

const AssignmentPage = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignTo, setAssignTo] = useState('');

  const unassigned = MOCK_LEADS.filter(l => l.status === 'not_assigned');
  const activeReps = MOCK_REPS.filter(r => r.status === 'active');

  const handleManualAssign = () => {
    if (selectedIds.length === 0 || !assignTo) return toast.error('Select leads and a rep');
    toast.success(`${selectedIds.length} leads assigned to ${assignTo}`);
    setSelectedIds([]);
    setAssignTo('');
  };

  const handleAutoDistribute = () => {
    if (unassigned.length === 0) return toast.info('No unassigned leads');
    const perRep = Math.ceil(unassigned.length / activeReps.length);
    toast.success(`${unassigned.length} leads auto-distributed (~${perRep} per rep)`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Lead Assignment</h1>
        <Button onClick={handleAutoDistribute} variant="outline" className="gap-2">
          <Shuffle className="w-4 h-4" /> Auto Distribute
        </Button>
      </div>
      <LeadsTable
        leads={unassigned}
        onLeadClick={() => {}}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        actions={
          <div className="flex items-center gap-2">
            <Select value={assignTo} onValueChange={setAssignTo}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Assign to..." /></SelectTrigger>
              <SelectContent>
                {activeReps.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-9" onClick={handleManualAssign} disabled={selectedIds.length === 0 || !assignTo}>
              Assign ({selectedIds.length})
            </Button>
          </div>
        }
      />
    </motion.div>
  );
};

export default AssignmentPage;

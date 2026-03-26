import { useState } from 'react';
import { useLeads } from '@/contexts/LeadsContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const TeamManagementPage = () => {
  const { leads, reps, toggleRepLeave, reassignLeadsFromRep } = useLeads();
  const [leaveDialog, setLeaveDialog] = useState<{ repId: string; repName: string } | null>(null);
  const [reassignTarget, setReassignTarget] = useState('');

  const handleLeaveToggle = (repId: string, repName: string, currentStatus: string) => {
    if (currentStatus === 'active') {
      const repLeadCount = leads.filter(l => l.assigned_to === repName).length;
      if (repLeadCount > 0) {
        setLeaveDialog({ repId, repName });
      } else {
        toggleRepLeave(repId);
        toast.success(`${repName} marked as On Leave`);
      }
    } else {
      toggleRepLeave(repId);
      toast.success(`${repName} marked as Active`);
    }
  };

  const handleReassignConfirm = () => {
    if (!leaveDialog || !reassignTarget) return;
    toggleRepLeave(leaveDialog.repId);
    reassignLeadsFromRep(leaveDialog.repId, reassignTarget);
    const actionLabel = reassignTarget === 'queue' ? 'moved to queue' : reassignTarget === 'admin' ? 'assigned to Sales Admin' : `reassigned to ${reps.find(r => r.id === reassignTarget)?.name}`;
    toast.success(`${leaveDialog.repName} set On Leave. Leads ${actionLabel}.`);
    setLeaveDialog(null);
    setReassignTarget('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-xl font-semibold text-foreground">Team Management</h1>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Leads</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reps.map(rep => {
              const repLeadCount = leads.filter(l => l.assigned_to === rep.name).length;
              return (
                <tr key={rep.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{rep.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rep.email}</td>
                  <td className="px-4 py-3 text-foreground">{repLeadCount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rep.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {rep.status === 'active' ? 'Active' : 'On Leave'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleLeaveToggle(rep.id, rep.name, rep.status)}>
                      {rep.status === 'active' ? 'Set On Leave' : 'Set Active'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!leaveDialog} onOpenChange={() => { setLeaveDialog(null); setReassignTarget(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign {leaveDialog?.repName}&apos;s Leads</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {leaveDialog?.repName} has {leads.filter(l => l.assigned_to === leaveDialog?.repName).length} assigned leads. Choose what to do with them:
          </p>
          <Select value={reassignTarget} onValueChange={setReassignTarget}>
            <SelectTrigger><SelectValue placeholder="Choose action..." /></SelectTrigger>
            <SelectContent>
              {reps.filter(r => r.id !== leaveDialog?.repId && r.status === 'active').map(r => (
                <SelectItem key={r.id} value={r.id}>Reassign to {r.name}</SelectItem>
              ))}
              <SelectItem value="admin">Assign to Sales Admin</SelectItem>
              <SelectItem value="queue">Move to Unassigned Queue</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setLeaveDialog(null); setReassignTarget(''); }}>Cancel</Button>
            <Button onClick={handleReassignConfirm} disabled={!reassignTarget}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default TeamManagementPage;

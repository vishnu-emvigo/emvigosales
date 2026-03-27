import { useState } from 'react';
import { Lead } from '@/types/leads';
import { useLeads } from '@/contexts/LeadsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReassignModalProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

const ReassignModal = ({ lead, open, onClose }: ReassignModalProps) => {
  const { reps, reassignLead } = useLeads();
  const { user } = useAuth();
  const [newUser, setNewUser] = useState('');
  const [reason, setReason] = useState('');

  if (!lead || !user) return null;

  const isAdmin = user.role === 'admin';

  const allAssignees = [
    // Admin cannot assign to themselves
    ...(!isAdmin ? [{ name: 'Admin User', linkedin: '' }] : []),
    { name: 'Sarah Manager', linkedin: '' },
    ...reps.filter(r => r.status === 'active').map(r => ({ name: r.name, linkedin: r.linkedin_profile })),
  ].filter(a => a.name !== lead.assigned_to);

  const handleConfirm = () => {
    if (!newUser) return toast.error('Select a new assignee');
    const target = allAssignees.find(a => a.name === newUser);
    reassignLead(lead.id, newUser, target?.linkedin || '', reason.trim(), user.name);
    toast.success(`Lead reassigned to ${newUser}`);
    setNewUser('');
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Lead</DialogTitle>
          <DialogDescription>Change the assigned user for {lead.full_name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Current Assignee</p>
            <p className="text-sm text-foreground bg-muted rounded px-3 py-2">{lead.assigned_to || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">New Assignee</p>
            <Select value={newUser} onValueChange={setNewUser}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select user..." /></SelectTrigger>
              <SelectContent>
                {allAssignees.map(a => (
                  <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Reason (optional)</p>
            <Textarea placeholder="Reason for reassignment..." value={reason} onChange={e => setReason(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!newUser}>Reassign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReassignModal;

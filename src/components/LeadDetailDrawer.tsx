import { useState, useEffect } from 'react';
import { Lead, LeadStatus, STATUS_LABELS, PriorityColor, canModifyLead } from '@/types/leads';
import { useLeads } from '@/contexts/LeadsContext';
import { useAuth } from '@/contexts/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import PriorityDot from '@/components/PriorityDot';
import ReassignModal from '@/components/ReassignModal';
import StatusUpdateModal from '@/components/StatusUpdateModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, MessageSquare, Send, Plus, X, Lock, RefreshCw, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

const LeadDetailDrawer = ({ lead, open, onClose }: LeadDetailDrawerProps) => {
  const { updateLead, addComment, comments, addReminder, removeReminder, setPriority, updateLeadStatus } = useLeads();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('10:00');
  const [reassignOpen, setReassignOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  useEffect(() => {
    if (lead) {
      setReminderDate('');
      setReminderTime('10:00');
    }
  }, [lead]);

  if (!lead) return null;

  const isAssigned = canModifyLead(user?.name, lead);
  const canReassign = user?.role === 'admin' || user?.role === 'sales_admin';
  const leadComments = comments.filter(c => c.lead_id === lead.id);

  const handleStatusSubmit = (data: { status: LeadStatus; connectNote: string; priority?: PriorityColor }) => {
    if (!user) return;
    const roleLabel = user.role === 'admin' ? 'Admin' : user.role === 'sales_admin' ? 'Sales Admin' : 'Sales Rep';
    if (data.connectNote) {
      addConnectNote(lead.id, data.connectNote, user.name);
    }
    updateLeadStatus(lead.id, data.status, user.name, roleLabel, data.priority);
    if (data.priority) {
      const labels: Record<PriorityColor, string> = { red: 'Red', amber: 'Amber', green: 'Green', none: 'None' };
      toast.success(`Status updated to ${STATUS_LABELS[data.status]} — Priority: ${labels[data.priority]}`);
    } else {
      toast.success(`Status updated to ${STATUS_LABELS[data.status]}`);
    }
    setStatusModalOpen(false);
  };

  const handleAddConnectNote = () => {
    if (!connectNote.trim() || !user || !isAssigned) return;
    if (lead.connect_notes.length > 0) {
      toast.error('Connect Note has already been submitted and cannot be modified');
      return;
    }
    addConnectNote(lead.id, connectNote.trim(), user.name);
    toast.success('Connect Note submitted');
    setConnectNote('');
  };

  const handleAddReminder = () => {
    if (!isAssigned) return toast.error('Only the assigned user can set reminders');
    if (!reminderDate) return toast.error('Select a date');
    const datetime = `${reminderDate}T${reminderTime}`;
    addReminder(lead.id, datetime);
    toast.success('Reminder added');
    setReminderDate('');
    setReminderTime('10:00');
  };

  const handleAddComment = () => {
    if (!comment.trim() || !user) return;
    const roleLabel = user.role === 'admin' ? 'Admin' : user.role === 'sales_admin' ? 'Sales Admin' : 'Sales Rep';
    addComment(lead.id, user.id, user.name, roleLabel, comment.trim());
    toast.success('Comment added');
    setComment('');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg">{lead.full_name}</SheetTitle>
            <div className="flex items-center gap-2">
              <StatusBadge status={lead.status} />
              <PriorityDot priority={lead.priority_color} size="md" />
              {!isAssigned && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  <Lock className="w-3 h-3" /> Read-only
                </span>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-5">
            {/* Basic Info + Reassign */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Basic Info</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Company:</span> <span className="text-foreground">{lead.company}</span></div>
                <div><span className="text-muted-foreground">Location:</span> <span className="text-foreground">{lead.location}</span></div>
                {lead.assigned_to && (
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-muted-foreground">Assigned To:</span>
                    <span className="text-foreground">{lead.assigned_to}</span>
                    {canReassign && (
                      <Button size="sm" variant="outline" className="h-6 text-xs gap-1 ml-auto" onClick={() => setReassignOpen(true)}>
                        <RefreshCw className="w-3 h-3" /> Reassign
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                LinkedIn Profile <ExternalLink className="w-3 h-3" />
              </a>
            </section>

            <Separator />

            {/* Priority */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Priority {!isAssigned && <span className="text-xs text-muted-foreground font-normal">(view only)</span>}
              </h3>
              {(() => {
                const colorEligible = lead.status === 'request_accepted' || lead.status === 'response_back';
                if (isAssigned && colorEligible) {
                  return (
                    <div className="flex items-center gap-3">
                      {(['red', 'amber', 'green'] as PriorityColor[]).map(p => {
                        const labels: Record<PriorityColor, string> = { red: '🔴 Red', amber: '🟠 Amber', green: '🟢 Green', none: 'None' };
                        return (
                          <Button
                            key={p}
                            size="sm"
                            variant={lead.priority_color === p ? 'default' : 'outline'}
                            className="h-7 text-xs"
                            onClick={() => setPriority(lead.id, p, user?.name || '')}
                          >
                            {labels[p]}
                          </Button>
                        );
                      })}
                    </div>
                  );
                }
                if (!colorEligible) {
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground cursor-default">
                          <PriorityDot priority={lead.priority_color} size="md" />
                          <span className="ml-1 italic">Available after Request Accepted</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Color can only be selected after Request Accepted stage</TooltipContent>
                    </Tooltip>
                  );
                }
                return <PriorityDot priority={lead.priority_color} size="md" />;
              })()}
            </section>

            <Separator />

            {/* Company Profile */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Company Profile</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{lead.company_profile}</p>
            </section>

            <Separator />

            {/* Person Summary */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Person Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{lead.person_summary}</p>
            </section>

            <Separator />

            {/* InMail Message */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">InMail Message</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg border border-border text-sm">
                  <div className="mb-1">
                    <span className="text-xs font-medium text-muted-foreground">Subject: {lead.inmail_subject}</span>
                  </div>
                  <p className="text-foreground">{lead.inmail_message}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Status */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Status {!isAssigned && <span className="text-xs text-muted-foreground font-normal">(view only)</span>}
              </h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={lead.status} />
                {isAssigned && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setStatusModalOpen(true)}>
                    <Edit className="w-3 h-3" /> Update Status
                  </Button>
                )}
              </div>
            </section>

            <Separator />

            {/* Connect Note */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Connect Note {!isAssigned && <span className="text-xs text-muted-foreground font-normal">(view only)</span>}
              </h3>
              {lead.connect_notes.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[...lead.connect_notes].reverse().map(note => (
                    <div key={note.id} className="border-l-2 border-primary/30 pl-3 py-1">
                      <p className="text-xs font-medium text-foreground">
                        {note.user_name} — <span className="text-muted-foreground font-normal">{formatDate(note.created_at)}</span>
                      </p>
                      <p className="text-sm text-foreground mt-0.5">"{note.content}"</p>
                    </div>
                  ))}
                  {isAssigned && (
                    <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Connect Note has been submitted and is locked
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">No connect note yet</p>
                  {isAssigned && (
                    <div className="flex gap-2">
                      <Textarea placeholder="Add your connect note (one-time only)..." value={connectNote} onChange={e => setConnectNote(e.target.value)} rows={2} className="text-sm" />
                      <Button size="sm" className="h-auto self-end" onClick={handleAddConnectNote}>Submit</Button>
                    </div>
                  )}
                </>
              )}
            </section>

            <Separator />

            {/* Reminders */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                Reminders {!isAssigned && <span className="text-xs text-muted-foreground font-normal">(view only)</span>}
              </h3>
              {lead.reminders.length > 0 && (
                <div className="space-y-1.5">
                  {lead.reminders.map(r => {
                    const dt = new Date(r.datetime);
                    return (
                      <div key={r.id} className="flex items-center gap-2 bg-muted/50 rounded px-3 py-1.5 text-sm">
                        <span className="text-foreground">{dt.toLocaleDateString()} at {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isAssigned && (
                          <Button size="icon" variant="ghost" className="h-5 w-5 ml-auto" onClick={() => removeReminder(lead.id, r.id)}>
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {lead.reminders.length === 0 && <p className="text-xs text-muted-foreground">No reminders set</p>}
              {isAssigned && (
                <div className="flex gap-2 items-end">
                  <Input type="date" className="h-8 text-xs flex-1" value={reminderDate} onChange={e => setReminderDate(e.target.value)} />
                  <Input type="time" className="h-8 text-xs w-24" value={reminderTime} onChange={e => setReminderTime(e.target.value)} />
                  <Button size="sm" className="h-8 gap-1" onClick={handleAddReminder}>
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>
              )}
            </section>

            <Separator />

            {/* Comments */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Comments
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {leadComments.length === 0 && <p className="text-xs text-muted-foreground">No comments yet</p>}
                {leadComments.map(c => (
                  <div key={c.id} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">{c.user_name}</span>
                      <span className="text-xs text-muted-foreground">- {c.user_role}</span>
                    </div>
                    <p className="text-sm text-foreground">{c.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} className="h-8 text-xs"
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
                <Button size="icon" className="h-8 w-8" onClick={handleAddComment}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>
      <StatusUpdateModal open={statusModalOpen} onClose={() => setStatusModalOpen(false)} lead={lead} onSubmit={handleStatusSubmit} />
      <ReassignModal lead={lead} open={reassignOpen} onClose={() => setReassignOpen(false)} />
    </>
  );
};

export default LeadDetailDrawer;

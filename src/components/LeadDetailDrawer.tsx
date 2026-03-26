import { useState } from 'react';
import { Lead, LeadStatus, STATUS_LABELS } from '@/types/leads';
import { MOCK_COMMENTS } from '@/data/mockData';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

const STATUS_FLOW: LeadStatus[] = ['not_assigned', 'assigned', 'mail_sent', 'connection_sent', 'request_accepted', 'response_back'];

const LeadDetailDrawer = ({ lead, open, onClose }: LeadDetailDrawerProps) => {
  const [notes, setNotes] = useState('');
  const [comment, setComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | ''>('');

  if (!lead) return null;

  const comments = MOCK_COMMENTS.filter(c => c.lead_id === lead.id);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg">{lead.full_name}</SheetTitle>
          <StatusBadge status={lead.status} />
        </SheetHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Basic Info</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Company:</span> <span className="text-foreground">{lead.company}</span></div>
              <div><span className="text-muted-foreground">Location:</span> <span className="text-foreground">{lead.location}</span></div>
            </div>
            <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              LinkedIn Profile <ExternalLink className="w-3 h-3" />
            </a>
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

          {/* Messaging */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Messaging</h3>
            <div className="space-y-2">
              <div className={`p-3 rounded-lg border text-sm ${lead.selected_message === 'A' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Message A</span>
                  <Button size="sm" variant={lead.selected_message === 'A' ? 'default' : 'outline'} className="h-6 text-xs"
                    onClick={() => toast.success('Message A selected')}>
                    {lead.selected_message === 'A' ? 'Selected' : 'Use A'}
                  </Button>
                </div>
                <p className="text-foreground">{lead.message_a}</p>
              </div>
              <div className={`p-3 rounded-lg border text-sm ${lead.selected_message === 'B' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">Message B</span>
                  <Button size="sm" variant={lead.selected_message === 'B' ? 'default' : 'outline'} className="h-6 text-xs"
                    onClick={() => toast.success('Message B selected')}>
                    {lead.selected_message === 'B' ? 'Selected' : 'Use B'}
                  </Button>
                </div>
                <p className="text-foreground">{lead.message_b}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Status Update */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Update Status</h3>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={v => setSelectedStatus(v as LeadStatus)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Change status..." /></SelectTrigger>
                <SelectContent>
                  {STATUS_FLOW.filter(s => s !== 'not_assigned').map(s => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="h-9" onClick={() => { toast.success('Status updated'); setSelectedStatus(''); }}>Update</Button>
            </div>
          </section>

          <Separator />

          {/* Notes */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Notes</h3>
            <Textarea placeholder="Add notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            <Button size="sm" onClick={() => { toast.success('Notes saved'); setNotes(''); }}>Save Notes</Button>
          </section>

          <Separator />

          {/* Reminder */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Reminder</h3>
            <div className="flex gap-2">
              <Input type="date" className="h-9" defaultValue={lead.reminder_date || ''} />
              <Button size="sm" className="h-9" onClick={() => toast.success('Reminder set')}>Set</Button>
            </div>
          </section>

          <Separator />

          {/* Comments */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Comments
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments.length === 0 && <p className="text-xs text-muted-foreground">No comments yet</p>}
              {comments.map(c => (
                <div key={c.id} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">{c.user_name}</span>
                    <span className="text-xs text-muted-foreground">• {c.user_role}</span>
                  </div>
                  <p className="text-sm text-foreground">{c.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} className="h-9" />
              <Button size="icon" className="h-9 w-9" onClick={() => { toast.success('Comment added'); setComment(''); }}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LeadDetailDrawer;

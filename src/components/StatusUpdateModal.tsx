import { useState } from 'react';
import { Lead, LeadStatus, STATUS_LABELS, PriorityColor } from '@/types/leads';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_FLOW: LeadStatus[] = ['assigned', 'inmail_sent', 'connection_sent', 'request_accepted', 'response_back'];
const COLOR_REQUIRED_STATUSES: LeadStatus[] = ['request_accepted', 'response_back'];

interface StatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead;
  onSubmit: (data: {
    status: LeadStatus;
    comment: string;
    priority?: PriorityColor;
  }) => void;
}

const StatusUpdateModal = ({ open, onClose, lead, onSubmit }: StatusUpdateModalProps) => {
  const [status, setStatus] = useState<LeadStatus | ''>(lead.status);
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState<PriorityColor | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const needsPriority = COLOR_REQUIRED_STATUSES.includes(status as LeadStatus);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!status) errs.status = 'Status is required';
    if (!comment.trim()) errs.comment = 'Comment is required';
    if (needsPriority && !priority) errs.priority = 'Priority color is mandatory for this status';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      status: status as LeadStatus,
      comment: comment.trim(),
      priority: needsPriority ? (priority as PriorityColor) : undefined,
    });
    setComment('');
    setErrors({});
  };

  const handleClose = () => {
    setErrors({});
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Lead Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Status *</Label>
            <Select value={status} onValueChange={(v) => { setStatus(v as LeadStatus); setErrors(e => ({ ...e, status: '' })); }}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FLOW.map(s => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
          </div>

          {/* Priority (only for request_accepted / response_back) */}
          {needsPriority && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Priority *</Label>
              <div className="flex gap-2">
                {(['red', 'amber', 'green'] as PriorityColor[]).map(p => {
                  const labels: Record<string, string> = { red: '🔴 Red', amber: '🟠 Amber', green: '🟢 Green' };
                  return (
                    <Button
                      key={p}
                      type="button"
                      variant={priority === p ? 'default' : 'outline'}
                      className="flex-1 h-9 text-sm"
                      onClick={() => { setPriority(p); setErrors(e => ({ ...e, priority: '' })); }}
                    >
                      {labels[p]}
                    </Button>
                  );
                })}
              </div>
              {errors.priority && <p className="text-xs text-destructive">{errors.priority}</p>}
            </div>
          )}

          {/* Comment */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Comment *</Label>
            <Textarea
              placeholder="Add a comment about this status change..."
              value={comment}
              onChange={e => { setComment(e.target.value); setErrors(er => ({ ...er, comment: '' })); }}
              rows={3}
              className="text-sm"
            />
            {errors.comment && <p className="text-xs text-destructive">{errors.comment}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusUpdateModal;

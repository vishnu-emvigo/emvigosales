import { useState } from 'react';
import { PriorityColor } from '@/types/leads';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PriorityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (priority: PriorityColor) => void;
}

const OPTIONS: { value: PriorityColor; emoji: string; label: string; desc: string; border: string }[] = [
  { value: 'red', emoji: '🔴', label: 'Red', desc: 'Hot / Immediate Action', border: 'border-destructive' },
  { value: 'amber', emoji: '🟠', label: 'Amber', desc: 'Warm / Follow-up Needed', border: 'border-amber-500' },
  { value: 'green', emoji: '🟢', label: 'Green', desc: 'Low Urgency', border: 'border-emerald-500' },
];

const PriorityModal = ({ open, onClose, onSubmit }: PriorityModalProps) => {
  const [selected, setSelected] = useState<PriorityColor | null>(null);

  const handleSubmit = () => {
    if (!selected) return;
    onSubmit(selected);
    setSelected(null);
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Lead Priority</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Priority selection is required when moving to Request Accepted.
          </p>
        </DialogHeader>
        <div className="space-y-2 py-3">
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                selected === opt.value ? opt.border + ' bg-muted/50' : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selected}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriorityModal;

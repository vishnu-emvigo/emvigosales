import { Lead } from '@/types/leads';
import { AlertTriangle, Flame, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
  leads: Lead[];
}

const HighPriorityAlerts = ({ leads }: Props) => {
  const navigate = useNavigate();

  // RED leads that are still in 'assigned' status (no progress) — "Hot Leads Needing Attention"
  const redStale = leads.filter(l => l.priority_color === 'red' && l.status === 'assigned');
  // RED leads without reminders
  const redNoReminder = leads.filter(l => l.priority_color === 'red' && l.reminders.length === 0 && l.status !== 'not_assigned');

  const allAlerts = [...new Map([...redStale, ...redNoReminder].map(l => [l.id, l])).values()];

  if (allAlerts.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-destructive" /> Hot Leads Needing Attention
        </h2>
        <p className="text-sm text-muted-foreground">No stale hot leads 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-destructive/30 p-5 shadow-card">
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Flame className="w-4 h-4 text-destructive" /> Hot Leads Needing Attention
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{allAlerts.length}</span>
      </h2>
      <div className="space-y-1.5 max-h-56 overflow-y-auto">
        {allAlerts.map(lead => {
          const isStale = redStale.some(l => l.id === lead.id);
          const hasNoReminder = lead.reminders.length === 0;
          return (
            <div key={lead.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-destructive/5 text-sm">
              <span className="text-destructive">🔴</span>
              <span className="font-medium text-foreground truncate max-w-[120px]">{lead.full_name}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">{lead.company}</span>
              <div className="ml-auto flex items-center gap-1.5">
                {isStale && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive whitespace-nowrap">
                    <AlertTriangle className="w-3 h-3 inline mr-0.5" />No progress
                  </span>
                )}
                {hasNoReminder && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 whitespace-nowrap">
                    <Bell className="w-3 h-3 inline mr-0.5" />No reminder
                  </span>
                )}
                <span className="text-xs text-muted-foreground">→ {lead.assigned_to ?? 'N/A'}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate('/leads?priority=red')}>
          View all Red leads →
        </Button>
      </div>
    </div>
  );
};

export default HighPriorityAlerts;

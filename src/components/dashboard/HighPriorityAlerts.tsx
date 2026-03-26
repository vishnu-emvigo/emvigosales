import { Lead } from '@/types/leads';
import { AlertTriangle } from 'lucide-react';

interface Props {
  leads: Lead[];
}

const HighPriorityAlerts = ({ leads }: Props) => {
  // RED leads that are still in 'assigned' status (no progress)
  const redStale = leads.filter(l => l.priority_color === 'red' && l.status === 'assigned');

  if (redStale.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" /> High Priority Alerts
        </h2>
        <p className="text-sm text-muted-foreground">No stale high-priority leads 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-destructive/30 p-5 shadow-card">
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive" /> High Priority Alerts
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{redStale.length}</span>
      </h2>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {redStale.map(lead => (
          <div key={lead.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-destructive/5 text-sm">
            <span className="text-destructive">🔴</span>
            <span className="font-medium text-foreground truncate max-w-[140px]">{lead.full_name}</span>
            <span className="text-xs text-muted-foreground">{lead.company}</span>
            <span className="ml-auto text-xs text-muted-foreground">→ {lead.assigned_to ?? 'N/A'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HighPriorityAlerts;

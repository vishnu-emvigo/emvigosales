import { Lead } from '@/types/leads';
import { AlertTriangle } from 'lucide-react';

interface Props {
  leads: Lead[];
}

const InactivityAlerts = ({ leads }: Props) => {
  // In local state we don't have timestamps for assignment, so we simulate:
  // "assigned" status leads with no further progress = potentially inactive
  const inactive = leads.filter(l => l.status === 'assigned');

  if (inactive.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Inactivity Alerts
        </h2>
        <p className="text-sm text-muted-foreground">No inactive leads — all caught up!</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" /> Inactivity Alerts
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{inactive.length}</span>
      </h2>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {inactive.slice(0, 10).map(lead => (
          <div key={lead.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-amber-50 text-sm">
            <span className="font-medium text-foreground truncate max-w-[140px]">{lead.full_name}</span>
            <span className="text-xs text-muted-foreground">{lead.company}</span>
            <span className="ml-auto text-xs text-amber-700">→ {lead.assigned_to ?? 'N/A'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InactivityAlerts;

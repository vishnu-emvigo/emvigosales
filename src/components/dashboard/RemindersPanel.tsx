import { Lead } from '@/types/leads';
import StatusBadge from '@/components/StatusBadge';
import { Bell, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  leads: Lead[];
  userName?: string;
}

const RemindersPanel = ({ leads, userName }: Props) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];

  // Flatten reminders
  const allReminders = leads.flatMap(l =>
    l.reminders.map(r => ({ lead: l, reminder: r, dt: new Date(r.datetime) }))
  );

  const upcoming = allReminders
    .filter(r => r.reminder.datetime.startsWith(today) || r.reminder.datetime.startsWith(tomorrow))
    .filter(r => r.dt >= now)
    .sort((a, b) => a.dt.getTime() - b.dt.getTime());

  const overdue = allReminders
    .filter(r => r.dt < now)
    .sort((a, b) => b.dt.getTime() - a.dt.getTime());

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
      <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Bell className="w-4 h-4 text-primary" /> Reminders & Follow-ups
      </h2>

      {overdue.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-destructive flex items-center gap-1 mb-2">
            <AlertTriangle className="w-3 h-3" /> Overdue ({overdue.length})
          </p>
          <div className="space-y-1.5">
            {overdue.slice(0, 5).map(({ lead, reminder, dt }) => (
              <div key={reminder.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-destructive/5 text-sm">
                <span className="font-medium text-foreground truncate max-w-[120px]">{lead.full_name}</span>
                <StatusBadge status={lead.status} />
                {lead.assigned_to && <span className="text-xs text-muted-foreground">→ {lead.assigned_to}</span>}
                <span className="ml-auto text-xs text-destructive">
                  {dt.toLocaleDateString([], { month: 'short', day: 'numeric' })} {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
            <Clock className="w-3 h-3" /> Upcoming ({upcoming.length})
          </p>
          <div className="space-y-1.5">
            {upcoming.slice(0, 5).map(({ lead, reminder, dt }) => (
              <div key={reminder.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-muted/30 text-sm">
                <span className="font-medium text-foreground truncate max-w-[120px]">{lead.full_name}</span>
                <StatusBadge status={lead.status} />
                {lead.assigned_to && <span className="text-xs text-muted-foreground">→ {lead.assigned_to}</span>}
                <span className="ml-auto text-xs text-muted-foreground">
                  {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : overdue.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming reminders</p>
      ) : null}
    </div>
  );
};

export default RemindersPanel;

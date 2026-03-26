import { useState } from 'react';
import { useLeads } from '@/contexts/LeadsContext';
import { useAuth } from '@/contexts/AuthContext';
import LeadDetailDrawer from '@/components/LeadDetailDrawer';
import { Lead } from '@/types/leads';
import StatusBadge from '@/components/StatusBadge';
import { Bell, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const RemindersPage = () => {
  const { leads } = useLeads();
  const { user } = useAuth();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const today = new Date().toISOString().split('T')[0];

  const myLeads = user?.role === 'sales_rep' ? leads.filter(l => l.assigned_to === user.name) : leads;
  const leadsWithReminders = myLeads.filter(l => l.reminders.length > 0);

  // Separate today's and upcoming
  const todayReminders = leadsWithReminders.filter(l => l.reminders.some(r => r.datetime.startsWith(today)));
  const upcomingReminders = leadsWithReminders.filter(l => l.reminders.some(r => r.datetime > today + 'T23:59') && !l.reminders.some(r => r.datetime.startsWith(today)));
  const pastReminders = leadsWithReminders.filter(l => l.reminders.every(r => r.datetime < today + 'T00:00'));

  const currentLead = selectedLead ? leads.find(l => l.id === selectedLead.id) || null : null;

  const renderTable = (items: Lead[], label: string) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">{label}</h2>
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Company</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Reminders</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(lead => (
                <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium text-foreground">{lead.full_name}</td>
                  <td className="px-3 py-2 text-foreground">{lead.company}</td>
                  <td className="px-3 py-2"><StatusBadge status={lead.status} /></td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {lead.reminders.map(r => {
                      const dt = new Date(r.datetime);
                      return <div key={r.id}>{dt.toLocaleDateString()} {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>;
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => setSelectedLead(lead)}>Open</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">Reminders</h1>
      </div>

      {leadsWithReminders.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No reminders set</p>
        </div>
      ) : (
        <div className="space-y-5">
          {renderTable(todayReminders, "📌 Today's Follow-ups")}
          {renderTable(upcomingReminders, '🔜 Upcoming')}
          {renderTable(pastReminders, '⏳ Past Due')}
        </div>
      )}
      <LeadDetailDrawer lead={currentLead} open={!!currentLead} onClose={() => setSelectedLead(null)} />
    </motion.div>
  );
};

export default RemindersPage;

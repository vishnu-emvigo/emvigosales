import { useState } from 'react';
import { useLeads } from '@/contexts/LeadsContext';
import { useAuth } from '@/contexts/AuthContext';
import LeadDetailDrawer from '@/components/LeadDetailDrawer';
import { Lead } from '@/types/leads';
import StatusBadge from '@/components/StatusBadge';
import { Bell, Clock, Settings, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const RemindersPage = () => {
  const { leads, globalFollowUpHours, setGlobalFollowUpHours } = useLeads();
  const { user } = useAuth();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [hoursInput, setHoursInput] = useState(globalFollowUpHours?.toString() || '');
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const isAdminOrSalesAdmin = user?.role === 'admin' || user?.role === 'sales_admin';

  const myLeads = user?.role === 'sales_rep' ? leads.filter(l => l.assigned_to === user.name) : leads;
  const leadsWithReminders = myLeads.filter(l => l.reminders.length > 0);

  // Global follow-up: assigned leads with no action within the set hours
  const globalFollowUpLeads: Lead[] = [];
  if (globalFollowUpHours && globalFollowUpHours > 0) {
    const thresholdMs = globalFollowUpHours * 60 * 60 * 1000;
    myLeads.forEach(l => {
      if (l.status === 'not_assigned') return;
      const refTime = l.last_action_at || l.assigned_at;
      if (!refTime) return;
      const elapsed = now.getTime() - new Date(refTime).getTime();
      if (elapsed >= thresholdMs) {
        globalFollowUpLeads.push(l);
      }
    });
  }

  // Separate today's and upcoming
  const todayReminders = leadsWithReminders.filter(l => l.reminders.some(r => r.datetime.startsWith(today)));
  const upcomingReminders = leadsWithReminders.filter(l => l.reminders.some(r => r.datetime > today + 'T23:59') && !l.reminders.some(r => r.datetime.startsWith(today)));
  const pastReminders = leadsWithReminders.filter(l => l.reminders.every(r => r.datetime < today + 'T00:00'));

  const currentLead = selectedLead ? leads.find(l => l.id === selectedLead.id) || null : null;

  const handleSaveFollowUp = () => {
    const val = hoursInput.trim();
    if (!val) {
      setGlobalFollowUpHours(null);
      toast.success('Global follow-up reminder disabled');
      setShowSettings(false);
      return;
    }
    const hrs = parseFloat(val);
    if (isNaN(hrs) || hrs <= 0) {
      toast.error('Please enter a valid number of hours');
      return;
    }
    setGlobalFollowUpHours(hrs);
    toast.success(`Global follow-up set to ${hrs} hour${hrs !== 1 ? 's' : ''}`);
    setShowSettings(false);
  };

  const formatElapsed = (refTime: string) => {
    const elapsed = now.getTime() - new Date(refTime).getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h ago`;
    return `${hours}h ago`;
  };

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
        <div className="ml-auto flex items-center gap-2">
          {globalFollowUpHours && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
              <Timer className="w-3 h-3" /> Follow-up: {globalFollowUpHours}h
            </span>
          )}
          {isAdminOrSalesAdmin && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setShowSettings(!showSettings); setHoursInput(globalFollowUpHours?.toString() || ''); }}>
              <Settings className="w-3 h-3" /> Follow-up Settings
            </Button>
          )}
        </div>
      </div>

      {/* Global Follow-up Settings Panel */}
      {showSettings && isAdminOrSalesAdmin && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-4 shadow-card">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary" /> Global Follow-up Reminder
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Set a follow-up interval in hours. Assigned leads with no action taken within this time will automatically appear as follow-up reminders.
          </p>
          <div className="flex items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="followup-hours" className="text-xs">Hours before follow-up</Label>
              <Input
                id="followup-hours"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 24"
                value={hoursInput}
                onChange={e => setHoursInput(e.target.value)}
                className="w-32 h-8 text-xs"
              />
            </div>
            <Button size="sm" className="h-8 text-xs" onClick={handleSaveFollowUp}>Save</Button>
            {globalFollowUpHours && (
              <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive" onClick={() => { setGlobalFollowUpHours(null); setShowSettings(false); toast.success('Global follow-up disabled'); }}>
                Disable
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Global Follow-up Alerts */}
      {globalFollowUpLeads.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Timer className="w-4 h-4 text-amber-500" /> ⚠️ Follow-up Required ({globalFollowUpLeads.length})
            <span className="text-xs font-normal text-muted-foreground ml-1">No action in {globalFollowUpHours}h+</span>
          </h2>
          <div className="bg-card rounded-xl border border-amber-200 shadow-card overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-amber-50/50 border-b border-border">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Company</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Assigned</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Last Activity</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {globalFollowUpLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-amber-50/30">
                    <td className="px-3 py-2 font-medium text-foreground">{lead.full_name}</td>
                    <td className="px-3 py-2 text-foreground">{lead.company}</td>
                    <td className="px-3 py-2"><StatusBadge status={lead.status} /></td>
                    <td className="px-3 py-2 text-muted-foreground">{lead.assigned_to || '—'}</td>
                    <td className="px-3 py-2 text-amber-600 font-medium">
                      {lead.last_action_at || lead.assigned_at ? formatElapsed(lead.last_action_at || lead.assigned_at!) : '—'}
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
      )}

      {leadsWithReminders.length === 0 && globalFollowUpLeads.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No reminders or follow-ups pending</p>
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

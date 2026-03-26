import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/contexts/LeadsContext';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { LeadStatus, STATUS_LABELS } from '@/types/leads';
import { Users, Upload, UserCheck, Clock, BarChart3, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { user } = useAuth();
  const { leads, reps } = useLeads();
  const isRep = user?.role === 'sales_rep';

  const myLeads = isRep ? leads.filter(l => l.assigned_to === user?.name) : leads;
  const today = new Date().toISOString().split('T')[0];
  const uploadedToday = leads.filter(l => l.upload_date === today).length;
  const unassigned = leads.filter(l => l.status === 'not_assigned').length;
  const remindersToday = myLeads.filter(l => l.reminder_date === today).length;

  const statusCounts = myLeads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">
        {isRep ? 'My Dashboard' : 'Dashboard'}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={isRep ? 'My Leads' : 'Total Leads'} value={myLeads.length} icon={<Users className="w-5 h-5" />} />
        {!isRep && <StatCard title="Uploaded Today" value={uploadedToday} icon={<Upload className="w-5 h-5" />} />}
        <StatCard title="Unassigned" value={unassigned} icon={<UserCheck className="w-5 h-5" />} />
        <StatCard title="Reminders Today" value={remindersToday} icon={<Bell className="w-5 h-5" />} />
        {isRep && <StatCard title="Completed" value={statusCounts['response_back'] || 0} icon={<BarChart3 className="w-5 h-5" />} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Status Breakdown</h2>
          <div className="space-y-3">
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map(status => {
              const count = statusCounts[status] || 0;
              const pct = myLeads.length ? Math.round((count / myLeads.length) * 100) : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <StatusBadge status={status} className="w-32 justify-center" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {!isRep && (
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <h2 className="text-sm font-semibold text-foreground mb-4">Sales Rep Performance</h2>
            <div className="space-y-3">
              {reps.map(rep => {
                const repLeads = leads.filter(l => l.assigned_to === rep.name);
                const completed = repLeads.filter(l => l.status === 'response_back').length;
                return (
                  <div key={rep.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">{rep.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{rep.name}</p>
                      <p className="text-xs text-muted-foreground">{repLeads.length} leads - {completed} completed</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rep.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {rep.status === 'active' ? 'Active' : 'On Leave'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardPage;

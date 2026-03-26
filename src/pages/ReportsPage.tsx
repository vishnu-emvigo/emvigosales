import { MOCK_LEADS, MOCK_REPS } from '@/data/mockData';
import { STATUS_LABELS, LeadStatus } from '@/types/leads';
import StatCard from '@/components/StatCard';
import { BarChart3, TrendingUp, MessageSquare, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const ReportsPage = () => {
  const statusCounts = MOCK_LEADS.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const msgA = MOCK_LEADS.filter(l => l.selected_message === 'A').length;
  const msgB = MOCK_LEADS.filter(l => l.selected_message === 'B').length;
  const responseRate = MOCK_LEADS.length ? Math.round(((statusCounts['response_back'] || 0) / MOCK_LEADS.length) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Processed" value={MOCK_LEADS.length} icon={<BarChart3 className="w-5 h-5" />} />
        <StatCard title="Response Rate" value={`${responseRate}%`} icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="Message A Used" value={msgA} subtitle={`vs ${msgB} Message B`} icon={<MessageSquare className="w-5 h-5" />} />
        <StatCard title="Active Reps" value={MOCK_REPS.filter(r => r.status === 'active').length} icon={<Users className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Status Distribution</h2>
          <div className="space-y-2">
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map(status => {
              const count = statusCounts[status] || 0;
              const pct = MOCK_LEADS.length ? Math.round((count / MOCK_LEADS.length) * 100) : 0;
              return (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{STATUS_LABELS[status]}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Rep Performance</h2>
          <div className="space-y-3">
            {MOCK_REPS.map(rep => {
              const repLeads = MOCK_LEADS.filter(l => l.assigned_to === rep.name);
              const responded = repLeads.filter(l => l.status === 'response_back').length;
              const rate = repLeads.length ? Math.round((responded / repLeads.length) * 100) : 0;
              return (
                <div key={rep.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">{rep.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{repLeads.length} leads</span>
                    <span className="text-xs font-medium text-primary">{rate}% response</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportsPage;

import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/contexts/LeadsContext';
import { LeadStatus } from '@/types/leads';
import KPICard from '@/components/dashboard/KPICard';
import StatusFunnel from '@/components/dashboard/StatusFunnel';
import StatusMiniCards from '@/components/dashboard/StatusMiniCards';
import RepPerformanceTable from '@/components/dashboard/RepPerformanceTable';
import RemindersPanel from '@/components/dashboard/RemindersPanel';
import InactivityAlerts from '@/components/dashboard/InactivityAlerts';
import CommentsActivity from '@/components/dashboard/CommentsActivity';
import PriorityDistribution from '@/components/dashboard/PriorityDistribution';
import HighPriorityAlerts from '@/components/dashboard/HighPriorityAlerts';
import { Users, UserX, Activity, CheckCircle2, TrendingUp, Upload, ClipboardList, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { user } = useAuth();
  const { leads, reps, comments } = useLeads();

  const isRep = user?.role === 'sales_rep';
  const isAdmin = user?.role === 'admin';

  const today = new Date().toISOString().split('T')[0];
  const uploadedToday = leads.filter(l => l.upload_date === today).length;
  const unassigned = leads.filter(l => l.status === 'not_assigned').length;
  const activeStatuses: LeadStatus[] = ['assigned', 'mail_sent', 'connection_sent'];
  const activeLeads = leads.filter(l => activeStatuses.includes(l.status)).length;
  const converted = leads.filter(l => l.status === 'response_back').length;
  const assignedTotal = leads.filter(l => l.status !== 'not_assigned').length;
  const conversionRate = assignedTotal > 0 ? Math.round((converted / assignedTotal) * 100) : 0;

  const myLeads = leads.filter(l => l.assigned_to === user?.name);
  const myPending = myLeads.filter(l => l.status === 'assigned').length;

  // ─── SALES REP DASHBOARD ─────────────────────────
  if (isRep) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-xl font-semibold text-foreground">My Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="My Leads" value={myLeads.length} icon={<Users className="w-5 h-5" />} href="/my-leads" />
          <KPICard title="Pending" value={myPending} icon={<Activity className="w-5 h-5" />} alert={myPending > 0} />
          <KPICard title="Completed" value={myLeads.filter(l => l.status === 'response_back').length} icon={<CheckCircle2 className="w-5 h-5" />} />
          <KPICard
            title="My Conversion"
            value={myLeads.length > 0 ? `${Math.round((myLeads.filter(l => l.status === 'response_back').length / myLeads.length) * 100)}%` : '0%'}
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>
        <StatusMiniCards leads={myLeads} />
        <PriorityDistribution leads={myLeads} title="My Priority View" />
        <RemindersPanel leads={myLeads} userName={user?.name} />
      </motion.div>
    );
  }

  // ─── ADMIN DASHBOARD (STRATEGIC) ──────────────────
  if (isAdmin) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard title="Total Leads" value={leads.length} subtitle={`+${uploadedToday} today`} icon={<Users className="w-5 h-5" />} href="/leads" tooltip="Click to view all leads" />
          <KPICard title="Unassigned" value={unassigned} icon={<UserX className="w-5 h-5" />} href="/unassigned" alert={unassigned > 3} tooltip="Leads needing assignment" />
          <KPICard title="Active" value={activeLeads} icon={<Activity className="w-5 h-5" />} tooltip="Assigned, mail sent, or connection sent" />
          <KPICard title="Converted" value={converted} icon={<CheckCircle2 className="w-5 h-5" />} />
          <KPICard title="Conversion Rate" value={`${conversionRate}%`} icon={<TrendingUp className="w-5 h-5" />} tooltip="Response back / total assigned" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusFunnel leads={leads} />
          <PriorityDistribution leads={leads} />
        </div>

        <RepPerformanceTable leads={leads} reps={reps} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RemindersPanel leads={leads} />
          <HighPriorityAlerts leads={leads} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InactivityAlerts leads={leads} />
          <CommentsActivity comments={comments} leads={leads} />
        </div>
      </motion.div>
    );
  }

  // ─── SALES ADMIN DASHBOARD (OPERATIONAL) ──────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Sales Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Unassigned Leads" value={unassigned} icon={<UserX className="w-5 h-5" />} href="/unassigned" alert={unassigned > 0} tooltip="Assign to reps or yourself" />
        <KPICard title="Assigned to Me" value={myLeads.length} icon={<ClipboardList className="w-5 h-5" />} href="/my-leads" tooltip="Leads you're working on" />
        <KPICard title="Uploaded Today" value={uploadedToday} icon={<Upload className="w-5 h-5" />} />
        <KPICard title="Pending Actions" value={myPending} icon={<AlertTriangle className="w-5 h-5" />} alert={myPending > 0} tooltip="Assigned but not yet progressed" />
      </div>

      <StatusMiniCards leads={leads} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriorityDistribution leads={leads} title="Priority Summary" />
        <HighPriorityAlerts leads={leads} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RepPerformanceTable leads={leads} reps={reps} compact />
        <RemindersPanel leads={leads} userName={user?.name} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InactivityAlerts leads={leads} />
        <CommentsActivity comments={comments} leads={leads} />
      </div>
    </motion.div>
  );
};

export default DashboardPage;

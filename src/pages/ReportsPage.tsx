import { useState, useMemo } from 'react';
import { useLeads } from '@/contexts/LeadsContext';
import { STATUS_LABELS, LeadStatus, PriorityColor } from '@/types/leads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, Download, FilterX, BarChart3, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { generateReportPdf } from '@/lib/generateReportPdf';

const PRIORITY_DISPLAY: Record<PriorityColor, { emoji: string; label: string }> = {
  red: { emoji: '🔴', label: 'Red' },
  amber: { emoji: '🟠', label: 'Amber' },
  green: { emoji: '🟢', label: 'Green' },
  none: { emoji: '', label: '—' },
};

const ReportsPage = () => {
  const { leads, reps } = useLeads();

  // Filter state
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [_messageType, _setMessageType] = useState('all');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Derived unique values
  const allUsers = useMemo(() => [...new Set(leads.map(l => l.assigned_to).filter(Boolean) as string[])].sort(), [leads]);
  const allBatches = useMemo(() => [...new Set(leads.map(l => l.batch_id))].sort(), [leads]);
  const allRegions = useMemo(() => [...new Set(leads.map(l => l.location).filter(Boolean))].sort(), [leads]);

  const hasActiveFilters = !!(dateFrom || dateTo || selectedStatuses.length || selectedUsers.length || messageType !== 'all' || selectedPriorities.length || selectedBatches.length || selectedRegions.length);

  // Filtered leads
  const filtered = useMemo(() => {
    let result = leads;
    if (dateFrom) {
      const from = dateFrom.toISOString().split('T')[0];
      result = result.filter(l => (l.last_action_at || l.upload_date) >= from);
    }
    if (dateTo) {
      const to = dateTo.toISOString().split('T')[0];
      result = result.filter(l => (l.last_action_at || l.upload_date) <= to + 'T23:59:59');
    }
    if (selectedStatuses.length) result = result.filter(l => selectedStatuses.includes(l.status));
    if (selectedUsers.length) result = result.filter(l => l.assigned_to && selectedUsers.includes(l.assigned_to));
    if (messageType !== 'all') result = result.filter(l => l.selected_message === messageType);
    if (selectedPriorities.length) result = result.filter(l => selectedPriorities.includes(l.priority_color));
    if (selectedBatches.length) result = result.filter(l => selectedBatches.includes(l.batch_id));
    if (selectedRegions.length) result = result.filter(l => selectedRegions.includes(l.location));
    return result;
  }, [leads, dateFrom, dateTo, selectedStatuses, selectedUsers, messageType, selectedPriorities, selectedBatches, selectedRegions]);

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedStatuses([]);
    setSelectedUsers([]);
    setMessageType('all');
    setSelectedPriorities([]);
    setSelectedBatches([]);
    setSelectedRegions([]);
    toast.success('Filters cleared');
  };

  // KPIs
  const statusCounts = useMemo(() => {
    const c: Record<string, number> = {};
    filtered.forEach(l => { c[l.status] = (c[l.status] || 0) + 1; });
    return c;
  }, [filtered]);
  const redCount = filtered.filter(l => l.priority_color === 'red').length;
  const amberCount = filtered.filter(l => l.priority_color === 'amber').length;
  const greenCount = filtered.filter(l => l.priority_color === 'green').length;
  const responseBack = statusCounts['response_back'] || 0;
  const conversionPct = filtered.length ? Math.round((responseBack / filtered.length) * 100) : 0;

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const handleDownloadPdf = () => {
    toast.info('PDF export feature is coming soon.');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Reports</h1>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1.5 text-xs">
              <FilterX className="w-3.5 h-3.5" /> Clear Filters
            </Button>
          )}
          <Button size="sm" onClick={handleDownloadPdf} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Download PDF Report
          </Button>
        </div>
      </div>

      {/* ── Advanced Filter Bar ── */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-card space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filters</p>
        <div className="flex flex-wrap gap-2 items-start">
          {/* Date From */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn('w-[140px] justify-start text-xs gap-1.5', !dateFrom && 'text-muted-foreground')}>
                <CalendarIcon className="w-3.5 h-3.5" />
                {dateFrom ? format(dateFrom, 'dd MMM yyyy') : 'From Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>

          {/* Date To */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn('w-[140px] justify-start text-xs gap-1.5', !dateTo && 'text-muted-foreground')}>
                <CalendarIcon className="w-3.5 h-3.5" />
                {dateTo ? format(dateTo, 'dd MMM yyyy') : 'To Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>

          {/* Status multi-select */}
          <MultiCheckboxDropdown
            label="Status"
            options={(Object.keys(STATUS_LABELS) as LeadStatus[]).map(s => ({ value: s, label: STATUS_LABELS[s] }))}
            selected={selectedStatuses}
            onChange={setSelectedStatuses}
          />

          {/* Assigned User multi-select */}
          <MultiCheckboxDropdown
            label="Assigned User"
            options={allUsers.map(u => ({ value: u, label: u }))}
            selected={selectedUsers}
            onChange={setSelectedUsers}
          />

          {/* Message Type */}
          <Select value={messageType} onValueChange={setMessageType}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Message Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Message Type</SelectItem>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority multi-select */}
          <MultiCheckboxDropdown
            label="Priority"
            options={[
              { value: 'red', label: '🔴 Red' },
              { value: 'amber', label: '🟠 Amber' },
              { value: 'green', label: '🟢 Green' },
            ]}
            selected={selectedPriorities}
            onChange={setSelectedPriorities}
          />

          {/* Batch ID */}
          <MultiCheckboxDropdown
            label="Batch ID"
            options={allBatches.map(b => ({ value: b, label: b }))}
            selected={selectedBatches}
            onChange={setSelectedBatches}
          />

          {/* Region */}
          <MultiCheckboxDropdown
            label="Region"
            options={allRegions.map(r => ({ value: r, label: r }))}
            selected={selectedRegions}
            onChange={setSelectedRegions}
          />
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Leads" value={filtered.length} icon={<BarChart3 className="w-4 h-4" />} />
        <KpiCard label="Response Back" value={responseBack} icon={<TrendingUp className="w-4 h-4" />} />
        <KpiCard label="Conversion" value={`${conversionPct}%`} icon={<TrendingUp className="w-4 h-4" />} />
        <KpiCard label="🔴 Red" value={redCount} accent="text-destructive" />
        <KpiCard label="🟠 Amber" value={amberCount} accent="text-amber-500" />
        <KpiCard label="🟢 Green" value={greenCount} accent="text-emerald-500" />
      </div>

      {/* ── Status & Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-xl border border-border p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">Status Distribution</h2>
          <div className="space-y-2">
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map(status => {
              const count = statusCounts[status] || 0;
              const pct = filtered.length ? Math.round((count / filtered.length) * 100) : 0;
              return (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{STATUS_LABELS[status]}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
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
            {reps.map(rep => {
              const repLeads = filtered.filter(l => l.assigned_to === rep.name);
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

      {/* ── Results Table ── */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Filtered Results ({filtered.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: '900px' }}>
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Full Name</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Company</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Region</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Assigned User</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Message Type</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Priority</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Reminders</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">No leads match current filters</td></tr>
              )}
              {filtered.map(lead => {
                const pd = PRIORITY_DISPLAY[lead.priority_color];
                return (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-1.5 font-medium text-foreground whitespace-nowrap">{lead.full_name}</td>
                    <td className="px-3 py-1.5 text-foreground whitespace-nowrap">{lead.company}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{lead.location}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{STATUS_LABELS[lead.status]}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{lead.assigned_to || 'Unassigned'}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{lead.selected_message || '—'}</td>
                    <td className="px-3 py-1.5">
                      <span className="inline-flex items-center gap-1 text-xs">
                        {pd.emoji && <span>{pd.emoji}</span>}
                        <span className="text-muted-foreground">{pd.label}</span>
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-muted-foreground">{lead.reminders.length}</td>
                    <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                      {lead.last_action_at ? new Date(lead.last_action_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// ── Sub-components ──

function KpiCard({ label, value, icon, accent }: { label: string; value: string | number; icon?: React.ReactNode; accent?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-card">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-primary">{icon}</span>}
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn('text-lg font-bold', accent || 'text-foreground')}>{value}</p>
    </div>
  );
}

function MultiCheckboxDropdown({
  label, options, selected, onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('h-8 text-xs gap-1', selected.length > 0 && 'border-primary text-primary')}>
          {label}
          {selected.length > 0 && (
            <span className="ml-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {selected.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer text-xs">
              <Checkbox checked={selected.includes(opt.value)} onCheckedChange={() => toggle(opt.value)} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {selected.length > 0 && (
          <Button variant="ghost" size="sm" className="w-full mt-1 text-xs h-7" onClick={() => onChange([])}>
            Clear
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default ReportsPage;

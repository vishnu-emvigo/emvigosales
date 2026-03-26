import { useState, useMemo } from 'react';
import { Lead, LeadStatus, STATUS_LABELS, PriorityColor, canModifyLead } from '@/types/leads';
import StatusBadge from '@/components/StatusBadge';
import PriorityDot from '@/components/PriorityDot';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLeads } from '@/contexts/LeadsContext';
import { useAuth } from '@/contexts/AuthContext';

interface LeadsTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  pageSize?: number;
  actions?: React.ReactNode;
  showMessages?: boolean;
}

const truncate = (text: string, max = 80) =>
  text.length > max ? text.slice(0, max) + '…' : text;

const ROW_BORDER_COLOR: Record<PriorityColor, string> = {
  red: 'border-l-4 border-l-destructive',
  amber: 'border-l-4 border-l-amber-500',
  green: 'border-l-4 border-l-emerald-500',
  none: '',
};

const PRIORITY_DISPLAY: Record<PriorityColor, { emoji: string; label: string }> = {
  red: { emoji: '🔴', label: 'Red' },
  amber: { emoji: '🟠', label: 'Amber' },
  green: { emoji: '🟢', label: 'Green' },
  none: { emoji: '', label: '—' },
};

const LeadsTable = ({
  leads, onLeadClick, selectable = false, selectedIds = [], onSelectionChange, pageSize = 20, actions, showMessages = false,
}: LeadsTableProps) => {
  const { setPriority } = useLeads();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const assignedUsers = useMemo(() => {
    const names = new Set(leads.map(l => l.assigned_to).filter(Boolean) as string[]);
    return Array.from(names).sort();
  }, [leads]);

  const filtered = useMemo(() => {
    let result = leads;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l => l.full_name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter);
    if (assignedFilter !== 'all') result = result.filter(l => l.assigned_to === assignedFilter);
    if (priorityFilter !== 'all') result = result.filter(l => l.priority_color === priorityFilter);
    const priorityOrder: Record<PriorityColor, number> = { red: 0, amber: 1, green: 2, none: 3 };
    result = [...result].sort((a, b) => priorityOrder[a.priority_color] - priorityOrder[b.priority_color]);
    return result;
  }, [leads, search, statusFilter, assignedFilter, priorityFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const allSelected = paginated.length > 0 && paginated.every(l => selectedIds.includes(l.id));
  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) onSelectionChange(selectedIds.filter(id => !paginated.find(l => l.id === id)));
    else onSelectionChange([...new Set([...selectedIds, ...paginated.map(l => l.id)])]);
  };
  const toggleOne = (id: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search name or company..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-8 h-8 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={v => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="red">🔴 Red</SelectItem>
            <SelectItem value="amber">🟠 Amber</SelectItem>
            <SelectItem value="green">🟢 Green</SelectItem>
            <SelectItem value="none">No Priority</SelectItem>
          </SelectContent>
        </Select>
        {assignedUsers.length > 0 && (
          <Select value={assignedFilter} onValueChange={v => { setAssignedFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Assign" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {assignedUsers.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {actions}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} leads</span>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border sticky top-0 z-10">
                {selectable && (
                  <th className="w-8 px-2 py-2"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></th>
                )}
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-10">#</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Full Name</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Company</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Priority</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Assign</th>
                {showMessages && (
                  <>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Msg A</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Msg B</th>
                  </>
                )}
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Inmail Message Type Sent</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Connect Note Type</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(lead => {
                const canSetPriority = canModifyLead(user?.name, lead);
                const pd = PRIORITY_DISPLAY[lead.priority_color];
                const latestNote = lead.connect_notes.length > 0 ? lead.connect_notes[lead.connect_notes.length - 1] : null;
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onLeadClick(lead)}
                    className={`border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${ROW_BORDER_COLOR[lead.priority_color]}`}
                  >
                    {selectable && (
                      <td className="px-2 py-1.5" onClick={e => e.stopPropagation()}>
                        <Checkbox checked={selectedIds.includes(lead.id)} onCheckedChange={() => toggleOne(lead.id)} />
                      </td>
                    )}
                    <td className="px-3 py-1.5 text-muted-foreground">{lead.sr_no}</td>
                    <td className="px-3 py-1.5 font-medium text-foreground">{lead.full_name}</td>
                    <td className="px-3 py-1.5 text-foreground">{lead.company}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{lead.location}</td>
                    <td className="px-3 py-1.5"><StatusBadge status={lead.status} /></td>
                    <td className="px-3 py-1.5" onClick={e => e.stopPropagation()}>
                      {canSetPriority ? (
                        <PriorityDot
                          priority={lead.priority_color}
                          interactive
                          onSelect={(p) => setPriority(lead.id, p, user?.name || '')}
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs">
                          {pd.emoji && <span>{pd.emoji}</span>}
                          <span className="text-muted-foreground">{pd.label}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-muted-foreground">{lead.assigned_to || '—'}</td>
                    {showMessages && (
                      <>
                        <td className="px-3 py-1.5 text-muted-foreground max-w-[200px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate cursor-default">{truncate(lead.message_a)}</span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-sm text-xs whitespace-pre-wrap">
                              {lead.message_a}
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="px-3 py-1.5 text-muted-foreground max-w-[200px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block truncate cursor-default">{truncate(lead.message_b)}</span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-sm text-xs whitespace-pre-wrap">
                              {lead.message_b}
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      </>
                    )}
                    <td className="px-3 py-1.5 text-muted-foreground">{lead.selected_message || '—'}</td>
                    <td className="px-3 py-1.5 text-muted-foreground max-w-[150px]">
                      {latestNote ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-default">{truncate(latestNote.content, 40)}</span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-sm text-xs whitespace-pre-wrap">
                            {latestNote.content}
                          </TooltipContent>
                        </Tooltip>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={selectable ? 12 : 11} className="px-3 py-10 text-center text-muted-foreground">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTable;

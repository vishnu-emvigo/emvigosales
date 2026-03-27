import { useState, useMemo } from 'react';
import { Lead, LeadStatus, STATUS_LABELS, PriorityColor, canModifyLead } from '@/types/leads';
import PriorityDot from '@/components/PriorityDot';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
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
}

const truncate = (text: string, max = 60) =>
  text.length > max ? text.slice(0, max) + '…' : text;

const truncateUrl = (url: string, max = 30) =>
  url.length > max ? url.slice(0, max) + '…' : url;

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

/** Reusable truncated cell with tooltip */
const TruncatedCell = ({ text, max = 60 }: { text: string; max?: number }) => {
  if (!text) return <span className="text-muted-foreground">—</span>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block truncate cursor-default">{truncate(text, max)}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-sm text-xs whitespace-pre-wrap">
        {text}
      </TooltipContent>
    </Tooltip>
  );
};

const LeadsTable = ({
  leads, onLeadClick, selectable = false, selectedIds = [], onSelectionChange, pageSize = 20, actions,
}: LeadsTableProps) => {
  const { setPriority } = useLeads();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [messageTypeFilter, setMessageTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const assignedUsers = useMemo(() => {
    const names = new Set(leads.map(l => l.assigned_to).filter(Boolean) as string[]);
    return Array.from(names).sort();
  }, [leads]);

  const filtered = useMemo(() => {
    let result = leads;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.full_name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.linkedin_url.toLowerCase().includes(q)
      );
    }
    if (assignedFilter !== 'all') result = result.filter(l => l.assigned_to === assignedFilter);
    if (priorityFilter !== 'all') result = result.filter(l => l.priority_color === priorityFilter);
    if (messageTypeFilter !== 'all') result = result.filter(l => l.selected_message === messageTypeFilter);
    const priorityOrder: Record<PriorityColor, number> = { red: 0, amber: 1, green: 2, none: 3 };
    result = [...result].sort((a, b) => priorityOrder[a.priority_color] - priorityOrder[b.priority_color]);
    return result;
  }, [leads, search, assignedFilter, priorityFilter, messageTypeFilter]);

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

  const colCount = (selectable ? 1 : 0) + 14;

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search name, company, LinkedIn..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-8 h-8 text-xs" />
        </div>
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
        <Select value={messageTypeFilter} onValueChange={v => { setMessageTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue placeholder="Message Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
          </SelectContent>
        </Select>
        {assignedUsers.length > 0 && (
          <Select value={assignedFilter} onValueChange={v => { setAssignedFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Assigned User" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {assignedUsers.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {actions}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} leads</span>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: '1800px' }}>
            <thead>
              <tr className="bg-muted/50 border-b border-border sticky top-0 z-10">
                {selectable && (
                  <th className="w-8 px-2 py-2 whitespace-nowrap"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></th>
                )}
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap w-[50px]">#</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[120px]">Full Name</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[110px]">Company</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[140px]">LinkedIn URL</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[80px]">Region</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">Company Profile</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">Person Summary</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[130px]">InMail Subject</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">InMail Message A</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">InMail Message B</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[160px]">Connection Request Note</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[130px]">InMail Message Type Sent</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[90px]">Priority</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap min-w-[120px]">Assigned User Name</th>
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
                    {/* Serial Number */}
                    <td className="px-3 py-1.5 text-muted-foreground">{lead.sr_no}</td>
                    {/* Full Name */}
                    <td className="px-3 py-1.5 font-medium text-foreground whitespace-nowrap">{lead.full_name}</td>
                    {/* Company */}
                    <td className="px-3 py-1.5 text-foreground whitespace-nowrap">{lead.company}</td>
                    {/* LinkedIn URL */}
                    <td className="px-3 py-1.5" onClick={e => e.stopPropagation()}>
                      <a
                        href={lead.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline whitespace-nowrap"
                      >
                        <span>{truncateUrl(lead.linkedin_url)}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>
                    {/* Region */}
                    <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">{lead.location}</td>
                    {/* Company Profile */}
                    <td className="px-3 py-1.5 text-muted-foreground">
                      <TruncatedCell text={lead.company_profile} />
                    </td>
                    {/* Person Summary */}
                    <td className="px-3 py-1.5 text-muted-foreground">
                      <TruncatedCell text={lead.person_summary} />
                    </td>
                    {/* InMail Subject */}
                    <td className="px-3 py-1.5 text-muted-foreground">
                      <TruncatedCell text={lead.inmail_subject} max={40} />
                    </td>
                    {/* InMail Message A */}
                    <td className="px-3 py-1.5 text-muted-foreground">
                      <TruncatedCell text={lead.message_a} />
                    </td>
                    {/* InMail Message B */}
                    <td className="px-3 py-1.5 text-muted-foreground">
                      <TruncatedCell text={lead.message_b} />
                    </td>
                    {/* Connection Request Note */}
                    <td className="px-3 py-1.5 text-muted-foreground">
                      {latestNote ? <TruncatedCell text={latestNote.content} max={40} /> : <span>—</span>}
                    </td>
                    {/* InMail Message Type Sent */}
                    <td className="px-3 py-1.5 text-muted-foreground">{lead.selected_message || '—'}</td>
                    {/* Priority */}
                    <td className="px-3 py-1.5" onClick={e => e.stopPropagation()}>
                      {(() => {
                        const colorEligible = lead.status === 'request_accepted' || lead.status === 'response_back';
                        if (canSetPriority && colorEligible) {
                          return (
                            <PriorityDot
                              priority={lead.priority_color}
                              interactive
                              onSelect={(p) => setPriority(lead.id, p, user?.name || '')}
                            />
                          );
                        }
                        if (!colorEligible) {
                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 text-xs cursor-default text-muted-foreground">
                                  {pd.emoji && <span>{pd.emoji}</span>}
                                  <span>{pd.label}</span>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Color can only be selected after Request Accepted stage</TooltipContent>
                            </Tooltip>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1 text-xs">
                            {pd.emoji && <span>{pd.emoji}</span>}
                            <span className="text-muted-foreground">{pd.label}</span>
                          </span>
                        );
                      })()}
                    </td>
                    {/* Assigned User Name */}
                    <td className="px-3 py-1.5 text-muted-foreground truncate">{lead.assigned_to || 'Unassigned'}</td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={colCount} className="px-3 py-10 text-center text-muted-foreground">No leads found</td></tr>
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

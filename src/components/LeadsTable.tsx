import { useState, useMemo } from 'react';
import { Lead, LeadStatus, STATUS_LABELS } from '@/types/leads';
import StatusBadge from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  pageSize?: number;
  actions?: React.ReactNode;
}

const LeadsTable = ({
  leads, onLeadClick, selectable = false, selectedIds = [], onSelectionChange, pageSize = 20, actions,
}: LeadsTableProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = leads;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l => l.full_name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter);
    return result;
  }, [leads, search, statusFilter]);

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
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name or company..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        {actions}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} leads</span>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border sticky top-0">
                {selectable && (
                  <th className="w-10 px-3 py-3"><Checkbox checked={allSelected} onCheckedChange={toggleAll} /></th>
                )}
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-14">#</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Full Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Company</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assigned To</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-16">Msg</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  {selectable && (
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <Checkbox checked={selectedIds.includes(lead.id)} onCheckedChange={() => toggleOne(lead.id)} />
                    </td>
                  )}
                  <td className="px-4 py-3 text-muted-foreground">{lead.sr_no}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{lead.full_name}</td>
                  <td className="px-4 py-3 text-foreground">{lead.company}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.location}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.assigned_to || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.selected_message || '—'}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTable;

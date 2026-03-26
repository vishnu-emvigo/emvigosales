import { Lead, SalesRep } from '@/types/leads';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle } from 'lucide-react';

interface Props {
  leads: Lead[];
  reps: SalesRep[];
  compact?: boolean;
}

const RepPerformanceTable = ({ leads, reps, compact }: Props) => {
  const navigate = useNavigate();

  const repData = reps.map(rep => {
    const repLeads = leads.filter(l => l.assigned_to === rep.name);
    const contacted = repLeads.filter(l => ['inmail_sent', 'connection_sent', 'request_accepted', 'response_back'].includes(l.status)).length;
    const responses = repLeads.filter(l => l.status === 'response_back').length;
    const pending = repLeads.filter(l => l.status === 'assigned').length;
    const conversionPct = repLeads.length > 0 ? Math.round((responses / repLeads.length) * 100) : 0;
    const overdue = pending;

    return { rep, total: repLeads.length, contacted, responses, conversionPct, pending, overdue };
  });

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
      <h2 className="text-sm font-semibold text-foreground mb-3">
        {compact ? 'Team Performance' : 'Sales Rep Performance'}
      </h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Rep</TableHead>
              <TableHead className="text-xs text-right">Assigned</TableHead>
              {!compact && <TableHead className="text-xs text-right">Contacted</TableHead>}
              <TableHead className="text-xs text-right">Responses</TableHead>
              <TableHead className="text-xs text-right">Conv %</TableHead>
              <TableHead className="text-xs text-right">Pending</TableHead>
              {!compact && <TableHead className="text-xs text-right">Overdue</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {repData.map(({ rep, total, contacted, responses, conversionPct, pending, overdue }) => (
              <Tooltip key={rep.id}>
                <TooltipTrigger asChild>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/leads?assigned=${encodeURIComponent(rep.name)}`)}
                  >
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-primary">{rep.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium">{rep.name}</span>
                        {rep.status === 'on_leave' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Leave</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm">{total}</TableCell>
                    {!compact && <TableCell className="text-right text-sm">{contacted}</TableCell>}
                    <TableCell className="text-right text-sm">{responses}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{conversionPct}%</TableCell>
                    <TableCell className="text-right text-sm">{pending}</TableCell>
                    {!compact && (
                      <TableCell className="text-right">
                        {overdue > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm text-destructive">
                            <AlertTriangle className="w-3 h-3" /> {overdue}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">0</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                </TooltipTrigger>
                <TooltipContent><p>Click to view {rep.name}'s leads</p></TooltipContent>
              </Tooltip>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RepPerformanceTable;

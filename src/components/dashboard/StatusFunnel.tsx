import { Lead, LeadStatus, STATUS_LABELS } from '@/types/leads';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const FUNNEL_STAGES: LeadStatus[] = ['assigned', 'mail_sent', 'connection_sent', 'request_accepted', 'response_back'];

const STAGE_COLORS = [
  'bg-blue-500', 'bg-amber-500', 'bg-orange-500', 'bg-emerald-500', 'bg-green-600',
];

interface Props { leads: Lead[] }

const StatusFunnel = ({ leads }: Props) => {
  const navigate = useNavigate();
  const assigned = leads.filter(l => l.status !== 'not_assigned');
  const counts = FUNNEL_STAGES.map(s => leads.filter(l => l.status === s).length);
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
      <h2 className="text-sm font-semibold text-foreground mb-4">Status Funnel</h2>
      <div className="space-y-3">
        {FUNNEL_STAGES.map((stage, i) => {
          const count = counts[i];
          const prevCount = i === 0 ? assigned.length : counts[i - 1];
          const dropOff = prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0;
          const widthPct = Math.max((count / maxCount) * 100, 8);

          return (
            <Tooltip key={stage}>
              <TooltipTrigger asChild>
                <div
                  className="cursor-pointer group"
                  onClick={() => navigate(`/leads?status=${stage}`)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{STATUS_LABELS[stage]}</span>
                    <span className="text-xs text-muted-foreground">
                      {count} {i > 0 && <span className="text-destructive/70">(-{dropOff}%)</span>}
                    </span>
                  </div>
                  <div className="h-7 bg-muted rounded-md overflow-hidden">
                    <div
                      className={`h-full ${STAGE_COLORS[i]} rounded-md transition-all group-hover:opacity-80`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{count} leads — click to view filtered list</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default StatusFunnel;

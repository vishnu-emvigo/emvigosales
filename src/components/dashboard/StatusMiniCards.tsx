import { Lead, LeadStatus, STATUS_LABELS } from '@/types/leads';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const STAGE_COLORS: Record<LeadStatus, string> = {
  not_assigned: 'border-muted-foreground/30 bg-muted/50',
  assigned: 'border-blue-300 bg-blue-50',
  mail_sent: 'border-amber-300 bg-amber-50',
  connection_sent: 'border-orange-300 bg-orange-50',
  request_accepted: 'border-emerald-300 bg-emerald-50',
  response_back: 'border-green-400 bg-green-50',
  meeting: 'border-purple-300 bg-purple-50',
  converted_to_customer: 'border-teal-300 bg-teal-50',
};

interface Props { leads: Lead[] }

const StatusMiniCards = ({ leads }: Props) => {
  const navigate = useNavigate();
  const statuses: LeadStatus[] = ['assigned', 'mail_sent', 'connection_sent', 'request_accepted', 'response_back', 'meeting', 'converted_to_customer'];

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
      <h2 className="text-sm font-semibold text-foreground mb-3">Status Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {statuses.map(s => {
          const count = leads.filter(l => l.status === s).length;
          return (
            <Tooltip key={s}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => navigate(`/leads?status=${s}`)}
                  className={`cursor-pointer rounded-lg border p-3 text-center transition-all hover:shadow-elevated hover:-translate-y-0.5 ${STAGE_COLORS[s]}`}
                >
                  <p className="text-lg font-bold text-foreground">{count}</p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{STATUS_LABELS[s]}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent><p>Click to view {STATUS_LABELS[s]} leads</p></TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default StatusMiniCards;

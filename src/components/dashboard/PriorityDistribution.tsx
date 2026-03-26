import { Lead, PriorityColor } from '@/types/leads';
import { useNavigate } from 'react-router-dom';

interface Props {
  leads: Lead[];
  title?: string;
}

const COLORS: Record<PriorityColor, { bg: string; text: string; border: string; label: string; emoji: string }> = {
  red: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', label: 'High Priority', emoji: '🔴' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', label: 'Medium Priority', emoji: '🟠' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', label: 'Low Priority', emoji: '🟢' },
  none: { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-border', label: 'No Priority', emoji: '⚪' },
};

const PriorityDistribution = ({ leads, title = 'Priority Distribution' }: Props) => {
  const navigate = useNavigate();
  const priorities: PriorityColor[] = ['red', 'amber', 'green'];

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-card">
      <h2 className="text-sm font-semibold text-foreground mb-3">{title}</h2>
      <div className="grid grid-cols-3 gap-3">
        {priorities.map(p => {
          const c = COLORS[p];
          const count = leads.filter(l => l.priority_color === p).length;
          return (
            <div
              key={p}
              onClick={() => navigate(`/leads?priority=${p}`)}
              className={`cursor-pointer rounded-lg border ${c.border} ${c.bg} p-4 text-center transition-all hover:shadow-elevated hover:-translate-y-0.5`}
            >
              <p className="text-2xl font-bold">{c.emoji}</p>
              <p className={`text-xl font-bold ${c.text}`}>{count}</p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{c.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriorityDistribution;

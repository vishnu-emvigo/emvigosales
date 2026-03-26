import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  href?: string;
  alert?: boolean;
  tooltip?: string;
  className?: string;
}

const KPICard = ({ title, value, subtitle, icon, href, alert, tooltip, className }: KPICardProps) => {
  const navigate = useNavigate();
  const card = (
    <div
      onClick={href ? () => navigate(href) : undefined}
      className={cn(
        'bg-card rounded-xl p-5 shadow-card border border-border transition-all',
        href && 'cursor-pointer hover:shadow-elevated hover:-translate-y-0.5',
        alert && 'border-destructive/40 bg-destructive/5',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className={cn('text-2xl font-bold', alert ? 'text-destructive' : 'text-foreground')}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          alert ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
        )}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent><p>{tooltip}</p></TooltipContent>
      </Tooltip>
    );
  }
  return card;
};

export default KPICard;

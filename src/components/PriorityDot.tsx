import { PriorityColor } from '@/types/leads';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const DOT_STYLES: Record<PriorityColor, string> = {
  red: 'bg-destructive',
  amber: 'bg-amber-500',
  green: 'bg-emerald-500',
  none: 'bg-muted-foreground/30',
};

const LABELS: Record<PriorityColor, string> = {
  red: 'Red',
  amber: 'Amber',
  green: 'Green',
  none: 'No Priority',
};

interface PriorityDotProps {
  priority: PriorityColor;
  size?: 'sm' | 'md';
  interactive?: boolean;
  onSelect?: (p: PriorityColor) => void;
}

const PriorityDot = ({ priority, size = 'sm', interactive, onSelect }: PriorityDotProps) => {
  const sizeClass = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';

  if (interactive && onSelect) {
    return (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        {(['red', 'amber', 'green', 'none'] as PriorityColor[]).map(p => (
          <Tooltip key={p}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSelect(p)}
                className={cn(
                  'rounded-full transition-all ring-offset-background',
                  sizeClass,
                  DOT_STYLES[p],
                  priority === p && 'ring-2 ring-ring ring-offset-1',
                )}
              />
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">{LABELS[p]}</p></TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-block rounded-full', sizeClass, DOT_STYLES[priority])} />
      </TooltipTrigger>
      <TooltipContent side="top"><p className="text-xs">{LABELS[priority]}</p></TooltipContent>
    </Tooltip>
  );
};

export default PriorityDot;

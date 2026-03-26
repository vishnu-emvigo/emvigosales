import { STATUS_LABELS, STATUS_COLORS, type LeadStatus } from '@/types/leads';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[status], className)}>
    {STATUS_LABELS[status]}
  </span>
);

export default StatusBadge;

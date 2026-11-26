import React from 'react';
import {
  Clock,
  Droplets,
  Flame,
  PackageCheck,
  CheckCircle2,
  BadgeCheck,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StsPsn, StsByr } from '@shared/schemas';

interface StatusBadgeProps {
  status: StsPsn | StsByr | 'Belum Lunas';
  className?: string;
  size?: 'sm' | 'default';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = 'default',
}) => {
  let styleClass = 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]';
  let Icon: React.ElementType = Clock;

  switch (status) {
    case 'Antrean':
      styleClass = 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]';
      Icon = Clock;
      break;
    case 'Sedang Dicuci':
      styleClass = 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
      Icon = Droplets;
      break;
    case 'Sedang Disetrika':
      styleClass = 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      Icon = Flame;
      break;
    case 'Siap Diambil':
      styleClass = 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]';
      Icon = PackageCheck;
      break;
    case 'Sudah Diambil':
      styleClass = 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      Icon = CheckCircle2;
      break;
    case 'Lunas':
      styleClass = 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      Icon = BadgeCheck;
      break;
    case 'Belum Lunas':
      styleClass = 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]';
      Icon = AlertCircle;
      break;
  }

  const sizeClasses =
    size === 'sm' ? 'text-xs px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-sm border select-none tabular-nums tracking-tight whitespace-nowrap',
        styleClass,
        sizeClasses,
        className
      )}
    >
      <Icon className="size-3.5 shrink-0 stroke-[2]" aria-hidden="true" />
      {status}
    </span>
  );
};

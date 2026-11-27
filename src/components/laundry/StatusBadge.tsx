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
  let styleClass = 'bg-[#F1F5F6] text-[#334155] border-[#D5DEE2]';
  let Icon: React.ElementType = Clock;

  switch (status) {
    case 'Antrean':
      styleClass = 'bg-[#F1F5F6] text-[#334155] border-[#D5DEE2]';
      Icon = Clock;
      break;
    case 'Sedang Dicuci':
      styleClass = 'bg-[#EEF6FB] text-[#005A94] border-[#C2DDF0]';
      Icon = Droplets;
      break;
    case 'Sedang Disetrika':
      styleClass = 'bg-[#FEF7EA] text-[#92400E] border-[#F3D9A6]';
      Icon = Flame;
      break;
    case 'Siap Diambil':
      styleClass = 'bg-[#ECFEFF] text-[#0E7490] border-[#A5E4EE]';
      Icon = PackageCheck;
      break;
    case 'Sudah Diambil':
      styleClass = 'bg-[#ECFDF5] text-[#166534] border-[#A7E8C9]';
      Icon = CheckCircle2;
      break;
    case 'Lunas':
      styleClass = 'bg-[#ECFDF5] text-[#166534] border-[#A7E8C9]';
      Icon = BadgeCheck;
      break;
    case 'Belum Lunas':
      styleClass = 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
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

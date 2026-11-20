import React from 'react';
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
  let bgClass = 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]';
  let dotClass = 'bg-[#9CA3AF]';

  switch (status) {
    case 'Antrean':
      bgClass = 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]';
      dotClass = 'bg-[#6B7280]';
      break;
    case 'Sedang Dicuci':
      bgClass = 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]';
      dotClass = 'bg-[#2563EB] animate-pulse';
      break;
    case 'Sedang Disetrika':
      bgClass = 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      dotClass = 'bg-[#D97706]';
      break;
    case 'Siap Diambil':
      bgClass = 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]';
      dotClass = 'bg-[#7C3AED]';
      break;
    case 'Sudah Diambil':
    case 'Lunas':
      bgClass = 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      dotClass = 'bg-[#16A34A]';
      break;
    case 'Belum Lunas':
      bgClass = 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]';
      dotClass = 'bg-[#DC2626]';
      break;
  }

  const sizeClasses =
    size === 'sm' ? 'text-xs px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-2';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border shadow-2xs select-none tabular-nums tracking-tight',
        bgClass,
        sizeClasses,
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full shrink-0', dotClass)} />
      {status}
    </span>
  );
};

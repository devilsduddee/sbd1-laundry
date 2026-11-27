import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Check, Clock, Droplets, Flame, PackageCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StsPsn } from '@shared/schemas';

interface OrderStepperProps {
  currentStatus: StsPsn;
  className?: string;
}

const STEPS: { status: StsPsn; label: string; icon: React.ElementType }[] = [
  { status: 'Antrean', label: 'Antrean', icon: Clock },
  { status: 'Sedang Dicuci', label: 'Dicuci', icon: Droplets },
  { status: 'Sedang Disetrika', label: 'Disetrika', icon: Flame },
  { status: 'Siap Diambil', label: 'Siap Diambil', icon: PackageCheck },
  { status: 'Sudah Diambil', label: 'Selesai', icon: CheckCircle2 },
];

export const OrderStepper: React.FC<OrderStepperProps> = ({
  currentStatus,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);
  const progressPercent = Math.max(
    0,
    Math.min(100, (currentIndex / (STEPS.length - 1)) * 100)
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${progressPercent}%`;
        }
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (progressBarRef.current) {
          gsap.to(progressBarRef.current, {
            width: `${progressPercent}%`,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      });
    },
    { dependencies: [currentStatus], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={cn('w-full py-4 px-2 relative select-none print:hidden', className)}
    >
      {/* Background Track Line */}
      <div className="absolute top-[34px] left-[36px] right-[36px] h-[2px] bg-[#D5E4E4] -translate-y-1/2 z-0" />

      {/* Active Progress Bar (Ocean Blue #006EB3) */}
      <div
        ref={progressBarRef}
        style={{ width: `${progressPercent}%` }}
        className="absolute top-[34px] left-[36px] h-[2px] bg-[#006EB3] -translate-y-1/2 z-0 origin-left transition-none"
      />

      {/* Stepper Nodes */}
      <div className="relative z-10 flex justify-between items-start">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.status}
              className="flex flex-col items-center group cursor-default"
            >
              <div
                className={cn(
                  'size-9 rounded-md flex items-center justify-center border transition-colors duration-200',
                  isDone && 'bg-[#006EB3] border-[#006EB3] text-white',
                  isCurrent &&
                    'bg-white border-2 border-[#0B253B] text-[#0B253B] ring-4 ring-[#D5ECEB] font-semibold',
                  !isDone &&
                    !isCurrent &&
                    'bg-white border-[#D5E4E4] text-[#425869]'
                )}
              >
                {isDone ? (
                  <Check className="size-4 stroke-[2.25]" aria-hidden="true" />
                ) : (
                  <Icon className="size-4 stroke-[1.75]" aria-hidden="true" />
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs text-center font-sans transition-colors duration-200',
                  isCurrent && 'text-[#0B253B] font-semibold',
                  isDone && 'text-[#006EB3] font-medium',
                  !isDone && !isCurrent && 'text-[#425869]'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

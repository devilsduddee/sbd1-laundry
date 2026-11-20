import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Check, Clock, Sparkles, Shirt, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STS_PSN, type StsPsn } from '@shared/schemas';

interface OrderStepperProps {
  currentStatus: StsPsn;
  className?: string;
}

const STEPS: { status: StsPsn; label: string; icon: React.ElementType }[] = [
  { status: 'Antrean', label: 'Antrean', icon: Clock },
  { status: 'Sedang Dicuci', label: 'Dicuci', icon: Sparkles },
  { status: 'Sedang Disetrika', label: 'Disetrika', icon: Shirt },
  { status: 'Siap Diambil', label: 'Siap Diambil', icon: Check },
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
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) {
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${progressPercent}%`;
        }
        return;
      }

      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          width: `${progressPercent}%`,
          duration: 0.35,
          ease: 'power2.out',
        });
      }

      // Micro pulse on current step dot
      gsap.fromTo(
        '.step-active-dot',
        { scale: 0.9 },
        { scale: 1.05, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut' }
      );
    },
    { dependencies: [currentStatus], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={cn('w-full py-4 px-2 relative select-none', className)}
    >
      {/* Background Track Line */}
      <div className="absolute top-[28px] left-[32px] right-[32px] h-1 bg-[#E4E7F2] -translate-y-1/2 z-0 rounded-full" />

      {/* Active Progress Bar */}
      <div
        ref={progressBarRef}
        style={{ width: `${progressPercent}%` }}
        className="absolute top-[28px] left-[32px] h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 -translate-y-1/2 z-0 rounded-full origin-left transition-none"
      />

      {/* Stepper Dots */}
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
                  'size-9 rounded-full flex items-center justify-center border-2 transition-colors duration-200 shadow-2xs',
                  isDone && 'bg-indigo-600 border-indigo-600 text-white',
                  isCurrent &&
                    'step-active-dot bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-50 font-semibold',
                  !isDone &&
                    !isCurrent &&
                    'bg-white border-[#E4E7F2] text-[#9CA3AF]'
                )}
              >
                {isDone ? (
                  <Check className="size-4 stroke-[2.5]" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs text-center font-medium transition-colors duration-200',
                  isCurrent && 'text-indigo-600 font-semibold',
                  isDone && 'text-[#1A1A2E]',
                  !isDone && !isCurrent && 'text-[#9CA3AF]'
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

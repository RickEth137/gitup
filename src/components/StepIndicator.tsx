'use client';

import { Check } from 'lucide-react';
import { LaunchStep } from '@/store/launchStore';

interface StepIndicatorProps {
  currentStep: LaunchStep;
}

const steps: { key: LaunchStep; label: string }[] = [
  { key: 'connect', label: 'Connect' },
  { key: 'select', label: 'Select Repo' },
  { key: 'brand', label: 'Brand Token' },
  { key: 'launch', label: 'Launch' },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep === 'complete' || index < currentIndex;
          const isCurrent = index === currentIndex && currentStep !== 'complete';
          const isPending = index > currentIndex && currentStep !== 'complete';

          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    font-medium text-xs transition-all duration-300
                    ${isCompleted ? 'bg-primary text-dark' : ''}
                    ${isCurrent ? 'bg-primary text-dark' : ''}
                    ${isPending ? 'bg-surface text-muted border border-border' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check size={14} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs
                    ${isCompleted || isCurrent ? 'text-primary' : 'text-muted'}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-px mx-6 transition-colors duration-300
                    ${index < currentIndex || currentStep === 'complete' ? 'bg-primary' : 'bg-border'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;

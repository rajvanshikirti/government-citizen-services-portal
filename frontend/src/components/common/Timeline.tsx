import { Check, Circle } from 'lucide-react';
import { StatusBadge } from './Badge';
import { formatDate } from '../../utils/helpers';
import type { ApplicationStatus } from '../../types';

interface TimelineStep {
  status: ApplicationStatus | string;
  label: string;
  date?: string;
  remarks?: string;
  completed: boolean;
  active: boolean;
}

const DEFAULT_STEPS: { status: ApplicationStatus; label: string }[] = [
  { status: 'SUBMITTED', label: 'Submitted' },
  { status: 'UNDER_REVIEW', label: 'Under Review' },
  { status: 'UNDER_REVIEW', label: 'Documents Verified' },
  { status: 'APPROVED', label: 'Approved' },
];

interface ApplicationTimelineProps {
  currentStatus: ApplicationStatus;
  statusHistory?: { status: ApplicationStatus; remarks?: string; createdAt: string }[];
  remarks?: string;
}

const STATUS_ORDER: ApplicationStatus[] = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED', 'REJECTED'];

export function ApplicationTimeline({ currentStatus, statusHistory = [], remarks }: ApplicationTimelineProps) {
  if (currentStatus === 'REJECTED') {
    const lastHistory = statusHistory[0];
    return (
      <div className="space-y-6">
        <TimelineItem
          step={{ status: 'REJECTED', label: 'Application Rejected', completed: true, active: true, remarks: remarks || lastHistory?.remarks, date: lastHistory?.createdAt }}
          isLast
        />
        {statusHistory.slice(1).map((h, i) => (
          <TimelineItem
            key={h.createdAt}
            step={{ status: h.status, label: h.status.replace(/_/g, ' '), completed: true, active: false, remarks: h.remarks, date: h.createdAt }}
            isLast={i === statusHistory.length - 2}
          />
        ))}
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const steps: TimelineStep[] = DEFAULT_STEPS.map((step, index) => {
    const historyEntry = statusHistory.find((h) => h.status === step.status);
    const stepIndex = step.status === 'APPROVED' ? 3 : index;
    return {
      ...step,
      completed: currentIndex >= stepIndex || currentStatus === 'COMPLETED',
      active: currentStatus === step.status || (step.status === 'APPROVED' && ['APPROVED', 'COMPLETED'].includes(currentStatus)),
      date: historyEntry?.createdAt,
      remarks: historyEntry?.remarks,
    };
  });

  if (currentStatus === 'COMPLETED') {
    steps[3] = { ...steps[3], label: 'Completed', completed: true, active: true };
  }

  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <TimelineItem key={step.label} step={step} isLast={i === steps.length - 1} />
      ))}
    </div>
  );
}

function TimelineItem({ step, isLast }: { step: TimelineStep; isLast: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
            step.completed
              ? 'bg-gov-blue border-gov-blue text-white'
              : step.active
              ? 'border-gov-blue bg-gov-blue-light text-gov-blue'
              : 'border-gov-border bg-white text-gov-muted dark:bg-slate-800 dark:border-slate-600'
          }`}
        >
          {step.completed ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[2rem] ${step.completed ? 'bg-gov-blue' : 'bg-gov-border dark:bg-slate-600'}`} />
        )}
      </div>
      <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold ${step.active || step.completed ? 'text-gov-text dark:text-white' : 'text-gov-muted'}`}>
            {step.label}
          </p>
          <StatusBadge status={step.status} />
        </div>
        {step.date && <p className="text-xs text-gov-muted mt-1">{formatDate(step.date)}</p>}
        {step.remarks && (
          <p className="text-sm text-gov-muted mt-2 p-3 bg-gov-bg dark:bg-slate-800 rounded-md border border-gov-border dark:border-slate-700">
            <span className="font-semibold text-gov-text dark:text-slate-300">Officer Remarks: </span>
            {step.remarks}
          </p>
        )}
      </div>
    </div>
  );
}

interface StepWizardProps {
  steps: string[];
  currentStep: number;
}

export function StepWizard({ steps, currentStep }: StepWizardProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, i) => (
          <li key={step} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < currentStep
                    ? 'bg-gov-blue text-white'
                    : i === currentStep
                    ? 'bg-gov-blue-light text-gov-blue border-2 border-gov-blue'
                    : 'bg-gov-bg text-gov-muted border border-gov-border'
                }`}
              >
                {i < currentStep ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-sm font-medium hidden sm:block ${i <= currentStep ? 'text-gov-text' : 'text-gov-muted'}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < currentStep ? 'bg-gov-blue' : 'bg-gov-border'}`} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

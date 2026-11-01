import React from 'react';
import { OrderStatus } from '../types';
import { CheckCircle2, Clock, ChefHat, PackageCheck, Ban, ArrowRight } from 'lucide-react';

interface Props {
  status: OrderStatus;
  cancellationReason?: string;
}

const steps: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'PLACED', label: 'Placed', icon: <Clock className="w-5 h-5" /> },
  { key: 'ACCEPTED', label: 'Accepted', icon: <CheckCircle2 className="w-5 h-5" /> },
  { key: 'PREPARING', label: 'Preparing', icon: <ChefHat className="w-5 h-5" /> },
  { key: 'READY', label: 'Ready for Pickup', icon: <PackageCheck className="w-5 h-5" /> },
  { key: 'COMPLETED', label: 'Completed', icon: <CheckCircle2 className="w-5 h-5" /> },
];

export const OrderTimeline: React.FC<Props> = ({ status, cancellationReason }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
        <Ban className="w-6 h-6 text-red-500 shrink-0" />
        <div>
          <span className="font-semibold block">Order Cancelled</span>
          {cancellationReason && <span className="text-sm text-red-600">Reason: {cancellationReason}</span>}
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-brand-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCurrent
                    ? 'bg-brand-500 text-white shadow-lg ring-4 ring-brand-100 scale-110'
                    : isDone
                    ? 'bg-brand-500 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`text-xs mt-2 font-medium hidden sm:block ${
                  isCurrent ? 'text-brand-600 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                }`}
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


import React from 'react';
import { useRedAlert } from '../../../hooks/useRedAlert';
import { checkOverdue } from '../../../utils/checkOverdue';
import { formatDate } from '../../../utils/formatDate';

export const UrgentAlerts = () => {
  const { overdueCases, count, hasAlerts } = useRedAlert();

  return (
    <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest p-card-padding rounded-xl card-shadow">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-error">warning</span>
          Tenggat Waktu Dekat
        </h4>
        <span className="text-[11px] font-bold px-2 py-0.5 bg-error-container text-on-error-container rounded-full">
          {count} Berkas Kritis
        </span>
      </div>

      <div className="space-y-3">
        {hasAlerts ? (
          overdueCases.map((c) => (
            <div 
              key={c.id} 
              className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-error-container text-on-error-container w-10 h-10 rounded flex items-center justify-center font-bold text-[13px]">
                  {c.serviceType === 'CV_PT' ? 'PT' : c.serviceType}
                </div>
                <div className="text-left">
                  <p className="font-bold text-on-surface text-body-md">
                    {c.serviceType === 'CV_PT' ? `Akte Pendirian ${c.clientName}` : `${c.serviceType} No. ${c.caseNumber} - ${c.clientName}`}
                  </p>
                  <p className="text-label-sm text-on-surface-variant text-[11px]">
                    Staf: {c.assignedStaff}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-error-container text-on-error-container text-[11px] font-bold rounded-full animate-pulse">
                Overdue ({formatDate(c.estimationDate)})
              </span>
            </div>
          ))
        ) : (
          <div className="py-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-[36px] text-secondary mb-2">check_circle</span>
            <p className="text-on-surface-variant text-[13px]">
              Semua berkas aman! Tidak ada berkas yang overdue saat ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrgentAlerts;

import React from 'react';
import { useCases } from '../../../hooks/useCases';

export const RecentActivity = () => {
  const { activities } = useCases();
  const displayActivities = (activities || []).slice(0, 6);

  return (
    <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest p-card-padding rounded-xl card-shadow">
      <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-6 text-left">
        Recent Activity
      </h4>
      
      {displayActivities.length === 0 ? (
        <p className="text-body-md text-on-surface-variant text-center py-8">Belum ada aktivitas terekam.</p>
      ) : (
        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant text-left">
          {displayActivities.map((act) => (
            <div key={act.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[22px] top-1.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-body-md text-on-surface font-bold text-[13px] flex items-center gap-2">
                    {act.user} 
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                      act.category === 'PPAT' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-primary'
                    }`}>
                      {act.category}
                    </span>
                    <span className="font-normal text-on-surface-variant">{act.action}</span>
                  </p>
                  <p className="text-[11px] text-primary font-semibold mt-0.5">
                    {act.target}
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    {act.timestamp}
                  </p>
                </div>
                
                <div className="p-1.5 bg-surface-container-high rounded text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">{act.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;

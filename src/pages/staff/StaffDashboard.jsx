import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useCases } from '../../hooks/useCases';
import { useRedAlert } from '../../hooks/useRedAlert';
import CaseTable from '../../components/features/staff/CaseTable';

export const StaffDashboard = () => {
  // Retrieve search values from the Layout Topbar search input dynamically
  const { searchVal } = useOutletContext();
  const { cases } = useCases();
  const { count: overdueCount } = useRedAlert();

  const activeCount = cases.filter((c) => !c.isComplete).length;
  const actionRequiredCount = cases.filter((c) => !c.isComplete && !c.documentsReady).length;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Metric Cards - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        
        {/* KPI Card 1: File Aktif */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden text-left flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-on-surface-variant/70 font-bold text-[12px] uppercase tracking-wider">
              File Aktif
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <h3 className="text-[32px] font-extrabold text-on-surface leading-none">
                {activeCount}
              </h3>
              <span className="text-primary text-[11px] font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px] font-bold">trending_up</span>
                <span>+2</span>
              </span>
            </div>
          </div>
          {/* Bottom Progress Indicator */}
          <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden mt-6">
            <div className="bg-primary h-full rounded-full w-2/3"></div>
          </div>
        </div>

        {/* KPI Card 2: Membutuhkan Tindakan */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden text-left flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-on-surface-variant/70 font-bold text-[12px] uppercase tracking-wider">
              Membutuhkan Tindakan
            </p>
            <h3 className="text-[32px] font-extrabold text-on-surface leading-none mt-1.5">
              {actionRequiredCount}
            </h3>
          </div>
          {/* Bottom Progress Indicator */}
          <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden mt-6">
            <div className="bg-warning h-full rounded-full w-1/3"></div>
          </div>
        </div>

        {/* KPI Card 3: Terlambat Kritis */}
        <div className="bg-[#FEF2F2] border border-[#FECACA] p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden text-left flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-error/80 font-bold text-[12px] uppercase tracking-wider">
              Terlambat Kritis
            </p>
            <div className="flex items-baseline gap-2.5 mt-1.5">
              <h3 className="text-[32px] font-extrabold text-error leading-none">
                {overdueCount}
              </h3>
              <span className="text-error text-[10px] font-extrabold bg-error-container px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                ! Tindakan
              </span>
            </div>
          </div>
          {/* Bottom Progress Indicator */}
          <div className="w-full bg-error-container/30 h-1.5 rounded-full overflow-hidden mt-6">
            <div className="bg-error h-full rounded-full w-3/4"></div>
          </div>
        </div>

      </div>

      {/* Registry File Aktif Table */}
      <div>
        <CaseTable searchVal={searchVal} />
      </div>
      
    </div>
  );
};

export default StaffDashboard;

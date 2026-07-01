import React from 'react';
import { useCases } from '../../hooks/useCases';
import { useRedAlert } from '../../hooks/useRedAlert';
import MetricCard from '../../components/common/MetricCard';
import UrgentAlerts from '../../components/features/owner/UrgentAlerts';
import RecentActivity from '../../components/features/owner/RecentActivity';

export const OwnerDashboard = () => {
  const { cases } = useCases();
  const { count: overdueCount } = useRedAlert();

  // Dynamic calculations based on Cases Context state
  const totalCount = cases.length;
  const completedCount = cases.filter((c) => c.status === 'Selesai').length;

  return (
    <div className="space-y-8 font-sans">
      
      {/* Dashboard Header (24px - 30px size range) */}
      <div className="mb-8 flex justify-between items-end text-left">
        <div>
          <h2 className="text-[30px] font-extrabold text-text tracking-tight">Executive Overview</h2>
          <p className="text-[14px] text-muted mt-1.5 font-medium">Real-time operational performance of NotaryDoc Pro.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 h-11 border border-outline-variant rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-body-md font-semibold text-[14px]">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-5 h-11 border border-outline-variant rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-body-md font-semibold text-[14px]">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Bento Layout Container: Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* KPI Card 1: Total Documents */}
        <MetricCard
          title="Total Documents"
          value={totalCount.toLocaleString()}
          icon="description"
          change="+12.5%"
          color="primary"
          footerText="Total finalized files this month"
        />

        {/* KPI Card 2: Active Clients */}
        <MetricCard
          title="Active Clients"
          value={(totalCount * 3 + 2).toLocaleString()} // mock active scale based on actual cases
          icon="group"
          color="secondary"
          footerText="Active consulting client portfolios"
        />

        {/* KPI Card 3: Completed Documents */}
        <MetricCard
          title="Completed Documents"
          value={completedCount.toLocaleString()}
          icon="task_alt"
          color="tertiary"
          footerText="Files successfully completed"
        />

        {/* KPI Card 4: Completion Rate */}
        <div className="bg-surface-container-lowest border border-outline-variant p-7 rounded-xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
          
          <div className="flex justify-between items-center mb-3">
            <p className="text-[13px] text-on-surface-variant/80 font-semibold uppercase tracking-wider">
              Completion Rate
            </p>
            <span className="text-primary font-bold text-[14px]">{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
          </div>
          
          <h3 className="font-bold text-[18px] text-on-surface mt-2 mb-3">Operational Goal</h3>
          
          <div className="w-full bg-surface-container-high h-4 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(0,108,73,0.3)] transition-all duration-500" 
              style={{ width: `${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%` }}
            />
          </div>
          <p className="text-[12px] text-on-surface-variant mt-3 text-right">Target: 100% Completion</p>
        </div>
      </div>

      {/* Lower Bento Grid: Urgent Alerts + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-grid">
        <UrgentAlerts />
        <RecentActivity />
      </div>
    </div>
  );
};

export default OwnerDashboard;

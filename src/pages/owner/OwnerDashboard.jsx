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
    <div className="space-y-stack-lg font-sans">
      
      {/* Dashboard Header (24px - 30px size range) */}
      <div className="mb-stack-lg flex justify-between items-end text-left">
        <div>
          <h2 className="text-[26px] font-bold text-text">Executive Overview</h2>
          <p className="text-[12.5px] text-muted mt-1 font-medium">Real-time operational performance of NotaryDoc Pro.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-body-md font-semibold text-[13px]">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-body-md font-semibold text-[13px]">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Bento Layout Container: Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-grid">
        
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
        <div className="bg-surface-container-lowest border border-outline-variant p-card-padding rounded-xl shadow-sm text-left flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <p className="text-label-sm text-on-surface-variant font-label-bold uppercase tracking-wider text-[11px] font-bold">
              Completion Rate
            </p>
            <span className="text-primary font-bold text-[13px]">{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-4">Operational Goal</h3>
          <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(0,108,73,0.3)] transition-all duration-500" 
              style={{ width: `${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%` }}
            />
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2 text-right">Target: 100% Completion</p>
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

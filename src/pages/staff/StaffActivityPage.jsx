import React, { useState, useMemo } from 'react';
import { useCases } from '../../hooks/useCases';
import { useAuth } from '../../hooks/useAuth';
import { mockActivities } from '../../data/mockActivities';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { SERVICE_TYPES, SERVICE_CATEGORIES, getCaseCategory } from '../../constants/serviceTypes';

const ACTIVITY_ICONS = {
  upload_file: 'upload_file',
  draw: 'draw',
  fact_check: 'fact_check',
  check_circle: 'check_circle',
  add_circle: 'add_circle',
  edit: 'edit',
  delete: 'delete',
};

const ACTION_TYPES = ['Semua', 'Upload', 'Tanda Tangan', 'Verifikasi', 'Selesai'];

// Generate rich activity log from cases + mock
function buildActivityLog(cases, mockActs) {
  const fromCases = cases.map((c, i) => {
    const category = getCaseCategory(c);
    
    // Map case status to action type dynamically
    let actionType = 'Verifikasi';
    let icon = 'fact_check';
    
    if (c.isComplete || c.status === 'Selesai') {
      actionType = 'Selesai';
      icon = 'check_circle';
    } else if (c.status === 'Tanda Tangan Akta') {
      actionType = 'Tanda Tangan';
      icon = 'draw';
    }
    
    return {
      id: `case-act-${c.id}`,
      user: c.assignedStaff,
      role: 'Staf Administrasi',
      action: c.isComplete
        ? 'Menyelesaikan berkas akta'
        : `Memperbarui status ke "${c.status}"`,
      target: `${c.clientName} (${c.caseNumber})`,
      timestamp: formatDate(c.estimationDate),
      icon,
      type: actionType,
      category,
      serviceType: c.serviceType,
      caseRef: c,
    };
  });

  const fromMock = mockActs.map((a) => {
    let serviceType = null;
    const match = a.target.match(/\(([^)]+)\)/);
    if (match) {
      const extracted = match[1];
      if (extracted === 'Pendirian PT') serviceType = 'PT';
      else if (extracted === 'Waarmerking') serviceType = 'WAARMERKING';
      else if (extracted === 'Hibah') serviceType = 'HIBAH';
      else if (extracted === 'Wasiat') serviceType = 'WASIAT';
      else serviceType = extracted.toUpperCase();
    }

    // Map mock icons to action type accurately
    let actionType = 'Verifikasi';
    if (a.icon === 'upload_file' || a.icon === 'cloud_upload') {
      actionType = 'Upload';
    } else if (a.icon === 'draw') {
      actionType = 'Tanda Tangan';
    } else if (a.icon === 'check_circle') {
      actionType = 'Selesai';
    }

    return {
      ...a,
      category: a.category ? a.category.toUpperCase() : 'PPAT',
      serviceType,
      type: actionType,
      caseRef: null,
    };
  });

  return [...fromMock, ...fromCases];
}

export const StaffActivityPage = () => {
  const { cases } = useCases();
  const { user } = useAuth();
  
  // Filter states
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterService, setFilterService] = useState('Semua');
  const [filterType, setFilterType] = useState('Semua');

  const allActivities = useMemo(() => buildActivityLog(cases, mockActivities), [cases]);

  // Dynamic service list based on selected category
  const serviceOptions = useMemo(() => {
    if (filterCategory === 'Semua') return [];
    return Object.values(SERVICE_TYPES).filter((s) => s.category === filterCategory);
  }, [filterCategory]);

  const handleCategoryChange = (cat) => {
    setFilterCategory(cat);
    setFilterService('Semua');
  };

  const filtered = useMemo(() => {
    return allActivities.filter((a) => {
      const matchType = filterType === 'Semua' || a.type === filterType;
      const matchCategory = filterCategory === 'Semua' || a.category === filterCategory;
      const matchService = filterService === 'Semua' || a.serviceType === filterService;
      
      const matchSearch =
        a.action.toLowerCase().includes(search.toLowerCase()) ||
        a.target.toLowerCase().includes(search.toLowerCase()) ||
        a.user.toLowerCase().includes(search.toLowerCase());
        
      return matchType && matchCategory && matchService && matchSearch;
    });
  }, [allActivities, filterType, filterCategory, filterService, search]);

  // Stats
  const totalActions = allActivities.length;
  const completedActions = allActivities.filter((a) => a.type === 'Selesai').length;
  const uploadActions = allActivities.filter((a) => a.type === 'Upload').length;
  const todayActions = mockActivities.length; // mock recent

  return (
    <div className="space-y-stack-lg text-left">
      {/* Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">Log Aktivitas</h2>
        <p className="text-body-lg text-on-surface-variant mt-1">
          Rekam jejak seluruh tindakan yang dilakukan dalam sistem manajemen berkas.
        </p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter-grid">
        {[
          { label: 'Total Aktivitas', value: totalActions, icon: 'history', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Hari Ini', value: todayActions, icon: 'today', color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Upload Dokumen', value: uploadActions, icon: 'upload_file', color: 'text-tertiary', bg: 'bg-tertiary/10' },
          { label: 'Berkas Selesai', value: completedActions, icon: 'check_circle', color: 'text-secondary', bg: 'bg-secondary/10' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined ${color} text-[20px]`}>{icon}</span>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{label}</p>
              <p className={`font-extrabold text-[20px] mt-0.5 ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 space-y-4">
        {/* Row 1: Search, Reset, Count */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aktivitas, staf, atau berkas..."
              className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-[13px] focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {(search || filterCategory !== 'Semua' || filterService !== 'Semua' || filterType !== 'Semua') && (
            <button
              onClick={() => {
                setSearch('');
                setFilterCategory('Semua');
                setFilterService('Semua');
                setFilterType('Semua');
              }}
              className="py-2.5 px-4 text-error border border-error/20 rounded-lg text-[12px] font-bold hover:bg-error/5 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Reset Filter
            </button>
          )}

          <span className="ml-auto text-[12px] text-on-surface-variant font-bold uppercase tracking-wider bg-surface-container px-3 py-1.5 rounded-lg select-none">
            {filtered.length} Aktivitas
          </span>
        </div>

        {/* Row 2: Category, Service, and Action Type Controls */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-outline-variant/30">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Kategori:</span>
            <select
              value={filterCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="py-2 px-3 bg-surface-container-low border border-outline-variant rounded-lg text-[12px] font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface-variant"
            >
              <option value="Semua">Semua Kategori</option>
              <option value={SERVICE_CATEGORIES.PPAT}>PPAT</option>
              <option value={SERVICE_CATEGORIES.NOTARIS}>NOTARIS</option>
            </select>
          </div>

          {/* Dynamic Service Dropdown */}
          {filterCategory !== 'Semua' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
              <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Layanan:</span>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="py-2 px-3 bg-surface-container-low border border-outline-variant rounded-lg text-[12px] font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface-variant max-w-[200px]"
              >
                <option value="Semua">Semua Layanan</option>
                {serviceOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Chips */}
          <div className="flex items-center gap-2 md:ml-4">
            <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Aksi:</span>
            <div className="flex flex-wrap gap-1.5">
              {ACTION_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                    filterType === t
                      ? 'bg-inverse-surface text-inverse-on-surface border-inverse-surface'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-30 block mb-3">manage_search</span>
            <p className="text-on-surface-variant text-[14px]">Tidak ada aktivitas yang ditemukan.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {filtered.map((act, idx) => {
              const iconBg =
                act.type === 'Selesai' ? 'bg-secondary-container text-on-secondary-container'
                : act.type === 'Upload' ? 'bg-primary-container text-on-primary-container'
                : act.type === 'Tanda Tangan' ? 'bg-tertiary-container text-on-tertiary-container'
                : 'bg-surface-container-high text-on-surface-variant';

              return (
                <div
                  key={act.id}
                  className="flex items-start gap-4 px-6 py-5 hover:bg-surface-container-low transition-colors group"
                >
                  {/* Icon Column */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBg}`}>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {act.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-on-surface text-[13px]">{act.user}</span>
                      <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full font-semibold">
                        {act.role}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        act.type === 'Selesai' ? 'bg-secondary-container text-on-secondary-container'
                        : act.type === 'Upload' ? 'bg-primary/10 text-primary'
                        : act.type === 'Tanda Tangan' ? 'bg-tertiary/10 text-tertiary'
                        : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {act.type}
                      </span>
                    </div>
                    <p className="text-[13px] text-on-surface">
                      {act.action}{' '}
                      <span className="font-bold text-primary">— {act.target}</span>
                    </p>
                    {act.caseRef && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <StatusBadge variant="status" label={act.caseRef.status} />
                        <StatusBadge variant="document" label={act.caseRef.documentsReady ? 'LENGKAP' : 'BELUM'} />
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">
                      {act.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffActivityPage;

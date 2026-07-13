import React, { useState, useMemo, useEffect } from 'react';
import { useCases } from '../../hooks/useCases';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { SERVICE_TYPES, SERVICE_CATEGORIES, getCaseCategory } from '../../constants/serviceTypes';
import DateFilter from '../../components/common/DateFilter';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const OwnerDocumentsPage = () => {
  const { cases, updateCaseStatus, toggleDocStatus, deleteCase, updateCase } = useCases();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterService, setFilterService] = useState('Semua');
  const [filterDate, setFilterDate] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [staffList, setStaffList] = useState([]);

  // Fetch all staff profiles for assignment dropdown
  useEffect(() => {
    const fetchStaff = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'staff');
      if (!error && data) {
        setStaffList(data);
      }
    };
    fetchStaff();
  }, []);

  // Dynamically derive service options based on selected category
  const serviceOptions = useMemo(() => {
    const list = Object.values(SERVICE_TYPES);
    if (filterCategory === 'Semua') {
      return [{ id: 'Semua', label: 'Semua Layanan' }, ...list];
    }
    const filteredList = list.filter(s => s.category === filterCategory);
    return [{ id: 'Semua', label: 'Semua Layanan' }, ...filteredList];
  }, [filterCategory]);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch =
        c.clientName.toLowerCase().includes(search.toLowerCase()) ||
        c.caseNumber.toLowerCase().includes(search.toLowerCase());
      
      const categoryOfCase = getCaseCategory(c);
      const matchCategory = filterCategory === 'Semua' || categoryOfCase === filterCategory;
      
      const matchService = filterService === 'Semua' || c.serviceType === filterService;

      // Period filter check
      if (!c.entryDate) return false;
      const [yStr, mStr, dStr] = c.entryDate.split('-');
      const cYear = parseInt(yStr, 10);
      const cMonth = parseInt(mStr, 10);
      const cDay = parseInt(dStr, 10);

      if (filterYear !== 'ALL' && cYear !== parseInt(filterYear, 10)) return false;
      if (filterMonth !== 'ALL' && cMonth !== parseInt(filterMonth, 10)) return false;
      if (filterDate !== 'ALL' && cDay !== parseInt(filterDate, 10)) return false;

      return matchSearch && matchCategory && matchService;
    });
  }, [cases, search, filterCategory, filterService, filterDate, filterMonth, filterYear]);

  const handleDelete = (id) => {
    deleteCase(id);
    setConfirmDeleteId(null);
    if (selectedCase?.id === id) setSelectedCase(null);
  };

  const STATUSES = [
    'Pemeriksaan Dokumen',
    'Verifikasi Sertifikat',
    'Penyusunan Draf',
    'Tanda Tangan Akta',
    'Validasi Pajak',
    'Proses BPN',
    'Selesai'
  ];

  return (
    <div className="space-y-stack-lg text-left">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">Manajemen Dokumen</h2>
          <p className="text-body-lg text-on-surface-variant mt-1">Pantau dan kelola seluruh berkas akta yang sedang berjalan.</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-bold text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">folder_open</span>
          {filtered.length} dari {cases.length} berkas
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama klien atau nomor berkas..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary text-[13px]"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setFilterService('Semua');
          }}
          className="py-2.5 px-3 bg-surface-container-low border border-outline-variant rounded-lg text-[12px] font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="Semua">Semua Kategori</option>
          <option value={SERVICE_CATEGORIES.PPAT}>PPAT</option>
          <option value={SERVICE_CATEGORIES.NOTARIS}>Notaris</option>
        </select>

        {/* Service Filter */}
        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          className="py-2.5 px-3 bg-surface-container-low border border-outline-variant rounded-lg text-[12px] font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {serviceOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <DateFilter
          date={filterDate}
          month={filterMonth}
          year={filterYear}
          onDateChange={setFilterDate}
          onMonthChange={setFilterMonth}
          onYearChange={setFilterYear}
        />

        {(search || filterCategory !== 'Semua' || filterService !== 'Semua' || filterDate !== 'ALL' || filterMonth !== 'ALL' || filterYear !== 'ALL') && (
          <button
            onClick={() => {
              setSearch('');
              setFilterCategory('Semua');
              setFilterService('Semua');
              setFilterDate('ALL');
              setFilterMonth('ALL');
              setFilterYear('ALL');
            }}
            className="py-2.5 px-3 text-error border border-error/30 rounded-lg text-[12px] font-bold hover:bg-error/5 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            Reset
          </button>
        )}
      </div>

      {/* Main 2-column layout: table + detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-grid">
        {/* Table */}
        <div className={`${selectedCase ? 'lg:col-span-7' : 'lg:col-span-12'} bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">No. Berkas</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Klien</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Layanan</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Dokumen</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tenggat</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant text-[13px]">
                      <span className="material-symbols-outlined text-[40px] block mb-2 opacity-40">search_off</span>
                      Tidak ada berkas yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const isOverdue = !c.isComplete && c.estimationDate && new Date(c.estimationDate) < new Date();
                    const isSelected = selectedCase?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCase(isSelected ? null : c)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-surface-container-low'}`}
                      >
                        <td className="px-4 py-3 font-bold text-primary text-[13px]">{c.caseNumber}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-on-surface text-[13px]">{c.clientName}</p>
                          <p className="text-[11px] text-on-surface-variant">{c.clientId}</p>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-on-surface-variant">{SERVICE_TYPES[c.serviceType]?.label || c.serviceType}</td>
                        <td className="px-4 py-3">
                          <StatusBadge variant="status" label={c.status} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge variant="document" label={c.documentsReady ? 'LENGKAP' : 'BELUM'} />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[12px] font-semibold ${isOverdue ? 'text-error' : 'text-on-surface-variant'}`}>
                            {isOverdue && <span className="material-symbols-outlined text-[13px] align-middle mr-0.5">warning</span>}
                            {formatDate(c.estimationDate)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(c.id); }}
                            className="text-on-surface-variant hover:text-error transition-colors"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedCase && (
          <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-primary text-[15px]">{selectedCase.caseNumber}</h3>
                <p className="text-on-surface font-semibold text-[18px] mt-0.5">{selectedCase.clientName}</p>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low rounded-lg p-3">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">ID Klien</p>
                <p className="font-semibold text-on-surface text-[13px] mt-0.5">{selectedCase.clientId}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Layanan</p>
                <p className="font-semibold text-on-surface text-[13px] mt-0.5">{SERVICE_TYPES[selectedCase.serviceType]?.label || selectedCase.serviceType}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Tenggat</p>
                <p className="font-semibold text-on-surface text-[13px] mt-0.5">{formatDate(selectedCase.estimationDate)}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-3">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Petugas Staf</p>
                <select
                  value={selectedCase.assignedStaffId || ''}
                  onChange={async (e) => {
                    const nextId = e.target.value || null;
                    try {
                      await updateCase(selectedCase.id, { assignedStaffId: nextId });
                      const matchedStaff = staffList.find(st => st.id === nextId);
                      setSelectedCase(prev => ({
                        ...prev,
                        assignedStaffId: nextId,
                        assignedStaff: matchedStaff ? matchedStaff.full_name : 'Belum ditugaskan'
                      }));
                      toast.success('Petugas staf berhasil ditugaskan!');
                    } catch (err) {
                      console.error(err);
                      toast.error('Gagal menugaskan petugas staf.');
                    }
                  }}
                  className="bg-transparent font-semibold text-on-surface text-[13px] mt-0.5 w-full focus:outline-none border-none cursor-pointer text-left"
                >
                  <option value="">Belum ditugaskan</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>{st.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            {selectedCase.notes && (
              <div className="bg-surface-container-low rounded-lg p-3">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">Catatan</p>
                <p className="text-[13px] text-on-surface-variant leading-relaxed">{selectedCase.notes}</p>
              </div>
            )}

            {/* Progress Timeline */}
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-3">Progress Pengerjaan</p>
              <div className="space-y-2">
                {STATUSES.map((s, i) => {
                  const currentIdx = STATUSES.indexOf(selectedCase.status);
                  const isPassed = i < currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <div key={s} className={`flex items-center gap-3 py-1.5 px-3 rounded-lg ${isCurrent ? 'bg-primary/10' : ''}`}>
                      <span className={`material-symbols-outlined text-[18px] ${isPassed ? 'text-secondary' : isCurrent ? 'text-primary' : 'text-outline-variant'}`}>
                        {isPassed ? 'check_circle' : isCurrent ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      <span className={`text-[12px] font-semibold ${isPassed ? 'text-secondary' : isCurrent ? 'text-primary font-bold' : 'text-on-surface-variant opacity-60'}`}>{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-outline-variant">
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Ubah Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { updateCaseStatus(selectedCase.id, s); setSelectedCase((prev) => ({ ...prev, status: s, isComplete: s === 'Selesai' })); }}
                    className={`text-[11px] px-3 py-1.5 rounded-full font-bold transition-all border ${selectedCase.status === s ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { toggleDocStatus(selectedCase.id); setSelectedCase((prev) => ({ ...prev, documentsReady: !prev.documentsReady })); }}
                className={`w-full mt-2 py-2 rounded-lg text-[12px] font-bold flex items-center justify-center gap-2 transition-all border ${selectedCase.documentsReady ? 'border-secondary text-secondary hover:bg-secondary/5' : 'border-primary text-primary hover:bg-primary/5'}`}
              >
                <span className="material-symbols-outlined text-[16px]">{selectedCase.documentsReady ? 'unpublished' : 'task_alt'}</span>
                {selectedCase.documentsReady ? 'Tandai Dokumen Belum Lengkap' : 'Tandai Dokumen Lengkap'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-sm w-full shadow-xl text-center">
            <span className="material-symbols-outlined text-error text-[40px] mb-3">delete_forever</span>
            <h3 className="font-bold text-on-surface text-[16px] mb-2">Hapus Berkas?</h3>
            <p className="text-[13px] text-on-surface-variant mb-6">Tindakan ini tidak dapat dibatalkan. Berkas akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 border border-outline-variant rounded-lg text-[13px] font-bold hover:bg-surface-container-low transition-colors">Batal</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 py-2.5 bg-error text-on-error rounded-lg text-[13px] font-bold hover:opacity-90 transition-all">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDocumentsPage;

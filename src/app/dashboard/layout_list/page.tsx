'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Calendar, 
  Clock, 
  MoreVertical, 
  Edit3, 
  Plus,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { deleteLayout, getAllLayouts } from '@/models/Layout';
import { Layout } from '@prisma/client';
import { formatDateIndo } from '@/lib/Helpers';
import { AlertLine } from '@/components/alerts/AlertLine';

interface Filters {
  date: string;
  time: string;
}

// --- Konfigurasi ---
const ITEMS_PER_PAGE = 6;

const App: React.FC = () => {
  // --- State ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [layoutData, setLayoutData] = useState<Layout[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1); // FIX: Tambahkan state currentPage yang sempat hilang
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  
  // State filter 
  const [tempFilters, setTempFilters] = useState<Filters>({
    date: '',
    time: ''
  });
  
  const [activeFilters, setActiveFilters] = useState<Filters>({
    date: '',
    time: ''
  });

  // --- Integrasi Fungsi Fetch ---
  const fetchLayout = async () => {
    setIsLoading(true);
    try {
      const data = await getAllLayouts();
      setLayoutData(data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Gagal mengambil data layout, silakan reload halaman'
      });
      console.error("Gagal mengambil data layout: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Memanggil fungsi fetchLayout saat halaman pertama kali dibuka
  useEffect(() => {
    fetchLayout();
  }, []);
  useEffect(() => {
        if (alert && errorRef.current) {
        errorRef.current.scrollIntoView({
            behavior: "smooth", // Transisi scroll yang halus
            block: "center",    // Memosisikan elemen tepat di tengah layar agar langsung terlihat
        });
        }
    }, [alert]);

  // --- Logika Filtering ---
  const filteredData = useMemo(() => {
    return layoutData.filter(item => {
      // Pencarian nama layout
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter tanggal dari Prisma (Konversi Date object atau string untuk dicocokkan)
      let matchesDate = true;
      if (activeFilters.date) {
        const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
        matchesDate = itemDate === activeFilters.date;
      }
      
      // Filter waktu (Jika struktur DB menyimpan data jam)
      let matchesTime = true;
      // if (activeFilters.time && (item as any).timeAt) {
      //   matchesTime = (item as any).timeAt === activeFilters.time;
      // }
      
      return matchesSearch && matchesDate && matchesTime;
    });
  }, [searchQuery, activeFilters, layoutData]);

  // --- Logika Pagination ---
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters]);

  // --- Handlers ---
  const applyFilters = () => {
    setActiveFilters(tempFilters);
    setIsFilterModalOpen(false);
  };

  const resetFilters = () => {
    const reset = { date: '', time: '' };
    setTempFilters(reset);
    setActiveFilters(reset);
  };

  const isAnyFilterActive = Boolean(activeFilters.date || activeFilters.time);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus layout ? riwayat berhubungan akan dihapus !")) return;

    try {
      const result = await deleteLayout(id);
      if (result.success) {
        // Update state secara lokal agar UI langsung berubah
        setLayoutData((prev) => prev.filter((item) => item.id !== id));
        setAlert({
          type: 'success',
          message: 'Berhasil Menghapus Layout'
        });
      } else {
        setAlert({
          type: 'error',
          message: 'Gagal Menghapus Layout'
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Terjadi kesalahan sistem saat menghapus data.'
      });
    }
  };

  return (
    <div>

        {/* Header Section */}
        <header className="flex flex-col min-[1200px]:flex-row min-[1200px]:items-end justify-between gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Layout List Struk
            </h1>
            <p className="text-slate-500 mt-2 dark:text-slate-400 text-sm md:text-base">
              Kelola dan pilih desain struk yang telah Anda buat dengan mudah.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative group flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Cari layout..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
              />
            </div>

            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold border transition-all ${
                isAnyFilterActive 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Filter size={18} />
              <span>Filter</span>
              {isAnyFilterActive && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
            </button>

            <Link href="/dashboard/layout_list/create" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform active:scale-95">
              <Plus size={20} strokeWidth={2.5} />
              <span className="hidden sm:inline">Buat Layout</span>
              <span className="sm:hidden">Baru</span>
            </Link>
          </div>
        </header>

        {/* Active Filters Display */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 text-[10px] md:text-xs">Filter Aktif:</span>
            {activeFilters.date && (
              <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 shadow-sm">
                Tanggal: {activeFilters.date}
              </span>
            )}
            {activeFilters.time && (
              <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 shadow-sm">
                Waktu: {activeFilters.time}
              </span>
            )}
            <button 
              onClick={resetFilters}
              className="text-xs text-red-500 hover:text-red-600 font-bold ml-2 underline"
            >
              Hapus Semua
            </button>
          </div>
        )}
        
        {alert?.message && (
            <div ref={errorRef}>
                <AlertLine message={alert.message} type={alert.type} className='mb-4' />
            </div>
        )}

        {/* State Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 min-[720px]:grid-cols-2 min-[1100px]:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 h-48 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : paginatedData.length > 0 ? (
          <>
            <div className="grid grid-cols-1 min-[720px]:grid-cols-2 min-[1100px]:grid-cols-3 gap-6">
              {paginatedData.map((layout) => (
                <LayoutCard onDelete={() => handleDelete(layout.id)} key={layout.id} layout={layout} />
              ))}
            </div>

            {/* Pagination Controls Rendered */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400 order-2 sm:order-1 text-center sm:text-left">
                  Menampilkan <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> sampai <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> dari <span className="font-bold text-slate-900 dark:text-white">{filteredData.length}</span> layout
                </p>
                
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex items-center gap-1.5 px-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all shadow-sm ${
                          currentPage === i + 1 
                          ? 'bg-blue-600 text-white shadow-blue-600/20' 
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
              <FileText size={48} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tidak ada hasil ditemukan</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-2 text-sm md:text-base px-4">
              Coba sesuaikan kata kunci pencarian atau filter Anda.
            </p>
            <button 
              onClick={resetFilters}
              className="mt-6 text-blue-600 font-bold hover:underline flex items-center gap-2 text-sm"
            >
              <RotateCcw size={16} /> Reset Filter
            </button>
          </div>
        )}

      {/* --- Filter Modal --- */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 flex flex-col max-h-[85vh]">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                  <Filter size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filter Layout</h2>
              </div>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Body Modal */}
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                {/* Date Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" /> Pilih Tanggal
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all appearance-none shadow-sm"
                    value={tempFilters.date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempFilters({...tempFilters, date: e.target.value})}
                  />
                </div>

                {/* Time Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} className="text-emerald-500" /> Pilih Waktu
                  </label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none dark:text-white transition-all appearance-none shadow-sm"
                    value={tempFilters.time}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempFilters({...tempFilters, time: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
              <button 
                onClick={resetFilters}
                className="w-full sm:flex-1 px-4 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all text-sm"
              >
                Reset
              </button>
              <button 
                onClick={applyFilters}
                className="w-full sm:flex-[1.5] px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 text-sm"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Subcomponent: LayoutCard ---
interface LayoutCardProps {
  layout: Layout;
  onDelete: () => Promise<void>;
}

const LayoutCard: React.FC<LayoutCardProps> = ({ layout, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const truncatedTitle = layout.name.length > 35
    ? layout.name.substring(0, 35) + "..." 
    : layout.name;

  // Mencari tahu jumlah elemen/komponen dari properti config (Prisma Json/Array)
  const totalElements = Array.isArray(layout.config) 
    ? layout.config.length 
    : typeof layout.config === 'string' 
      ? JSON.parse(layout.config || '[]').length 
      : 0;

  const onClickDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  }

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full shadow-sm">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150 duration-500" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* TOP SECTION: Icon, Status Badge, and More Button */}
        <div className="flex justify-between items-center mb-4 gap-2">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0">
            <FileText size={22} />
          </div>
          
          <div className="flex items-center gap-1 min-w-0">
            {/* BADGE BARU: Menampilkan status aktif jika layout di-set default */}
            {layout.isDefault && (
              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase rounded-md tracking-wider flex-shrink-0">
                Utama
              </span>
            )}
            <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* MIDDLE SECTION: Title & Component Summary */}
        <div className="space-y-2 mb-4 flex-grow min-w-0">
          <h3 
            className="font-bold text-slate-900 dark:text-white text-base md:text-lg leading-snug line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]" 
            title={layout.name}
          >
            {truncatedTitle}
          </h3>
          
          {/* INFORMASI BARU: Summary data komponen di dalam JSON config */}
          <div className="bg-slate-50/70 dark:bg-slate-800/20 rounded-xl p-2.5 border border-slate-100/50 dark:border-slate-800/50">
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              Struktur: <span className="text-blue-600 dark:text-blue-400 font-bold">{totalElements} Elemen Susunan</span>
            </p>
          </div>
        </div>

        {/* METADATA BARU: Separator Border & Tanggal Pembuatan */}
        <div className="pt-3 mb-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] md:text-xs min-w-0">
            <Calendar size={13} className="text-blue-500 flex-shrink-0" />
            <span className="truncate">{formatDateIndo(layout.createdAt)}</span>
          </div>
          
          <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            ID: #{layout.id.slice(-5)}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-2.5 mt-auto">
          <Link href={`/dashboard/layout_list/${layout.id}`} className="flex cursor-pointer items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] md:text-xs font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-200 shadow-sm group/btn">
            <Edit3 size={14} className="text-slate-400 group-hover/btn:text-white transition-colors" />
            <span>Edit</span>
          </Link>
          <button onClick={onClickDelete} className="flex cursor-pointer items-center justify-center gap-1.5 py-2 px-3 bg-red-400 dark:bg-red-800 text-slate-200 dark:text-slate-300 rounded-xl text-[11px] md:text-xs font-bold hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all duration-200 shadow-sm group/btn">
            <Trash2 size={14} className="text-slate-200 group-hover/btn:text-white transition-colors" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
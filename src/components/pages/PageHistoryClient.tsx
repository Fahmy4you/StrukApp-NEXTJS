'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Printer, 
  Calendar, 
  Clock, 
  Layers, 
  Search, 
  Filter,
  FileText,
  X,
  RotateCcw,
  Check,
  Trash2,
  Loader2,
  Inbox
} from 'lucide-react';
import { deleteReceipt, getAllReceipts } from '@/models/Receipt';
import { Layout, Prisma } from '@prisma/client';
import { formatIDR } from '@/lib/Helpers';
import { getAllLayouts } from '@/models/Layout';
import { AlertLine } from '@/components/alerts/AlertLine';
import { DefaultConfigLayout } from '@/lib/constanta';
import PreviewModal from '@/components/modal/PreviewModal';
import { getSettingByUserId } from '@/models/Settings';
import { SettingsData } from '@/types/Settings';

type ReceiptWithLayout = Prisma.ReceiptGetPayload<{
  include: { layout: true }
}>;

const PageHistoryClient = ({settingsData}: {settingsData: SettingsData | null}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [receipts, setReceipts] = useState<ReceiptWithLayout[]>([]);
  const [layoutData, setLayoutData] = useState<Layout[]>([])
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [strukData, setStrukData] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const errorRef = useRef<HTMLDivElement | null>(null);
  
  // Filter States
  const [filterDate, setFilterDate] = useState('');
  const [filterLayout, setFilterLayout] = useState('');

  useEffect(() => {
        if (alert && errorRef.current) {
        errorRef.current.scrollIntoView({
            behavior: "smooth", // Transisi scroll yang halus
            block: "center",    // Memosisikan elemen tepat di tengah layar agar langsung terlihat
        });
        }
    }, [alert]);

  // Fetch Data dari DB
  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      // Kita panggil getAllReceipts (Pastikan ini diarahkan ke API route atau Server Action)
      const data = await getAllReceipts({
        startDateCreatedAt: filterDate ? new Date(filterDate) : undefined,
      });
      
      setReceipts(data);
    } catch (error) {
      setAlert({
        type: 'error',
        'message': 'Gagal mengambil data history, reload halaman'
      })
      console.error("Gagal mengambil data history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLayout = async () => {
    setIsLoading(true)
    try {
      const data = await getAllLayouts();
      setLayoutData(data);
    } catch (error) {
      setAlert({
        type: 'error',
        'message': 'Gagal mengambil data layout, reload halaman'
      })
      console.error("Gagal mengambil data layout: ", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fungsi untuk menyiapkan data sebelum modal dibuka
  const handleRePrint = (item: ReceiptWithLayout) => {
    // 1. Ambil data konten dari receipt (formData)
    setStrukData(item.content); // Asumsi item.content adalah JSON object

    // 2. Tentukan Config: Jika ada layout ambil config-nya, jika tidak pakai Default
    if (item.layout && item.layout.config) {
      setConfig(item.layout.config);
    } else {
      setConfig(DefaultConfigLayout);
    }

    // 3. Buka Modal
    setShowModal(true);
  };

  useEffect(() => {
    setMounted(true);
    fetchReceipts();
  }, [filterDate]); // Re-fetch saat filter tanggal berubah

  useEffect(() => {
    setMounted(true);
    fetchLayout();
  }, [])

  // Logika Client-side Search & Layout Filter
  const filteredData = useMemo(() => {
    return receipts.filter(item => {
      // 1. Filter Pencarian (Gunakan optional chaining ?. untuk keamanan)
      const matchesSearch = item.nama?.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Filter Layout
      let matchesLayout = true;
      if (filterLayout === 'default') {
        // Jika filter bernilai 'default', cari yang layoutId-nya kosong/null
        matchesLayout = item.layoutId === null || item.layoutId === undefined;
      } else if (filterLayout) {
        // Jika filter berisi ID tertentu, cocokkan dengan layoutId
        matchesLayout = item.layoutId === filterLayout;
      }

      return matchesSearch && matchesLayout;
    });
  }, [searchTerm, filterLayout, receipts]);

  // Lock scroll saat modal buka
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isFilterOpen]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterDate) count++;
    if (filterLayout) count++;
    return count;
  }, [filterDate, filterLayout]);

  const resetFilters = () => {
    setFilterDate('');
    setFilterLayout('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus riwayat ini?")) return;

    try {
      const result = await deleteReceipt(id);
      if (result.success) {
        // Update state secara lokal agar UI langsung berubah
        setReceipts((prev) => prev.filter((item) => item.id !== id));
        setAlert({
          type: 'success',
          message: 'Berhasil Menghapus History'
        });
      } else {
        setAlert({
          type: 'error',
          message: 'Gagal Menghapus History'
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
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Riwayat Struk
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
              Daftar seluruh struk yang pernah Anda cetak atau simpan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cari struk..."
                className="pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm w-full sm:w-64 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => setIsFilterOpen(true)}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer relative
                ${activeFilterCount > 0 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <Filter size={18} />
              Filter
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center bg-white text-blue-600 w-5 h-5 rounded-full text-[10px] font-black shadow-sm">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {alert?.message && (
            <div ref={errorRef}>
                <AlertLine message={alert.message} type={alert.type} className='mb-4' />
            </div>
        )}

        {/* LOADING & EMPTY STATE LOGIC */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Memuat data history...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <Inbox className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tidak ada struk ditemukan</h3>
            <p className="text-slate-500 text-sm mt-1">Coba ubah kata kunci pencarian atau filter Anda.</p>
            {(searchTerm || activeFilterCount > 0) && (
              <button 
                onClick={() => { resetFilters(); setSearchTerm(''); }}
                className="mt-4 text-blue-600 font-bold text-sm hover:underline"
              >
                Bersihkan semua filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[720px]:grid-cols-2 min-[1110px]:grid-cols-3 min-[1536px]:grid-cols-4 gap-4 md:gap-6">
            {filteredData.map((item) => (
              <HistoryCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} onRePrint={() => handleRePrint(item)} />
            ))}
          </div>
        )}

        {/* MODAL FILTER PORTAL */}
        {mounted && isFilterOpen && createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsFilterOpen(false)} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg"><Filter size={20} /></div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Saring Riwayat</h2>
                </div>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Tanggal Transaksi</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="date" 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Jenis Layout</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm appearance-none"
                      value={filterLayout}
                      onChange={(e) => setFilterLayout(e.target.value)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <option value="">Memuat daftar layout...</option>
                      ) : (
                        <>
                          <option value="">Semua Layout</option>
                          
                          {layoutData.length > 0 ? (
                            // Jika ada data dari DB
                            layoutData.map((layout) => (
                              <option key={layout.id} value={layout.id}>
                                {layout.name}
                              </option>
                            ))
                          ) : (
                            <option value="default">Default Layout App</option>
                          )}
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                <button onClick={resetFilters} className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white transition-all">
                  <RotateCcw size={16} /> Reset
                </button>
                <button onClick={() => setIsFilterOpen(false)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all">
                  <Check size={16} /> Terapkan
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* MODAL RE-PRINT */}
        {showModal && (
          <PreviewModal
            show={showModal}
            onClose={() => setShowModal(false)}
            formData={strukData} 
            setFormData={setStrukData}
            isGenerating={isGenerating}
            config={config}
            setIsGenerating={setIsGenerating}
            settings={settingsData as SettingsData | null}
          />
        )}
    </div>
  );
};

const HistoryCard: React.FC<{ item: ReceiptWithLayout, onDelete: () => Promise<void>, onRePrint: () => void; }> = ({ item, onDelete, onRePrint }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const onClickDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  } 
  
  // Format Nama, Tanggal & Waktu dari JavaScript Date
  const truncatedTitle = item.nama.length > 30 ? item.nama.substring(0, 30) + "..." : item.nama;
  const dateStr = item.createdAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = item.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  return (
    <div className={`group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 transition-all duration-300 hover:shadow-xl hover:border-blue-500/30 flex flex-col justify-between relative overflow-hidden ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-blue-500 transition-colors">
            <FileText size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-white text-base md:text-lg leading-tight truncate" title={item.nama}>
              {truncatedTitle}
            </h3>
            <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-1">
              Rp {item.total ? formatIDR(item.total) : "-"}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs">
            <Calendar size={14} className="shrink-0 text-blue-500" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs">
            <Clock size={14} className="shrink-0 text-emerald-500" />
            <span>{timeStr}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs">
            <Layers size={14} className="shrink-0 text-purple-500" />
            <span className="truncate">Layout: {item.layoutId ? item.layout?.name : "Default Layout App"}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 relative z-10">
        <button onClick={onRePrint} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer">
          <Printer size={16} /> Cetak Kembali
        </button>
        <button onClick={onClickDelete} disabled={isDeleting} title='Hapus History' className="cursor-pointer p-3 bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95 border border-transparent hover:border-red-600">
          {isDeleting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default PageHistoryClient;
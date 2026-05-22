'use client';
import { useState, useEffect, ChangeEvent, FormEvent, useMemo, useRef } from 'react';
import { 
  Smartphone, 
  Calendar, 
  DollarSign,
  Clock,
  Landmark,
  FileText,
  Loader2,
  User,
  Hash,
  Activity,
  Type
} from 'lucide-react';

import PreviewModal from '@/components/modal/PreviewModal';
import { DefaultConfigLayout, NOT_SHOW_IN_PREVIEW } from '@/lib/constanta';
import { SettingsData } from '@/types/Settings';
import { normalizeKey } from '@/lib/Helpers';
import { Checkbox } from '@/components/inputs/CheckBox';
import { InputTextConfig } from '@/types/MainStruk';
import { AlertLine } from '@/components/alerts/AlertLine';
import { createReceipt } from '@/models/Receipt';
import { Layout } from '@prisma/client';
import SearchableSelect from '../inputs/SearchableSelect';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type ElementType = 'input_text' | 'input_image' | 'text' | 'separator';

export interface ReceiptElement {
  id: string;
  type: ElementType;
  label?: string;
  value?: string;
  fontSize?: number;       
  labelFontSize?: number;  
  valueFontSize?: number;  
  fontWeight?: string;
  labelFontWeight?: string;  
  valueFontWeight?: string;  
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  hasBorder?: boolean;
  marginTop?: number;      
  marginBottom?: number;   
  gap?: number;            
  width?: number;
  height?: number;
  source?: 'upload' | 'logo';
  style?: 'dash' | 'line' | 'double_line' | 'double_dash';
  dataType?: string;
  position?: string;
  showLabel?: boolean;
  labelLayout?: 'inline' | 'stacked';
  exampleValue?: string;
  letterSpacing?: number;
  labelLetterSpacing?: number; 
  valueLetterSpacing?: number; 
  thickness?: number;          
}

const getIcon = (label: string) => {
  const l = label.toUpperCase();
  if (l.includes('NAMA')) return <User size={14} className="text-blue-500" />;
  if (l.includes('BANK')) return <Landmark size={14} className="text-blue-500" />;
  if (l.includes('REKENING') || l.includes('HP')) return <Smartphone size={14} className="text-blue-500" />;
  if (l.includes('TANGGAL')) return <Calendar size={14} className="text-blue-500" />;
  if (l.includes('WAKTU')) return <Clock size={14} className="text-blue-500" />;
  if (l.includes('NOMINAL') || l.includes('ADMIN') || l.includes('TOTAL')) return <DollarSign size={14} className="text-blue-500" />;
  if (l.includes('STATUS')) return <Activity size={14} className="text-blue-500" />;
  if (l.includes('REF')) return <Hash size={14} className="text-blue-500" />;
  return <Type size={14} className="text-blue-500" />;
};

const getInputType = (label: string, dataType: string) => {
  const l = label.toUpperCase();
  if (l.includes('TANGGAL')) return 'date';
  if (l.includes('WAKTU')) return 'time';
  if (dataType?.includes('number') || l.includes('NOMINAL') || l.includes('ADMIN')) return 'number';
  return 'text';
};

export default function PageStrukManualClient({ settings, layoutData }: { settings: SettingsData | null, layoutData: Layout[] }) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  
  // --- STATE CONFIG LAYOUT ---
  const [config, setConfig] = useState<ReceiptElement[]>(DefaultConfigLayout);
  const [configId, setConfigId] = useState<string | null>("default_system"); // Set default awal
  const [isSwitchingLayout, setIsSwitchingLayout] = useState<boolean>(false);

  const [formData, setFormData] = useState<Record<string, any>>({
    showAdmin: true,
  });
  const session = useSession();
  const router = useRouter();

  // --- MEMOIZE OPTIONS UNTUK SEARCHABLE SELECT ---
  const layoutOptions = useMemo(() => {
    const defaultOption = {
      id: "default_system",
      label: "Layout Bawaan Sistem (Default)"
    };

    const customOptions = layoutData.map(layout => ({
      id: layout.id,
      label: layout.name
    }));

    return [defaultOption, ...customOptions];
  }, [layoutData]);

  useEffect(() => {
    setIsMounted(true);
    rebuildFormSchema(DefaultConfigLayout);
  }, []);
  useEffect(() => {
      if (alert && errorRef.current) {
      errorRef.current.scrollIntoView({
          behavior: "smooth", // Transisi scroll yang halus
          block: "center",    // Memosisikan elemen tepat di tengah layar agar langsung terlihat
      });
      }
  }, [alert]);

  // Fungsi pembersih sekaligus pembangun ulang struktur input schema form
  const rebuildFormSchema = (targetConfig: ReceiptElement[]) => {
    const freshData = targetConfig
      .filter((el): el is InputTextConfig => el.type === 'input_text')
      .reduce((acc, el) => {
        acc[normalizeKey(el.label)] = '';
        return acc;
      }, {} as Record<string, any>);

    setFormData({
      ...freshData,
      showAdmin: true,
    });
  };

  // --- LOGIKA MENANGANI PERGANTIAN LAYOUT ---
  const handleLayoutSelect = (id: string | null) => {
    // Jika dropdown di-clear atau memilih kembali opsi default_system
    if (!id || id === "default_system") {
      setIsSwitchingLayout(true);
      setConfigId("default_system");

      setTimeout(() => {
        setConfig(DefaultConfigLayout);
        rebuildFormSchema(DefaultConfigLayout);
        setIsSwitchingLayout(false);
      }, 350);
      return;
    }

    // Jika memilih layout kustom buatan user dari DB
    setIsSwitchingLayout(true);
    setConfigId(id);

    setTimeout(() => {
      const selectedLayout = layoutData.find(l => l.id === id);
      if (selectedLayout) {
        const rawConfig = selectedLayout.config;
        const parsedConfig: ReceiptElement[] = typeof rawConfig === 'string' 
          ? JSON.parse(rawConfig) 
          : (rawConfig as unknown as ReceiptElement[]);
        
        setConfig(parsedConfig);
        rebuildFormSchema(parsedConfig);
      }
      setIsSwitchingLayout(false);
    }, 450);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(session.status !== "authenticated") {
        router.push("/auth");
        return;
    }

    const findNameValue = () => {
        const priorityLabels = ['penerima', 'nama'];
        for (const target of priorityLabels) {
            const found = config.find(el => el.label?.toLowerCase() === target);
            if (found) {
                const val = formData[normalizeKey(found.label || "")];
                if (val && val.trim() !== "") return val;
            }
        }
        for (const target of priorityLabels) {
            const found = config.find(el => {
                const labelLower = el.label?.toLowerCase() || "";
                return (labelLower.includes(target) && !labelLower.includes('toko') && !labelLower.includes('bank'));
            });
            if (found) {
                const val = formData[normalizeKey(found.label || "")];
                if (val && val.trim() !== "") return val;
            }
        }
        return null;
    };

    const randomText = Math.random().toString(36).substring(2, 10).toUpperCase();
    const namaHistory = findNameValue() || formData['user'] || randomText;

    const findTotalValue = () => {
        const byDataType = config.find(el => el.dataType === 'total_keseluruhan');
        if (byDataType) return formData[normalizeKey(byDataType.label || "")];

        const priorityLabels = ['total', 'total keseluruhan', 'nominal', 'jumlah'];
        for (const label of priorityLabels) {
            const found = config.find(el => el.label?.toLowerCase() === label);
            if (found) {
                const value = formData[normalizeKey(found.label || "")];
                if (value !== undefined && value !== "") return value;
            }
        }

        const byCurrency = config.find(el => el.dataType === 'Currency');
        if (byCurrency) return formData[normalizeKey(byCurrency.label || "")];

        return null;
    };

    const rawTotal = findTotalValue();
    const finalTotal = rawTotal !== null && rawTotal !== "" 
        ? parseFloat(rawTotal.toString().replace(/[^0-9.-]/g, '')) 
        : null;
    
    const saveInHistory = await createReceipt({
        nama: namaHistory,
        layoutId: configId == "default_system" ? null : configId, // Jika bawaan sistem, kirim null / sesuaikan skema DB
        total: finalTotal,
        content: formData
    });

    if(saveInHistory.success) {
        setShowModal(true);
    } else {
      setAlert({
          type: 'error',
          message: 'Gagal menyimpan data ke history'
      });
      return;
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Buat Struk Secara Manual
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
              Isi data struk Anda secara manual untuk membuat struk baru dari awal.
          </p>
      </header>

      {alert?.message && (
          <div ref={errorRef}>
              <AlertLine message={alert.message} type={alert.type} className='mb-4' />
          </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        
        {/* SECTION 1: SEARCHABLE DROP-DOWN (Full width / Block atas) */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
          <SearchableSelect 
            labelTitle="Pilih Template Desain Struk"
            placeholder="Cari desain struk kustom Anda..."
            selectedId={configId}
            onSelect={handleLayoutSelect}
            options={layoutOptions}
          />
        </div>

        {/* SECTION 2: DINAMIS FORM INPUTS BODY */}
        {isSwitchingLayout ? (
          /* Tampilan Loading saat layout sedang ditukar */
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 gap-3">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            <p className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
              Mengubah Struktur Form Input...
            </p>
          </div>
        ) : (
          /* Render grid field input jika loading selesai */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-250">
            {config
              .filter((el): el is InputTextConfig => el.type === 'input_text' && !NOT_SHOW_IN_PREVIEW.includes(el.dataType ?? ""))
              .map((input) => {
                const key = normalizeKey(input.label);
                return (
                  <div key={input.id} className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 group-focus-within:text-blue-500 transition-colors">
                      {getIcon(input.label)} {input.label}
                    </label>
                    <div className="relative">
                      {(input.label.includes('NOMINAL') || input.label.includes('ADMIN')) && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                      )}
                      <input 
                        name={key}
                        type={getInputType(input.label, input.dataType)}
                        value={formData[key] || ''}
                        onChange={handleInputChange}
                        placeholder={`Masukkan ${input.label.toLowerCase()}...`}
                        className={`
                          w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 
                          rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none 
                          transition-all shadow-sm text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base
                          ${(input.label.includes('NOMINAL') || input.label.includes('ADMIN')) ? 'pl-11' : ''}
                        `} 
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* SECTION 3: CHECKBOX OPTIONS CARD */}
        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm w-full">
          <Checkbox
              label="Kalkulasi & Tampilkan Biaya Admin"
              checked={formData.showAdmin}
              onChange={() => 
                setFormData((prev) => ({
                  ...prev, 
                  showAdmin: !prev.showAdmin 
                }))
              }
          />
        </div>

        {/* SECTION 4: TRIGGER SUBMIT BUTTON */}
        <button 
          type="submit"
          disabled={isGenerating || isSwitchingLayout} 
          className="w-full cursor-pointer bg-slate-900 dark:bg-blue-600 hover:scale-[1.005] active:scale-[0.995] text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-4 tracking-widest uppercase text-sm disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
          {isGenerating ? "PROSES DATA..." : "PREVIEW"}
        </button>
      </form>

      <PreviewModal
        show={showModal}
        onClose={() => setShowModal(false)}
        formData={formData} 
        setFormData={setFormData}
        isGenerating={isGenerating}
        config={config}
        setIsGenerating={setIsGenerating}
        settings={settings}
      />
    </div>
  );
}
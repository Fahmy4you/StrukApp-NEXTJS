'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
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
import { NOT_SHOW_IN_PREVIEW } from '@/lib/constanta';
import { SettingsData } from '@/types/Settings';
import { getReceiptMetadata, normalizeKey } from '@/lib/Helpers';
import { Checkbox } from '@/components/inputs/CheckBox';
import { InputTextConfig } from '@/types/MainStruk';
import { AlertLine } from '@/components/alerts/AlertLine';
import { createReceipt } from '@/models/Receipt';

// --- TYPES & INTERFACES ---

type ElementType = 'input_text' | 'input_image' | 'text' | 'separator';

export interface ReceiptElement {
  id: string;
  type: ElementType;
  label?: string;
  value?: string;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right';
  hasBorder?: boolean;
  width?: number;
  height?: number;
  source?: 'upload' | 'logo';
  style?: 'dash' | 'line';
  dataType?: string;
  position?: string;
  color?: string;
  showLabel?: boolean;
  labelLayout?: 'inline' | 'stacked';
  fontWeight?: string;
  exampleValue?: string;
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

export default function PageStrukManualClient({settings, config, configId}: {settings : SettingsData | null, config: ReceiptElement[], configId: string | null}) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  

  const initialData = config
    .filter((el): el is InputTextConfig => el.type === 'input_text')
    .reduce((acc, el) => {
      acc[normalizeKey(el.label)] = '';
      return acc;
    }, {} as Record<string, any>);

  const [formData, setFormData] = useState<Record<string, any>>({
    ...initialData,
    showAdmin: true
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

    useEffect(() => {
        const nominalField = config.find(el => el.dataType === 'Nominal' || el.dataType === 'Currency');
        const nominalKey = nominalField ? normalizeKey(nominalField.label || "") : "";
        const nominalValue = Number(formData[nominalKey]) || 0;

        let finalTotal = nominalValue;
        let updates: Record<string, any> = {};

        config.forEach((el) => {
            const key = normalizeKey(el.label || "");

            switch (el.dataType) {
                case 'Admin_Fee':
                    // Jika showAdmin false, paksa admin jadi 0 atau kosong
                    updates[key] = "0";
                    break;
                case 'total_keseluruhan':
                    updates[key] = finalTotal.toString();
                    break;
            }
        });

        if (settings) {
            const receiptMeta = getReceiptMetadata(nominalValue, settings);
            
            updates['logo'] = receiptMeta.logoPath;
            updates['reference_set'] = receiptMeta.reference_set;

            // Tentukan nilai total berdasarkan showAdmin
            finalTotal = formData.showAdmin 
                ? receiptMeta.totalAmount 
                : nominalValue;

            config.forEach((el) => {
                const key = normalizeKey(el.label || "");

                switch (el.dataType) {
                    case 'Store_Name':
                        updates[key] = receiptMeta.shopName;
                        break;
                    case 'Admin_Fee':
                        // Jika showAdmin false, paksa admin jadi 0 atau kosong
                        console.log(receiptMeta.adminFee)
                        updates[key] = formData.showAdmin ? receiptMeta.adminFee.toString() : "0";
                        break;
                    case 'total_keseluruhan':
                        updates[key] = finalTotal.toString();
                        break;
                }
            });

        }

        setFormData(prev => ({
            ...prev,
            ...updates
        }));
    }, [
        formData[normalizeKey(config.find(el => el.dataType === 'Currency' || el.dataType === 'Nominal')?.label || "")] , 
        settings,
        formData.showAdmin // Trigger ulang saat toggle berubah
    ]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Logika Pengambilan Nama yang Disiplin (Hirarki Ketat)
    const findNameValue = () => {
        // Definisi urutan prioritas label yang ingin dicari
        const priorityLabels = ['penerima', 'nama'];
        
        // Tahap 1: Pencarian Exact Match (Sama Persis)
        for (const target of priorityLabels) {
            const found = config.find(el => el.label?.toLowerCase() === target);
            if (found) {
                const val = formData[normalizeKey(found.label || "")];
                // Pastikan nilainya ada dan tidak cuma spasi
                if (val && val.trim() !== "") return val;
            }
        }

        // Tahap 2: Pencarian Partial (Mengandung kata), tapi selektif
        for (const target of priorityLabels) {
            const found = config.find(el => {
                const labelLower = el.label?.toLowerCase() || "";
                return (
                    labelLower.includes(target) && 
                    !labelLower.includes('toko') && // Abaikan "Nama Toko"
                    !labelLower.includes('bank')    // Abaikan "Nama Bank"
                );
            });
            
            if (found) {
                const val = formData[normalizeKey(found.label || "")];
                if (val && val.trim() !== "") return val;
            }
        }

        return null;
    };

    // Penggunaan Hirarki: Hasil Fungsi -> User -> Random Text
    const randomText = Math.random().toString(36).substring(2, 10).toUpperCase();
    const namaHistory = findNameValue() || formData['user'] || randomText;

    // --- 2. Logika Pengambilan Total (Hirarki Revisi) ---
    const findTotalValue = () => {
        // A. Cari berdasarkan dataType 'total_keseluruhan' (Pertama ditemukan)
        const byDataType = config.find(el => el.dataType === 'total_keseluruhan');
        if (byDataType) return formData[normalizeKey(byDataType.label || "")];

        // B. Cari berdasarkan Label (total, total keseluruhan, nominal, jumlah)
        // 2. Hirarki Ketat berdasarkan Label
        const priorityLabels = ['total', 'total keseluruhan', 'nominal', 'jumlah'];
        
        for (const label of priorityLabels) {
            const found = config.find(el => el.label?.toLowerCase() === label);
            if (found) {
                const value = formData[normalizeKey(found.label || "")];
                // Jika ditemukan tapi isinya kosong, lanjut cari ke label berikutnya
                if (value !== undefined && value !== "") return value;
            }
        }

        // C. Cari berdasarkan dataType 'Currency' (Pertama ditemukan)
        const byCurrency = config.find(el => el.dataType === 'Currency');
        if (byCurrency) return formData[normalizeKey(byCurrency.label || "")];

        return null;
    };

    const rawTotal = findTotalValue();
    // Konversi ke number: hapus semua karakter kecuali angka, titik, dan minus
    const finalTotal = rawTotal !== null && rawTotal !== "" 
        ? parseFloat(rawTotal.toString().replace(/[^0-9.-]/g, '')) 
        : null;
    
    // Simpan Ke History
    const saveInHistory = await createReceipt({
        nama: namaHistory,
        layoutId: configId,
        total: finalTotal,
        content: formData
    });

    if(saveInHistory.success) {
        console.log(formData)
        setShowModal(true);
    } else {
        setAlert({
            'type': 'error',
            'message': 'Gagal menyimpan data ke history'
        });
        return;
    }
  }

  if (!isMounted) return null;

  return (
    <div>
      <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Buat Struk Secara Manual
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
              Isi data struk Anda secara manual untuk membuat struk baru dari awal.
          </p>
      </header>

      {alert?.message && <AlertLine message={alert.message} type={alert.type} className='mb-3' />}

      <form 
        className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" 
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.filter((el): el is InputTextConfig => el.type == 'input_text' && !NOT_SHOW_IN_PREVIEW.includes(el.dataType ?? "")).map((input) => {
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
                    value={formData[key]}
                    onChange={handleInputChange}
                    placeholder={`Masukkan ${input.label.toLowerCase()}...`}
                    className={`
                      w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 
                      rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none 
                      transition-all shadow-sm text-slate-700 dark:text-slate-200 font-semibold
                      ${(input.label.includes('NOMINAL') || input.label.includes('ADMIN')) ? 'pl-11' : ''}
                    `} 
                  />
                </div>
              </div>
            );
          })}
        </div>

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

        <button 
          type="submit"
          disabled={isGenerating} 
          className="w-full bg-slate-900 dark:bg-blue-600 hover:scale-[1.01] active:scale-[0.99] text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-4 tracking-widest uppercase text-sm"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
          {isGenerating ? "PROSES DATA..." : "PREVIEW STRUK SEKARANG"}
        </button>
      </form>

      <PreviewModal
        show={showModal}
        onClose={() => setShowModal(false)}
        // Gunakan strukData yang sudah berisi hasil ekstraksi AI
        formData={formData} 
        setFormData={setFormData}
        isGenerating={isGenerating}
        config={config}
        setIsGenerating={setIsGenerating}
      />
    </div>
  );
}
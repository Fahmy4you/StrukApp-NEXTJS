'use client';
import React, { FC, Dispatch, SetStateAction, ReactNode, useEffect } from 'react';
import { X, Image as LucideImage, Printer, Loader2, BluetoothOff, FileText } from 'lucide-react';
import { ReceiptElement } from '../pages/PageStrukManualClient';
import { calculateReceiptTotal, cleanCurrencyInput, formatIDR, formatReceiptDate } from '@/lib/Helpers';
import { DownloadStruk } from '@/lib/Download';
import { usePrinter } from '@/context/PrinterContext';
import { printImageToThermal } from '@/lib/PrinterThermal';
import { SettingsData } from '../../types/Settings';
import { fontConfig, fontInternal, weightConstanta } from '@/lib/constanta';

interface PreviewModalProps {
  show: boolean;
  onClose: () => void;
  config: ReceiptElement[];
  formData: Record<string, any>;
  setFormData: Dispatch<SetStateAction<Record<string, any>>>;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  settings: SettingsData | null;
}

const normalizeKey = (label?: string): string => {
  if (!label) return "unknown_field";
  return label.toLowerCase().trim().replace(/\s+/g, '_');
};

const PreviewModal: FC<PreviewModalProps> = ({
  show,
  onClose,
  config,
  formData,
  setFormData,
  isGenerating,
  setIsGenerating,
  settings
}) => {
  const { printerDevice } = usePrinter();

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    console.log(formData)
    try {
      await DownloadStruk(formData, config);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch {
      console.error("Gagal Generate File");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintFisik = async () => {
    if (!printerDevice) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/cetak_struk', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, config, format: 'png' })
      });

      if (!response.ok) throw new Error("Gagal mengambil data dari server");

      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        await printImageToThermal(printerDevice, base64data);
        setIsGenerating(false);
      };
      
    } catch (error: any) {
      console.error("Gagal cetak via API:", error);
      alert("Gagal mencetak: " + (error.message || "Periksa koneksi server."));
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      await DownloadStruk(formData, config, 'png');
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch {
      console.error("Gagal Generate File");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!config || !Array.isArray(config)) return;

    // 1. Salin formData saat ini untuk dibersihkan sebelum dikalkulasi
    const sanitizedFormData = { ...formData };

    // 2. Iterasi seluruh elemen konfigurasi struk
    config.forEach(element => {
      // Cek apakah elemen ini bertipe mata uang/nominal
      const isCurrencyElement = 
        element.dataType === 'Currency' || 
        element.dataType === 'Admin_Fee' ||
        element.dataType === 'total_keseluruhan' ||
        element.label?.toUpperCase().includes('NOMINAL') || 
        element.label?.toUpperCase().includes('ADMIN');

      if (isCurrencyElement) {
        const key = normalizeKey(element.label);
        if (formData[key]) {
          // 🔥 Gunakan fungsi helper yang sudah kamu import untuk membersihkan datanya
          sanitizedFormData[key] = cleanCurrencyInput(formData[key]);
        }
      }
    });

    // 3. Lempar data yang sudah bersih dari titik ke fungsi kalkulator total
    const { updates } = calculateReceiptTotal({ config, formData: sanitizedFormData, settings });

    // 4. Update state formData utama jika ada perubahan hasil perhitungan
    setFormData(prev => {
      const isDifferent = Object.keys(updates).some(k => prev[k] !== updates[k]);
      if (!isDifferent) return prev;
      return { ...prev, ...updates };
    });

  }, [
      // Ambil field nominal dan admin secara dinamis berdasarkan label yang ada di config
      formData[normalizeKey(config?.find(el => el.dataType === 'Currency' || el.dataType === 'Nominal')?.label || "")], 
      formData[normalizeKey(config?.find(el => el.dataType === 'Admin_Fee')?.label || "")],
      formData[normalizeKey(config?.find(el => el.dataType === 'Referensi')?.label || "")],
      formData.showAdmin,
      settings,
      config
  ]);
  

  const renderElement = (element: any) => {
    const mTop = `${element.marginTop ?? 0}px`;
    const mBottom = `${element.marginBottom ?? 0}px`;

    switch (element.type) {
      case 'input_image':
        if(element.source == 'logo') {
          if(!settings) return null;
          if (!settings.logo || settings.logo == "") return null;
          return (
            <div key={element.id} className="flex flex-col items-center gap-[5px]" style={{ marginTop: mTop, marginBottom: mBottom }}>
              <img 
                src={settings.logo} 
                style={{ width: `${element.width || 100}px`, height: 'auto' }}
                className="grayscale contrast-[1.5] brightness-100" 
                alt="Logo"
              />
            </div>
          );
        } else {
          return (
            <div key={element.id} className="flex flex-col items-center gap-[5px]" style={{ marginTop: mTop, marginBottom: mBottom }}>
               {element.value ? (
                  <img 
                    src={element.value} 
                    style={{ width: `${element.width || 100}px`, height: 'auto' }}
                    className="grayscale contrast-[1.5] brightness-100" 
                    alt="Logo"
                  />
               ) : (
                  <div className="w-20 h-20 bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                    <LucideImage className="text-slate-300" />
                  </div>
               )}
            </div>
          );
        }

      case 'text':
        return (
          <div
            key={element.id}
            contentEditable
            suppressContentEditableWarning
            style={{
              fontSize: `${element.fontSize || 14}px`,
              textAlign: element.alignment || 'center',
              fontWeight: weightConstanta[element.fontWeight as CustomFontWeight] || 400,
              color: element.color || '#000',
              border: element.hasBorder ? '2px solid #000' : 'none',
              padding: element.hasBorder ? '5px' : '0',
              marginTop: mTop,
              marginBottom: mBottom,
              letterSpacing: `${element.letterSpacing ?? 0}px`
            }}
            className="outline-none focus:bg-yellow-50 uppercase leading-tight"
          >
            {element.value}
          </div>
        );

      case 'input_text':
        const key = normalizeKey(element.label);
        const hasValue = formData[key] != undefined && formData[key] != null && formData[key] != '' && formData[key] != "null";
        const rawValue = hasValue ? formData[key] : '-';

        const isCurrency = 
          element.dataType === 'Currency' || 
          element.dataType === 'Admin_Fee' ||
          element.dataType === 'total_keseluruhan' ||
          element.label?.toUpperCase().includes('NOMINAL') || 
          element.label?.toUpperCase().includes('ADMIN');

        let displayValue = rawValue;

        // 2. Bersihkan rawValue terlebih dahulu sebelum dikonversi oleh formatIDR
        if (isCurrency && rawValue != '-') {
          const angkaBersih = cleanCurrencyInput(rawValue); // <--- Memaksa "100.000" atau "Rp 100.000" menjadi string angka murni "100000"
          displayValue = `Rp ${formatIDR(angkaBersih)}`;   // <--- Sekarang formatIDR dijamin menerima angka bersih tanpa titik
        }

        const isStacked = element.labelLayout === 'stacked';
        const isCentered = element.position === 'center';
        const rowGap = `${element.gap ?? 12}px`;
        
        const isDate = element.dataType === 'Date';
        if(isDate && rawValue != '-') {
          displayValue = formatReceiptDate(rawValue);
        }

        return (
          <div 
            key={element.id} 
            className={`flex leading-[1.1] ${isStacked ? 'flex-col' : 'justify-between items-baseline'} ${isCentered ? 'text-center justify-center' : ''}`}
            style={{
              color: element.color || '#000',
              border: element.hasBorder ? `2px solid ${element.color || '#000'}` : 'none',
              padding: element.hasBorder ? '8px' : '0',
              marginTop: mTop,
              marginBottom: mBottom,
              gap: rowGap
            }}
          >
            {element.showLabel && element.label && (
              <span 
                className={`uppercase ${isStacked ? 'text-[0.85em]' : 'pr-[5px]'}`}
                style={{ 
                  fontSize: `${element.labelFontSize || 12}px`,
                  fontWeight: weightConstanta[element.labelFontWeight as CustomFontWeight] || 400,
                  letterSpacing: `${element.labelLetterSpacing ?? 0}px`
                }}
              >
                {element.label}
              </span>
            )}
            <span 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => {
                const rawText = e.currentTarget?.innerText || '';
                const finalValue = isCurrency ? cleanCurrencyInput(rawText) : rawText;
                setFormData(prev => ({ ...prev, [key]: finalValue }));
              }}
              className={`outline-none focus:bg-yellow-50 break-all ${!isStacked && !isCentered ? 'text-right' : ''}`}
              style={{ 
                fontSize: `${element.valueFontSize || 12}px`,
                fontWeight: weightConstanta[element.valueFontWeight as CustomFontWeight] || 400,
                letterSpacing: `${element.valueLetterSpacing ?? 0}px`
              }}
            >
              {displayValue}
            </span>
          </div>
        );

      case 'separator':
        const lineThickness = `${element.thickness ?? 2}px`; // Menggunakan data thickness dinamis

        if (element.style === 'double_line') {
          return (
            <div key={element.id} className="w-full flex flex-col justify-between" style={{ marginTop: mTop, marginBottom: mBottom, height: `calc(${lineThickness} * 2 + 2px)` }}>
              <div style={{ borderTop: `${lineThickness} solid ${element.color || '#000'}` }}></div>
              <div style={{ borderTop: `${lineThickness} solid ${element.color || '#000'}` }}></div>
            </div>
          );
        }
        
        if (element.style === 'double_dash') {
          return (
            <div key={element.id} className="w-full flex flex-col justify-between" style={{ marginTop: mTop, marginBottom: mBottom, height: `calc(${lineThickness} * 2 + 2px)` }}>
              <div style={{ borderTop: `${lineThickness} dashed ${element.color || '#000'}` }}></div>
              <div style={{ borderTop: `${lineThickness} dashed ${element.color || '#000'}` }}></div>
            </div>
          );
        }

        return (
          <div 
            key={element.id} 
            className="w-full" 
            style={{ 
              borderTop: `${lineThickness} ${element.style === 'dash' ? 'dashed' : 'solid'} ${element.color || '#000'}`,
              marginTop: mTop,
              marginBottom: mBottom
            }} 
          />
        );

      default:
        return null;
    }
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      {/* <link href={fontConfig.googleFontsUrl} rel="stylesheet" /> */}

      <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-5xl h-[92vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Sisi Kiri: Struk Preview (The Paper) */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 p-4 md:p-10 overflow-y-auto flex flex-col items-center custom-scrollbar relative">
          <div className="mb-6 text-center">
            <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Thermal 58mm Mode</span>
          </div>

          {/* THE RECEIPT CONTAINER */}
          <div className="receipt-paper-thermal">
            <style>{`
            ${fontInternal.map(font => 
              font.variants.map(variant => `
                @font-face {
                  font-family: '${font.name}';
                  src: url('${variant.path}') format('truetype');
                  font-weight: ${variant.weight};
                  font-style: normal;
                }
              `).join('\n')
            ).join('\n')}
              .receipt-paper-thermal {
                background-color: #ffffff;
                width: 226px;
                padding: 25px 12px;
                position: relative;
                color: #000;
                box-sizing: border-box;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                font-family: '${fontConfig.name}', ${fontConfig.fallback};
                font-variant-numeric: slashed-zero;
              }
              .receipt-paper-thermal::before {
                content: ""; position: absolute; top: -8px; left: 0; width: 100%; height: 8px;
                background: linear-gradient(-45deg, #ffffff 6px, transparent 0), linear-gradient(45deg, #ffffff 6px, transparent 0);
                background-position: left bottom; background-repeat: repeat-x; background-size: 8px 8px;
              }
              .receipt-paper-thermal::after {
                content: ""; position: absolute; bottom: -8px; left: 0; width: 100%; height: 8px;
                background: linear-gradient(-45deg, transparent 6px, #ffffff 0), linear-gradient(45deg, transparent 6px, #ffffff 0);
                background-position: left top; background-repeat: repeat-x; background-size: 8px 8px;
              }
              .custom-scrollbar::-webkit-scrollbar { width: 5px; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; }
            `}</style>

            {/* DYNAMIC CONTENT */}
            {config.map((element: any) => renderElement(element))}
          </div>
        </div>

        {/* Sisi Kanan: Sidebar Actions */}
        <div className="w-full md:w-[350px] p-8 flex flex-col justify-between bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="hidden md:block">
                <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tighter">Opsi Penyimpanan</h4>
                <p className="text-[11px] text-slate-500 mt-1 uppercase font-bold">Pilih metode penyimpanan struk</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer rounded-xl transition">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 gap-x-3 flex flex-row md:flex-col">
              <ActionButton 
                onClick={handleDownloadPDF} 
                loading={isGenerating} 
                icon={<FileText/>} 
                title="Simpan PDF" 
                desc="Kualitas standar thermal"
                color="blue"
              />
              <ActionButton 
                onClick={handleDownloadImage} 
                loading={isGenerating} 
                icon={<LucideImage/>} 
                title="Simpan Gambar" 
                desc="Format PNG Contrast Tinggi"
                color="purple"
              />
              <ActionButton 
                onClick={handlePrintFisik} 
                loading={isGenerating} 
                icon={printerDevice ? <Printer/> : <BluetoothOff/>} 
                title="Cetak Langsung" 
                desc={printerDevice ? "Kirim ke Printer Thermal" : "Printer belum terhubung"}
                color={printerDevice ? "green" : "gray"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type CustomFontWeight = keyof typeof weightConstanta;

interface ActionButtonProps {
  onClick: () => void;
  loading?: boolean;
  icon: ReactNode;
  title: string;
  desc: string;
  color: 'blue' | 'purple' | 'green' | 'gray';
  disabled?: boolean;
}

const ActionButton: FC<ActionButtonProps> = ({ onClick, loading, icon, title, desc, color, disabled }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-900/20 dark:text-blue-400",
    purple: "bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-900/20 dark:text-purple-400",
    green: "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white dark:bg-green-900/20 dark:text-green-400",
    gray: "bg-gray-50 text-gray-700 hover:bg-gray-600 hover:text-white dark:bg-gray-800/20 dark:text-gray-400"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex justify-center md:justify-start items-center gap-4 p-5 h-20 rounded-3xl transition-all duration-300 text-left w-full disabled:opacity-50 group overflow-hidden ${themes[color]}`}
    >
      <div className="w-11 h-11 flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
        {loading ? (
          <Loader2 className="animate-spin" size={20}/>
        ) : (
          <div className="flex items-center justify-center [&_svg]:!w-5 [&_svg]:!h-5">
            {icon}
          </div>
        )}
      </div>
      
      <div className='hidden md:flex flex-col justify-center min-w-0'>
        <div className="text-xs font-black uppercase tracking-tight truncate">{title}</div>
        <div className="text-[10px] opacity-70 font-bold truncate">{desc}</div>
      </div>
    </button>
  );
};

export default PreviewModal;
import React, { FC, Dispatch, SetStateAction, ReactNode } from 'react';
import { X, Download, Image as LucideImage, Printer, Loader2, BluetoothOff } from 'lucide-react';
import { ReceiptElement } from '../pages/PageStrukManualClient';
import { formatIDR } from '@/lib/Helpers';
import { DownloadStruk } from '@/lib/Download';
import { usePrinter } from '@/context/PrinterContext';

// --- INTERFACES & TYPES ---

interface PreviewModalProps {
  show: boolean;
  onClose: () => void;
  config: ReceiptElement[];
  formData: Record<string, any>;
  setFormData: Dispatch<SetStateAction<Record<string, any>>>;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
}

// --- HELPERS ---
const normalizeKey = (label?: string): string => {
  if (!label) return "unknown_field"; // Berikan fallback agar tidak null
  return label.toLowerCase().trim().replace(/\s+/g, '_');
};

const PreviewModal: FC<PreviewModalProps> = ({
  show,
  onClose,
  config,
  formData,
  setFormData,
  isGenerating,
  setIsGenerating
}) => {
  if (!show) return null;
  const { printerDevice, isPrinterConnected } = usePrinter();

  const handleDownloadPDF = async () => {
      setIsGenerating(true);
      try {
          // Kirim strukData dan config layout saat ini
          await DownloadStruk(formData, config);
          // Tambahkan delay kecil untuk memberi napas pada UI
          await new Promise(resolve => setTimeout(resolve, 500));
      } catch {
          console.error("Gagal Generate File");
      } finally {
          setIsGenerating(false);
      }
  }

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
          // Kirim strukData dan config layout saat ini
          await DownloadStruk(formData, config, 'png');
          // Tambahkan delay kecil untuk memberi napas pada UI
          await new Promise(resolve => setTimeout(resolve, 500));
      } catch {
          console.error("Gagal Generate File");
      } finally {
          setIsGenerating(false);
      }
  }
  

  // Fungsi untuk merender elemen berdasarkan tipe config
  const renderElement = (element: ReceiptElement) => {
    switch (element.type) {
      case 'input_image':
        return (
          <div key={element.id} className="flex justify-center mb-6">
            <div 
              className="flex items-center justify-center bg-slate-50 border border-slate-100 overflow-hidden"
              style={{ 
                width: `${element.width}px`, 
                height: `${element.height}px`,
                maxWidth: '100%' 
              }}
            >
              {formData.logo_image || formData.logo || element.value ? (
                <img 
                  src={formData.logo_image || formData.logo || element.value} 
                  className="w-full h-full object-contain grayscale contrast-125" 
                  alt="Logo Toko"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 opacity-30">
                  <LucideImage size={24} />
                  <span className="text-[8px] font-black uppercase tracking-tighter">Logo</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div
            key={element.id}
            contentEditable
            suppressContentEditableWarning
            style={{
              fontSize: `${element.fontSize}px`,
              textAlign: element.alignment || 'center',
              fontWeight: element.fontWeight || 'bold',
              margin: '6px 0',
              padding: element.hasBorder ? '10px' : '2px 0',
              border: element.hasBorder ? `2.5px solid ${element.color || '#1a1a1a'}` : 'none',
              color: element.color || '#1a1a1a',
              lineHeight: 1.2
            }}
            className="outline-none focus:bg-blue-50 uppercase tracking-tight"
          >
            {element.value}
          </div>
        );

      case 'input_text':
        const key = normalizeKey(element.label);
        const rawValue = formData[key] || element.exampleValue || '-';

        const isCurrency = 
          element.dataType === 'Currency' || 
          element.dataType === 'Admin_Fee' ||
          element.dataType === 'total_keseluruhan' ||
          element.label?.toUpperCase().includes('NOMINAL') || 
          element.label?.toUpperCase().includes('ADMIN');

        let displayValue = rawValue;

        if (isCurrency && rawValue !== '-') {
          // Kita hapus karakter non-angka dulu sebelum diformat untuk mencegah double formatting
          const cleanNumber = String(rawValue).replace(/[^0-9.-]/g, '');
          displayValue = `Rp ${formatIDR(cleanNumber)}`;
        }

        if(element.dataType == "Referensi") {
          if(formData.reference_set.type == 'limited') {
            displayValue = formData.reference_set.digitLimit && formData.reference_set.digitLimit != 0 ? rawValue.slice(0, formData.reference_set.digitLimit) : rawValue
            formData[key] = displayValue;
          }
        }

        if(element.dataType == "Admin_Fee" && formData.showAdmin == false) {
            return;
        }
        
        // Cek layout (stacked vs inline)
        const isStacked = element.labelLayout === 'stacked';
        const isCentered = element.position === 'center';

        return (
          <div 
            key={element.id} 
            className={`
              info-row my-2 
              ${isStacked ? 'flex flex-col' : 'flex justify-between items-baseline gap-4'}
              ${isCentered ? 'text-center' : ''}
            `}
            style={{
              fontSize: `${element.fontSize}px`,
              fontWeight: element.fontWeight as any || 'normal',
              color: element.color || '#1a1a1a',
              // opacity: element.dataType === 'Hidden' ? 0.6 : 1,
              border: element.hasBorder ? `2px solid ${element.color || '#1a1a1a'}` : 'none',
              padding: element.hasBorder ? '8px' : '0',
              margin: element.hasBorder ? '6px 0' : '0 0 6px 0'
            }}
          >
            {element.showLabel && element.label && (
              <span className={`uppercase opacity-70 shrink-0 font-bold ${isStacked ? 'mb-1 text-[0.8em]' : ''}`}>
                {element.label}
              </span>
            )}
            <span 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLSpanElement>) => {
                // Gunakan optional chaining atau pastikan target ada
                const value = e.currentTarget?.innerText ?? "";
                setFormData(prev => ({ ...prev, [key]: value }));
              }}
              className={`
                leading-tight outline-none focus:bg-blue-50 px-1
                ${!isStacked ? 'text-right break-all' : ''}
                ${(element.fontWeight === '900' || (typeof element.fontSize === 'number' && element.fontSize > 18)) ? 'font-black' : 'font-bold'}
              `}
            >
              {displayValue}
            </span>
          </div>
        );

      case 'separator':
        return (
          <div 
            key={element.id} 
            className="my-3" 
            style={{ 
              borderTop: `1.5px ${element.style === 'dash' ? 'dashed' : 'solid'} ${element.color || '#333'}` 
            }} 
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Sisi Kiri: Dynamic Receipt Preview */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-6 md:p-12 overflow-y-auto flex flex-col items-center border-r border-slate-100 dark:border-slate-800 custom-scrollbar">
          <div className="mb-6 text-center">
            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live Editor</span>
            <p className="text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-tighter">Klik teks pada struk untuk mengedit langsung</p>
          </div>
          
          <div className="receipt-paper bg-white text-[#1a1a1a] w-full max-w-[350px] shadow-2xl p-8 relative font-mono transition-all">
            <style>{`
              .receipt-paper::before {
                content: ""; position: absolute; top: -16px; left: 0; width: 100%; height: 16px;
                background: linear-gradient(-45deg, #ffffff 10px, transparent 0), linear-gradient(45deg, #ffffff 10px, transparent 0);
                background-position: left bottom; background-repeat: repeat-x; background-size: 16px 16px;
              }
              .receipt-paper::after {
                content: ""; position: absolute; bottom: -16px; left: 0; width: 100%; height: 16px;
                background: linear-gradient(-45deg, transparent 10px, #ffffff 0), linear-gradient(45deg, transparent 10px, #ffffff 0);
                background-position: left top; background-repeat: repeat-x; background-size: 16px 16px;
              }
              .custom-scrollbar::-webkit-scrollbar { width: 4px; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>

            {/* --- DYNAMIC RENDERING CORE --- */}
            {config.map((element) => renderElement(element))}

            <div className="footer-note mt-8 text-center text-[10px] font-bold uppercase opacity-40 leading-relaxed">
              *** TERIMA KASIH ***<br />HARAP SIMPAN STRUK INI
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Action Buttons */}
        <div className="w-full md:w-[320px] p-8 flex flex-col justify-between bg-white dark:bg-slate-900 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-widest">Opsi Simpan</h4>
                    <p className="text-xs text-slate-500 mt-1">Pilih format struk Anda</p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition group">
                    <X size={20} className="text-slate-400 group-hover:rotate-90 transition-transform" />
                  </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  <ActionButton 
                    onClick={handleDownloadPDF} 
                    loading={isGenerating} 
                    icon={<Download size={20}/>} 
                    title="Simpan PDF" 
                    desc="Cocok untuk Printer Thermal"
                    color="blue"
                  />
                  <ActionButton 
                    onClick={handleDownloadImage} 
                    loading={isGenerating} 
                    icon={<LucideImage size={20}/>} 
                    title="Simpan Gambar" 
                    desc="Format PNG HD"
                    color="purple"
                  />
                  <ActionButton 
                    onClick={handlePrintFisik} 
                    loading={isGenerating} 
                    disabled={!printerDevice || isGenerating} // Nonaktifkan jika tidak ada printer
                    icon={printerDevice ? <Printer size={20}/> : <BluetoothOff size={20} className="opacity-50"/>} 
                    title={printerDevice ? "Print Fisik" : "Hubungkan Printer"} 
                    desc={printerDevice ? "Cetak via API Puppeteer" : "Printer Offline / Belum Pairing"}
                    color={printerDevice ? "green" : "gray"} // Warna abu-abu jika mati
                  />
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">Receipt Generator v2.0</p>
        </div>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  onClick: () => void;
  loading?: boolean;
  icon: ReactNode;
  title: string;
  desc: string;
  color: 'blue' | 'purple' | 'green' | 'gray';
  disabled?: boolean;
}

// Sub-component untuk tombol aksi
const ActionButton: FC<ActionButtonProps> = ({ onClick, loading, icon, title, desc, color, disabled }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-900/20 dark:text-blue-400",
    purple: "bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-900/20 dark:text-purple-400",
    green: "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white dark:bg-green-900/20 dark:text-green-400",
    gray: "bg-gray-50 text-gray-700 hover:bg-gray-600 hover:text-white dark:bg-gray-900/20 dark:text-gray-400"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-4 p-5 rounded-3xl transition-all duration-300 text-left w-full disabled:opacity-50 group ${themes[color]}`}
    >
      <div className="p-3 bg-white/50 dark:bg-black/20 rounded-xl group-hover:scale-110 transition-transform">
        {loading ? <Loader2 className="animate-spin" size={20}/> : icon}
      </div>
      <div>
        <div className="text-xs font-black uppercase tracking-tight">{title}</div>
        <div className="text-[10px] opacity-70 font-bold">{desc}</div>
      </div>
    </button>
  );
};

export default PreviewModal;
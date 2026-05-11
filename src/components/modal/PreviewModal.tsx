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
  const renderElement = (element: any) => {
    switch (element.type) {
      case 'input_image':
        return (
          <div key={element.id} className="flex flex-col items-center gap-[5px] mb-[10px]">
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

      case 'text':
        return (
          <div
            key={element.id}
            contentEditable
            suppressContentEditableWarning
            style={{
              fontSize: `${element.fontSize || 14}px`,
              textAlign: element.alignment || 'center',
              fontWeight: element.fontWeight || '900',
              color: '#000',
              border: element.hasBorder ? '2px solid #000' : 'none',
              padding: element.hasBorder ? '5px' : '0',
              marginBottom: '8px'
            }}
            className="outline-none focus:bg-yellow-50 uppercase leading-tight"
          >
            {element.value}
          </div>
        );

      case 'input_text':
        const key = normalizeKey(element.label);
        const hasValue = formData[key] !== undefined && formData[key] !== null && formData[key] !== '';
        const rawValue = hasValue ? formData[key] : '-';

        const isCurrency = 
          element.dataType === 'Currency' || 
          element.dataType === 'Admin_Fee' ||
          element.dataType === 'total_keseluruhan' ||
          element.label?.toUpperCase().includes('NOMINAL') || 
          element.label?.toUpperCase().includes('ADMIN');

        let displayValue = rawValue;
        if (isCurrency && rawValue !== '-') {
          displayValue = `Rp ${formatIDR(rawValue)}`;
        }

        // Tampilan khusus Total Keseluruhan (Boxed)
        if (element.dataType === 'total_keseluruhan') {
          return (
            <div key={element.id} className="text-center my-5">
              {element.showLabel && <label className="block text-sm font-[900] mb-2 uppercase">{element.label}</label>}
              <div 
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setFormData(prev => ({ ...prev, [key]: e.currentTarget.innerText }))}
                className="inline-block text-2xl font-[900] border-[3px] border-black px-4 py-2 outline-none focus:bg-yellow-50"
              >
                {displayValue}
              </div>
            </div>
          );
        }

        const isStacked = element.labelLayout === 'stacked';
        const isCentered = element.position === 'center';

        return (
          <div 
            key={element.id} 
            className={`flex mb-[6px] gap-3 leading-[1.1] ${isStacked ? 'flex-col' : 'justify-between items-baseline'} ${isCentered ? 'text-center justify-center' : ''}`}
            style={{
              fontSize: `${element.fontSize || 14}px`,
              fontWeight: element.fontWeight || '900',
              border: element.hasBorder ? '2px solid #000' : 'none',
              padding: element.hasBorder ? '8px' : '0',
            }}
          >
            {element.showLabel && element.label && (
              <span className={`uppercase whitespace-nowrap font-[900] ${isStacked ? 'text-[0.85em]' : 'pr-[5px]'}`}>
                {element.label}
              </span>
            )}
            <span 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => setFormData(prev => ({ ...prev, [key]: e.currentTarget.innerText }))}
              className={`outline-none focus:bg-yellow-50 font-[900] break-all ${!isStacked ? 'text-right' : ''}`}
            >
              {displayValue}
            </span>
          </div>
        );

      case 'separator':
        return (
          <div 
            key={element.id} 
            className="w-full my-[10px]" 
            style={{ 
              borderTop: `2px ${element.style === 'dash' ? 'dashed' : 'solid'} #000` 
            }} 
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-5xl h-[92vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Sisi Kiri: Struk Preview (The Paper) */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 p-4 md:p-10 overflow-y-auto flex flex-col items-center custom-scrollbar relative">
          <div className="mb-6 text-center">
            <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Thermal 58mm Mode</span>
          </div>

          {/* THE RECEIPT CONTAINER */}
          <div className="receipt-paper-thermal">
            <style>{`
              .receipt-paper-thermal {
                background-color: #ffffff;
                width: 226px;
                padding: 25px 12px;
                position: relative;
                color: #000;
                box-sizing: border-box;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                font-family: 'Consolas', 'Monaco', 'Courier New', Courier, monospace;
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

            {/* STATIC FOOTER FROM TEMPLATE */}
            <div className="mt-[25px] text-center text-[13px] font-[900] uppercase leading-[1.4]">
              *** TERIMA KASIH ***<br />
              HARAP SIMPAN STRUK INI SEBAGAI<br />
              BUKTI PEMBAYARAN YANG SAH
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Sidebar Actions */}
        <div className="w-full md:w-[350px] p-8 flex flex-col justify-between bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tighter">Opsi Penyimpanan</h4>
                <p className="text-[11px] text-slate-500 mt-1 uppercase font-bold">Siap cetak ke printer bluetooth</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <ActionButton 
                onClick={handleDownloadPDF} 
                loading={isGenerating} 
                icon={<Download size={20}/>} 
                title="Simpan PDF" 
                desc="Kualitas standar thermal"
                color="blue"
              />
              <ActionButton 
                onClick={handleDownloadImage} 
                loading={isGenerating} 
                icon={<LucideImage size={20}/>} 
                title="Simpan Gambar" 
                desc="Format PNG Contrast Tinggi"
                color="purple"
              />
              <ActionButton 
                onClick={handlePrintFisik} 
                loading={isGenerating} 
                disabled={!printerDevice || isGenerating}
                icon={printerDevice ? <Printer size={20}/> : <BluetoothOff size={20}/>} 
                title="Cetak Langsung" 
                desc={printerDevice ? "Kirim ke Printer Thermal" : "Printer belum terhubung"}
                color={printerDevice ? "green" : "gray"}
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">System Thermal V2.5</span>
          </div>
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
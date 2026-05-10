'use client';
import React, { useState } from 'react';
import { ElementType, DataType, Alignment, SeparatorType, LabelLayout, FontWeight } from '@/types/MainStruk';
import { 
  Trash2, 
  Check, 
  RefreshCw,
  Type,
  Image as ImageIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Save,
  FileText,
  EyeOff,
  Palette,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface BaseElement {
  id: string;
  type: ElementType;
}

interface InputTextElement extends BaseElement {
  type: 'input_text';
  label: string;
  showLabel: boolean;
  dataType: DataType;
  position: 'default' | 'center';
  labelLayout: LabelLayout;
  fontSize: number;
  fontWeight: FontWeight;
  color: string;
  exampleValue: string;
  hasBorder?: boolean;
}

interface InputImageElement extends BaseElement {
  type: 'input_image';
  width: number;
  height: number;
  source: 'upload' | 'logo';
}

interface TextElement extends BaseElement {
  type: 'text';
  value: string;
  fontSize: number;
  fontWeight: FontWeight;
  alignment: Alignment;
  hasBorder?: boolean;
  color: string;
}

interface SeparatorElement extends BaseElement {
  type: 'separator';
  style: SeparatorType;
  color: string;
}

type ReceiptElement = InputTextElement | InputImageElement | TextElement | SeparatorElement;

// --- UTILS ---
const generatePlaceholder = (el: InputTextElement) => {
  if (el.exampleValue) return el.exampleValue;
  
  switch (el.dataType) {
    case 'Admin_Fee': return 'Rp 2.500';
    case 'Store_Name': return 'TOKO SEJAHTERA';
    case 'total_keseluruhan': return 'Rp 1.002.500';
    case 'random_number': return '3436 6731 7054';
    case 'random_mixed': return 'REF-99X21B';
    case 'random_text': return 'SAMPLE-TEXT';
    case 'Number': return '0123456789';
    case 'Date': return '2026-05-15';
    case 'Time': return '22:56 WIB';
    case 'Currency': return 'Rp 1.000.000';
    case 'Nominal': return 'Rp 1.000.000';
    default: return 'Sample Data';
  }
};

const App: React.FC = () => {
  const [layoutName, setLayoutName] = useState<string>('Struk Default Pembayaran');
  const [rows, setRows] = useState<ReceiptElement[]>([
    { id: '1', type: 'input_image', width: 80, height: 80, source: 'logo' },
    { id: '2', type: 'input_text', label: 'NAMA TOKO', showLabel: false, dataType: 'Store_Name', position: 'center', labelLayout: 'stacked', fontSize: 20, fontWeight: '900', color: '#1a1a1a', exampleValue: 'NAMA TOKO ANDA', hasBorder: false },
    { id: '3', type: 'input_text', label: 'KODE REFERENSI', showLabel: true, dataType: 'Referensi', position: 'center', labelLayout: 'stacked', fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', exampleValue: '3436 6731 7054', hasBorder: false },
    { id: '4', type: 'separator', style: 'dash', color: '#333333' },
    { id: '5', type: 'input_text', label: 'TANGGAL', showLabel: true, dataType: 'Date', position: 'default', labelLayout: 'inline', fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', exampleValue: '2026-05-15' },
    { id: '6', type: 'input_text', label: 'WAKTU', showLabel: true, dataType: 'Time', position: 'default', labelLayout: 'inline', fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', exampleValue: '22:56 WIB' },
    { id: '7', type: 'separator', style: 'dash', color: '#333333' },
    { id: '8', type: 'text', value: 'DATA PENERIMA', fontSize: 13, fontWeight: 'bold', alignment: 'center', color: '#1a1a1a' },
    { id: '9', type: 'input_text', label: 'NAMA', showLabel: true, dataType: 'String', position: 'default', labelLayout: 'inline', fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', exampleValue: 'IVANS ISWAHYUDI' },
    { id: '10', type: 'input_text', label: 'BANK', showLabel: true, dataType: 'String', position: 'default', labelLayout: 'inline', fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', exampleValue: 'BCA' },
    { id: '11', type: 'input_text', label: 'REKENING', showLabel: true, dataType: 'String', position: 'default', labelLayout: 'inline', fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', exampleValue: '1234567890' },
    { id: '12', type: 'input_text', label: 'NOMINAL', showLabel: true, dataType: 'Nominal', position: 'default', labelLayout: 'inline', fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', exampleValue: 'Rp 1.000.000' },
    { id: '13', type: 'input_text', label: 'BIAYA ADMIN', showLabel: true, dataType: 'Admin_Fee', position: 'default', labelLayout: 'inline', fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', exampleValue: 'Rp 2.500' },
    { id: '14', type: 'input_text', label: 'STATUS', showLabel: true, dataType: 'String', position: 'default', labelLayout: 'inline', fontSize: 12, fontWeight: 'bold', color: '#1a1a1a', exampleValue: 'BERHASIL' },
    { id: '15', type: 'separator', style: 'dash', color: '#333333' },
    { id: '16', type: 'text', value: 'TOTAL KESELURUHAN', fontSize: 12, fontWeight: 'normal', alignment: 'center', color: '#1a1a1a' },
    { id: '17', type: 'input_text', label: 'TOTAL KESELURUHAN', showLabel: false, dataType: 'total_keseluruhan', position: 'center', labelLayout: 'stacked', fontSize: 21, fontWeight: '900', color: '#1a1a1a', exampleValue: 'Rp 1.002.500', hasBorder: true},
    { id: '18', type: 'separator', style: 'dash', color: '#333333' }
  ]);
  const [copied, setCopied] = useState(false);

  // --- ACTIONS ---
  const addElement = (type: ElementType) => {
    const id = crypto.randomUUID();
    let newEl: ReceiptElement;

    switch (type) {
      case 'input_text':
        newEl = { 
          id, 
          type: 'input_text', 
          label: 'Label Baru', 
          showLabel: true,
          dataType: 'random_text', 
          position: 'default', 
          labelLayout: 'inline',
          fontSize: 12, 
          fontWeight: 'bold',
          color: '#1a1a1a',
          exampleValue: 'Contoh Data',
          hasBorder: false
        };
        break;
      case 'input_image':
        newEl = { id, type: 'input_image', width: 120, height: 60, source: 'logo' };
        break;
      case 'text':
        newEl = { id, type: 'text', value: 'Teks Baru', fontSize: 11, fontWeight: 'bold', alignment: 'left', color: '#1a1a1a' };
        break;
      case 'separator':
        newEl = { id, type: 'separator', style: 'dash', color: '#333333' };
        break;
    }
    setRows([...rows, newEl]);
  };

  const removeRow = (id: string) => setRows(rows.filter(r => r.id !== id));

  const updateRow = (id: string, updates: Partial<ReceiptElement>) => {
    setRows(rows.map(r => r.id === id ? { ...r, ...updates } as any : r));
  };

  const moveElement = (index: number, direction: 'up' | 'down') => {
    const newRows = [...rows];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRows.length) return;
    [newRows[index], newRows[targetIndex]] = [newRows[targetIndex], newRows[index]];
    setRows(newRows);
  };

  const resetForm = () => {
    setRows([]);
    setLayoutName('');
  };

  const handleSaveLayout = () => {
    const output = {
      namaLayout: layoutName || 'Untitled Layout',
      config: rows
    };
    console.log('Simpan Layout:', JSON.stringify(output, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-4 sm:py-8 px-4">
        {/* INPUT NAMA LAYOUT */}
        <div className="max-w-6xl mx-auto mb-6 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-blue-50 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
              <FileText size={24} />
            </div>
            <div className="flex-1 w-full space-y-1">
              <label className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-slate-400 ml-1">Identitas Konfigurasi</label>
              <input 
                type="text"
                placeholder="Nama Layout Struk..."
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                className="w-full px-2 py-2 sm:py-3 text-sm sm:text-md font-semibold bg-transparent border-b-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT: CONFIGURATION */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 order-2 lg:order-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-blue-50 dark:border-slate-800 p-4 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold dark:text-white">Struktur Struk</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Atur komponen secara visual.</p>
                </div>
                <button onClick={resetForm} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <RefreshCw size={20} />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] lg:max-h-[700px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                {rows.map((row, index) => (
                  <div key={row.id} className="group p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-black text-blue-500">{index + 1}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{row.type.replace('_', ' ')}</span>
                        {row.type === 'input_text' && (row as InputTextElement).dataType === 'Hidden' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-[8px] font-bold rounded uppercase text-amber-600 dark:text-amber-400">
                             <EyeOff size={8} /> Hidden
                          </span>
                        )}
                        {row.type === 'input_text' && ((row as InputTextElement).dataType === 'Admin_Fee' || (row as InputTextElement).dataType === 'Store_Name') && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-[8px] font-bold rounded uppercase text-blue-600 dark:text-blue-400">
                             Dinamis
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <div className="flex border rounded-lg overflow-hidden bg-white dark:bg-slate-800 dark:border-slate-700">
                          <button onClick={() => moveElement(index, 'up')} disabled={index === 0} className="p-1 sm:p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-20"><ChevronUp size={14} /></button>
                          <div className="w-[1px] bg-slate-100 dark:bg-slate-700" />
                          <button onClick={() => moveElement(index, 'down')} disabled={index === rows.length - 1} className="p-1 sm:p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-20"><ChevronDown size={14} /></button>
                        </div>
                        <button onClick={() => removeRow(row.id)} className="text-slate-400 hover:text-rose-500 p-1 ml-1"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {row.type === 'input_text' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 flex justify-between items-center">
                              Nama Label
                              <button 
                                onClick={() => updateRow(row.id, { showLabel: !(row as InputTextElement).showLabel })}
                                className={`text-[8px] px-1.5 py-0.5 rounded transition-all ${ (row as InputTextElement).showLabel ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                              >
                                Tampil: {(row as InputTextElement).showLabel ? 'YA' : 'TIDAK'}
                              </button>
                            </label>
                            <input value={row.label} onChange={e => updateRow(row.id, { label: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm focus:ring-1 focus:ring-blue-500/20 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Contoh Value</label>
                            <input value={(row as InputTextElement).exampleValue} onChange={e => updateRow(row.id, { exampleValue: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm focus:ring-1 focus:ring-blue-500/20 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Tipe Data</label>
                            <select value={row.dataType} onChange={e => updateRow(row.id, { dataType: e.target.value as DataType })} className="w-full px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm outline-none">
                              <optgroup label="Dinamis"><option value="Admin_Fee">Biaya Admin</option><option value="Store_Name">Nama Toko</option></optgroup>
                              <optgroup label="Standar"><option value="String">String</option><option value="Number">Number</option><option value="Currency">Currency</option><option value="Nominal">Nominal</option><option value="Referensi">Referensi</option><option value="Date">Date</option><option value="Time">Time</option><option value="Hidden">Hidden</option><option value="total_keseluruhan">Total (Nominal + Admin)</option></optgroup>
                              <optgroup label="Randomizer"><option value="random_text">Rand Text</option><option value="random_number">Rand Num</option><option value="random_mixed">Rand Mix</option></optgroup>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Warna & Gaya</label>
                            <div className="flex gap-2 h-9">
                               <div className="flex-1 flex items-center gap-1 bg-white dark:bg-slate-900 px-2 rounded-lg border dark:border-slate-700">
                                  <Palette size={12} className="text-slate-400" />
                                  <input type="text" value={(row as InputTextElement).color} onChange={e => updateRow(row.id, { color: e.target.value })} className="w-full bg-transparent border-none text-[10px] font-mono focus:outline-none dark:text-white" />
                                  <div className="w-4 h-4 rounded-full border flex-shrink-0" style={{ backgroundColor: (row as InputTextElement).color }} />
                               </div>
                               <button onClick={() => updateRow(row.id, { hasBorder: !(row as InputTextElement).hasBorder })} className={`px-2 rounded-lg border text-[10px] font-black transition-all ${ (row as InputTextElement).hasBorder ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 text-slate-400'}`}>BOX</button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Font & Berat</label>
                            <div className="flex gap-2">
                               <input type="number" value={(row as InputTextElement).fontSize} onChange={e => updateRow(row.id, { fontSize: parseInt(e.target.value) })} className="w-1/2 px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm outline-none" />
                               <select value={(row as InputTextElement).fontWeight} onChange={e => updateRow(row.id, { fontWeight: e.target.value as FontWeight })} className="w-1/2 px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm outline-none">
                                  <option value="normal">Reg</option><option value="bold">Bold</option><option value="900">Black</option>
                                </select>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Layout & Posisi</label>
                            <div className="flex gap-2">
                               <select value={(row as InputTextElement).labelLayout} onChange={e => updateRow(row.id, { labelLayout: e.target.value as LabelLayout })} className="flex-1 px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm outline-none">
                                  <option value="inline">Sejajar</option><option value="stacked">Stack</option>
                                </select>
                                <div className="flex gap-1 p-1 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900">
                                  {['default', 'center'].map(pos => (
                                    <button key={pos} onClick={() => { const u: any = { position: pos }; if (pos === 'center') u.labelLayout = 'stacked'; updateRow(row.id, u); }} className={`px-2 py-0.5 rounded text-[8px] font-semibold uppercase transition-all ${ (row as InputTextElement).position === pos ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{pos}</button>
                                  ))}
                                </div>
                            </div>
                          </div>
                        </>
                      )}

                      {row.type === 'input_image' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">W x H (px)</label>
                            <div className="flex items-center gap-2">
                              <input type="number" value={row.width} onChange={e => updateRow(row.id, { width: parseInt(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm outline-none" />
                              <span className="text-slate-400">×</span>
                              <input type="number" value={row.height} onChange={e => updateRow(row.id, { height: parseInt(e.target.value) })} className="w-full px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm outline-none" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Sumber</label>
                            <select value={row.source} onChange={e => updateRow(row.id, { source: e.target.value as any })} className="w-full px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm outline-none">
                              <option value="logo">Logo Default</option><option value="upload">Upload</option>
                            </select>
                          </div>
                        </>
                      )}

                      {row.type === 'text' && (
                        <>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Isi Teks</label>
                            <input value={row.value} onChange={e => updateRow(row.id, { value: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Warna (Hex)</label>
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 h-9 rounded-lg border dark:border-slate-700">
                               <Palette size={12} className="text-slate-400" />
                               <input type="text" value={(row as TextElement).color} onChange={e => updateRow(row.id, { color: e.target.value })} className="w-full bg-transparent border-none text-[10px] font-mono focus:outline-none dark:text-white" />
                               <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: (row as TextElement).color }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Font & Berat</label>
                            <div className="flex gap-2">
                               <input type="number" value={(row as TextElement).fontSize} onChange={e => updateRow(row.id, { fontSize: parseInt(e.target.value) })} className="w-1/2 px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm outline-none" />
                               <select value={(row as TextElement).fontWeight} onChange={e => updateRow(row.id, { fontWeight: e.target.value as any })} className="w-1/2 px-3 py-1.5 rounded-lg border dark:bg-slate-900 dark:border-slate-700 dark:text-white text-sm outline-none">
                                  <option value="normal">Reg</option><option value="bold">Bold</option><option value="900">Black</option>
                                </select>
                            </div>
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Align & Style</label>
                            <div className="flex gap-1">
                              {['left', 'center', 'right'].map(align => (
                                <button key={align} onClick={() => updateRow(row.id, { alignment: align as any })} className={`flex-1 p-2 rounded-lg border text-sm transition-all ${row.alignment === align ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                  {align === 'left' && <AlignLeft size={14} className="mx-auto" />}
                                  {align === 'center' && <AlignCenter size={14} className="mx-auto" />}
                                  {align === 'right' && <AlignRight size={14} className="mx-auto" />}
                                </button>
                              ))}
                              <button onClick={() => updateRow(row.id, { hasBorder: !row.hasBorder })} className={`flex-1 p-2 rounded-lg border text-[10px] font-black transition-all ${row.hasBorder ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 text-slate-400'}`}>BOX</button>
                            </div>
                          </div>
                        </>
                      )}

                      {row.type === 'separator' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Gaya Garis</label>
                            <div className="flex gap-2">
                              {['line', 'dash'].map(style => (
                                <button key={style} onClick={() => updateRow(row.id, { style: style as any })} className={`flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${row.style === style ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'}`}>{style === 'line' ? 'Lurus' : 'Putus'}</button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Warna (Hex)</label>
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 h-9 rounded-lg border dark:border-slate-700">
                               <Palette size={12} className="text-slate-400" />
                               <input type="text" value={(row as SeparatorElement).color} onChange={e => updateRow(row.id, { color: e.target.value })} className="w-full bg-transparent border-none text-[10px] font-mono focus:outline-none dark:text-white" />
                               <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: (row as SeparatorElement).color }} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ADD BUTTONS - Grid optimized for mobile */}
              <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { id: 'input_text', label: 'Input', icon: Type },
                  { id: 'input_image', label: 'Image', icon: ImageIcon },
                  { id: 'text', label: 'Teks', icon: AlignCenter },
                  { id: 'separator', label: 'Garis', icon: Minus }
                ].map(btn => (
                  <button key={btn.id} onClick={() => addElement(btn.id as any)} className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800 hover:border-blue-400 transition-all group">
                    <btn.icon size={18} className="text-slate-400 group-hover:text-blue-500" />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight text-slate-500">{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: PREVIEW - Centered and scaled for mobile */}
          <div className="lg:col-span-5 flex flex-col items-center order-1 lg:order-2 w-full">
            <div className="sticky top-4 sm:top-8 w-full">
              <div className="flex items-center gap-2 mb-3 px-2 text-slate-400">
                <Eye size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Live Preview</span>
              </div>

              <div className="receipt-container w-full overflow-hidden">
                <div className="receipt-paper mx-auto origin-top sm:scale-100 transform" style={{ scale: 'var(--preview-scale, 1)' }}>
                  {rows.map((row) => {
                    if (row.type === 'input_text') {
                      const el = row as InputTextElement;
                      return (
                        <div key={el.id} className={`info-row ${el.labelLayout === 'stacked' ? 'flex flex-col' : 'flex justify-between items-baseline'} ${el.position === 'center' ? 'text-center' : ''}`} style={{ fontSize: `${el.fontSize}px`, fontWeight: el.fontWeight, color: el.color, border: el.hasBorder ? `2px solid ${el.color}` : 'none', padding: el.hasBorder ? '8px' : '0', margin: el.hasBorder ? '6px 0' : '0 0 6px 0' }}>
                          {el.showLabel && el.label && <span className="uppercase opacity-80">{el.label}</span>}
                          <span className="leading-tight">{generatePlaceholder(el)}</span>
                        </div>
                      );
                    }
                    if (row.type === 'input_image') {
                      return (
                        <div key={row.id} className="flex justify-center my-4">
                          <div className="bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 uppercase font-black overflow-hidden" style={{ width: `${row.width}px`, height: `${row.height}px`, maxWidth: '100%' }}>
                            {row.source === 'logo' ? <svg viewBox="0 0 100 100" className="w-full h-full p-2 opacity-50"><path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="2" /><text x="50" y="55" textAnchor="middle" fontSize="10" className="fill-current">LOGO SMK</text></svg> : 'IMAGE'}
                          </div>
                        </div>
                      );
                    }
                    if (row.type === 'text') {
                      const el = row as TextElement;
                      return (
                        <div key={el.id} style={{ fontSize: `${el.fontSize}px`, textAlign: el.alignment, fontWeight: el.fontWeight, margin: '5px 0', padding: el.hasBorder ? '10px' : '0', border: el.hasBorder ? `2.5px solid ${el.color}` : 'none', color: el.color, lineHeight: '1.2' }} className="uppercase">
                          {el.value}
                        </div>
                      );
                    }
                    if (row.type === 'separator') {
                      const el = row as SeparatorElement;
                      return <div key={row.id} className="my-3" style={{ borderTop: `1.5px ${el.style === 'dash' ? 'dashed' : 'solid'} ${el.color}` }} />;
                    }
                    return null;
                  })}
                  <div className="footer-note mt-8 text-center text-[10px] font-bold uppercase leading-relaxed">
                    *** TERIMA KASIH ***<br />HARAP SIMPAN STRUK INI
                  </div>
                </div>
              </div>

              <button onClick={handleSaveLayout} className="w-full mt-6 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/10 group">
                {copied ? <Check size={20} className="animate-bounce" /> : <Save size={20} />}
                {copied ? 'Tersimpan!' : 'Simpan Layout'}
              </button>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .receipt-paper {
            background-color: #ffffff;
            width: 100%;
            max-width: 320px;
            padding: 30px 20px;
            position: relative;
            color: #1a1a1a;
            font-family: 'Courier New', Courier, monospace;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            box-sizing: border-box;
          }

          .receipt-paper::before, .receipt-paper::after {
            content: "";
            position: absolute;
            left: 0;
            width: 100%;
            height: 10px;
            background-repeat: repeat-x;
            background-size: 12px 10px;
          }

          .receipt-paper::before {
            top: -10px;
            background-image: linear-gradient(-45deg, #ffffff 6px, transparent 0), 
                              linear-gradient(45deg, #ffffff 6px, transparent 0);
          }

          .receipt-paper::after {
            bottom: -10px;
            background-image: linear-gradient(-45deg, transparent 6px, #ffffff 0), 
                              linear-gradient(45deg, transparent 6px, #ffffff 0);
          }

          .info-row { line-height: 1.2; }
          .info-row span:last-child { word-break: break-all; }

          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          
          .receipt-container {
             background: #cbd5e1;
             padding: 30px 10px;
             border-radius: 1rem;
             display: flex;
             justify-content: center;
             min-height: 400px;
          }
          .dark .receipt-container { background: #1e293b; }

          @media (max-width: 480px) {
            :root { --preview-scale: 0.85; }
            .receipt-container { padding: 20px 5px; min-height: 350px; }
          }
        `}</style>
    </div>
  );
};

export default App;
'use client';
import { useEffect, useState } from 'react';
import { 
  Store, Image as ImageIcon, Hash, Save, Upload, Info, Check, 
  AlertCircle, Plus, Trash2, Layers, Calculator, Target, X,
  Printer,
  Bluetooth,
  BluetoothOff,
  RefreshCw,
  Trash
} from 'lucide-react';
import { AdminRange, SettingsData } from '@/types/Settings';
import { AlertLine } from '@/components/alerts/AlertLine';
import { upsertSettingsAction } from '@/lib/actions';
import { usePrinter } from '@/context/PrinterContext';

const PageSettingsClient: React.FC<{ initialData?: SettingsData }> = ({ initialData }) => {
  // --- States ---
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  
  // Data State
  const [shopName, setShopName] = useState(initialData?.shopName || 'StrukApp Digital');
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null);
  
  const [adminType, setAdminType] = useState(initialData?.adminFee?.type || 'fixed');
  const [fixedFee, setFixedFee] = useState(initialData?.adminFee?.fixedValue || 2500);
  const [ranges, setRanges] = useState<AdminRange[]>(initialData?.adminFee?.ranges || []);
  const [multiplier, setMultiplier] = useState(initialData?.adminFee?.multiplier || { step: 10000, fee: 2500 });
  // Modal State untuk Input Range Baru
  const [newRange, setNewRange] = useState({ 
    min: '', 
    max: '', 
    fee: '' 
  });
  
  const [refType, setRefType] = useState(initialData?.reference?.type || 'full');
  const [digitLimit, setDigitLimit] = useState(initialData?.reference?.digitLimit || 8);

  // Context Printer State
  const [isSearching, setIsSearching] = useState(false);
  const { printerDevice, setPrinterDevice, isPrinterConnected, setIsPrinterConnected } = usePrinter();

  // --- BLUETOOT ---
  const connectPrinter = async () => {
    setIsSearching(true);
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });
      await device.gatt.connect();
      setPrinterDevice(device);
      setIsPrinterConnected(true);
      localStorage.setItem('last_printer_name', device.name || 'Printer');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const disconnectPrinter = () => {
    if (printerDevice?.gatt?.connected) printerDevice.gatt.disconnect();
    setIsPrinterConnected(false);
    setPrinterDevice(null);
  };

  // --- Handlers ---
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addRange = () => {
    const minVal = Number(newRange.min);
    const maxVal = newRange.max !== '' ? Number(newRange.max) : null;
    const feeVal = Number(newRange.fee);

    // 1. Validasi Dasar
    if (newRange.min === '' || newRange.fee === '') {
      setAlert({ message: "Min dan Fee wajib diisi", type: 'error' });
      return;
    }

    if (maxVal !== null && maxVal <= minVal) {
      setAlert({ message: "Max harus lebih besar dari Min", type: 'error' });
      return;
    }

    // 2. Validasi Tumpang Tindih (Overlapping)
    const isOverlapping = ranges.some(r => {
      const existingMin = r.min;
      const existingMax = r.max === null ? Infinity : r.max;
      const currentMin = minVal;
      const currentMax = maxVal === null ? Infinity : maxVal;

      // Cek apakah ada irisan antara rentang lama dan baru
      // Rumus: (MinA <= MaxB) dan (MaxA >= MinB)
      return currentMin <= existingMax && currentMax >= existingMin;
    });

    if (isOverlapping) {
      setAlert({ 
        message: "Rentang harga tumpang tindih dengan aturan yang sudah ada!", 
        type: 'error' 
      });
      return;
    }

    // 3. Jika lolos validasi, tambahkan ke state
    const range: AdminRange = {
      id: Math.random().toString(36).substring(2, 9),
      min: minVal,
      max: maxVal,
      fee: feeVal
    };

    setRanges((prev) => [...prev, range].sort((a, b) => a.min - b.min));
    setNewRange({ min: '', max: '', fee: '' });
    setShowModal(false);
    setAlert(null); // Bersihkan error jika berhasil
  };

  const removeRange = (id: string) => {
    setRanges(ranges.filter(r => r.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    let finalLogoPath = logoPreview;

    try {
      // 1. Logika Upload Image (Hanya jika user ganti gambar/base64 baru)
      if (logoPreview && logoPreview.startsWith("data:")) {
        const uploadRes = await fetch("/api/upload_image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64: logoPreview,
            category: "logo",
          }),
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || "Gagal upload logo");
        }

        const uploadData = await uploadRes.json();
        finalLogoPath = uploadData.path; // Mendapatkan path baru: /image/upload/logo/xxx.png
      }

      // 2. Susun Object JSON lengkap
      const finalJson: SettingsData = {
        shopName,
        logo: finalLogoPath,
        adminFee: {
          type: adminType,
          fixedValue: fixedFee,
          ranges: ranges,
          multiplier: multiplier
        },
        reference: {
          type: refType,
          digitLimit: digitLimit
        }
      };

      // 3. Panggil Server Action untuk Simpan ke Database
      // finalJson akan masuk ke kolom 'data' yang bertipe Json di tabel Settings
      const result = await upsertSettingsAction({ data: finalJson });

      if (result.success) {
        setAlert({ 
          message: "Pengaturan berhasil disimpan dan file lama telah dibersihkan!", 
          type: 'success' 
        });
        
        // Update logoPreview dengan path asli dari server agar tidak dianggap base64 lagi
        setLogoPreview(finalLogoPath); 
      } else {
        throw new Error(result.error);
      }

    } catch (error: any) {
      setAlert({ 
        message: error.message || "Terjadi kesalahan saat menyimpan.", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pengaturan Sistem
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Konfigurasi identitas, biaya admin, dan format struk digital.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <span className="animate-spin mr-2">◌</span> : <Save size={18} />}
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </header>

      {alert?.message && <AlertLine message={alert.message} type={alert.type} className='mb-3' />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: Identitas & Biaya */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* IDENTITAS TOKO */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <Store className="text-blue-500" size={20} />
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Identitas Toko</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Nama Toko</label>
                <input 
                  type="text" 
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* KONFIGURASI BIAYA ADMIN */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <Calculator className="text-emerald-500" size={20} />
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Skema Biaya Admin</h2>
            </div>

            {/* Selector Tipe Admin */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {[
                { id: 'fixed', label: 'Tetap', icon: Target, desc: 'Biaya flat' },
                { id: 'range', label: 'Rentang', icon: Layers, desc: 'Tangga harga' },
                { id: 'multiplier', label: 'Kelipatan', icon: Calculator, desc: 'Per kelipatan' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAdminType(item.id as any)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                    adminType === item.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <item.icon size={20} className={adminType === item.id ? 'text-blue-500' : 'text-slate-400'} />
                  <div>
                    <p className="font-bold text-sm dark:text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Dynamic Input based on Type */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              
              {/* FIXED */}
              {adminType === 'fixed' && (
                <div className="space-y-2 max-w-sm">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Nominal Admin Tetap</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                    <input 
                      type="number" 
                      value={fixedFee}
                      onChange={(e) => setFixedFee(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* RANGE (TANGGA) */}
              {adminType === 'range' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Atur Rentang Harga & Biaya</label>
                    <button 
                      onClick={() => setShowModal(true)}
                      className="flex items-center gap-2 text-xs bg-blue-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-700 cursor-pointer"
                    >
                      <Plus size={14} /> Tambah Rentang
                    </button>
                  </div>
                  
                  {ranges.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <Layers size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400">Belum ada rentang biaya yang diatur.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ranges.map((r) => (
                        <div key={r.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group">
                          <div>
                            <p className="text-[10px] font-bold text-blue-500 uppercase">Rentang</p>
                            <p className="text-sm font-bold dark:text-white">
                              Rp {r.min.toLocaleString()} - {r.max ? `Rp ${r.max.toLocaleString()}` : '∞'}
                            </p>
                            <p className="text-xs text-slate-400">Admin: Rp {r.fee.toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={() => removeRange(r.id)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MULTIPLIER (KELIPATAN) */}
              {adminType === 'multiplier' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Setiap Kelipatan Harga</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <input 
                        type="number" 
                        value={multiplier.step}
                        onChange={(e) => setMultiplier({...multiplier, step: Number(e.target.value)})}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Biaya Admin</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <input 
                        type="number" 
                        value={multiplier.fee}
                        onChange={(e) => setMultiplier({...multiplier, fee: Number(e.target.value)})}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* FORMAT REFERENSI */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <Hash className="text-purple-500" size={20} />
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Format Referensi Struk</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => setRefType('full')}
                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all cursor-pointer ${refType === 'full' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <div className="flex justify-between w-full mb-1">
                  <span className="font-bold text-sm dark:text-white">Tampilan Penuh</span>
                  {refType === 'full' && <Check size={16} className="text-blue-500" />}
                </div>
                <code className="text-[10px] text-slate-400">STR-20240507-ABCDEF123</code>
              </button>

              <button 
                onClick={() => setRefType('limited')}
                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all cursor-pointer ${refType === 'limited' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <div className="flex justify-between w-full mb-1">
                  <span className="font-bold text-sm dark:text-white">Batasi Digit</span>
                  {refType === 'limited' && <Check size={16} className="text-blue-500" />}
                </div>
                <code className="text-[10px] text-slate-400">Hanya mengambil X digit terakhir</code>
              </button>
            </div>

            {refType === 'limited' && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Jumlah Digit Terakhir</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="4" max="16" step="1"
                    value={digitLimit}
                    onChange={(e) => setDigitLimit(Number(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm min-w-[3rem] text-center">
                    {digitLimit}
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* KOLOM KANAN: LOGO PREVIEW */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm top-6">
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Logo Perusahaan</label>
            <div className="relative group mx-auto w-40 h-40 mb-6">
              <div className="w-full h-full rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon size={48} className="text-slate-300 dark:text-slate-600" />
                )}
              </div>
              {logoPreview ? (
                <button onClick={() => setLogoPreview(null)} className="absolute -bottom-2 -right-2 bg-red-600 text-white p-3 rounded-2xl shadow-xl cursor-pointer hover:bg-red-700 transition-all hover:scale-110 active:scale-95">
                  <Trash size={20} />
                </button>
              ) : (
                <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl shadow-xl cursor-pointer hover:bg-blue-700 transition-all hover:scale-110 active:scale-95">
                  <Upload size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                </label>
              )}
            </div>
            
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <Info size={14} className="text-blue-500 shrink-0" />
                <p>Logo ini akan muncul di bagian header setiap struk yang dicetak atau dibagikan.</p>
              </div>
              <div className="flex items-start gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <AlertCircle size={14} className="text-amber-500 shrink-0" />
                <p>Gunakan gambar PNG transparan untuk hasil terbaik di mode gelap.</p>
              </div>
            </div>
          </div>
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <Printer className="text-blue-600" size={20} />
                <h2 className="font-bold">Printer Fisik</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30">
                  {isPrinterConnected ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/10">
                        <Bluetooth size={32} />
                      </div>
                      <p className="font-bold">{printerDevice?.name || 'Unknown'}</p>
                      <p className="text-xs text-green-500 font-semibold uppercase tracking-wider mt-1">Terhubung</p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 dark:text-slate-600">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        {printerDevice?.name ? <BluetoothOff size={32} /> : <Printer size={32} />}
                      </div>
                      <p className="font-bold text-slate-500 dark:text-slate-400">{printerDevice?.name || 'Belum Ada Printer'}</p>
                      <p className="text-[10px] uppercase mt-1">Status: Offline</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={isPrinterConnected ? disconnectPrinter : connectPrinter}
                  disabled={isSearching}
                  className={`w-full py-3.5 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    isPrinterConnected 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700'
                  }`}
                >
                  {isSearching ? <RefreshCw className="animate-spin" size={18} /> : isPrinterConnected ? <BluetoothOff size={18} /> : <Bluetooth size={18} />}
                  {isSearching ? 'Mencari...' : isPrinterConnected ? 'Putuskan Koneksi' : 'Hubungkan Printer'}
                </button>
              </div>
            </section>
        </div>
      </div>

      {/* MODAL UNTUK TAMBAH RANGE */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-extrabold text-lg dark:text-white">Tambah Rentang Biaya</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            {alert?.message && <AlertLine message={alert.message} type={alert.type} className='m-2' />}
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Min</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newRange.min}
                    onChange={(e) => setNewRange({...newRange, min: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Max (Kosong = ∞)</label>
                  <input 
                    type="number" 
                    placeholder="Max"
                    value={newRange.max}
                    onChange={(e) => setNewRange({...newRange, max: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Biaya Admin</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">Rp</span>
                  <input 
                    type="number" 
                    placeholder="2500"
                    value={newRange.fee}
                    onChange={(e) => setNewRange({...newRange, fee: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={addRange}
                disabled={!newRange.min || !newRange.fee}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageSettingsClient;
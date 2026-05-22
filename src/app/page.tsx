"use client"
import "@/styles/home.css";
import { useState } from 'react';
import { 
  Receipt, 
  Settings, 
  RefreshCw, 
  FileText, 
  Printer, 
  Share2, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Heart,
  TrendingUp,
  LayoutGrid,
} from 'lucide-react';
import Link from "next/link";

// Interfaces
interface ReceiptItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

interface ToastState {
  visible: boolean;
  title: string;
  desc: string;
  icon: string;
  colorClass: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export default function App() {
  // Navigation and UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Receipt Items State
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: 1, name: "Caramel Macchiato Latte", qty: 2, price: 28000 },
    { id: 2, name: "Sourdough Croissant", qty: 1, price: 22000 }
  ]);

  // Toast State
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    title: '',
    desc: '',
    icon: '✓',
    colorClass: 'text-emerald-500'
  });

  // Toast Notification Utility
  const triggerToast = (title: string, desc: string, icon: string = '✓', colorClass: string = 'text-emerald-500') => {
    setToast({
      visible: true,
      title,
      desc,
      icon,
      colorClass
    });

    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const updateItemField = (id: number, field: keyof ReceiptItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'qty') return { ...item, qty: parseInt(value as string) || 1 };
        if (field === 'price') return { ...item, price: parseFloat(value as string) || 0 };
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const faqs: FaqItem[] = [
    {
      id: 1,
      question: "Bagaimana cara menghubungkan aplikasi ke printer thermal Bluetooth?",
      answer: "Aplikasi StrukKu mendukung koneksi Bluetooth SPP universal. Aktifkan koneksi bluetooth di perangkat Anda, pasangkan ke printer thermal berukuran 58mm atau 80mm, lalu gunakan tombol cetak thermal untuk mengirim data secara langsung."
    },
    {
      id: 2,
      question: "Apakah format DefaultStruk ini dapat diubah identitasnya?",
      answer: "Tentu saja. Melalui tab 'Settings Toko', Anda dapat menyesuaikan logo, nama merchant, alamat fisik toko Anda, biaya admin default, dan pola format penulisan referensi transaksi agar sesuai dengan identitas bisnis Anda."
    },
    {
      id: 3,
      question: "Bagaimana cara kerja konversi otomatis struk e-wallet?",
      answer: "Unggah screenshot transaksi dari platform GoPay, OVO, atau DANA. Sistem kami akan membaca struktur teks (OCR) data nominal, tanggal, ID transaksi, lalu mengonversikannya langsung menjadi visual struk toko Anda."
    },
    {
      id: 4,
      question: "Apakah riwayat pencetakan di dashboard pelacakan aman?",
      answer: "Ya, privasi & keamanan data Anda adalah prioritas utama kami. Seluruh log pencetakan manual dan konversi disimpan di dalam database lokal peramban Anda dengan enkripsi tinggi tanpa dikirim ke server luar."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Receipt className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                Struk<span className="text-slate-800 dark:text-slate-200">Ku</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-20 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <a href="#beranda" className="hover:text-indigo-500 transition-colors">Beranda</a>
              <a href="#fitur" className="hover:text-indigo-500 transition-colors">Fitur Utama</a>
              <a href="#demo" className="hover:text-indigo-500 transition-colors">Live Demo</a>
              <a href="#faq" className="hover:text-indigo-500 transition-colors">FAQ</a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* CTA Button */}
              <Link href="/auth" className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-500/15 transition-all transform active:scale-95">
                Coba Sekarang
              </Link>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 md:hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none" 
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3 transition-all duration-200">
            <a 
              href="#beranda" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium"
            >
              Beranda
            </a>
            <a 
              href="#fitur" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium"
            >
              Fitur Utama
            </a>
            <a 
              href="#demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium"
            >
              Live Demo
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium"
            >
              FAQ
            </a>
            <Link 
              href="/auth" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all"
            >
              Coba Sekarang
            </Link>
          </div>
        )}
      </header>

      <main className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Headline & Description */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Promo Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-900/30 text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 font-semibold tracking-wide">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Terintegrasi Dengan Artificial Intelligence</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Kelola, Cetak, dan <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">Konversi Struk</span> Toko Anda Lebih Fleksibel
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0">
                Solusi praktis untuk mencetak struk manual atau mengonversi struk transaksi e-wallet lain menjadi format struk merchant Anda sendiri. Cetak instan ke bluetooth thermal, simpan PDF, atau ekspor berupa gambar!
              </p>

              {/* CTA Button Group */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/auth" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all hover:-translate-y-0.5">
                  Mulai Buat Struk
                  <Receipt className="w-5 h-5 ml-2" />
                </Link>
                <a href="#demo" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-800 transition-all">
                  Live Demo
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <p className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-4">Mendukung konektivitas multi-device & printer thermal</p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 opacity-60 dark:opacity-40 grayscale hover:grayscale-0 transition-all font-mono text-xs font-bold">
                  <span>BLUETOOTH SPP</span>
                  <span>PDF EXPORT</span>
                  <span>PNG GENERATOR</span>
                  <span>E-WALLET CONVERT</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Hero Receipt Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-600 to-emerald-500 opacity-20 dark:opacity-30 blur-xl" />
              
              {/* Floating Status Card */}
              <div className="absolute -top-6 -left-6 z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '6s' }}>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Struk Hari Ini</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">+124 Cetakan</div>
                </div>
              </div>

              {/* Mockup Preview Card */}
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="text-xs text-slate-400 font-mono">LAYOUT: DefaultStruk</div>
                </div>

                {/* Simulated Mini Receipt */}
                <div className="mt-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                  <div className="text-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
                    <div className="text-xl mb-1">🎁</div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">KEDAI KOPI RAYA</h3>
                    <p className="text-[10px] text-slate-400">Ruko Sentra Bisnis No. 12, Jakarta</p>
                  </div>
                  <div className="py-3 space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Ref No.</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">REF/2026/05/012</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Admin</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Rp 2.500</span>
                    </div>
                    <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-1 pt-1" />
                    <div className="flex justify-between">
                      <span>2x Caramel Macchiato</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Rp 56.000</span>
                    </div>
                    <div className="flex justify-between text-xs font-extrabold border-t border-dashed border-slate-200 dark:border-slate-800 pt-1 text-slate-950 dark:text-white">
                      <span>TOTAL</span>
                      <span>Rp 58.500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="fitur" className="py-16 sm:py-24 border-t border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">Fungsionalitas Sistem</h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Fitur Utama Pengelolaan Struk Anda</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Seluruh kebutuhan pencetakan, kustomisasi layout identitas toko, konversi otomatis hingga pelacakan performa operasional bisnis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              
              {/* Fitur 1: Manual Creator */}
              <div className="group p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-slate-100">Pembuatan Struk Manual</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Input data belanja pelanggan Anda dengan cepat, tambahkan diskon, pajak, biaya admin kustom dan langsung terapkan ke layout <b>DefaultStruk</b> yang bersih.
                </p>
              </div>

              {/* Fitur 2: Convert Merchant */}
              <div className="group p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-slate-100">Konversi Struk Pihak Ketiga</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Konversikan struk eksternal (seperti bukti transfer e-wallet GoPay, OVO, Dana, dll.) secara otomatis menjadi format desain struk toko merchant Anda sendiri.
                </p>
              </div>

              {/* Fitur 3: Thermal & Bluetooth Printer */}
              <div className="group p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Printer className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-slate-100">Multi Ekspor & Thermal Bluetooth</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Cetak struk secara fisik ke printer thermal bluetooth portable, atau simpan dalam format file siap pakai seperti PDF dokumen dan file Gambar (PNG).
                </p>
              </div>

              {/* Fitur 4: Layout & Setting */}
              <div className="group p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-slate-100">Settings Toko Kustom</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Sesuaikan detail struk Anda pada satu halaman pengaturan: Pilih logo kustom toko, atur biaya admin, ubah alamat, serta kelola format prefix referensi.
                </p>
              </div>

              {/* Fitur 5: History & Tracking */}
              <div className="group p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-slate-100">Kustomisasi Layout Struk</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Fleksibilitas penuh untuk mengatur tata letak struk Anda. Ubah susunan komponen, sesuaikan ukuran kertas thermal, dan kelola whitespace agar hasil cetakan terlihat rapi dan profesional.
                </p>
              </div>

              {/* Fitur 6: Social Media Share */}
              <div className="group p-6 sm:p-8 bg-slate-100 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 relative overflow-hidden transition-all duration-300">
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                  Segera Hadir
                </div>
                <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-6">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-400 dark:text-slate-500">Share ke Sosial Media</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm leading-relaxed">
                  Bagikan visualisasi ringkasan struk pesanan langsung ke platform pesan WhatsApp, Telegram, atau story Instagram hanya dalam satu klik mudah.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* LIVE DEMO & INTERACTIVE SIMULATOR */}
        <section id="demo" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-sm font-bold text-emerald-500 tracking-wider uppercase">Uji Coba Langsung</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Simulator Struk Interaktif</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Gunakan tab di bawah untuk mencoba fitur pengunggahan & konversi struk otomatis, atau buat struk Anda sendiri secara manual dari awal.</p>
            </div>

            
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section id="faq" className="py-16 sm:py-24 bg-white/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">Pertanyaan Umum</h2>
              <h3 className="text-3xl font-extrabold tracking-tight">Ketahui Lebih Jauh Mengenai StrukKu</h3>
            </div>

            {/* Accordion container */}
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-350">
                  <button 
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full py-5 px-6 flex items-center justify-between text-left font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <span className="text-indigo-500 transform transition-transform duration-200 font-bold text-xl">
                      {openFaq === faq.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>

                  {openFaq == faq.id && (
                    <div className="px-6 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/50 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-slate-950 text-slate-400 py-12 sm:py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-8 gap-10">
            
            {/* Footer Brand Info */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black text-xs">
                  SK
                </div>
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                  StrukKu
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Ubah struk transaksi biasa Anda menjadi aset visual pemasaran yang konsisten serta modern melalui ekspor media PDF, gambar, atau printer fisik thermal nirkabel.
              </p>
            </div>

            {/* Footer Navigation Links */}
            <div className="md:col-span-3 space-y-3">
              <h5 className="text-white font-semibold text-sm uppercase tracking-wider">Navigasi</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#fitur" className="hover:text-indigo-500 transition-colors">Semua Fitur</a></li>
                <li><a href="#demo" className="hover:text-indigo-500 transition-colors">Live Simulator</a></li>
                <li><a href="#tracking" className="hover:text-indigo-500 transition-colors">Lacak & Statistik</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-semibold">
            <p>© 2026 StrukKu. Seluruh Hak Cipta Dilindungi.</p>
            <p className="flex items-center gap-1">Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk UMKM Indonesia Tangguh.</p>
          </div>
        </div>
      </footer>

      {/* TOAST NOTIFICATION WINDOW */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 transform translate-y-0 opacity-100 transition-all duration-300 max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-in">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 bg-slate-100 dark:bg-slate-800 ${toast.colorClass}`}>
            {toast.icon}
          </div>
          <div>
            <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{toast.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{toast.desc}</p>
          </div>
        </div>
      )}

    </div>
  );
}
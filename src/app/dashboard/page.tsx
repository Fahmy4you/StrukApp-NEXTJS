"use client";
import {
  FileText, 
  Image as ImageIcon, 
  Printer, 
  ArrowRight,
  PlusCircle,
  UploadCloud,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getGreeting } from '@/lib/Helpers';
import React, { useEffect, useState } from 'react';
import { getUserDashboardStats } from '@/lib/actions';

// --- Interfaces ---
type ColorTheme = 'blue' | 'purple' | 'emerald' | 'orange';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactElement;
  color: ColorTheme;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  colorClass: string;
  href: string;
}

const App = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalLayout: 0,
    totalPdf: 0,
    totalGambar: 0,
    totalPrint: 0,
  });

  async function fetchStats() {
    try {
      setLoading(true);
      const data = await getUserDashboardStats({ filter: 'semua' });
      setStats(data);
    } catch (error) {
      console.error("Gagal mengambil data statistik:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, [])

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {getGreeting()}, {session?.user?.name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
          Berikut ringkasan performa hari ini.
        </p>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Layout Struk" 
          value={stats.totalLayout.toLocaleString()} 
          icon={<Layers />} 
          color="blue" 
        />
        
        <StatCard 
          title="Struk via PDF" 
          value={stats.totalPdf.toLocaleString()} 
          icon={<FileText />} 
          color="purple" 
        />
        
        <StatCard 
          title="Struk via Gambar" 
          value={stats.totalGambar.toLocaleString()} 
          icon={<ImageIcon />} 
          color="emerald" 
        />
        
        <StatCard 
          title="Struk via Print" 
          value={stats.totalPrint.toLocaleString()} 
          icon={<Printer />} 
          color="orange" 
        />
      </div>

      <div className="grid mt-10 grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ActionCard 
          title="Upload Struk"
          description="Unggah file struk Anda (PDF/Gambar) untuk diproses secara otomatis."
          icon={<UploadCloud className="w-8 h-8" />}
          colorClass="from-blue-600 to-indigo-600"
          href="/dashboard/upload_struk"
        />
        <ActionCard 
          title="Buat Struk Manual"
          description="Input data transaksi secara manual untuk membuat struk baru dari awal."
          icon={<PlusCircle className="w-8 h-8" />}
          colorClass="from-emerald-600 to-teal-600"
          href="/dashboard/struk_manual"
        />
      </div>

    </div>
  );
};

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const themeClasses: Record<ColorTheme, string> = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 dark:bg-orange-500/20',
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-start justify-between transition-all">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${themeClasses[color]}`}>
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
          className: "w-6 h-6" 
        })}
      </div>
    </div>
  );
};

const ActionCard = ({ title, description, icon, colorClass, href }: ActionCardProps) => (
  <Link href={href} className="group relative overflow-hidden bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 text-left transition-all hover:shadow-xl hover:border-transparent">
    {/* Efek Gradient saat Hover */}
    <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
    
    <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
          {description}
        </p>
        <div className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
          Mulai Sekarang <ArrowRight className="ml-2 w-4 h-4" />
        </div>
      </div>
    </div>
  </Link>
);

export default App;
'use client';
import { usePathname } from 'next/navigation'; // Tambahkan ini
import { LayersPlus, LayoutDashboard, LogOut, Settings, Timer, X } from 'lucide-react';
import Link from 'next/link';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean; // Tetap gunakan prop active
  isOpen: boolean;
  href: string;
}

const SidebarDashboard = ({isSidebarOpen, setIsSidebarOpen, handleLogout}: { isSidebarOpen: boolean; setIsSidebarOpen: (open: boolean) => void; handleLogout: () => Promise<void> }) => {
  const pathname = usePathname(); // Ambil path yang aktif saat ini

  return (
    <aside 
        className={`
        fixed top-0 left-0 h-full z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col overflow-hidden
        ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
        `}>
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-blue-500 p-2 rounded-lg shrink-0">
                  <LayoutDashboard size={24} className="text-white" />
              </div>
              <span className={`font-bold text-xl tracking-tight transition-all duration-300 ${!isSidebarOpen ? 'lg:opacity-0 lg:invisible w-0' : 'opacity-100 w-auto'}`}>
                  StrukApp
              </span>
          </div>
          {/* Tombol Close Hanya di Mobile */}
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
          {/* Logika Active: Cek apakah pathname sama dengan href */}
          <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={['/dashboard', '/dashboard/upload_struk', '/dashboard/struk_manual'].includes(pathname)} 
              isOpen={isSidebarOpen} 
              href="/dashboard"
          />
          <SidebarItem 
              icon={<LayersPlus size={20} />} 
              label="Layout Struk" 
              active={['/dashboard/layout_list'].includes(pathname)} 
              isOpen={isSidebarOpen} 
              href="/dashboard/layout_list"
          />
          <SidebarItem 
              icon={<Settings size={20} />} 
              label="Settings" 
              active={['/dashboard/settings'].includes(pathname)} 
              isOpen={isSidebarOpen}
              href="/dashboard/settings"
          />
          <SidebarItem 
              icon={<Timer size={20} />} 
              label="History" 
              active={['/dashboard/history'].includes(pathname)} 
              isOpen={isSidebarOpen}
              href="/dashboard/history"
          />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={handleLogout} className="cursor-pointer flex items-center gap-4 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all overflow-hidden">
              <LogOut size={20} className="shrink-0" />
              <span className={`font-medium transition-all duration-300 ${!isSidebarOpen ? 'lg:opacity-0 lg:invisible' : 'opacity-100'}`}>
                Logout
              </span>
          </button>
        </div>
    </aside>
  )
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, isOpen, href }) => (
  <Link 
    href={href} 
    className={`
      flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
      ${active 
        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}
    `}
  >
    <div className="shrink-0 z-10">{icon}</div>
    <span className={`font-semibold text-sm whitespace-nowrap transition-all duration-300 z-10 ${!isOpen ? 'lg:opacity-0 lg:invisible w-0' : 'opacity-100 w-auto'}`}>
      {label}
    </span>
    
    {/* Dekorasi tambahan untuk efek aktif (opsional) */}
    {active && (
      <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
    )}
  </Link>
);

export default SidebarDashboard;
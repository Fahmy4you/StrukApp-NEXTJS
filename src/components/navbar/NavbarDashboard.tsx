'use client';
import { ChevronDown, ChevronLeft, LogOut, Menu, Settings2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  badge?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface NotificationItemProps {
  title: string;
  time: string;
  isWarning?: boolean;
}

const NavbarDashboard = ({ isSidebarOpen, setIsSidebarOpen, handleLogout }: { isSidebarOpen: boolean; setIsSidebarOpen: (open: boolean) => void; handleLogout: () => Promise<void> }) => {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  const router = useRouter();

  const getPageTitle = (path: string) => {
        // Objek pemetaan untuk path yang spesifik
        const titles: Record<string, string> = {
            '/dashboard': 'Dashboard Utama',
            '/dashboard/layout_list': 'Layout List Struk',
            '/dashboard/settings': 'Pengaturan Sistem',
            '/dashboard/history': 'Riwayat Struk',
        };

        if (titles[path]) return titles[path];
        const segments = path.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        return lastSegment
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-20 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
            >
            {isSidebarOpen ? <ChevronLeft size={24} className="hidden lg:block" /> : <Menu size={24} className='hidden lg:block' />}
            <Menu size={24} className="lg:hidden" />
            </button>
            
            <h2 className="font-bold text-lg hidden sm:block truncate">{getPageTitle(pathname)}</h2>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
            {/* <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 gap-2 border border-transparent focus-within:border-blue-500 transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                  type="text" 
                  placeholder="Cari..." 
                  className="bg-transparent placeholder:text-slate-600 dark:placeholder:text-slate-400 border-none outline-none text-sm w-24 md:w-64"
              />
            </div> */}

            {/* <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button> */}

            <div className="relative">
            {/* <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative"
            >
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button> */}
            {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-4 w-72 md:w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-4 z-50">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold">Notifikasi</span>
                    <span className="text-xs text-blue-500 cursor-pointer">Baca semua</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                    <NotificationItem title="Struk Berhasil Dibuat" time="2 menit lalu" />
                    <NotificationItem title="Stok Produk Menipis" time="1 jam lalu" isWarning />
                    <NotificationItem title="User Baru Terdaftar" time="5 jam lalu" />
                </div>
                </div>
            )}
            </div>

            <div className="relative">
            <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex cursor-pointer items-center gap-2 p-1 md:p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
            >
                <img 
                src={session?.user?.image || "https://via.placeholder.com/150"} 
                alt="profile" 
                className="w-8 h-8 rounded-lg object-cover"
                referrerPolicy="no-referrer"
                />
                <div className="hidden md:block text-left px-1">
                <p className="text-xs font-bold leading-none">{session?.user?.name?.substring(0, 5) + "..."}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{session?.user?.role?.toUpperCase()}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 mr-1 hidden sm:block" />
            </button>

            {isProfileOpen && (
                <div className="absolute top-full right-0 mt-4 w-56 md:w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-3 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 mb-2">
                    <p className="font-bold text-sm">{session?.user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
                </div>
                {/* <ProfileMenuItem icon={<UserCircle size={18}/>} label="Edit Profile" /> */}
                <ProfileMenuItem onClick={() => router.push('/settings')} icon={<Settings2 size={18}/>} label="Settings" />
                {/* <ProfileMenuItem icon={<Mail size={18}/>} label="Messages" badge="3" /> */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <ProfileMenuItem onClick={handleLogout} icon={<LogOut size={18}/>} label="Sign Out" danger />
                </div>
                </div>
            )}
            </div>
        </div>
        </header>
  )
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ icon, label, danger, badge, onClick }) => (
  <button onClick={onClick} className={`
    w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors cursor-pointer
    ${danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}
  `}>
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    {badge && <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
  </button>
);

const NotificationItem: React.FC<NotificationItemProps> = ({ title, time, isWarning }) => (
  <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-700 last:border-0">
    <div className="flex gap-3">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isWarning ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
      <div>
        <p className="text-sm font-bold leading-tight">{title}</p>
        <p className="text-[10px] text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  </div>
);

export default NavbarDashboard

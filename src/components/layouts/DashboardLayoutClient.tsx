'use client'
import SidebarDashboard from "@/components/sidebar/SidebarDashboard"
import NavbarDashboard from "@/components/navbar/NavbarDashboard"
import { useEffect, useState } from "react";
import LoadingScreenSkeleton from "@/components/loading/LoadingScreen";
import { useSession } from "next-auth/react";
import { handleLogout } from "@/lib/actions";
import { useRouter } from "next/navigation";

const DashboardLayoutClient = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const { status } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogoutConfirmation = async () => {
      const konfirmasi = confirm("Apakah Anda yakin ingin keluar?");
      if (konfirmasi) {
        setLoading(true);

        try {
          await handleLogout();
        } catch (error) {
          
        } finally {{
          setLoading(false);
          router.push("/auth");
        }}
      }
    };
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (status == "loading" || loading) return <LoadingScreenSkeleton />;
      
    return (
        // 1. Tambahkan h-screen dan overflow-hidden di sini agar body tidak scroll
        <div className="h-screen overflow-hidden font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <div className="flex h-full transition-colors duration-300 relative">
                
                {/* BACKDROP UNTUK MOBILE */}
                <div 
                  className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                  onClick={() => setIsSidebarOpen(false)}
                ></div>

                {/* SIDEBAR */}
                <SidebarDashboard 
                  isSidebarOpen={isSidebarOpen} 
                  setIsSidebarOpen={setIsSidebarOpen} 
                  handleLogout={handleLogoutConfirmation}
                />

                {/* MAIN CONTENT AREA */}
                {/* 2. Tambahkan flex flex-col h-full dan overflow-y-auto di sini */}
                <main className={`
                  flex-1 flex flex-col h-full transition-all duration-300 min-w-0 overflow-hidden
                  ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
                `}>
                  
                  {/* NAVBAR */}
                  {/* Sekarang Navbar akan menempel karena dia anak langsung dari kontainer flex-col */}
                  <NavbarDashboard 
                    isSidebarOpen={isSidebarOpen} 
                    setIsSidebarOpen={setIsSidebarOpen} 
                    handleLogout={handleLogoutConfirmation}
                  /> 

                  {/* DASHBOARD CONTENT SCROLL AREA */}
                  {/* 3. Area ini yang akan meng-handle scroll konten */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-10 md:pt-7 transition-all duration-300">
                    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                      {children}
                    </div>
                  </div>
                </main>
            </div>
        </div>
    )
}

export default DashboardLayoutClient
import type { Metadata } from "next";
import "@/styles/globals.css";
import { poppinsFont } from "@/lib/fonts";
import DarkModeToggle from "@/components/button/DarkModeToggle";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Authentikasi | Struk Digital - Buat Struk Digital dengan Mudah",
  description: "Aplikasi Pembuatan Struk Digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppinsFont.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500 bg-slate-50 dark:bg-slate-950`}>
      
          {/* Background Ornaments */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-1 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px]" />
          </div>
          <SessionProvider>
            {children}
          </SessionProvider>
        </div>
        
        <DarkModeToggle/>
      </body>
    </html>
  );
}

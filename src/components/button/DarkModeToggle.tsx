'use client';

import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Cek Storage terlebih dahulu
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme) {
      setDarkMode(storedTheme === 'dark');
    } else {
      // 2. Jika tidak ada di storage, cek settingan browser
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Menghindari eksekusi saat darkMode masih null (awal render)
    if (darkMode === null) return;

    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Cegah "hydration mismatch" dengan tidak merender icon sampai state ditentukan
  if (darkMode === null) return null;

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed cursor-pointer bottom-6 right-6 w-14 h-14 bg-white dark:bg-slate-800 shadow-2xl rounded-full flex items-center justify-center text-blue-600 dark:text-yellow-400 hover:scale-110 active:scale-95 transition-all duration-300 border border-gray-200 dark:border-slate-700 z-50 focus:outline-none"
      aria-label="Toggle Dark Mode"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Ikon Matahari (Muncul saat Dark Mode) */}
        <div
          className={`absolute transform transition-all duration-500 ease-in-out ${
            darkMode 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
          }`}
        >
          <Sun size={24} fill="currentColor" />
        </div>

        {/* Ikon Bulan (Muncul saat Light Mode) */}
        <div
          className={`absolute transform transition-all duration-500 ease-in-out ${
            darkMode 
              ? '-rotate-90 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
          }`}
        >
          <Moon size={24} fill="currentColor" />
        </div>
      </div>
    </button>
  );
};

export default DarkModeToggle;
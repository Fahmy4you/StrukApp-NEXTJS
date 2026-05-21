'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown, Check, Loader2 } from "lucide-react";

// Definisikan struktur data generic agar bisa dipakai untuk data apapun
interface SelectOption {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  labelTitle?: string;
  placeholder?: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  options: SelectOption[];
  loading?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  labelTitle = "Pilih Opsi",
  placeholder = "Ketik untuk mencari...",
  selectedId,
  onSelect,
  options,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Efek klik di luar komponen untuk otomatis menutup dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter option berdasarkan karakter input pencarian (case-insensitive)
  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  // Cari objek item yang sedang aktif dipilih saat ini
  const currentSelection = options.find((opt) => opt.id === selectedId);

  return (
    <div className="relative w-full min-w-0" ref={containerRef}>
      {/* Label Atas */}
      <label className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">
        {labelTitle}
      </label>

      {/* Main Selector Box (Trigger Open/Close) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-600 transition-all shadow-sm select-none"
      >
        <span className={`text-xs sm:text-sm truncate flex-1 ${currentSelection ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
          {currentSelection ? currentSelection.label : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 dark:text-slate-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-500" : ""}`} 
        />
      </div>

      {/* Dropdown Card Flyout */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-slate-950/50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 flex flex-col">
          
          {/* Search Box Sticky Input */}
          <div className="relative p-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Menahan event bubling agar dropdown tidak tertutup saat diklik
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-600 transition-all text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* List Box Options - MAXIMAL TAMPILKAN 3 ITEM SAJA (`max-h-[112px]` atau 3 baris item) */}
          <div className="overflow-y-auto max-h-[120px] divide-y divide-slate-50 dark:divide-slate-800/40 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-4 text-slate-400 dark:text-slate-500 gap-2 text-xs">
                <Loader2 size={14} className="animate-spin text-blue-500" />
                Memuat data...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`flex items-center justify-between gap-2 px-4 py-2 text-xs sm:text-sm cursor-pointer select-none transition-colors ${
                    selectedId === item.id
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {selectedId === item.id && (
                    <Check size={14} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                Data tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Landmark, Check, ChevronDown, Search, X, LucideIcon } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  label?: string;
  placeholder?: string;
  name?: string;
  icon?: LucideIcon;
  onChange?: (e: { target: { name: string; value: string } }) => void;
  value?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
  options = [], 
  label = "Pilih", 
  placeholder = "Cari...", 
  name = "select_field", 
  icon: Icon = Landmark, 
  onChange,
  value = ""
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update status internal jika prop value berubah
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Menutup dropdown jika klik di luar komponen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (item: string) => {
    setSelectedValue(item);
    setSearchTerm("");
    setIsOpen(false);
    
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: item
        }
      });
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue("");
    if (onChange) {
      onChange({ target: { name: name, value: "" } });
    }
  };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon size={14} className="text-blue-500" />} {label}
      </label>

      <div className="relative">
        {/* Trigger / Paparan Input */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full p-4 flex items-center justify-between cursor-pointer
            bg-gray-50 dark:bg-slate-800 border rounded-2xl transition-all duration-200
            ${isOpen ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-gray-200 dark:border-slate-700'}
          `}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {!selectedValue && !isOpen && (
              <span className="text-gray-400 truncate">{placeholder}</span>
            )}
            {selectedValue && !isOpen && (
              <span className="font-medium text-gray-900 dark:text-white truncate">{selectedValue}</span>
            )}
            {isOpen && (
              <input
                autoFocus
                type="text"
                placeholder="Taip untuk mencari..."
                className="bg-transparent outline-none w-full text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>

          <div className="flex items-center gap-2 ml-2">
            {selectedValue && (
              <X 
                size={16} 
                className="text-gray-400 hover:text-red-500 transition-colors" 
                onClick={clearSelection}
              />
            )}
            <ChevronDown 
              size={18} 
              className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>

        {/* Menu Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-64 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-100 no-scrollbar">
            {filteredOptions.length > 0 ? (
              <div className="p-2">
                {filteredOptions.map((item) => (
                  <div
                    key={item}
                    onClick={() => handleSelect(item)}
                    className={`
                      flex items-center justify-between p-3 rounded-xl cursor-pointer transition
                      ${selectedValue === item 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200'}
                    `}
                  >
                    <span className="font-medium">{item}</span>
                    {selectedValue === item && <Check size={16} />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Data tidak dijumpai</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableSelect;
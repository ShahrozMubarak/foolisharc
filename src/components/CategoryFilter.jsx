import React from 'react';

export const GENDER_FILTERS = [
  { id: "all", label: "All Items" },
  { id: "men", label: "Men's Collection" },
  { id: "women", label: "Women’s Collection" },
  { id: "kids", label: "Kids" }
];

export const SLOT_FILTERS = [
  { id: "all", label: "All Categories" },
  { id: "jeans", label: "Jeans & Denim" },
  { id: "tee", label: "T-Shirts" },
  { id: "shirt", label: "Shirts" },
  { id: "trouser", label: "Trousers" },
  { id: "outer", label: "Outerwear" }, { id:"dress",label:"Dresses" }, { id:"knit",label:"Knitwear" }, { id:"shorts",label:"Shorts" }
];

export default function CategoryFilter({
  activeGender = "all",
  onSelectGender,
  activeSlot = "all",
  onSelectSlot
}) {
  return (
    <div className="py-4 border-b border-[#E8E0D5] dark:border-[#2C241D] space-y-3">
      
      {/* Top Row: Gender Collection Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {GENDER_FILTERS.map((g) => {
          const isActive = activeGender === g.id;
          return (
            <button
              key={g.id}
              aria-pressed={isActive} onClick={() => onSelectGender(g.id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#1C1612] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1A1613] text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-[#D8CEBF] dark:border-[#382F26] hover:border-[#9A6E3E]'
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Row: Garment Slot Category Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        {SLOT_FILTERS.map((s) => {
          const isActive = activeSlot === s.id;
          return (
            <button
              key={s.id}
              aria-pressed={isActive} onClick={() => onSelectSlot(s.id)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold uppercase transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#9A6E3E] text-white shadow-sm'
                  : 'bg-[#FAF6F0] dark:bg-[#201A16] text-[#7C6A58] dark:text-[#D8CEBF] border border-[#E6D3B3] dark:border-[#332A22] hover:border-[#9A6E3E]'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}

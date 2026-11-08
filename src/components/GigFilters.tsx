'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { GigCategory, GigSource } from '@/lib/types';

interface GigFiltersProps {
  category: GigCategory;
  onSelectCategory: (cat: GigCategory) => void;
  source: GigSource | 'all';
  onSelectSource: (src: GigSource | 'all') => void;
  minBudget: number;
  onSelectMinBudget: (budget: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const CATEGORIES: { id: GigCategory; label: string }[] = [
  { id: 'all', label: 'All Fields' },
  { id: 'react-nextjs', label: 'React / Next.js' },
  { id: 'video-editing', label: 'Video Editing' },
  { id: 'ai-llm', label: 'AI & LLMs' },
  { id: 'ui-ux', label: 'UI/UX Design' },
  { id: 'python-backend', label: 'Python & Backend' },
  { id: 'copywriting', label: 'Copywriting' },
  { id: 'virtual-assistant', label: 'Virtual Assistant' },
];

export const GigFilters: React.FC<GigFiltersProps> = ({
  category,
  onSelectCategory,
  source,
  onSelectSource,
  minBudget,
  onSelectMinBudget,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md">
      
      {/* Top row: Search input + Min budget pills */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search keywords, tech stack, or client handle..."
            className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Budget filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-zinc-400 font-mono flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            Min stated $:
          </span>
          {[0, 1000, 2500, 4000].map((amount) => (
            <button
              key={amount}
              onClick={() => onSelectMinBudget(amount)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                minBudget === amount
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {amount === 0 ? 'Any' : `$${amount / 1000}k+`}
            </button>
          ))}
        </div>

        <span className="text-xs text-zinc-500">Posters are not independently verified.</span>

      </div>

      {/* Category Pills (Horizontal scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              category === cat.id
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-zinc-950/80 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Source pills */}
      <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60 text-xs">
        <span className="text-zinc-400 font-mono text-[11px]">Radar Source:</span>
        {(['all', 'reddit'] as const).map((src) => (
          <button
            key={src}
            onClick={() => onSelectSource(src)}
            className={`capitalize px-2.5 py-0.5 rounded-md font-mono text-[11px] transition-all ${
              source === src
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {src}
          </button>
        ))}
      </div>

    </div>
  );
};

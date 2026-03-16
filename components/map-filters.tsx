"use client";

import { CATEGORY_COLORS } from "@/lib/constants";
import type { MapFilters } from "@/lib/geo-utils";

export function MapFiltersBar({
  filters,
  allCategories,
  allCountries,
  hasActiveFilters,
  onToggleCategory,
  onSetSearch,
  onSetCountry,
  onClear,
}: {
  filters: MapFilters;
  allCategories: string[];
  allCountries: string[];
  hasActiveFilters: boolean;
  onToggleCategory: (cat: string) => void;
  onSetSearch: (s: string) => void;
  onSetCountry: (c: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="absolute top-16 right-4 z-10 flex max-w-[320px] flex-col gap-2">
      {/* Search */}
      <input
        type="text"
        placeholder="Search validators..."
        value={filters.search}
        onChange={(e) => onSetSearch(e.target.value)}
        className="font-body w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-foreground placeholder:text-muted backdrop-blur-md focus:border-accent focus:outline-none"
      />

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        {allCategories.map((cat) => {
          const active = filters.categories.has(cat);
          const color = CATEGORY_COLORS[cat] ?? "#6B7280";
          return (
            <button
              key={cat}
              onClick={() => onToggleCategory(cat)}
              className="font-body rounded-full px-2.5 py-1 text-[10px] font-medium transition-all"
              style={{
                backgroundColor: active ? color + "30" : "rgba(15,14,12,0.7)",
                color: active ? color : "rgba(243,238,217,0.5)",
                border: `1px solid ${active ? color + "60" : "rgba(243,238,217,0.1)"}`,
                backdropFilter: "blur(8px)",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Country dropdown */}
      <select
        value={filters.country}
        onChange={(e) => onSetCountry(e.target.value)}
        className="font-body rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-foreground backdrop-blur-md focus:border-accent focus:outline-none"
      >
        <option value="">All Countries</option>
        {allCountries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="font-body rounded-lg border border-border bg-background/70 px-3 py-1.5 text-[10px] text-muted backdrop-blur-md transition-colors hover:border-accent hover:text-accent"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

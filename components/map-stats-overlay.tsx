"use client";

import { formatSol, formatNumber } from "@/lib/utils";
import type { MapStats } from "@/lib/geo-utils";

export function MapStatsOverlay({
  stats,
  isLoading,
}: {
  stats: MapStats;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="absolute top-16 left-4 z-50 rounded-xl border border-border bg-background/70 p-4 backdrop-blur-md">
        <div className="skeleton h-4 w-24 rounded" />
      </div>
    );
  }

  const items = [
    { label: "Validators", value: formatNumber(stats.filteredCount) },
    { label: "Total Stake", value: `${formatSol(stats.totalStakeSol)} SOL` },
    { label: "Countries", value: formatNumber(stats.countries) },
    { label: "Continents", value: formatNumber(stats.continents) },
  ];

  return (
    <div className="absolute top-16 left-4 z-50 rounded-xl border border-border bg-background/70 p-4 backdrop-blur-md">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="font-title text-lg leading-none text-accent">
              {item.value}
            </p>
            <p className="font-body mt-1 text-[10px] tracking-wider text-muted uppercase">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

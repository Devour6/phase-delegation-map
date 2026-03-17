"use client";

import { useEffect, useCallback } from "react";
import { clientName, CATEGORY_COLORS } from "@/lib/constants";
import { formatSol } from "@/lib/utils";

interface ValidatorProperties {
  vote_pubkey: string;
  name: string;
  categories: string[];
  city: string;
  country: string;
  pool_stake_sol: number;
  apy: number | null;
  commission: number;
  mev_commission: number;
  client_type: number;
  skip_rate: number;
  vote_credits_ratio: number;
}

export function MapClusterPanel({
  validators,
  onClose,
  onSelectValidator,
  title,
}: {
  validators: ValidatorProperties[];
  onClose: () => void;
  onSelectValidator: (v: ValidatorProperties) => void;
  title?: string;
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (validators.length === 0) return null;

  // Group by city
  const cities = new Map<string, ValidatorProperties[]>();
  for (const v of validators) {
    const key = `${v.city}, ${v.country}`;
    if (!cities.has(key)) cities.set(key, []);
    cities.get(key)!.push(v);
  }

  const totalStake = validators.reduce((s, v) => s + v.pool_stake_sol, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/30"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-[52px] bottom-0 z-40 flex w-full max-w-sm flex-col overflow-hidden border-l border-border bg-background/95 backdrop-blur-xl md:w-96">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-title text-lg text-foreground">
              {title ?? `${validators.length} Validators`}
            </h2>
            <p className="font-body mt-0.5 text-xs text-muted">
              {formatSol(totalStake)} SOL total stake
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Validator list */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {Array.from(cities.entries()).map(([cityName, cityValidators]) => (
            <div key={cityName} className="mb-4">
              <p className="font-body mb-2 text-[10px] tracking-wider text-muted uppercase">
                {cityName} ({cityValidators.length})
              </p>
              <div className="space-y-1.5">
                {cityValidators
                  .sort((a, b) => b.pool_stake_sol - a.pool_stake_sol)
                  .map((v) => (
                    <button
                      key={v.vote_pubkey}
                      onClick={() => onSelectValidator(v)}
                      className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-accent/30 hover:bg-surface-hover"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-body truncate text-sm text-foreground">
                          {v.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="font-body text-[10px] text-muted">
                            {formatSol(v.pool_stake_sol)} SOL
                          </span>
                          {v.apy != null && (
                            <>
                              <span className="text-border">|</span>
                              <span className="font-body text-[10px] text-muted">
                                {v.apy.toFixed(2)}% APY
                              </span>
                            </>
                          )}
                          <span className="text-border">|</span>
                          <span className="font-body text-[10px] text-muted">
                            {v.commission}% comm
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {v.categories.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="rounded-full px-1.5 py-0.5 text-[8px] font-medium"
                            style={{
                              backgroundColor:
                                (CATEGORY_COLORS[c] ?? "#6B7280") + "20",
                              color: CATEGORY_COLORS[c] ?? "#6B7280",
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="shrink-0 text-muted"
                        aria-hidden="true"
                      >
                        <path
                          d="M4.5 2.5L8 6L4.5 9.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

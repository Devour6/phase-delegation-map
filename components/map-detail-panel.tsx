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

export function MapDetailPanel({
  validator,
  onClose,
}: {
  validator: ValidatorProperties | null;
  onClose: () => void;
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

  if (!validator) return null;

  const kpis = [
    {
      label: "Pool Stake",
      value: `${formatSol(validator.pool_stake_sol)} SOL`,
    },
    {
      label: "APY",
      value: validator.apy != null ? `${validator.apy.toFixed(2)}%` : "-",
    },
    { label: "Commission", value: `${validator.commission}%` },
    {
      label: "Vote Credits",
      value: `${(validator.vote_credits_ratio * 100).toFixed(2)}%`,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/30"
        onClick={onClose}
      />

      {/* Panel — desktop: right slide, mobile: bottom sheet */}
      <div className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-sm overflow-y-auto border-l border-border bg-background/95 p-6 backdrop-blur-xl md:w-96">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent hover:text-accent"
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

        {/* Name + pubkey */}
        <h2 className="font-title mt-2 text-xl text-foreground">
          {validator.name}
        </h2>
        <p className="font-body mt-1 break-all text-[11px] text-muted">
          {validator.vote_pubkey}
        </p>

        {/* Categories */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {validator.categories.map((c) => (
            <span
              key={c}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
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

        {/* KPI cards */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="rounded-lg border border-border bg-surface p-3"
            >
              <p className="font-body text-[10px] tracking-wider text-muted uppercase">
                {k.label}
              </p>
              <p className="font-title mt-1 text-base text-accent">
                {k.value}
              </p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-muted">Location</span>
            <span className="font-body text-xs text-foreground">
              {validator.city}, {validator.country}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-muted">Client</span>
            <span className="font-body text-xs text-foreground">
              {clientName(validator.client_type)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-muted">
              MEV Commission
            </span>
            <span className="font-body text-xs text-foreground">
              {(validator.mev_commission / 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-muted">Skip Rate</span>
            <span className="font-body text-xs text-foreground">
              {validator.skip_rate}
            </span>
          </div>
        </div>

        {/* Link out */}
        <a
          href={`https://phase-delegation.vercel.app/validators/${validator.vote_pubkey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body mt-6 flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
        >
          View Full Details
        </a>
      </div>
    </>
  );
}

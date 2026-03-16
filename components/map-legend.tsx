"use client";

export function MapLegend() {
  return (
    <div className="absolute bottom-6 left-4 z-10 rounded-lg border border-border bg-background/70 px-3 py-2 backdrop-blur-md">
      <p className="font-body mb-1.5 text-[10px] tracking-wider text-muted uppercase">
        Stake Density
      </p>
      <div className="flex items-center gap-1">
        <div
          className="h-2.5 w-24 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(153,163,255,0.2), rgba(153,163,255,0.6), rgba(167,139,250,0.8), rgba(251,191,36,1))",
          }}
        />
      </div>
      <div className="flex justify-between">
        <span className="font-body text-[9px] text-muted">Low</span>
        <span className="font-body text-[9px] text-muted">High</span>
      </div>
    </div>
  );
}

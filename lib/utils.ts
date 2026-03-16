export function formatSol(sol: number): string {
  if (sol >= 1_000_000) return `${(sol / 1_000_000).toFixed(2)}M`;
  if (sol >= 1_000) return `${(sol / 1_000).toFixed(0)}K`;
  return sol.toFixed(0);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

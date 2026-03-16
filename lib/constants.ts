export const API_BASE = "https://aero-pool-metrics.apps.ra.latentfree.llc";

export const CLIENT_NAMES: Record<number, string> = {
  1: "Agave",
  2: "Jito",
  3: "Firedancer",
  4: "Frankendancer",
  5: "Firedancer Jito",
  6: "Jito BAM",
  7: "Harmonic",
  8: "Rakurai",
  9: "Frankendancer Jito",
  10: "Harmonic",
  11: "Firedancer",
  255: "Unknown",
};

export function clientName(type: number): string {
  return CLIENT_NAMES[type] ?? "Unknown";
}

export const CATEGORY_COLORS: Record<string, string> = {
  Community: "#99A3FF",
  Infrastructure: "#4ADE80",
  Development: "#A78BFA",
  DeFi: "#FBBF24",
  Education: "#F472B6",
  Analytics: "#FB923C",
  Events: "#34D399",
  Other: "#6B7280",
};

export const CONTINENT_COLORS: Record<string, string> = {
  Europe: "#99A3FF",
  Asia: "#4ADE80",
  "North America": "#FBBF24",
  "South America": "#A78BFA",
  Africa: "#F472B6",
};

"use client";

import useSWR from "swr";
import { useMemo, useState, useCallback } from "react";
import { CITY_COORDINATES } from "./geocoding";
import { API_BASE } from "./constants";
import type { PoolValidator, PoolOverview, DiversityResponse } from "./types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function hashCode(str: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function jitter(
  lat: number,
  lng: number,
  pubkey: string,
  spread = 0.03
): [number, number] {
  const h1 = hashCode(pubkey, 1);
  const h2 = hashCode(pubkey, 2);
  const jLat = ((h1 % 1000) / 1000 - 0.5) * spread;
  const jLng = ((h2 % 1000) / 1000 - 0.5) * spread;
  return [lat + jLat, lng + jLng];
}

export interface MapFilters {
  categories: Set<string>;
  search: string;
  country: string;
}

export interface MapStats {
  validatorCount: number;
  totalStakeSol: number;
  countries: number;
  continents: number;
  filteredCount: number;
}

export function useMapData() {
  const { data: validators, isLoading: vLoading } = useSWR<PoolValidator[]>(
    `${API_BASE}/api/v1/validators`,
    fetcher,
    { refreshInterval: 300_000 }
  );
  const { data: overview } = useSWR<PoolOverview>(
    `${API_BASE}/api/v1/pool/overview`,
    fetcher,
    { refreshInterval: 300_000 }
  );
  const { data: diversity } = useSWR<DiversityResponse>(
    `${API_BASE}/api/v1/comparisons/diversity`,
    fetcher,
    { refreshInterval: 300_000 }
  );

  const [filters, setFilters] = useState<MapFilters>({
    categories: new Set(),
    search: "",
    country: "",
  });

  const toggleCategory = useCallback((cat: string) => {
    setFilters((prev) => {
      const next = new Set(prev.categories);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return { ...prev, categories: next };
    });
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setCountry = useCallback((country: string) => {
    setFilters((prev) => ({ ...prev, country }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ categories: new Set(), search: "", country: "" });
  }, []);

  const allCategories = useMemo(() => {
    if (!validators) return [];
    const cats = new Set<string>();
    for (const v of validators) {
      for (const c of v.categories) cats.add(c);
    }
    return Array.from(cats).sort();
  }, [validators]);

  const allCountries = useMemo(() => {
    if (!validators) return [];
    const countries = new Set<string>();
    for (const v of validators) {
      if (v.country) countries.add(v.country);
    }
    return Array.from(countries).sort();
  }, [validators]);

  const filtered = useMemo(() => {
    if (!validators) return [];
    return validators.filter((v) => {
      if (
        filters.categories.size > 0 &&
        !v.categories.some((c) => filters.categories.has(c))
      )
        return false;
      if (
        filters.search &&
        !(v.name ?? "").toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.country && v.country !== filters.country) return false;
      return true;
    });
  }, [validators, filters]);

  const geojson = useMemo((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = [];
    for (const v of filtered) {
      const key = `${v.city ?? "Unknown"}, ${v.country ?? "Unknown"}`;
      const coords = CITY_COORDINATES[key];
      if (!coords) continue;
      const [lat, lng] = jitter(coords.lat, coords.lng, v.vote_pubkey);
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] },
        properties: {
          vote_pubkey: v.vote_pubkey,
          name: v.name ?? "Unknown",
          categories: v.categories,
          city: v.city ?? "Unknown",
          country: v.country ?? "Unknown",
          pool_stake_sol: v.pool_stake_sol,
          apy: v.apy,
          commission: v.commission,
          mev_commission: v.mev_commission,
          client_type: v.client_type,
          skip_rate: v.skip_rate,
          vote_credits_ratio: v.vote_credits_ratio,
        },
      });
    }
    return { type: "FeatureCollection", features };
  }, [filtered]);

  const stats: MapStats = useMemo(() => {
    const countries = diversity
      ? Object.keys(diversity.pool.countries).length
      : 0;
    const continents = diversity
      ? Object.keys(diversity.pool.continents).length
      : 0;
    return {
      validatorCount: overview?.validatorCount ?? 0,
      totalStakeSol: overview?.totalStakeSol ?? 0,
      countries,
      continents,
      filteredCount: filtered.length,
    };
  }, [overview, diversity, filtered]);

  const hasActiveFilters =
    filters.categories.size > 0 || filters.search !== "" || filters.country !== "";

  return {
    geojson,
    stats,
    filters,
    toggleCategory,
    setSearch,
    setCountry,
    clearFilters,
    hasActiveFilters,
    allCategories,
    allCountries,
    isLoading: vLoading,
    validators: filtered,
  };
}

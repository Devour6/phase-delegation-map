"use client";

import { useState, useCallback, useRef } from "react";
import Map, {
  Source,
  Layer,
  NavigationControl,
  type MapRef,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import { useMapData } from "@/lib/geo-utils";
import { Navbar } from "./navbar";
import { MapStatsOverlay } from "./map-stats-overlay";
import { MapFiltersBar } from "./map-filters";
import { MapDetailPanel } from "./map-detail-panel";
import { MapClusterPanel } from "./map-cluster-panel";
import { MapLegend } from "./map-legend";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

interface ValidatorProps {
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

function parseCategories(props: Record<string, unknown>): ValidatorProps {
  const p = { ...props };
  if (typeof p.categories === "string") {
    try {
      p.categories = JSON.parse(p.categories as string);
    } catch {
      p.categories = [];
    }
  }
  return p as unknown as ValidatorProps;
}

export default function ValidatorMap() {
  const mapRef = useRef<MapRef>(null);
  const {
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
    isLoading,
  } = useMapData();

  const [selected, setSelected] = useState<ValidatorProps | null>(null);
  const [clusterValidators, setClusterValidators] = useState<
    ValidatorProps[]
  >([]);
  const [cursor, setCursor] = useState("grab");

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) {
        setSelected(null);
        setClusterValidators([]);
        return;
      }

      // Cluster — get leaves and show list panel
      if (feature.properties?.cluster) {
        const map = mapRef.current?.getMap();
        if (!map) return;
        const source = map.getSource("validators-clustered") as unknown as {
          getClusterExpansionZoom: (
            id: number,
            cb: (err: unknown, zoom: number) => void
          ) => void;
          getClusterLeaves: (
            id: number,
            limit: number,
            offset: number,
            cb: (err: unknown, features: GeoJSON.Feature[]) => void
          ) => void;
        };

        const clusterId = feature.properties.cluster_id as number;
        const pointCount = feature.properties.point_count as number;

        // Get all validators in this cluster
        source.getClusterLeaves(
          clusterId,
          pointCount,
          0,
          (_err, leaves) => {
            if (!leaves || leaves.length === 0) return;
            const validators = leaves.map((leaf) =>
              parseCategories(
                (leaf.properties ?? {}) as Record<string, unknown>
              )
            );
            setClusterValidators(validators);
            setSelected(null);
          }
        );
        return;
      }

      // Individual validator
      setClusterValidators([]);
      setSelected(parseCategories(feature.properties as Record<string, unknown>));
    },
    []
  );

  const handleMouseEnter = useCallback(() => setCursor("pointer"), []);
  const handleMouseLeave = useCallback(() => setCursor("grab"), []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <Navbar />

      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE}
        initialViewState={{
          longitude: 10,
          latitude: 20,
          zoom: 1.8,
        }}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={["validator-points", "clusters"]}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        cursor={cursor}
        maxZoom={18}
        minZoom={1}
      >
        <NavigationControl position="bottom-right" showCompass={false} />

        {geojson.features.length > 0 && (
          <>
            {/* Non-clustered source for heatmap — needs raw points for density */}
            <Source
              id="validators-heatmap"
              type="geojson"
              data={geojson}
            >
              <Layer
                id="validator-heatmap"
                type="heatmap"
                paint={{
                  "heatmap-weight": [
                    "interpolate",
                    ["linear"],
                    ["get", "pool_stake_sol"],
                    0,
                    0.1,
                    50000,
                    1,
                  ],
                  "heatmap-intensity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0,
                    0.8,
                    4,
                    2,
                    8,
                    3,
                  ],
                  "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    0,
                    "rgba(0,0,0,0)",
                    0.15,
                    "rgba(153,163,255,0.25)",
                    0.3,
                    "rgba(153,163,255,0.5)",
                    0.5,
                    "rgba(153,163,255,0.7)",
                    0.7,
                    "rgba(167,139,250,0.85)",
                    0.85,
                    "rgba(251,191,36,0.9)",
                    1,
                    "rgba(251,191,36,1)",
                  ],
                  "heatmap-radius": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0,
                    40,
                    3,
                    60,
                    6,
                    80,
                    10,
                    40,
                  ],
                  "heatmap-opacity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    6,
                    0.8,
                    9,
                    0,
                  ],
                }}
              />
            </Source>

            {/* Clustered source for circles and individual points */}
            <Source
              id="validators-clustered"
              type="geojson"
              data={geojson}
              cluster={true}
              clusterMaxZoom={14}
              clusterRadius={50}
            >
              {/* Cluster circles */}
              <Layer
                id="clusters"
                type="circle"
                filter={["has", "point_count"]}
                paint={{
                  "circle-color": "#99A3FF",
                  "circle-opacity": 0.7,
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    18,
                    10,
                    24,
                    30,
                    32,
                    50,
                    40,
                  ],
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "rgba(153,163,255,0.3)",
                }}
              />

              {/* Cluster count labels */}
              <Layer
                id="cluster-count"
                type="symbol"
                filter={["has", "point_count"]}
                layout={{
                  "text-field": ["get", "point_count_abbreviated"],
                  "text-size": 12,
                }}
                paint={{
                  "text-color": "#F3EED9",
                }}
              />

              {/* Individual validator points */}
              <Layer
                id="validator-points"
                type="circle"
                filter={["!", ["has", "point_count"]]}
                paint={{
                  "circle-color": "#99A3FF",
                  "circle-radius": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    4,
                    3,
                    8,
                    5,
                    14,
                    8,
                  ],
                  "circle-stroke-width": 1.5,
                  "circle-stroke-color": "rgba(153,163,255,0.4)",
                  "circle-opacity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    5,
                    0,
                    7,
                    1,
                  ],
                  "circle-stroke-opacity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    5,
                    0,
                    7,
                    1,
                  ],
                }}
              />
            </Source>
          </>
        )}
      </Map>

      {/* Overlays */}
      <MapStatsOverlay stats={stats} isLoading={isLoading} />

      <MapFiltersBar
        filters={filters}
        allCategories={allCategories}
        allCountries={allCountries}
        hasActiveFilters={hasActiveFilters}
        onToggleCategory={toggleCategory}
        onSetSearch={setSearch}
        onSetCountry={setCountry}
        onClear={clearFilters}
      />

      <MapLegend />

      <MapDetailPanel
        validator={selected}
        onClose={() => setSelected(null)}
      />

      <MapClusterPanel
        validators={clusterValidators}
        onClose={() => setClusterValidators([])}
        onSelectValidator={(v) => {
          setClusterValidators([]);
          setSelected(v);
        }}
      />
    </div>
  );
}

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
    async (e: MapLayerMouseEvent) => {
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
        const source = map.getSource("validators") as unknown as {
          getClusterLeaves: (
            id: number,
            limit: number,
            offset: number
          ) => Promise<GeoJSON.Feature[]>;
        };

        try {
          const clusterId = feature.properties.cluster_id as number;
          const pointCount = feature.properties.point_count as number;
          const leaves = await source.getClusterLeaves(
            clusterId,
            pointCount,
            0
          );
          if (leaves && leaves.length > 0) {
            const validators = leaves.map((leaf) =>
              parseCategories(
                (leaf.properties ?? {}) as Record<string, unknown>
              )
            );
            setClusterValidators(validators);
            setSelected(null);
          }
        } catch {
          // Fallback: zoom into the cluster
          const geom = feature.geometry as GeoJSON.Point;
          map.flyTo({
            center: geom.coordinates as [number, number],
            zoom: (map.getZoom() ?? 2) + 3,
            duration: 500,
          });
        }
        return;
      }

      // Individual validator
      setClusterValidators([]);
      setSelected(
        parseCategories(feature.properties as Record<string, unknown>)
      );
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
          <Source
            id="validators"
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
                "circle-opacity": 0.15,
                "circle-radius": [
                  "step",
                  ["get", "point_count"],
                  20,
                  10,
                  28,
                  30,
                  36,
                  50,
                  44,
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "rgba(153,163,255,0.5)",
              }}
            />

            {/* Cluster count labels */}
            <Layer
              id="cluster-count"
              type="symbol"
              filter={["has", "point_count"]}
              layout={{
                "text-field": ["get", "point_count_abbreviated"],
                "text-size": 13,
                "text-font": ["Open Sans Bold"],
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
                  4,
                  8,
                  6,
                  14,
                  9,
                ],
                "circle-stroke-width": 1.5,
                "circle-stroke-color": "rgba(153,163,255,0.4)",
                "circle-opacity": 0.85,
                "circle-stroke-opacity": 1,
              }}
            />
          </Source>
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

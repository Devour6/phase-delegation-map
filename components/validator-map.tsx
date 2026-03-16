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
import { MapLegend } from "./map-legend";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

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

  const [selected, setSelected] = useState<Record<string, unknown> | null>(
    null
  );
  const [cursor, setCursor] = useState("grab");

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) {
        setSelected(null);
        return;
      }

      // Cluster — zoom in
      if (feature.properties?.cluster) {
        const map = mapRef.current?.getMap();
        if (!map) return;
        const source = map.getSource("validators") as unknown as {
          getClusterExpansionZoom: (
            id: number,
            cb: (err: unknown, zoom: number) => void
          ) => void;
        };
        source.getClusterExpansionZoom(
          feature.properties.cluster_id as number,
          (_err, zoom) => {
            const geom = feature.geometry as GeoJSON.Point;
            map.flyTo({
              center: geom.coordinates as [number, number],
              zoom: zoom + 1,
              duration: 500,
            });
          }
        );
        return;
      }

      // Individual validator — parse categories back from string
      const props = { ...feature.properties };
      if (typeof props.categories === "string") {
        try {
          props.categories = JSON.parse(props.categories);
        } catch {
          props.categories = [];
        }
      }
      setSelected(props);
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
            {/* Heatmap layer — visible at low zoom */}
            <Layer
              id="validator-heatmap"
              type="heatmap"
              paint={{
                "heatmap-weight": [
                  "interpolate",
                  ["linear"],
                  ["get", "pool_stake_sol"],
                  0,
                  0,
                  10000,
                  1,
                ],
                "heatmap-intensity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0,
                  1,
                  6,
                  3,
                ],
                "heatmap-color": [
                  "interpolate",
                  ["linear"],
                  ["heatmap-density"],
                  0,
                  "rgba(0,0,0,0)",
                  0.2,
                  "rgba(153,163,255,0.3)",
                  0.4,
                  "rgba(153,163,255,0.6)",
                  0.6,
                  "rgba(167,139,250,0.8)",
                  0.8,
                  "rgba(251,191,36,0.9)",
                  1,
                  "rgba(251,191,36,1)",
                ],
                "heatmap-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0,
                  20,
                  6,
                  40,
                ],
                "heatmap-opacity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  5,
                  0.8,
                  7,
                  0,
                ],
              }}
            />

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
        validator={selected as never}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

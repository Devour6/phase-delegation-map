"use client";

import dynamic from "next/dynamic";

const ValidatorMap = dynamic(
  () => import("@/components/validator-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="skeleton mx-auto mb-4 h-8 w-48 rounded-lg" />
          <p className="font-body text-sm text-muted">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <ValidatorMap />;
}

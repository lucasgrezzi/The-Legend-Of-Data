import { notFound } from "next/navigation";
import type { Track } from "@/types";
import { TRACK_ORDER } from "@/lib/tracks";
import WorldMap from "@/components/map/WorldMap";

interface RegionPageProps {
  params: Promise<{ track: string }>;
}

/** Trilha de uma região do Mapa-Múndi (ex.: /regiao/sql), terminando no chefe */
export default async function RegionPage({ params }: RegionPageProps) {
  const { track } = await params;
  if (!TRACK_ORDER.includes(track as Track)) notFound();
  return <WorldMap track={track as Track} />;
}

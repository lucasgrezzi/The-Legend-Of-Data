import type { Track } from "@/types";

export interface TrackInfo {
  name: string;
  subtitle: string;
  color: string;
  /** rgb sem alpha, para compor rgba() */
  rgb: string;
  sprite: string;
  lang: string;
  /** cor de tinta escura — para texto sobre pergaminho (rótulos do mapa) */
  ink: string;
}

export const TRACK_ORDER: Track[] = ["python", "sql", "pandas", "dataviz"];

export const TRACKS: Record<Track, TrackInfo> = {
  python:  { name: "Python",   subtitle: "A Linguagem dos Antigos", color: "var(--color-python)",  rgb: "79,195,247",  sprite: "/assets/sprites/trilha-python.png", lang: "Python", ink: "#1d5f86" },
  sql:     { name: "SQL",      subtitle: "As Catacumbas de Dados",  color: "var(--color-sql)",     rgb: "107,203,119", sprite: "/assets/sprites/trilha-sql.png", lang: "SQL", ink: "#2a6b33" },
  pandas:  { name: "Pandas",   subtitle: "A Forja de Dados",        color: "var(--color-pandas)",  rgb: "255,183,77",  sprite: "/assets/sprites/trilha-pandas.png", lang: "Pandas", ink: "#8a4d00" },
  dataviz: { name: "Data Viz", subtitle: "O Farol da Verdade",      color: "var(--color-dataviz)", rgb: "244,143,177", sprite: "/assets/sprites/trilha-dataviz.png", lang: "Data Viz", ink: "#9a2f60" },
};

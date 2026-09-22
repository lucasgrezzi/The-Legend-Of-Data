import type { Track } from "@/types";

export interface TrackInfo {
  name: string;
  subtitle: string;
  color: string;
  /** rgb sem alpha, para compor rgba() */
  rgb: string;
  sprite: string;
  lang: string;
}

export const TRACK_ORDER: Track[] = ["python", "sql", "pandas", "dataviz"];

export const TRACKS: Record<Track, TrackInfo> = {
  python:  { name: "Python",   subtitle: "A Linguagem dos Antigos", color: "var(--color-python)",  rgb: "79,195,247",  sprite: "/assets/sprites/trilha-python.png", lang: "Python" },
  sql:     { name: "SQL",      subtitle: "As Catacumbas de Dados",  color: "var(--color-sql)",     rgb: "107,203,119", sprite: "/assets/sprites/trilha-sql.png", lang: "SQL" },
  pandas:  { name: "Pandas",   subtitle: "A Forja de Dados",        color: "var(--color-pandas)",  rgb: "255,183,77",  sprite: "/assets/sprites/trilha-pandas.png", lang: "Pandas" },
  dataviz: { name: "Data Viz", subtitle: "O Farol da Verdade",      color: "var(--color-dataviz)", rgb: "244,143,177", sprite: "/assets/sprites/trilha-dataviz.png", lang: "Data Viz" },
};

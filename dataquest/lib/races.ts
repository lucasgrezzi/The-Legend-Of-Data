import type { Race } from "@/types";

export interface RaceInfo {
  name: string;
  guild: string;
  motto: string;
  sprite: string;
  color: string;
  rgb: string;
}

export const RACE_ORDER: Race[] = ["elfo", "anao", "orc", "goblin"];

export const RACES: Record<Race, RaceInfo> = {
  elfo:   { name: "Elfo",   guild: "Guilda da Folha Prateada", motto: "Enxerga padrões onde outros veem ruído.",       sprite: "/assets/sprites/raca-elfo.png",   color: "#b39ddb", rgb: "179,157,219" },
  anao:   { name: "Anão",   guild: "Guilda da Bigorna Funda",  motto: "Escava as catacumbas mais profundas de dados.", sprite: "/assets/sprites/raca-anao.png",   color: "#ffb74d", rgb: "255,183,77" },
  orc:    { name: "Orc",    guild: "Clã do Punho de Ferro",    motto: "Esmaga tabelas gigantes na força bruta.",       sprite: "/assets/sprites/raca-orc.png",    color: "#8bc34a", rgb: "139,195,74" },
  goblin: { name: "Goblin", guild: "Bando dos Engenhoqueiros", motto: "Resolve tudo com um script esperto.",           sprite: "/assets/sprites/raca-goblin.png", color: "#ef5350", rgb: "239,83,80" },
};

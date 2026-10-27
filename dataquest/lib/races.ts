import type { Race, Track } from "@/types";

export interface RacePower {
  /** Nome do golpe especial (aparece na faixa da batalha) */
  name: string;
  /** O que o golpe faz, em uma frase (ficha e criação de personagem) */
  text: string;
  /** Cores da animação: principal e brilho */
  colors: [string, string];
}

export interface RaceInfo {
  name: string;
  guild: string;
  motto: string;
  sprite: string;
  color: string;
  rgb: string;
  /** Golpe especial: a animação do herói na batalha (feitiço que funciona e golpe final) */
  power: RacePower;
  /** Região de afinidade: as dicas do Grimório saem mais baratas lá (ver hintCostFor em lib/xp.ts) */
  affinity: Track;
}

export const RACE_ORDER: Race[] = ["elfo", "anao", "orc", "goblin"];

/** Desconto (moedas) em cada dica do Grimório na região de afinidade da raça */
export const AFFINITY_DISCOUNT = 2;

export const RACES: Record<Race, RaceInfo> = {
  elfo: {
    name: "Elfo", guild: "Guilda da Folha Prateada", motto: "Enxerga padrões onde outros veem ruído.",
    sprite: "/assets/sprites/raca-elfo.png", color: "#b39ddb", rgb: "179,157,219",
    power: { name: "Chuva de Flechas Lunares", text: "Dispara uma rajada de flechas de luz que nunca erram o alvo.", colors: ["#d7c8ff", "#ffffff"] },
    affinity: "dataviz",
  },
  anao: {
    name: "Anão", guild: "Guilda da Bigorna Funda", motto: "Escava as catacumbas mais profundas de dados.",
    sprite: "/assets/sprites/raca-anao.png", color: "#ffb74d", rgb: "255,183,77",
    power: { name: "Martelo Sísmico", text: "Um martelo gigante cai do céu e racha o chão debaixo do monstro.", colors: ["#ffb74d", "#ffe08a"] },
    affinity: "sql",
  },
  orc: {
    name: "Orc", guild: "Clã do Punho de Ferro", motto: "Esmaga tabelas gigantes na força bruta.",
    sprite: "/assets/sprites/raca-orc.png", color: "#8bc34a", rgb: "139,195,74",
    power: { name: "Investida Furiosa", text: "Atravessa a arena num rugido e explode numa onda de fúria.", colors: ["#ff5a3c", "#ffd36b"] },
    affinity: "pandas",
  },
  goblin: {
    name: "Goblin", guild: "Bando dos Engenhoqueiros", motto: "Resolve tudo com um script esperto.",
    sprite: "/assets/sprites/raca-goblin.png", color: "#ef5350", rgb: "239,83,80",
    power: { name: "Bomba de Engenhoca", text: "Arremessa uma bomba caseira que explode em engrenagens e faíscas.", colors: ["#ff9f43", "#ffe08a"] },
    affinity: "python",
  },
};

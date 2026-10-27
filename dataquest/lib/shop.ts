/**
 * Loja do Mercador (Seu Bartolo): itens só visuais, comprados com moedas.
 * Nada aqui ajuda a resolver missões — isso é papel das dicas do Grimório.
 * Ids são estáveis (ficam salvos em `ownedItems`); para tirar um item da loja, marque `retired` em vez de apagar.
 */
export type ShopSlot = "titulo" | "moldura" | "mascote";

export interface ShopItem {
  id: string;
  slot: ShopSlot;
  name: string;
  description: string;
  price: number;
  /** Só pode comprar depois de concluir esta missão */
  requiresMissionId?: number;
  /** título: o texto · moldura: cor do aro · mascote: caminho do sprite */
  value: string;
  /** Moldura animada (brilho pulsante) */
  glow?: boolean;
  /** Mascotes: raridade (cor do brilho e do selo na loja) */
  rarity?: Rarity;
}

export type Rarity = "comum" | "raro" | "epico" | "lendario";
export const RARITY_INFO: Record<Rarity, { label: string; color: string; rgb: string }> = {
  comum:    { label: "Comum",    color: "#b7bfce", rgb: "183,191,206" },
  raro:     { label: "Raro",     color: "#4aa8ff", rgb: "74,168,255" },
  epico:    { label: "Épico",    color: "#c084fc", rgb: "192,132,252" },
  lendario: { label: "Lendário", color: "#f5c451", rgb: "245,196,81" },
};

export const SLOT_INFO: Record<ShopSlot, { label: string; icon: string; hint: string }> = {
  titulo:  { label: "Títulos",  icon: "🏷️", hint: "Aparece ao lado do seu nome na ficha e no topo da tela." },
  moldura: { label: "Molduras", icon: "🖼️", hint: "Um aro em volta do retrato do seu personagem." },
  mascote: { label: "Mascotes", icon: "🐾", hint: "Um companheiro que segue seu herói pelo mapa." },
};

export const SHOP_ITEMS: ShopItem[] = [
  // Títulos
  { id: "titulo-curioso", slot: "titulo", name: "o Curioso", price: 15, value: "o Curioso",
    description: "Para quem lê o Estudo antes de tudo. Ou depois. Mas lê." },
  { id: "titulo-cacador", slot: "titulo", name: "Caçador de Bugs", price: 30, value: "Caçador de Bugs",
    description: "Errou, leu a tradução do Grimório e consertou. É assim que se faz." },
  { id: "titulo-amigo", slot: "titulo", name: "Amigo do Grimório", price: 45, value: "Amigo do Grimório",
    description: "O Grimório finge que não liga, mas guardou seu nome numa página especial." },
  { id: "titulo-serpente", slot: "titulo", name: "Encantador de Serpentes", price: 40, value: "Encantador de Serpentes",
    requiresMissionId: 8, description: "Venceu o Selo das Catacumbas e domou o Python." },
  { id: "titulo-tabelas", slot: "titulo", name: "Domador de Tabelas", price: 60, value: "Domador de Tabelas",
    requiresMissionId: 12, description: "Derrotou o Rei Esquecido com um JOIN certeiro." },
  { id: "titulo-ferreiro", slot: "titulo", name: "Ferreiro de Dados", price: 60, value: "Ferreiro de Dados",
    requiresMissionId: 14, description: "Brokk aprova. E Brokk não aprova quase nada." },
  { id: "titulo-farol", slot: "titulo", name: "Guardião do Farol", price: 50, value: "Guardião do Farol",
    requiresMissionId: 22, description: "Dona Íris não elogia ninguém. Mas deixou você segurar a lente." },
  { id: "titulo-hidra", slot: "titulo", name: "Caçador de Hidras", price: 40, value: "Caçador de Hidras",
    requiresMissionId: 26, description: "Achou a parede rachada e voltou com zero cabeças de Hidra para contar a história." },
  { id: "titulo-enigmas", slot: "titulo", name: "Decifrador de Enigmas", price: 70, value: "Decifrador de Enigmas",
    requiresMissionId: 27, description: "A Esfinge perguntou. Você respondeu. Ela ainda está pensando em como você fez isso." },
  { id: "titulo-lenda", slot: "titulo", name: "Lenda do Arquivo", price: 150, value: "Lenda do Arquivo",
    description: "O título mais caro do reino. Ninguém sabe o que faz. Todo mundo quer." },

  // Molduras
  { id: "moldura-bronze", slot: "moldura", name: "Moldura de Bronze", price: 20, value: "#b0703a",
    description: "Simples, honesta, levemente enferrujada." },
  { id: "moldura-prata", slot: "moldura", name: "Moldura de Prata", price: 40, value: "#c4ccd8",
    description: "Brilha o suficiente para os vizinhos repararem." },
  { id: "moldura-ouro", slot: "moldura", name: "Moldura de Ouro", price: 70, value: "#f0c040",
    description: "Ouro de verdade. Bartolo jura." },
  { id: "moldura-arcana", slot: "moldura", name: "Moldura Arcana", price: 110, value: "#b07cff", glow: true,
    description: "Pulsa com magia antiga. Ou com pilhas. Difícil dizer." },

  // Mascotes
  { id: "mascote-gato", slot: "mascote", name: "Gato Laranja", price: 50, value: "/assets/pets/gato.png", rarity: "comum",
    description: "Senta em cima do teclado na hora errada. Mascote oficial de todo programador." },
  { id: "mascote-slime", slot: "mascote", name: "Slime Sorridente", price: 60, value: "/assets/pets/slime.png", rarity: "comum",
    description: "Pegajoso, leal e sempre feliz. Não deixe perto das relíquias." },
  { id: "mascote-coruja", slot: "mascote", name: "Coruja Sábia", price: 80, value: "/assets/pets/coruja.png", rarity: "raro",
    requiresMissionId: 3, description: "Já leu todos os livros das Catacumbas. Duas vezes." },
  { id: "mascote-sapo", slot: "mascote", name: "Sapo Príncipe", price: 90, value: "/assets/pets/sapo-principe.png", rarity: "raro",
    requiresMissionId: 8, description: "Pulou do Selo das Catacumbas. Jura que é da realeza. Ninguém tem coragem de beijar para conferir." },
  { id: "mascote-vagalume", slot: "mascote", name: "Vaga-lume Ancião", price: 110, value: "/assets/pets/vagalume.png", rarity: "epico",
    requiresMissionId: 14, description: "Ilumina o código à noite. Atrai bugs, mas come todos." },
  { id: "mascote-dragao", slot: "mascote", name: "Dragãozinho", price: 130, value: "/assets/pets/dragao.png", rarity: "raro",
    requiresMissionId: 12, description: "Ainda não cospe fogo. Só faíscas. Mas tem atitude." },
  { id: "mascote-grifo", slot: "mascote", name: "Grifinho", price: 150, value: "/assets/pets/grifo.png", rarity: "epico",
    requiresMissionId: 12, description: "Metade águia, metade leão, inteiro dramático. Voa em JOIN: junta duas criaturas numa só." },
  { id: "mascote-fenix", slot: "mascote", name: "Fênix da Masmorra", price: 180, value: "/assets/pets/fenix.png", rarity: "lendario",
    requiresMissionId: 27, description: "Guardava o baú da Esfinge. Renasce das cinzas a cada bug corrigido — ou seja, vive renascendo." },
  { id: "mascote-dragao-dourado", slot: "mascote", name: "Dragão Dourado", price: 200, value: "/assets/pets/dragao-dourado.png", rarity: "lendario",
    requiresMissionId: 22, description: "O guardião do Farol. Dorme em cima de gráficos de ouro e acorda só para os lendários." },
];

export type Equipped = Partial<Record<ShopSlot, string>>;

export function getItem(id: string | undefined): ShopItem | undefined {
  return id ? SHOP_ITEMS.find((i) => i.id === id) : undefined;
}

/** Itens equipados, já resolvidos (o que cada tela precisa mostrar) */
export function equippedLook(equipped: Equipped | undefined) {
  return {
    title: getItem(equipped?.titulo)?.value,
    frame: getItem(equipped?.moldura),
    pet: getItem(equipped?.mascote),
  };
}

/** A loja abre depois do Mercado da Vila (onde o jogador conhece o Seu Bartolo) */
export const SHOP_UNLOCK_MISSION_ID = 5;

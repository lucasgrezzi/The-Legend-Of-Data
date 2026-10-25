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
}

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
    requiresMissionId: 16, description: "Dona Íris não elogia ninguém. Mas deixou você segurar a lente." },
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
  { id: "mascote-gato", slot: "mascote", name: "Gato Laranja", price: 50, value: "/assets/pets/gato.png",
    description: "Senta em cima do teclado na hora errada. Mascote oficial de todo programador." },
  { id: "mascote-slime", slot: "mascote", name: "Slime Sorridente", price: 60, value: "/assets/pets/slime.png",
    description: "Pegajoso, leal e sempre feliz. Não deixe perto das relíquias." },
  { id: "mascote-coruja", slot: "mascote", name: "Coruja Sábia", price: 80, value: "/assets/pets/coruja.png",
    requiresMissionId: 3, description: "Já leu todos os livros das Catacumbas. Duas vezes." },
  { id: "mascote-dragao", slot: "mascote", name: "Dragãozinho", price: 130, value: "/assets/pets/dragao.png",
    requiresMissionId: 12, description: "Ainda não cospe fogo. Só faíscas. Mas tem atitude." },
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

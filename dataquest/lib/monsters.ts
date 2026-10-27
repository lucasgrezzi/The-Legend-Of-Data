/**
 * O inimigo de cada fase: o "bug" que o código precisa derrotar. Só visual + falas —
 * a regra do jogo continua a mesma (Executar não valida; Enviar certo vence).
 * Sprites CC0 do Dungeon Crawl Stone Soup em /assets/monsters (ver CREDITS.md).
 */
export interface Monster {
  name: string;
  sprite: string;
  /** Fala ao aparecer */
  intro: string;
  /** Provocações quando o código dá erro ou a resposta está errada (sorteadas) */
  taunts: string[];
  /** Última fala ao ser derrotado */
  defeat: string;
  /** Chefes: onde fica o topo da cabeça no sprite 32×32 (a coroa senta ali); null = o sprite já tem coroa */
  head?: [number, number] | null;
}

const m = (file: string, name: string, intro: string, taunts: string[], defeat: string): Monster => ({
  name,
  sprite: `/assets/monsters/${file}.png`,
  intro,
  taunts,
  defeat,
});

export const MONSTERS: Record<number, Monster> = {
  // ── Python: A Linguagem dos Antigos ──
  1: m("acaro", "Ácaro da Sintaxe", "Ninguém escreve um print sem tropeçar em mim!", [
    "Esqueceu uma aspa? Eu moro nas aspas.",
    "Hehe, um parêntese a menos e eu fico mais forte.",
  ], "Nãão… sintaxe… perfeita…"),
  5: m("rato", "Rato do Troco", "Quero ver você fazer conta sem calculadora!", [
    "Errou a conta! O troco agora é meu.",
    "Multiplicar antes de subtrair, nunca ouviu falar?",
  ], "Tá bom, tá bom, o troco é seu…"),
  6: m("golem", "Golem do Ferrolho", "SÓ. PASSA. QUEM. DECIDE. CERTO.", [
    "IF. SEM. DOIS. PONTOS. NÃO. PASSA.",
    "ISSO. FOI. UM. ELSE. TRISTE.",
  ], "PORTÃO… ABERTO…"),
  2: m("morcego", "Morcego Apaga-Tochas", "Vou apagar suas tochas uma por uma… em loop!", [
    "Seu for deu uma volta a mais, hihihi!",
    "Range errado! Ficou tudo no escuro.",
  ], "A luz! O loop! Aaargh…"),
  7: m("diabrete", "Diabrete Bate-Carteira", "Que mochila bonita… seria uma pena se sumisse um item.", [
    "Opa, esse append não pegou nada!",
    "Contou errado? Fui eu que peguei. Ou não. Hehe.",
  ], "Devolvo tudo! Até o mapa antigo!"),
  8: m("serpente", "Serpente do Selo", "Eu guardo o Selo há mil anos. Mostre que domina as funções, mortal.", [
    "Uma função sem return devolve… nada. Como você.",
    "Ssssintaxe errada. Delícia.",
    "Mil anos esperando e você me traz ISSO?",
  ], "O Selo… se rompe… bem jogado, Arquivista."),

  // ── SQL: As Catacumbas de Dados ──
  3: m("caveira", "Caveira Bisbilhoteira", "Quer achar relíquias? Primeiro me diz: SELECT o quê?", [
    "Essa consulta voltou mais vazia que meu crânio.",
    "WHERE errado! Trouxe a cripta inteira.",
  ], "Que consulta linda… *desmonta*"),
  17: m("kobold", "Kobold dos Baús", "Os baús são meus! Todos os oito!", [
    "Esqueceu o LIMIT? Agora carrega tudo nas costas!",
    "Ordem errada, pegou o baú furado.",
  ], "Fica com os três melhores… snif."),
  9: m("esqueleto", "Esqueleto Desordenado", "Minhas relíquias são uma bagunça. Filtre se for capaz!", [
    "AND e OR sem parênteses? Clássico.",
    "Pegou relíquia amaldiçoada! Boa sorte com isso.",
  ], "Meus ossos… finalmente organizados…"),
  18: m("fantasma", "Fantasma Desmemoriado", "Eu lembro que começava com A… ou era B? Hu-hu-hu.", [
    "Esqueceu o %? Agora nem eu lembro.",
    "LIKE sem curinga é só um igual triste.",
  ], "Lembrei! Lembrei de tudo! Obrigadooo…"),
  10: m("mumia", "Múmia Contadora", "Contar, somar, tirar a média… em três mil anos ninguém acertou.", [
    "Errou a soma. Volte daqui a três mil anos.",
    "Esqueceu o AS? Sem nome, sem glória.",
  ], "A conta… bate… *se desenrola*"),
  11: m("carnical", "Carniçal Agrupador", "Agrupar? Eu prefiro tudo misturado!", [
    "HAVING no lugar de WHERE ou WHERE no lugar de HAVING? Hihi.",
    "Grupo errado, ganhei um lanchinho.",
  ], "Tudo… em… grupinhos… não!"),
  12: m("rei-esquecido", "O Rei Esquecido", "Ousas ler o Livro das Expedições? JUNTA as tabelas, se puder.", [
    "Um JOIN sem ON… que plebeu.",
    "LEFT JOIN? Lyra não viajou, tolo!",
    "Minha coroa pesa mais que essa consulta.",
  ], "Lembrado… finalmente… lembrado."),

  // ── Pandas: A Forja de Dados ──
  4: m("diabrete-ferro", "Diabrete de Ferro", "A Forja é minha! Você nem sabe ler um CSV!", [
    "read_csv com o caminho errado? Hehehe.",
    "Filtro errado, forja fria!",
  ], "Tá quente demais aqui… fui!"),
  19: m("gargula", "Gárgula da Vitrine", "Só as mais caras vão para a vitrine. Escolha mal e eu te petrifico.", [
    "Ordenou ao contrário! As baratas na vitrine!",
    "Esqueceu o head? Vitrine lotada.",
  ], "Vitrine… impecável… *vira pedra de vez*"),
  20: m("salamandra", "Salamandra do Carvão", "Quanto carvão eu comi esta semana? Adivinha!", [
    "Média errada! Mais carvão pra mim.",
    "Somou a coluna errada, que delícia.",
  ], "Fui contada… e apagada…"),
  21: m("hobgoblin", "Hobgoblin Penetra", "Eu assino o livro de visitas com nomes falsos!", [
    "Contou na mão? value_counts existe, sabia?",
    "Errou a contagem. Eu sou três pessoas diferentes.",
  ], "Fui descoberto pela contagem!"),
  13: m("efreet", "Efreet do Fole", "Sopro as brasas só para quem soma por região!", [
    "groupby sem soma? Nem uma faísca.",
    "Contou as pendentes! O fole riu de você.",
  ], "O fole é seu, mestre das regiões…"),
  23: m("ettin", "Ettin dos Dois Livros", "EU leio os pedidos! EU leio os preços! NÓS não nos falamos!", [
    "Sem merge? A cabeça da esquerda nunca vai contar pra direita!",
    "Somou o número da peça? Até eu, com duas cabeças, sei que não é preço.",
  ], "Nós… concordamos… pela primeira vez…"),
  24: m("aranha-tecela", "Aranha Tecelã", "Lista comprida é coisa de minhoca. Eu só aceito GRADES.", [
    "Apareceu .0? Isso é média, docinho. Eu pedi SOMA.",
    "Linha no lugar de coluna! Minha teia ficou de cabeça pra baixo.",
  ], "Que grade linda… vou emoldurar… *se enrola*"),
  14: m("colosso", "Colosso da Têmpera", "O Rei quer o faturamento. Eu quero esmagar quem errar a conta!", [
    "Coluna nova sem multiplicar? FRACO!",
    "Esqueceu o filtro! A ordem mudou, HAHAHA!",
    "Isso foi uma conta ou um soluço?",
  ], "Aço… bem… temperado… *desaba*"),

  // ── Data Viz: O Farol da Verdade ──
  15: m("olho", "Olho Embaçado", "Números em lista? Eu só enxergo gráficos!", [
    "Barra faltando! Ainda vejo tudo borrado.",
    "Sem título? Que gráfico é esse?",
  ], "Agora sim… tudo nítido!"),
  16: m("harpia", "Harpia da Tempestade", "Minhas tempestades sobem e descem! Desenhe se for capaz!", [
    "Barra onde era linha? Que vergonha.",
    "Eixo sem nome! Ninguém entende nada!",
  ], "A rota… está traçada… *voa embora*"),
  25: m("prisma", "Prisma Desbotado", "Tudo cinza… tudo igual… ninguém sabe qual linha é qual…", [
    "Duas linhas da mesma cor? Que tédio.",
    "Sem legenda! Agora são gêmeas sem crachá.",
  ], "Cores! Eu vejo CORES! *brilha em arco-íris*"),
  22: m("kraken", "O Kraken dos Portos", "Os capitães brigam e eu afundo os navios. Só um gráfico me para!", [
    "Esqueceu de agrupar! Quatro portos viraram quarenta!",
    "Ordem errada! Lá vai mais um navio pro fundo.",
    "Glub glub, que gráfico ruim.",
  ], "O Conselho… decidiu… glub…"),

  // ── Masmorra Secreta (bônus) ──
  26: m("hidra", "Hidra Sem Fim", "Corta uma, nascem outras. Quantos golpes? Nem EU sei!", [
    "Seu loop parou cedo! Ainda tenho cabeça sobrando.",
    "Loop sem fim? Eu adoro. Fico aqui para sempre.",
    "Esqueceu a cabeça nova? Ela não esqueceu de nascer.",
  ], "Zero… cabeças… como isso é possível…"),
  27: m("esfinge", "A Esfinge dos Pares", "Cada gema tem seu nome. Cada nome tem seu número. Responda, mortal.", [
    "Chave errada! No meu dicionário essa palavra não existe.",
    "Esqueceu o pedágio? Eu não esqueço. Nunca.",
    "Contou na mão? Que coisa mais… plebeia.",
  ], "Enigma… decifrado. O tesouro é seu, Arquivista."),
};

// Onde a coroa senta em cada chefe (medido nos sprites)
MONSTERS[8].head = [16, 1];
MONSTERS[12].head = null; // o Rei Esquecido já usa coroa
MONSTERS[14].head = [14, 1];
MONSTERS[22].head = [17, 0];
MONSTERS[27].head = [8, 0];

/**
 * Posição da coroa de chefe sobre o sprite desenhado em `size` px (centro do topo da cabeça),
 * ou null quando o sprite já tem coroa. Sem medida, usa o centro do topo.
 */
export function crownStyle(mon: Monster, size: number): React.CSSProperties | null {
  if (mon.head === null) return null;
  const [hx, hy] = mon.head ?? [16, 0];
  const k = size / 32;
  return { left: hx * k, top: hy * k + 4, transform: "translate(-50%, -100%)" };
}

/** Fases sem monstro (Prólogo) ganham o boneco de treino */
export const TRAINING_DUMMY: Monster = m(
  "boneco",
  "Boneco de Treino",
  "…",
  ["…"],
  "…"
);

export function monsterOf(missionId: number): Monster {
  return MONSTERS[missionId] ?? TRAINING_DUMMY;
}

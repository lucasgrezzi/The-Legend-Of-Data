# Créditos dos assets

## Sprites (`sprites/`) — CC0 / domínio público
Dungeon Crawl Stone Soup tiles — https://opengameart.org/content/dungeon-crawl-32x32-tiles
Licença CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/). Atribuição não obrigatória.

| Arquivo | Original |
|---|---|
| raca-elfo.png | monster/deep_elf_mage.png |
| raca-anao.png | monster/dwarf_new.png |
| raca-orc.png | monster/orc_warrior_new.png |
| raca-goblin.png | monster/goblin_new.png |
| trilha-python.png | monster/animals/ball_python.png |
| trilha-sql.png | dungeon/gateways/enter_crypt.png |
| trilha-pandas.png | gui/spells/earth/maxwells_silver_hammer.png |
| trilha-dataviz.png | item/misc/misc_orb_2.png |
| missao-concluida.png | dungeon/chest.png |
| missao-bloqueada.png | dungeon/gateways/portal_unknown.png |
| grimorio.png | item/book/glittering.png |
| moedas.png | item/gold/gold_pile_3.png |

## Fundo (`bg/mapa-mundo.png`) — CC0
O reino em 4 biomas (floresta, cemitério, forja e costa com farol), gerado por `scripts/gerar_mundo_biomas.py` a partir
dos tiles Kenney **Tiny Town** e **Tiny Dungeon** (https://kenney.nl/assets/tiny-town e /tiny-dungeon, CC0 1.0).
O mar, a areia e o farol são pixel art própria do script. Para gerar de novo: baixar e extrair os dois zips e rodar
`python scripts/gerar_mundo_biomas.py <pasta tiny-town> <pasta tiny-dungeon> public/assets/bg/mapa-mundo.png`.
(O gerador antigo, `scripts/gerar_fundo_mapa.py`, fazia uma vila só, com Tiny Town.)

## Monstros (`monsters/`) — CC0 / domínio público
Dungeon Crawl Stone Soup tiles (mesmo pacote dos `sprites/`, https://opengameart.org/content/dungeon-crawl-32x32-tiles).

| Arquivo | Original (`dc-mon/`) | Arquivo | Original (`dc-mon/`) |
|---|---|---|---|
| acaro.png | animals/giant_mite | mumia.png | undead/mummy |
| rato.png | animals/green_rat | carnical.png | undead/ghoul |
| golem.png | nonliving/stone_golem | rei-esquecido.png | undead/ancient_lich |
| morcego.png | animals/giant_bat | diabrete-ferro.png | demons/iron_imp |
| diabrete.png | demons/imp | gargula.png | nonliving/molten_gargoyle |
| serpente.png | unique/serpent_of_hell | salamandra.png | animals/salamander |
| caveira.png | undead/flying_skull | hobgoblin.png | hobgoblin |
| kobold.png | kobold | efreet.png | demons/efreet |
| esqueleto.png | undead/skeletal_warrior | colosso.png | fire_giant |
| fantasma.png | undead/ghost | olho.png | giant_eyeball |
| harpia.png | harpy | kraken.png | animals/kraken_head |
| boneco.png | statues/training_dummy | | |

Sessão 19 (pacote "Dungeon Crawl Stone Soup Full", mesmo autor e licença CC0, pasta `monster/`):
ettin.png ← ettin_new · aranha-tecela.png ← animals/orb_spider · prisma.png ← nonliving/fulminant_prism_1 ·
hidra.png ← dragons/hydra_5_new · esfinge.png ← sphinx_new.

## Mascotes novos (`pets/`) — CC0 (Dungeon Crawl Stone Soup, mesmo pacote dos monstros)
| Arquivo | Original (`dc-mon/`) |
|---|---|
| sapo-principe.png | unique/prince_ribbit |
| grifo.png | griffon |
| vagalume.png | animals/giant_firefly |
| dragao-dourado.png | golden_dragon |
| fenix.png | phoenix (pacote Full, Sessão 19) |
(gato, slime, coruja e dragao continuam sendo arte própria de `scripts/gerar_mascotes.py`.)

## Sons
Sintetizados no navegador por `lib/sfx.ts` (Web Audio) — nenhum arquivo de áudio.

## Cursor (`cursors/luva.png`, `cursors/luva-hover.png`)
- Manopla dourada em pixel art **criada para o DataQuest** por `scripts/gerar_cursor.py` (formas geométricas, sem assets de terceiros). Livre para uso no projeto.

## Neblina (`fog/nuvem-1.png` … `nuvem-3.png`)
- Nuvens em pixel art **criadas para o DataQuest** por `scripts/gerar_nuvens.py` (círculos, sem assets de terceiros). Livre para uso no projeto.

# Gera public/assets/bg/mapa-mundo.png: o reino em 4 biomas, da esquerda para a direita, na ordem das regiões —
# Floresta (Python) → Cemitério das Catacumbas (SQL) → Terras da Forja (Pandas) → Costa do Farol (Data Viz).
# Tiles CC0 da Kenney: Tiny Town e Tiny Dungeon (https://kenney.nl/assets/tiny-town, /tiny-dungeon).
# Uso: python gerar_mundo_biomas.py <pasta tiny-town extraída> <pasta tiny-dungeon extraída> <saída.png>
# Só árvores INTEIRAS (a alta é copa + tronco, dois tiles juntos), desenhadas de trás para a frente.
# O 4º argumento (opcional) gera a folha de quadros do mar animado. Requer Pillow.
import math
import random
import sys

from PIL import Image

TOWN, DUNGEON, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
random.seed(847)  # ano 847 da Era dos Dados :)

TT = Image.open(f"{TOWN}/Tilemap/tilemap_packed.png").convert("RGBA")
TD = Image.open(f"{DUNGEON}/Tilemap/tilemap_packed.png").convert("RGBA")
def town(i): c, r = i % 12, i // 12; return TT.crop((c * 16, r * 16, c * 16 + 16, r * 16 + 16))
def dun(i): c, r = i % 12, i // 12; return TD.crop((c * 16, r * 16, c * 16 + 16, r * 16 + 16))

W, H = 64, 36          # em tiles de 16 px → 1024×576, ampliado 2× no fim
PW, PH = W * 16, H * 16
img = Image.new("RGBA", (PW, PH))

# ── Biomas: fronteiras em x (fração da largura) com borda irregular ──
BOUNDS = [0.26, 0.48, 0.70]  # floresta | cemitério | forja | costa
def biome_at(x, y):
    fx = x / W + 0.025 * math.sin(y / 3.0 + x) + 0.02 * math.sin(y / 1.7)
    for i, b in enumerate(BOUNDS):
        if fx < b: return i
    return 3
FOREST, GRAVE, FORGE, COAST = range(4)
def biome_fx(x, y):  # x, y em tiles (float)
    return x / W + 0.025 * math.sin(y / 3.0 + x) + 0.02 * math.sin(y / 1.7)
biome = [[biome_at(x, y) for x in range(W)] for y in range(H)]

# ── Mar na costa (lado direito), com linha de praia ondulada ──
def shore_x(y): return 0.86 * W + 2.2 * math.sin(y / 4.0) + 1.2 * math.sin(y / 1.9)
sea = [[x > shore_x(y) for x in range(W)] for y in range(H)]

# ── Estrada principal sinuosa (esquerda → direita), parando na praia ──
path = [[False] * W for _ in range(H)]
def carve(x, y, w=2):
    for dy in range(w):
        for dx in range(w):
            if 0 <= x + dx < W and 0 <= y + dy < H and not sea[y + dy][x + dx]: path[y + dy][x + dx] = True
for x in range(W):
    carve(x, int(H / 2 + 6 * math.sin(x / 6.5) + 1.5 * math.sin(x / 2.9)), 2)
for y in range(H // 2, H):  # ramal descendo para a forja
    carve(int(0.59 * W + 3 * math.sin(y / 4.0)), y, 2)
for y in range(0, H // 2):  # ramal subindo para as catacumbas
    carve(int(0.37 * W + 3 * math.sin(y / 3.5)), y, 2)
for _ in range(3):  # clareiras de terra batida na forja
    bx, by = random.randint(int(0.5 * W), int(0.67 * W)), random.randint(5, H - 6)
    rx, ry = random.randint(2, 3), 2
    for y in range(by - ry, by + ry + 1):
        for x in range(bx - rx, bx + rx + 1):
            if ((x - bx) / rx) ** 2 + ((y - by) / ry) ** 2 <= 1 and 0 <= x < W and 0 <= y < H: path[y][x] = True
for _ in range(2):
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if not path[y][x] and ((path[y - 1][x] and path[y + 1][x]) or (path[y][x - 1] and path[y][x + 1])):
                path[y][x] = True
def P(x, y): return 0 <= x < W and 0 <= y < H and path[y][x]

# ── Chão ──
for y in range(H):
    for x in range(W):
        img.alpha_composite(town(random.choice([0] * 9 + [1] * 3 + [2])), (x * 16, y * 16))

# estrada (autotile 3×3 de terra)
for y in range(H):
    for x in range(W):
        if not path[y][x]: continue
        up, dn, lf, rt = P(x, y - 1), P(x, y + 1), P(x - 1, y), P(x + 1, y)
        row = 0 if not up else (2 if not dn else 1)
        col = 0 if not lf else (2 if not rt else 1)
        img.alpha_composite(town([[12, 13, 14], [24, 25, 26], [36, 37, 38]][row][col]), (x * 16, y * 16))

# ── Areia (estática). A água é pintada depois, em quadros: ver paint_sea ──
px = img.load()
for y in range(PH):
    sx = shore_x(y / 16) * 16
    sand_in = sx - 56 - 10 * math.sin(y / 23.0) - 6 * math.sin(y / 9.0)
    for x in range(max(0, int(sand_in)), min(PW, int(sx) + 1)):
        if path[y // 16][x // 16] and x < sand_in + 6: continue
        n = (x * 7 + y * 13) % 11
        c = (236, 210, 150, 255) if n else (214, 186, 126, 255)
        if x - sand_in < 3: c = (196, 178, 110, 255)  # borda grama/areia
        px[x, y] = c
# brilhos do mar: as mesmas posições sorteadas das antigas "ondinhas", agora piscando em quadros diferentes
GLINTS = []
for _ in range(260):
    x = random.randint(int(0.88 * PW), PW - 6); y = random.randint(0, PH - 1)
    if x > shore_x(y / 16) * 16 + 10:
        GLINTS.append((x, y, random.choice([3, 4, 5])))

# ── Tons de bioma (cemitério mais frio e escuro, forja mais quente) ──
# A transição é pontilhada (dither de Bayer em blocos de 2 px), e não um degradê liso:
# o degradê borrava a pixel art e parecia uma mancha.
TINTS = [(1, 1, 1), (0.60, 0.70, 0.78), (0.96, 0.86, 0.70), (1, 1, 1)]
BLEND = 0.035  # largura da transição (fração da largura)
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
def tint_at(fx, x, y):
    th = (BAYER[(y // 2) % 4][(x // 2) % 4] + 0.5) / 16
    acc = 0.0
    for i in range(4):
        lo = BOUNDS[i - 1] if i else -9
        hi = BOUNDS[i] if i < 3 else 9
        acc += max(0.0, min(1.0, (fx - lo) / BLEND + 0.5)) * max(0.0, min(1.0, (hi - fx) / BLEND + 0.5))
        if th < acc: return TINTS[i]
    return TINTS[3]
for y in range(PH):
    for x in range(PW):
        m = tint_at(biome_fx(x / 16, y / 16), x, y)
        if m == (1, 1, 1): continue
        r, g, bl, a = px[x, y]
        px[x, y] = (min(255, int(r * m[0])), min(255, int(g * m[1])), min(255, int(bl * m[2])), a)
GROUND = img.copy()  # chão + estrada + areia, sem água e sem objetos

# ── Mar animado: ondas chegando em linhas paralelas à praia, quebrando em espuma, subindo a areia e voltando ──
# t vai de 0 a 1 e o ciclo fecha (o quadro t=1 é igual ao t=0). Em t=0 a crista chega na linha da praia.
FRAMES = 24
WAVE = 30  # distância entre as cristas, em px
def h01(x, y):  # ruído fixo (não muda entre quadros)
    v = (x * 73856093) ^ (y * 19349663) ^ 0x5bd1e995
    v = (v ^ (v >> 13)) * 0x2545F491 & 0xffffffff
    return (v & 0xffff) / 65535
def runup_max(y): return 10 + 3 * math.sin(y / 17.0) + 2 * math.sin(y / 7.3)
def sea_from(y):  # onde começa a área que muda entre quadros (água + areia molhada)
    return int(shore_x(y / 16) * 16 - runup_max(y) - 3)
def mix(a, b, k): return tuple(int(a[i] + (b[i] - a[i]) * k) for i in range(3)) + (255,)
DEEP2, DEEP, MID, SHALLOW, CLEAR = (34, 96, 152), (42, 114, 168), (54, 140, 192), (74, 168, 208), (110, 200, 222)
FOAM, CREST = (238, 246, 246, 255), (178, 226, 238, 255)

def paint_sea(px, t, ground):
    for y in range(PH):
        sx = shore_x(y / 16) * 16
        R = runup_max(y)
        u = (t + 0.07 * math.sin(y / 45.0) + 0.03 * math.sin(y / 13.0)) % 1.0  # a onda bate em diagonal, não toda de uma vez
        # quanto a água sobe na areia (rápido) e volta (devagar), e a marca molhada que fica
        if u < 0.2: run = R * math.sin(u / 0.2 * math.pi / 2); wet = run
        elif u < 0.65: run = R * (1 + math.cos(math.pi * (u - 0.2) / 0.45)) / 2; wet = max(run, R * (1 - (u - 0.2) / 0.75))
        else: run = 0; wet = max(0.0, R * (1 - (u - 0.2) / 0.75))
        jit = 2 * math.sin(y / 7.0) + 1.5 * math.sin(y / 3.1)
        for x in range(sea_from(y), PW):
            d = x - sx
            if d < 0:  # areia
                if d >= -run:
                    edge = d + run
                    if edge < 1.6 or (edge < 3.5 and h01(x, y // 2) < 0.45): px[x, y] = FOAM  # borda de espuma rendada
                    else: px[x, y] = mix(ground[x, y], CLEAR, 0.55 if h01(x // 2, y // 2) < 0.8 else 0.3)
                elif d >= -wet:
                    g = ground[x, y]; px[x, y] = (int(g[0] * 0.8), int(g[1] * 0.78), int(g[2] * 0.72), 255)
                else:
                    px[x, y] = ground[x, y]
                continue
            dj = d + jit
            c = CLEAR if dj < 7 else SHALLOW if dj < 20 else MID if dj < 52 else DEEP if dj < 130 else DEEP2
            # cristas: andam em direção à praia; longe são tracinhos soltos, perto viram uma linha inteira de espuma
            f = (d / WAVE + u) % 1.0
            thick = (2.0 if d > 12 else 3.5) / WAVE
            if f < thick:
                show = 0.85 - min(d, 90) / 90 * 0.7
                if h01(0, y // 5) < show or d < 10:
                    c = FOAM[:3] if d < 14 else CREST[:3]
            elif f < thick + 1.0 / WAVE and d < 40:
                c = mix(c, (20, 70, 120), 0.35)[:3]  # sombrinha na frente da crista
            # espuma fixa na beira, que cresce quando a onda quebra
            fw = 2.5 + (5 if (u > 0.92 or u < 0.12) else 0)
            if d < fw and h01(x // 2, y // 2 + int(t * FRAMES)) < (0.9 if d < 2 else 0.55): c = FOAM[:3]
            px[x, y] = c + (255,)
    k = int(round(t * FRAMES))
    for i, (gx, gy, gl) in enumerate(GLINTS):  # brilhos: cada um aparece em 2 de cada 24 quadros
        if (k - i * 7) % FRAMES < 2:
            for j in range(gl): px[gx + j, gy] = (196, 234, 244, 255)

# ── Objetos: lista (x_px, y_px, tile), desenhados por y para sobrepor direito ──
objs = []
occupied = [[path[y][x] or sea[y][x] for x in range(W)] for y in range(H)]
def free(x, y, w=1, h=1, pad=1):
    for yy in range(y - pad, y + h + pad):
        for xx in range(x - pad, x + w + pad):
            if not (0 <= xx < W and 0 <= yy < H) or occupied[yy][xx]: return False
    return True
def claim(x, y, w, h):
    for yy in range(y, y + h):
        for xx in range(x, x + w): occupied[yy][xx] = True
def stamp(x, y, rows, src=town):
    for dy, r in enumerate(rows):
        for dx, t in enumerate(r):
            if t is not None: objs.append(((x + dx) * 16, (y + dy) * 16, src(t), 0))

def place(n, zone, w, h, rows, src=town, tries=400):
    for _ in range(n):
        for _ in range(tries):
            x, y = random.randint(1, W - w - 1), random.randint(1, H - h - 1)
            if biome[y][x] == zone and biome[y + h - 1][x + w - 1] == zone and free(x, y, w, h):
                stamp(x, y, rows, src); claim(x, y, w, h); break

BLUE_HOUSE = [[48, 49, 50], [60, 61, 62], [88, 90, 88]]
RED_HOUSE = [[52, 53, 54], [64, 65, 66], [84, 86, 84]]
place(3, FOREST, 3, 3, BLUE_HOUSE)
place(2, FORGE, 3, 3, RED_HOUSE)
place(1, FORGE, 4, 2, [[72, 73, 73, 75], [72, 73, 74, 75]])  # a forja (galpão de pedra-tijolo)
# entrada das catacumbas: arco de pedra
place(1, GRAVE, 3, 2, [[111, 112, 113], [123, 124, 125]])
# cemitério: lápides e cruzes em fileiras
for _ in range(34):
    for _ in range(80):
        x, y = random.randint(1, W - 2), random.randint(1, H - 2)
        if biome[y][x] == GRAVE and free(x, y, 1, 1, 0):
            objs.append((x * 16, y * 16, dun(random.choice([64, 65, 64, 65, 66])), 0)); claim(x, y, 1, 1); break
# forja: bigornas, barris, pedras
for tile, n in ((74, 4), (82, 7), (24, 8), (75, 3)):
    for _ in range(n):
        for _ in range(80):
            x, y = random.randint(1, W - 2), random.randint(1, H - 2)
            if biome[y][x] == FORGE and free(x, y, 1, 1, 0):
                objs.append((x * 16, y * 16, dun(tile), 0)); claim(x, y, 1, 1); break
# costa: píer de madeira entrando no mar
py = H // 2 + 6
sx0 = int(shore_x(py)) - 1
for k in range(6):
    objs.append(((sx0 + k) * 16, py * 16 + 4, town(81 if 0 < k < 5 else (80 if k == 0 else 82)), 0))

# ── O farol (pixel art própria): torre listrada + lanterna, na ponta da costa ──
def lighthouse():
    L = Image.new("RGBA", (20, 46), (0, 0, 0, 0)); p = L.load()
    for y in range(12, 44):
        half = 4 + (y - 12) // 8
        for x in range(10 - half, 10 + half):
            stripe = ((y - 12) // 6) % 2 == 0
            c = (226, 64, 64, 255) if stripe else (245, 240, 230, 255)
            if x in (10 - half, 10 + half - 1): c = (40, 30, 34, 255)
            p[x, y] = c
    for y in range(4, 12):
        for x in range(5, 15):
            p[x, y] = (40, 30, 34, 255) if x in (5, 14) or y in (4, 11) else (255, 226, 120, 255)
    for x in range(3, 17): p[x, 12] = (40, 30, 34, 255)
    for x in range(7, 13): p[x, 2] = p[x, 3] = (226, 64, 64, 255)
    for x in range(4, 16): p[x, 44] = p[x, 45] = (40, 30, 34, 255)
    return L
lx, ly = int(shore_x(12)) - 3, 12
LH = lighthouse().resize((40, 92), Image.NEAREST)
objs.append((lx * 16 - 10, ly * 16 - 60, LH, 0))
claim(lx - 1, ly - 1, 3, 4)
# brilho do farol
glow = Image.new("RGBA", (64, 64), (0, 0, 0, 0)); gp = glow.load()
for y in range(64):
    for x in range(64):
        d = math.hypot(x - 32, y - 32)
        if d < 30: gp[x, y] = (255, 226, 120, int(70 * (1 - d / 30)))
objs.append((lx * 16 + 10 - 32, ly * 16 - 60 + 16 - 32, glow, 1))

# ── Árvores inteiras, densas nas bordas e esparsas perto da estrada ──
# Na Tiny Town a árvore alta ocupa DOIS tiles (copa em cima, tronco embaixo: 3+15 laranja, 4+16 verde).
# Cada árvore aqui é um sprite inteiro — nunca meia árvore solta.
def stack(top, bottom):
    t = Image.new("RGBA", (16, 32)); t.alpha_composite(town(top), (0, 0)); t.alpha_composite(town(bottom), (0, 16)); return t
TREE_SPRITES = {"alta-laranja": stack(3, 15), "alta-verde": stack(4, 16), "laranja": town(27), "verde": town(28), "moita": town(5)}
TREES = {
    FOREST: ["alta-verde", "verde", "moita", "alta-verde", "verde", "alta-laranja", "laranja", "verde"],
    GRAVE: ["alta-verde", "verde", "moita", "verde"],
    FORGE: ["alta-laranja", "laranja", "laranja", "alta-laranja", "moita"],
    COAST: ["moita", "verde", "alta-verde"],
}
DECOR = {FOREST: [29, 17], GRAVE: [17], FORGE: [29], COAST: [17]}
def darker(t, k):  # escurece só a cor; a transparência continua 0 ou 255 (sem árvore fantasma)
    r, g, bl, a = t.split()
    f = lambda v: int(v * k)
    return Image.merge("RGBA", (r.point(f), g.point(f), bl.point(f), a))
def near_path(x, y, r):
    for yy in range(y - r, y + r + 1):
        for xx in range(x - r, x + r + 1):
            if P(xx, yy): return True
    return False
def blocked(x, y): return 0 <= x < W and 0 <= y < H and (occupied[y][x] or sea[y][x])
tree_at = set()  # tiles que já têm árvore (a alta ocupa dois): uma árvore nunca esconde metade da outra
for y in range(-1, H + 1):
    for x in range(-1, W + 1):
        tx, ty = min(max(x, 0), W - 1), min(max(y, 0), H - 1)
        b = biome[ty][tx]
        if sea[ty][tx] or occupied[ty][tx] and (0 <= x < W and 0 <= y < H): continue
        edge = min(y, H - 1 - y)  # distância da borda de cima/baixo
        dens = {FOREST: 0.62, GRAVE: 0.2, FORGE: 0.24, COAST: 0.14}[b]
        if edge < 5: dens = max(dens, 0.82 if b != COAST else 0.45)
        if near_path(tx, ty, 1): dens *= 0.05
        elif near_path(tx, ty, 3): dens *= 0.4
        if (x, y) not in tree_at and random.random() < dens:
            ox, oy = random.randint(-1, 1), random.randint(-1, 1)
            kind = random.choice(TREES[b])
            # a copa da árvore alta sobe um tile: não pode cobrir outra árvore, casa, lápide, estrada nem o mar
            if kind.startswith("alta") and ((x, y - 1) in tree_at or blocked(x, y - 1) or P(x, y - 1)): kind = kind.replace("alta-", "")
            tree_at.add((x, y))
            if kind.startswith("alta"): tree_at.add((x, y - 1))
            t = TREE_SPRITES[kind]
            # copa um pouco mais escura que a grama; no cemitério, árvores secas/escuras
            t = darker(t, 0.72 if b == GRAVE else 0.86)
            objs.append((x * 16 + ox, (y + 1) * 16 - t.height + oy, t, 0))
        elif random.random() < 0.05 and not near_path(tx, ty, 1):
            objs.append((x * 16 + random.randint(-3, 3), y * 16 + random.randint(-3, 3), town(random.choice(DECOR[b])), 0))

# sombra no chão sob cada objeto + desenho na ordem de y (de trás para a frente)
objs.sort(key=lambda o: (o[3], o[1] + o[2].height))
shadow = Image.new("RGBA", (12, 4), (0, 0, 0, 0)); sp = shadow.load()
for x in range(12):
    for y in range(4):
        if (x - 5.5) ** 2 / 36 + (y - 1.5) ** 2 / 4 <= 1: sp[x, y] = (0, 0, 0, 60)
def draw_objects(im, xmin=0):
    for x, y, t, layer in objs:
        if x + t.width + 2 <= xmin: continue
        if layer == 0 and t.width == 16:
            im.alpha_composite(shadow, (max(0, x + 2), max(0, min(PH - 4, y + t.height - 3))))
        # recorta o que sai da imagem (árvores da borda ficam pela metade só FORA da tela, não no meio do mapa)
        cx, cy = max(0, -x), max(0, -y)
        cw, ch = min(t.width, PW - x), min(t.height, PH - y)
        if cw > cx and ch > cy:
            im.alpha_composite(t.crop((cx, cy, cw, ch)), (max(0, x), max(0, y)))

# imagem fixa = quadro 0 (é o que aparece sem animação)
paint_sea(img.load(), 0.0, GROUND.load())
draw_objects(img)
img.resize((PW * 2, PH * 2), Image.NEAREST).convert("RGB").save(OUT, optimize=True)
print("ok", OUT)

# folha de quadros do mar: só a faixa que muda (água + areia molhada); o resto é transparente
if len(sys.argv) > 4:
    X0 = min(sea_from(y) for y in range(PH)) // 8 * 8
    sheet = Image.new("RGBA", ((PW - X0) * FRAMES, PH), (0, 0, 0, 0))
    gp = GROUND.load()
    for f in range(FRAMES):
        fr = GROUND.copy()
        paint_sea(fr.load(), f / FRAMES, gp)
        draw_objects(fr, X0)
        crop = fr.crop((X0, 0, PW, PH)); cp = crop.load()
        for y in range(PH):
            for x in range(sea_from(y) - X0): cp[x, y] = (0, 0, 0, 0)
        sheet.paste(crop, (f * (PW - X0), 0))
    sheet.save(sys.argv[4], optimize=True)
    print("ok", sys.argv[4], f"{FRAMES} quadros de {PW - X0}x{PH}, começa em x={X0} de {PW} ({X0 / PW * 100:.4f}%)")

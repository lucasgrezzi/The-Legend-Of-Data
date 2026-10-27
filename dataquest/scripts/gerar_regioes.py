# Gera um fundo próprio para cada região: public/assets/bg/regiao-<trilha>.png
#   python  → A Floresta dos Antigos (riacho, ponte, santuário de runas, a casa da Guilda)
#   sql     → As Catacumbas (salão de pedra, sarcófagos, tochas, fonte espectral)
#   pandas  → A Forja (rio de lava, fornalhas, bigornas, casas de tijolo)
#   dataviz → A Costa do Farol (noite, mar com o reflexo da lua, píer, barcos e o farol)
# Tiles CC0 da Kenney: Tiny Town e Tiny Dungeon (https://kenney.nl/assets/tiny-town, /tiny-dungeon); o resto
# (água, lava, tochas, farol, barcos, teias…) é pixel art própria desenhada aqui.
# Uso: python gerar_regioes.py <pasta tiny-town extraída> <pasta tiny-dungeon extraída> <pasta de saída>
# A luz é calculada em blocos de 4 px e em degraus (luz "de pixel art"): cada cena tem uma luz ambiente e
# fontes de luz (tochas, janelas, lava, o farol). O meio da tela fica mais calmo — é onde passam as fases;
# o que chama atenção fica nas laterais. Requer Pillow e numpy.
import math
import random
import sys

import numpy as np
from PIL import Image

TOWN, DUNGEON, OUTDIR = sys.argv[1], sys.argv[2], sys.argv[3]
TT = Image.open(f"{TOWN}/Tilemap/tilemap_packed.png").convert("RGBA")
TD = Image.open(f"{DUNGEON}/Tilemap/tilemap_packed.png").convert("RGBA")
def town(i): c, r = i % 12, i // 12; return TT.crop((c * 16, r * 16, c * 16 + 16, r * 16 + 16))
def dun(i): c, r = i % 12, i // 12; return TD.crop((c * 16, r * 16, c * 16 + 16, r * 16 + 16))

W, H = 64, 36          # em tiles de 16 px → 1024×576, ampliado 2× no fim
PW, PH = W * 16, H * 16


class Scene:
    def __init__(self, seed):
        random.seed(seed)
        self.img = Image.new("RGBA", (PW, PH), (0, 0, 0, 255))
        self.objs = []                       # (x_px, y_px, imagem, camada)
        self.occ = [[False] * W for _ in range(H)]
        self.lights = []                     # (x_px, y_px, raio_px, (r, g, b), força)

    def tile(self, x, y, t): self.img.alpha_composite(t, (x * 16, y * 16))
    def obj(self, x, y, t, layer=0): self.objs.append((int(x), int(y), t, layer))
    def light(self, x, y, r, col, k=1.0): self.lights.append((x, y, r, col, k))

    def free(self, x, y, w=1, h=1, pad=1):
        for yy in range(y - pad, y + h + pad):
            for xx in range(x - pad, x + w + pad):
                if not (0 <= xx < W and 0 <= yy < H) or self.occ[yy][xx]: return False
        return True

    def claim(self, x, y, w=1, h=1):
        for yy in range(max(0, y), min(H, y + h)):
            for xx in range(max(0, x), min(W, x + w)): self.occ[yy][xx] = True

    def stamp(self, x, y, rows, src=town):
        for dy, r in enumerate(rows):
            for dx, t in enumerate(r):
                if t is not None: self.obj((x + dx) * 16, (y + dy) * 16, src(t))
        self.claim(x, y, len(rows[0]), len(rows))

    def scatter(self, n, tiles, zone, src=town, pad=0, dark=1.0):
        """espalha objetos de 1 tile onde zone(x, y) é verdadeiro"""
        for _ in range(n):
            for _ in range(120):
                x, y = random.randint(0, W - 1), random.randint(0, H - 1)
                if zone(x, y) and self.free(x, y, 1, 1, pad):
                    t = src(random.choice(tiles))
                    if dark != 1.0: t = Image.eval(t, lambda v: int(v * dark))
                    self.obj(x * 16 + random.randint(-2, 2), y * 16 + random.randint(-2, 2), t)
                    self.claim(x, y); break

    def trees(self, tiles, dens, dark=0.86):
        """árvores inteiras, uma por tile, com deslocamento livre (densas onde dens() é alto)"""
        for y in range(-1, H + 1):
            for x in range(-1, W + 1):
                tx, ty = min(max(x, 0), W - 1), min(max(y, 0), H - 1)
                if self.occ[ty][tx] and 0 <= x < W and 0 <= y < H: continue
                if random.random() < dens(tx, ty):
                    t = Image.eval(town(random.choice(tiles)), lambda v: int(v * dark))
                    self.obj(x * 16 + random.randint(-3, 3), y * 16 + random.randint(-4, 2), t)

    def draw_objects(self):
        self.objs.sort(key=lambda o: (o[3], o[1] + o[2].height))
        sh = Image.new("RGBA", (12, 4), (0, 0, 0, 0)); sp = sh.load()
        for x in range(12):
            for y in range(4):
                if (x - 5.5) ** 2 / 36 + (y - 1.5) ** 2 / 4 <= 1: sp[x, y] = (0, 0, 0, 70)
        for x, y, t, layer in self.objs:
            if layer == 0 and t.width == 16 and 0 <= y + 13 < PH - 4:
                self.img.alpha_composite(sh, (max(0, x + 2), y + 13))
            cx, cy = max(0, -x), max(0, -y)
            cw, ch = min(t.width, PW - x), min(t.height, PH - y)
            if cw > cx and ch > cy:
                self.img.alpha_composite(t.crop((cx, cy, cw, ch)), (max(0, x), max(0, y)))

    def apply_light(self, ambient, steps=10, vignette=0.35):
        """luz em blocos de 4 px e em degraus; vinheta escurece os cantos"""
        B = 4
        bw, bh = PW // B, PH // B
        ys, xs = np.mgrid[0:bh, 0:bw].astype(np.float32)
        xs = xs * B + B / 2; ys = ys * B + B / 2
        L = np.zeros((bh, bw, 3), np.float32) + np.array(ambient, np.float32)
        for (lx, ly, r, col, k) in self.lights:
            d = np.hypot(xs - lx, ys - ly) / r
            f = np.clip(1 - d, 0, 1) ** 1.7 * k
            L += f[..., None] * (np.array(col, np.float32) / 255.0)[None, None, :]
        if vignette:
            vx = (xs / PW - 0.5) * 2; vy = (ys / PH - 0.5) * 2
            L *= (1 - vignette * np.clip(np.hypot(vx * 0.8, vy) - 0.55, 0, 1))[..., None]
        L = np.round(L * steps) / steps
        L = np.repeat(np.repeat(L, B, axis=0), B, axis=1)
        a = np.asarray(self.img.convert("RGB"), np.float32)
        out = np.clip(a * L, 0, 255).astype(np.uint8)
        self.img = Image.fromarray(out, "RGB").convert("RGBA")

    def save(self, name):
        out = self.img.convert("RGB").resize((PW * 2, PH * 2), Image.NEAREST)
        out = out.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        path = f"{OUTDIR}/regiao-{name}.png"
        out.save(path, optimize=True)
        print("ok", path)


# ─────────────────────────── pixel art própria ───────────────────────────

def px_img(w, h): im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); return im, im.load()

def torch_img():
    im, p = px_img(16, 16)
    for y in range(7, 15): p[7, y] = p[8, y] = (92, 60, 34, 255)          # cabo
    for x in range(5, 11): p[x, 7] = (60, 60, 70, 255)                    # suporte de ferro
    flame = [(7, 2, (255, 240, 170)), (8, 2, (255, 240, 170)), (6, 3, (255, 190, 70)), (7, 3, (255, 236, 150)),
             (8, 3, (255, 236, 150)), (9, 3, (255, 190, 70)), (6, 4, (255, 150, 40)), (7, 4, (255, 210, 90)),
             (8, 4, (255, 210, 90)), (9, 4, (255, 150, 40)), (6, 5, (230, 90, 30)), (7, 5, (255, 170, 60)),
             (8, 5, (255, 170, 60)), (9, 5, (230, 90, 30)), (7, 6, (200, 70, 30)), (8, 6, (200, 70, 30)), (7, 1, (255, 250, 210))]
    for x, y, c in flame: p[x, y] = c + (255,)
    return im

def candle_img():
    im, p = px_img(16, 16)
    for (cx, hgt) in ((5, 6), (9, 4), (12, 5)):
        for y in range(15 - hgt, 15):
            p[cx, y] = (236, 228, 205, 255); p[cx + 1, y] = (200, 190, 168, 255)
        p[cx, 13 - hgt] = (255, 220, 120, 255); p[cx, 12 - hgt] = (255, 250, 210, 255)
    return im

def skull_img():
    im, p = px_img(16, 16)
    bone = (226, 220, 200, 255); dark = (40, 36, 40, 255)
    for y in range(8, 13):
        for x in range(5, 11): p[x, y] = bone
    for x in range(6, 10): p[x, 7] = bone; p[x, 13] = bone
    p[6, 10] = p[7, 10] = dark; p[9, 10] = p[8, 10] = dark; p[7, 12] = p[9, 12] = dark
    for x in range(2, 14): p[x, 14] = (190, 184, 166, 255)                 # osso atravessado
    p[1, 13] = p[1, 15] = p[14, 13] = p[14, 15] = (190, 184, 166, 255)
    return im

def web_img():
    im, p = px_img(32, 32); c = (220, 224, 235, 150)
    for i in range(32): p[i, 0] = c; p[0, i] = c                           # canto superior esquerdo
    for i in range(30): p[i, i] = c
    for i in range(24): p[i, i // 2] = c; p[i // 2, i] = c
    for r in (8, 15, 22):
        for t in range(0, 91, 6):
            a = math.radians(t); x, y = int(r * math.cos(a)), int(r * math.sin(a))
            if 0 <= x < 32 and 0 <= y < 32: p[x, y] = c
    return im

def lantern_post():
    im, p = px_img(16, 32)
    for y in range(8, 31): p[7, y] = p[8, y] = (52, 48, 56, 255)
    for x in range(5, 11): p[x, 31] = (40, 36, 44, 255)
    for y in range(2, 8):
        for x in range(5, 11): p[x, y] = (40, 36, 44, 255) if x in (5, 10) or y in (2, 7) else (255, 222, 130, 255)
    p[7, 1] = p[8, 1] = (40, 36, 44, 255)
    return im

def boat_img(color):
    im, p = px_img(32, 16)
    for y in range(7, 13):
        inset = (y - 7) // 2
        for x in range(2 + inset, 30 - inset): p[x, y] = color + (255,)
    for x in range(4, 28): p[x, 7] = (60, 40, 30, 255)
    for x in range(6, 26): p[x, 9] = (110, 76, 50, 255)
    for y in range(0, 8): p[15, y] = (90, 64, 44, 255)                    # mastro
    for y in range(1, 7):
        for x in range(16, 16 + (7 - y) * 2 // 2 + 2): p[x, y] = (236, 232, 220, 255)  # vela
    return im

def rock_img(seed):
    rnd = random.Random(seed); im, p = px_img(16, 16)
    cx, cy, rx, ry = 8, 10, rnd.randint(5, 7), rnd.randint(3, 5)
    for y in range(16):
        for x in range(16):
            v = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
            if v <= 1:
                shade = 118 if y < cy - ry / 3 else (96 if v < 0.7 else 70)
                p[x, y] = (shade, shade + 4, shade + 12, 255)
    return im

def coal_img():
    im, p = px_img(16, 16)
    for y in range(16):
        for x in range(16):
            if ((x - 8) / 7) ** 2 + ((y - 12) / 4) ** 2 <= 1:
                p[x, y] = (28, 26, 30, 255) if (x * 3 + y * 5) % 4 else (70, 64, 70, 255)
    p[7, 9] = p[10, 11] = (255, 140, 40, 255)
    return im

def furnace_img():
    """fornalha de pedra 3×3 tiles com a boca acesa"""
    im, p = px_img(48, 48)
    for y in range(6, 46):
        for x in range(4, 44):
            brick = ((x + (8 if (y // 6) % 2 else 0)) % 16 == 0) or y % 6 == 0
            p[x, y] = (70, 64, 70, 255) if brick else (118, 108, 112, 255)
    for x in range(2, 46): p[x, 4] = p[x, 5] = (52, 48, 54, 255)
    for y in range(22, 42):
        for x in range(14, 34):
            r = ((x - 24) / 10) ** 2 + ((y - 42) / 20) ** 2
            if r <= 1:
                p[x, y] = (255, 240, 160, 255) if r < 0.3 else ((255, 176, 60, 255) if r < 0.65 else (214, 80, 30, 255))
    for y in range(0, 6):
        for x in range(34, 42): p[x, y] = (60, 56, 62, 255)              # chaminé
    return im

def lighthouse_img():
    L, p = px_img(20, 46)
    for y in range(12, 44):
        half = 4 + (y - 12) // 8
        for x in range(10 - half, 10 + half):
            stripe = ((y - 12) // 6) % 2 == 0
            c = (226, 64, 64, 255) if stripe else (245, 240, 230, 255)
            if x in (10 - half, 10 + half - 1): c = (40, 30, 34, 255)
            p[x, y] = c
    for y in range(4, 12):
        for x in range(5, 15):
            p[x, y] = (40, 30, 34, 255) if x in (5, 14) or y in (4, 11) else (255, 236, 150, 255)
    for x in range(3, 17): p[x, 12] = (40, 30, 34, 255)
    for x in range(7, 13): p[x, 2] = p[x, 3] = (226, 64, 64, 255)
    for x in range(4, 16): p[x, 44] = p[x, 45] = (40, 30, 34, 255)
    return L.resize((60, 138), Image.NEAREST)

def rune_stone():
    """pedra de runas (santuário da floresta), com as runas brilhando em ciano"""
    im, p = px_img(16, 32)
    for y in range(4, 31):
        for x in range(3, 13):
            top = y < 7 and abs(x - 7.5) > (y - 3) * 1.6
            if not top: p[x, y] = (118, 128, 128, 255) if x > 4 else (88, 96, 98, 255)
    for x in range(2, 14): p[x, 31] = (60, 66, 66, 255)
    for (x, y) in ((7, 10), (8, 10), (7, 11), (6, 12), (9, 12), (7, 15), (8, 16), (7, 17), (6, 20), (7, 20), (8, 20), (9, 21), (7, 24), (8, 25)):
        p[x, y] = (120, 255, 240, 255)
    return im


# ─────────────────────────── chão e água ───────────────────────────

def grass(s, tiles=(0,) * 9 + (1,) * 3 + (2,)):
    for y in range(H):
        for x in range(W): s.tile(x, y, town(random.choice(tiles)))

def dirt_road(s, path):
    def P(x, y): return 0 <= x < W and 0 <= y < H and path[y][x]
    for y in range(H):
        for x in range(W):
            if not path[y][x]: continue
            up, dn, lf, rt = P(x, y - 1), P(x, y + 1), P(x - 1, y), P(x + 1, y)
            row = 0 if not up else (2 if not dn else 1)
            col = 0 if not lf else (2 if not rt else 1)
            s.tile(x, y, town([[12, 13, 14], [24, 25, 26], [36, 37, 38]][row][col]))
            s.occ[y][x] = True

def carve_vertical(path, cx, width, y0=0, y1=H):
    for y in range(y0, y1):
        x0 = int(cx(y))
        for dx in range(width):
            if 0 <= x0 + dx < W: path[y][x0 + dx] = True

def paint_water(s, inside, deep=(44, 118, 170), mid=(64, 156, 196), foam=(236, 244, 246), seed=1):
    """água em pixel: espuma na borda, faixa clara, fundo escuro e ondinhas. inside(x_px, y_px) → bool"""
    rnd = random.Random(seed)
    p = s.img.load()
    mask = np.zeros((PH, PW), bool)
    for y in range(PH):
        for x in range(PW): mask[y, x] = inside(x, y)
    # distância (aprox.) até a margem, por erosão
    dist = np.zeros((PH, PW), np.int16); cur = mask.copy(); k = 0
    while cur.any() and k < 14:
        dist[cur] += 1
        sh = cur.copy()
        sh[1:, :] &= cur[:-1, :]; sh[:-1, :] &= cur[1:, :]; sh[:, 1:] &= cur[:, :-1]; sh[:, :-1] &= cur[:, 1:]
        cur = sh; k += 1
    for y in range(PH):
        for x in range(PW):
            d = dist[y, x]
            if not d: continue
            c = foam if d <= 2 else (mid if d <= 7 else deep)
            p[x, y] = c + (255,)
    for _ in range(int(mask.sum() / 900)):
        x, y = rnd.randrange(PW - 6), rnd.randrange(PH)
        if mask[y, x] and dist[y, x] > 8:
            for kk in range(rnd.choice((3, 4, 5))):
                if x + kk < PW and mask[y, x + kk]: p[x + kk, y] = (150, 210, 232, 255)
    return mask

def paint_ash(s, seed=4):
    """chão da forja: terra batida e queimada, com cinza e pedrinhas"""
    rnd = random.Random(seed); p = s.img.load()
    for y in range(PH):
        for x in range(PW):
            n = rnd.random()
            band = 6 * math.sin(x / 37 + y / 53) + 4 * math.sin(y / 19 - x / 71)
            c = (int(118 + band), int(88 + band * 0.8), int(66 + band * 0.6))
            if n < 0.06: c = (c[0] - 22, c[1] - 20, c[2] - 16)
            elif n < 0.09: c = (c[0] + 18, c[1] + 14, c[2] + 10)
            p[x, y] = c + (255,)
    for _ in range(500):
        x, y = rnd.randrange(PW - 2), rnd.randrange(PH - 2)
        g = rnd.choice(((70, 62, 60), (150, 136, 120), (44, 38, 38)))
        p[x, y] = p[x + 1, y] = g + (255,)

def paint_lava(s, inside, seed=2):
    rnd = random.Random(seed); p = s.img.load()
    for y in range(PH):
        for x in range(PW):
            if not inside(x, y): continue
            edge = not (inside(x - 3, y) and inside(x + 3, y) and inside(x, y - 3) and inside(x, y + 3))
            n = (x * 7 + y * 11 + (x // 5) * 3) % 13
            if edge: c = (60, 30, 26)
            elif n < 2: c = (255, 240, 170)
            elif n < 6: c = (255, 170, 50)
            else: c = (224, 84, 28)
            p[x, y] = c + (255,)
    for _ in range(90):  # crostas escuras boiando
        x, y = rnd.randrange(PW - 8), rnd.randrange(PH - 4)
        if inside(x, y) and inside(x + 7, y + 3):
            for dx in range(rnd.randint(3, 7)):
                for dy in range(2): p[x + dx, y + dy] = (90, 40, 30, 255)

def paint_cobble(s, base=(72, 76, 92), seed=3, x0=0, x1=PW, y0=0, y1=PH):
    """piso de pedra das catacumbas: lajes irregulares com rejunte"""
    rnd = random.Random(seed); p = s.img.load()
    row_h = 12
    for ry in range(y0, y1, row_h):
        x = x0 - rnd.randint(0, 14)
        while x < x1:
            w = rnd.randint(12, 22)
            v = rnd.randint(-10, 10)
            c = tuple(max(0, min(255, b + v)) for b in base)
            for yy in range(ry, min(y1, ry + row_h)):
                for xx in range(max(x0, x), min(x1, x + w)):
                    mortar = yy == ry or xx == x
                    hl = yy == ry + 1 and not mortar
                    p[xx, yy] = (34, 34, 44, 255) if mortar else ((c[0] + 14, c[1] + 14, c[2] + 16, 255) if hl else c + (255,))
            x += w
    for _ in range(260):  # rachaduras e musgo
        x, y = rnd.randrange(x0, x1 - 3), rnd.randrange(y0, y1)
        if rnd.random() < 0.6: p[x, y] = (40, 40, 52, 255)
        else: p[x, y] = (70, 104, 74, 255)


# ═══════════════════════════ PYTHON — A Floresta dos Antigos ═══════════════════════════

def forest():
    s = Scene(1991)  # o ano em que o Python nasceu
    grass(s)
    # trilha de terra pelo meio (onde passam as fases), sinuosa
    path = [[False] * W for _ in range(H)]
    carve_vertical(path, lambda y: W / 2 - 1 + 4 * math.sin(y / 5.0), 3)
    # riacho à esquerda, ponte de madeira onde cruza o ramal
    def creek_x(yp): return (0.17 * W + 2.4 * math.sin(yp / 16 / 4.2) + 1.2 * math.sin(yp / 16 / 1.7)) * 16
    for y in range(H):
        cx = int(creek_x(y * 16 + 8) / 16)
        for x in range(cx - 1, cx + 3):
            if 0 <= x < W: s.occ[y][x] = True
    branch_y = 19
    for x in range(0, W // 2):  # ramal da trilha até a casa da guilda... e até o santuário
        for dy in range(2): path[branch_y + dy + int(1.5 * math.sin(x / 3))][x] = True
    for x in range(W // 2, W - 6):
        for dy in range(2): path[10 + dy + int(1.5 * math.sin(x / 3.4))][x] = True
    dirt_road(s, path)
    paint_water(s, lambda x, y: abs(x - creek_x(y)) < 26 + 4 * math.sin(y / 9), seed=11)
    # ponte (madeira) sobre o riacho no ramal
    by = branch_y + int(1.5 * math.sin(int(creek_x(branch_y * 16) / 16) / 3))
    cxb = int(creek_x(by * 16 + 8) / 16)
    for k in range(-2, 4):
        s.obj((cxb + k) * 16, by * 16 + 4, town(81 if -2 < k < 3 else (80 if k == -2 else 82)), 1)
        s.obj((cxb + k) * 16, (by + 1) * 16 - 2, town(81 if -2 < k < 3 else (80 if k == -2 else 82)), 1)

    # santuário de runas (lado esquerdo): círculo de pedras com runas acesas
    sx, sy = 6, 9
    for i, (dx, dy) in enumerate(((0, 0), (4, -1), (7, 1), (6, 4), (1, 4))):
        s.obj((sx + dx) * 16, (sy + dy) * 16 - 16, rune_stone())
        s.claim(sx + dx, sy + dy - 1, 1, 2)
        s.light((sx + dx) * 16 + 8, (sy + dy) * 16, 46, (90, 255, 230), 0.7)
    s.light((sx + 3.5) * 16, (sy + 2) * 16, 90, (60, 200, 220), 0.45)
    for x in range(sx + 1, sx + 7):
        for y in range(sy, sy + 4): s.occ[y][x] = True
    for (dx, dy) in ((2, 1), (4, 2), (3, 3), (5, 1)):
        s.obj((sx + dx) * 16, (sy + dy) * 16, town(2))

    # anel de cogumelos (fadas) embaixo à esquerda, brilhando
    rx, ry = 7, 27
    for a in range(0, 360, 40):
        x = rx + 2.6 * math.cos(math.radians(a)); y = ry + 1.8 * math.sin(math.radians(a))
        s.obj(x * 16, y * 16, town(29)); s.claim(int(x), int(y))
        s.light(x * 16 + 8, y * 16 + 10, 22, (255, 120, 200), 0.5)
    for x in range(rx - 2, rx + 3):
        for y in range(ry - 1, ry + 2): s.occ[y][x] = True

    # a casa da Guilda (direita, no fim do ramal de cima) + poço, cerca, colmeia, placa
    s.stamp(W - 9, 7, [[48, 49, 50], [60, 61, 62], [88, 90, 88]])
    s.light((W - 9) * 16 + 8, 9 * 16 + 8, 34, (255, 200, 110), 0.9)
    s.light((W - 7) * 16 + 8, 9 * 16 + 8, 34, (255, 200, 110), 0.9)
    s.stamp(W - 5, 8, [[92], [104]])
    s.stamp(W - 12, 9, [[83]])
    s.stamp(W - 10, 11, [[80, 81, 81, 81, 82]])
    s.stamp(W - 4, 12, [[94]])
    s.obj((W - 3) * 16, 12 * 16, town(29))
    # segunda casa embaixo à direita, horta cercada
    s.stamp(W - 10, 24, [[48, 49, 50], [60, 61, 62], [88, 89, 88]])
    s.light((W - 10) * 16 + 8, 26 * 16 + 8, 34, (255, 200, 110), 0.9)
    s.stamp(W - 6, 26, [[44, 45, 46], [68, 69, 70]])
    for (dx, dy) in ((1, 0), (1, 1)): s.obj((W - 6 + dx) * 16, (26 + dy) * 16, town(17))

    # flores e brotos espalhados
    s.scatter(40, [2], lambda x, y: True)
    s.scatter(18, [17, 29], lambda x, y: x < W * 0.3 or x > W * 0.7)
    # árvores: muito densas nas bordas, raras no meio
    def dens(x, y):
        edge = min(x, W - 1 - x, y * 1.4, (H - 1 - y) * 1.4)
        mid = abs(x - W / 2) < W * 0.16
        d = 0.9 if edge < 3 else (0.55 if edge < 7 else 0.32)
        return d * (0.25 if mid else 1)
    s.trees([4, 16, 28, 5, 4, 16, 28, 15, 3, 27], dens, dark=0.84)
    # vaga-lumes "pintados" (pontos de luz quente entre as árvores)
    for _ in range(26):
        x, y = random.randint(0, PW), random.randint(0, PH)
        s.light(x, y, 18, (255, 236, 140), 0.45)
    s.draw_objects()
    s.apply_light((0.80, 0.86, 0.78), vignette=0.42)
    s.save("python")


# ═══════════════════════════ SQL — As Catacumbas ═══════════════════════════

def crypt():
    s = Scene(1974)  # o ano do SEQUEL, avô do SQL
    paint_cobble(s)
    # parede de tijolos no alto (4 fileiras), com portas, estandartes e tochas
    WALL = 7  # a barra do topo do site cobre as 2 primeiras fileiras
    for y in range(WALL):
        for x in range(W):
            s.tile(x, y, dun(40 if y > 2 else 28))
            s.occ[y][x] = True
    for x in range(W):  # rodapé escuro
        s.obj(x * 16, WALL * 16 - 4, Image.new("RGBA", (16, 4), (20, 20, 28, 255)), 1)
    for x in (9, W - 12):
        s.stamp(x, WALL - 3, [[45, 46, 47], [57, 58, 59]], src=dun)
    for x in (4, 16, W - 18, W - 5):
        s.obj(x * 16, (WALL - 4) * 16, dun(29))
    for x in (2, 7, 13, 20, W - 21, W - 14, W - 8, W - 3):
        s.obj(x * 16, (WALL - 3) * 16 - 2, torch_img(), 1)
        s.light(x * 16 + 8, (WALL - 3) * 16 + 4, 120, (255, 160, 70), 1.0)
    # gárgulas com água espectral (verde)
    for x in (24, W - 26):
        s.obj(x * 16, (WALL - 2) * 16, dun(19)); s.obj(x * 16, (WALL - 1) * 16, dun(32))
        s.light(x * 16 + 8, (WALL - 1) * 16 + 8, 90, (80, 255, 170), 0.8)
    # tapete vermelho escuro descendo pelo meio (corredor do Rei)
    p = s.img.load()
    for y in range(WALL * 16, PH):
        for x in range(PW // 2 - 70, PW // 2 + 70):
            edge = abs(x - PW // 2) > 62
            gold = abs(x - PW // 2) in (63, 64) or abs(x - PW // 2) in (58,)
            c = (190, 150, 60) if gold else ((70, 18, 26) if edge else ((112, 26, 34) if (y // 4 + x // 4) % 9 else (130, 36, 44)))
            p[x, y] = c + (255,)
    for y in range(WALL, H):
        for x in range(W // 2 - 5, W // 2 + 5): s.occ[y][x] = True

    # colunas em duas fileiras, ao longo do corredor
    for y in range(WALL + 3, H - 1, 6):
        for x in (W // 2 - 8, W // 2 + 7):
            s.obj(x * 16, (y - 1) * 16, dun(6)); s.obj(x * 16, y * 16, dun(18)); s.claim(x, y - 1, 1, 2)
    # sarcófagos e lápides em fileiras nas laterais
    for side in (0, 1):
        xs = range(3, 18, 3) if side == 0 else range(W - 18, W - 3, 3)
        for y in range(WALL + 2, H - 3, 5):
            for x in xs:
                if random.random() < 0.75 and s.free(x, y, 1, 2, 0):
                    s.obj(x * 16, y * 16, dun(66)); s.obj(x * 16, (y + 1) * 16, dun(random.choice((64, 65))))
                    s.claim(x, y, 1, 2)
                    if random.random() < 0.35:
                        s.obj(x * 16 + 16, (y + 1) * 16, candle_img())
                        s.light(x * 16 + 24, (y + 1) * 16 + 6, 34, (255, 190, 90), 0.75)
    # ossuário cercado de grades (esquerda, embaixo) e baús do tesouro (direita, embaixo)
    for x in range(3, 11): s.obj(x * 16, (H - 4) * 16, dun(77))
    for x in range(3, 11):
        if random.random() < 0.7: s.obj(x * 16, (H - 3) * 16, skull_img())
    for x in range(3, 11): s.claim(x, H - 4, 1, 2)
    for (x, t) in ((W - 10, 89), (W - 8, 90), (W - 6, 89)):
        s.obj(x * 16, (H - 3) * 16, dun(t)); s.claim(x, H - 3)
        s.light(x * 16 + 8, (H - 3) * 16 + 8, 40, (255, 210, 90), 0.5)
    # teias nos cantos, ossos e entulho espalhados
    s.obj(0, WALL * 16, web_img(), 1)
    s.obj(PW - 32, WALL * 16, web_img().transpose(Image.FLIP_LEFT_RIGHT), 1)
    s.scatter(26, [12, 24], lambda x, y: y > WALL + 1, src=dun)
    for _ in range(14):
        for _ in range(60):
            x, y = random.randint(1, W - 2), random.randint(WALL + 2, H - 2)
            if s.free(x, y, 1, 1, 0): s.obj(x * 16, y * 16, skull_img()); s.claim(x, y); break
    # um fantasma bem fraquinho flutuando perto da parede
    ghost = Image.eval(dun(121), lambda v: v); ga = ghost.split()[3].point(lambda a: int(a * 0.45)); ghost.putalpha(ga)
    s.obj((W - 16) * 16, (WALL + 2) * 16, ghost, 1)
    s.light((W - 16) * 16 + 8, (WALL + 2) * 16 + 8, 40, (150, 200, 255), 0.5)
    for _ in range(9):
        s.light(random.randint(40, PW - 40), random.randint(WALL * 16 + 40, PH - 30), 50, (90, 255, 180), 0.35)
    s.draw_objects()
    s.apply_light((0.50, 0.54, 0.70), vignette=0.45)
    s.save("sql")


# ═══════════════════════════ PANDAS — A Forja ═══════════════════════════

def forge():
    s = Scene(2008)  # o ano em que o pandas nasceu
    paint_ash(s)
    # praça de pedra no meio (onde passam as fases)
    paint_cobble(s, base=(112, 96, 88), seed=8, x0=PW // 2 - 96, x1=PW // 2 + 96)
    for y in range(H):
        for x in range(W // 2 - 6, W // 2 + 6): s.occ[y][x] = True
    # rio de lava à esquerda, ponte de pedra
    def lava_x(yp): return (0.16 * W + 2 * math.sin(yp / 16 / 3.6) + 1.3 * math.sin(yp / 16 / 1.5)) * 16
    inside = lambda x, y: abs(x - lava_x(y)) < 22 + 3 * math.sin(y / 7)
    paint_lava(s, inside)
    for y in range(H):
        cx = int(lava_x(y * 16 + 8) / 16)
        for x in range(cx - 2, cx + 3):
            if 0 <= x < W: s.occ[y][x] = True
        if y % 3 == 0: s.light(lava_x(y * 16 + 8), y * 16 + 8, 120, (255, 110, 40), 0.7)
    # ponte de pedra em arco sobre a lava
    by = 21 * 16
    bx = int(lava_x(by + 16))
    p = s.img.load()
    for y in range(by, by + 32):
        for x in range(bx - 44, bx + 44):
            mortar = (y - by) % 8 == 0 or (x + (6 if ((y - by) // 8) % 2 else 0)) % 12 == 0
            rail = y < by + 3 or y > by + 28
            p[x, y] = (54, 46, 46, 255) if rail else ((80, 70, 68, 255) if mortar else (138, 124, 116, 255))
    # fornalhas grandes (direita e esquerda, encostadas)
    for (fx, fy) in ((W - 8, 4), (5, 4)):
        s.obj(fx * 16, fy * 16, furnace_img()); s.claim(fx, fy, 3, 3)
        s.light(fx * 16 + 24, fy * 16 + 38, 150, (255, 140, 50), 1.1)
    # casas de tijolo e o galpão da forja (pedra) do lado direito
    s.stamp(W - 13, 12, [[52, 53, 54], [64, 65, 66], [84, 86, 84]])
    s.light((W - 13) * 16 + 8, 14 * 16 + 8, 34, (255, 190, 100), 0.9)
    s.stamp(W - 8, 18, [[52, 53, 53, 54], [64, 65, 65, 66], [76, 77, 78, 79]])
    s.light((W - 6) * 16 + 8, 20 * 16 + 8, 60, (255, 150, 60), 1.0)
    s.stamp(W - 13, 26, [[52, 53, 54], [64, 65, 66], [84, 87, 84]])
    s.light((W - 13) * 16 + 8, 28 * 16 + 8, 34, (255, 190, 100), 0.9)
    # bigornas, barris, lenha, carvão, ferramentas e armas nas laterais
    side = lambda x, y: (x < W * 0.33 or x > W * 0.68) and y > 2
    s.scatter(9, [74], side, src=dun, pad=1)
    s.scatter(10, [82], side, src=dun)
    s.scatter(8, [106, 107], side)
    s.scatter(14, [63, 75], side, src=dun)
    for k in range(12):
        for _ in range(80):
            x, y = random.randint(1, W - 2), random.randint(3, H - 2)
            if side(x, y) and s.free(x, y, 1, 1, 0): s.obj(x * 16, y * 16, rock_img(40 + k)); s.claim(x, y); break
    for _ in range(10):
        for _ in range(80):
            x, y = random.randint(1, W - 2), random.randint(3, H - 2)
            if side(x, y) and s.free(x, y, 1, 1, 0):
                s.obj(x * 16, y * 16, coal_img()); s.claim(x, y)
                s.light(x * 16 + 8, y * 16 + 10, 26, (255, 120, 40), 0.5); break
    # cavalete de armas (cerca + espadas/machados) à esquerda, embaixo
    for k, t in enumerate((103, 104, 105, 117, 118, 106)):
        s.obj((6 + k) * 16, (H - 6) * 16, dun(t))
        s.obj((6 + k) * 16, (H - 5) * 16, town(81 if 0 < k < 5 else (80 if k == 0 else 82)))
    s.claim(6, H - 6, 6, 2)
    for k, t in enumerate((115, 116, 127, 128, 129)):
        s.obj((W - 18 + k) * 16, (H - 4) * 16, town(t))
    s.claim(W - 18, H - 4, 5, 1)
    s.scatter(22, [3, 15, 27], lambda x, y: (x < 3 or x > W - 4 or y > H - 3) and not (W * 0.33 < x < W * 0.68))
    s.draw_objects()
    s.apply_light((0.80, 0.66, 0.60), vignette=0.45)
    s.save("pandas")


# ═══════════════════════════ DATA VIZ — A Costa do Farol ═══════════════════════════

def coast():
    s = Scene(1786)  # 1786: Playfair desenha o primeiro gráfico de barras
    grass(s)
    def shore(yp): return (0.70 * W + 2.4 * math.sin(yp / 16 / 4.0) + 1.1 * math.sin(yp / 16 / 1.9)) * 16
    # areia
    p = s.img.load()
    for y in range(PH):
        sx = shore(y)
        sand_in = sx - 70 - 12 * math.sin(y / 23.0) - 6 * math.sin(y / 9.0)
        for x in range(max(0, int(sand_in)), min(PW, int(sx) + 4)):
            n = (x * 7 + y * 13) % 11
            c = (236, 210, 150) if n else (214, 186, 126)
            if x - sand_in < 3: c = (196, 178, 110)
            p[x, y] = c + (255,)
    for y in range(H):
        for x in range(W):
            if x * 16 > shore(y * 16) - 70: s.occ[y][x] = True
    sea = paint_water(s, lambda x, y: x > shore(y), deep=(28, 70, 120), mid=(46, 112, 160), seed=21)
    # reflexo da lua: coluna de brilhos no mar
    rnd = random.Random(5)
    mx = int(0.95 * PW)
    for y in range(0, PH, 3):
        w = int(6 + 18 * (1 - y / PH))
        for _ in range(3):
            x = mx + rnd.randint(-w, w)
            if 0 <= x < PW - 4 and sea[y, x]:
                for k in range(rnd.randint(2, 5)): p[x + k, y] = (220, 236, 255, 255)
    # trilha (meio) até o píer
    path = [[False] * W for _ in range(H)]
    carve_vertical(path, lambda y: W / 2 - 1 + 4 * math.sin(y / 5.0), 3)
    for x in range(W // 2, int(shore(22 * 16) / 16) - 3):
        for dy in range(2): path[22 + dy][x] = True
    for y in range(H):
        for x in range(W):
            if path[y][x] and s.occ[y][x] and x * 16 > shore(y * 16) - 74: path[y][x] = False
    dirt_road(s, path)
    # píer com barris e barcos
    py = 22
    sx0 = int(shore(py * 16) / 16) - 3
    for k in range(9):
        for dy in range(2):
            s.obj((sx0 + k) * 16, (py + dy) * 16 + 2, town(81 if 0 < k < 8 else (80 if k == 0 else 82)), 1)
    s.obj((sx0 + 3) * 16, py * 16 - 8, dun(82), 1)
    s.obj((sx0 + 8) * 16, (py - 1) * 16, lantern_post(), 2)
    s.light((sx0 + 8) * 16 + 8, (py - 1) * 16 + 6, 70, (255, 210, 120), 0.9)
    s.obj((sx0 + 5) * 16, (py + 2) * 16 + 6, boat_img((150, 70, 60)), 1)
    s.obj((sx0 + 10) * 16, (py - 3) * 16, boat_img((60, 100, 150)), 1)
    s.obj(int(0.9 * PW), 30 * 16, boat_img((120, 90, 60)), 1)
    # rochas no mar e o farol na ponta, em cima de um rochedo
    for k, (rx, ry) in enumerate(((0.80, 4), (0.93, 9), (0.88, 15), (0.95, 27), (0.78, 32))):
        s.obj(int(rx * PW), ry * 16, rock_img(k), 1)
    # o farol fica numa ilhota de pedra no mar, à direita (longe das fases, que passam no meio da tela)
    lx, ly = int(0.865 * PW), 4 * 16
    ix, iy = lx, ly + 112
    for y in range(iy - 40, iy + 40):
        for x in range(ix - 70, ix + 70):
            v = ((x - ix) / 62) ** 2 + ((y - iy) / 32) ** 2 + 0.08 * math.sin(x / 5 + y / 7)
            if v <= 1.18:
                if v > 1.0: c = (236, 244, 246)                          # espuma
                elif y > iy + 14 * (1 - v): c = (84, 80, 92) if (x + y) % 7 else (64, 60, 72)   # rocha
                else: c = (92, 140, 70) if (x * 3 + y) % 9 else (74, 120, 60)                  # capim
                p[x, y] = c + (255,)
    for k in range(-4, 5, 2):
        s.obj(ix + k * 14 - 8, iy + 18 + abs(k) * 2, rock_img(10 + k), 1)
    s.obj(lx - 30, ly - 20, lighthouse_img(), 2)
    s.light(lx, ly + 4, 260, (255, 226, 140), 1.15)
    s.light(lx, ly + 4, 60, (255, 250, 220), 0.9)
    # vila dos pescadores (esquerda): casas azuis, postes, barris, cerca
    s.stamp(4, 6, [[48, 49, 50], [60, 61, 62], [88, 90, 88]])
    s.stamp(10, 15, [[48, 49, 50], [60, 61, 62], [88, 89, 88]])
    s.stamp(3, 25, [[52, 53, 54], [64, 65, 66], [84, 86, 84]])
    for (hx, hy) in ((4, 8), (6, 8), (10, 17), (12, 17), (3, 27), (5, 27)):
        s.light(hx * 16 + 8, hy * 16 + 8, 32, (255, 200, 110), 0.95)
    for (lxp, lyp) in ((9, 9), (15, 21), (8, 30), (W // 2 + 4, 14), (W // 2 - 6, 28)):
        if s.free(lxp, lyp, 1, 2, 0):
            s.obj(lxp * 16, lyp * 16, lantern_post()); s.claim(lxp, lyp, 1, 2)
            s.light(lxp * 16 + 8, lyp * 16 + 6, 64, (255, 210, 120), 0.85)
    s.stamp(8, 12, [[80, 81, 81, 82]])
    s.scatter(8, [107, 106], lambda x, y: x < W * 0.3, src=town)
    s.scatter(6, [82], lambda x, y: x < W * 0.3, src=dun)
    s.scatter(30, [2], lambda x, y: x * 16 < shore(y * 16) - 90)
    def dens(x, y):
        if x * 16 > shore(y * 16) - 90: return 0
        edge = min(x, y * 1.4, (H - 1 - y) * 1.4)
        mid = abs(x - W / 2) < W * 0.14
        d = 0.8 if edge < 3 else 0.2
        return d * (0.2 if mid else 1)
    s.trees([5, 16, 4, 28], dens, dark=0.84)
    s.draw_objects()
    s.apply_light((0.40, 0.48, 0.76), vignette=0.45)
    s.save("dataviz")


if __name__ == "__main__":
    only = sys.argv[4:] or ["python", "sql", "pandas", "dataviz"]
    for name, fn in (("python", forest), ("sql", crypt), ("pandas", forge), ("dataviz", coast)):
        if name in only: fn()

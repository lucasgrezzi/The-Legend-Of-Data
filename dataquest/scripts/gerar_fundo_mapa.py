# Gera public/assets/bg/mapa-mundo.png (vila + floresta) a partir dos tiles CC0 Kenney Tiny Town.
# Uso: extrair https://kenney.nl/assets/tiny-town e rodar `python gerar_fundo_mapa.py` dentro da pasta extraída.
# Requer Pillow. Saída: mapa-mundo.png (2048×1152).
import random, math
from PIL import Image
random.seed(847)  # ano 847 da Era dos Dados :)
T = Image.open('Tilemap/tilemap_packed.png').convert('RGBA')
def tile(i): c, r = i % 12, i // 12; return T.crop((c*16, r*16, c*16+16, r*16+16))
W, H = 64, 36
base = [[random.choice([0]*10 + [1]*3 + [2]) for _ in range(W)] for _ in range(H)]
over = [[None]*W for _ in range(H)]
ground = [[None]*W for _ in range(H)]  # caminhos de terra / pedra

# ── Caminhos de terra (máscara → autotile 3×3: 12-14 / 24-26 / 36-38) ──
path = [[False]*W for _ in range(H)]
def carve(x, y, w=2):
    for dy in range(w):
        for dx in range(w):
            if 0 <= x+dx < W and 0 <= y+dy < H: path[y+dy][x+dx] = True
# estrada principal sinuosa (esquerda → direita)
for x in range(W):
    y = int(H/2 + 5*math.sin(x/7.0) + 2*math.sin(x/3.1))
    carve(x, y, 3)
# estrada vertical cruzando o centro
for y in range(H):
    x = int(W/2 + 4*math.sin(y/5.0))
    carve(x, y, 3)
# fecha buracos de 1 tile para o autotile ficar limpo
for _ in range(2):
    for y in range(1, H-1):
        for x in range(1, W-1):
            if not path[y][x] and ((path[y-1][x] and path[y+1][x]) or (path[y][x-1] and path[y][x+1])):
                path[y][x] = True
def P(x, y): return 0 <= x < W and 0 <= y < H and path[y][x]
for y in range(H):
    for x in range(W):
        if not path[y][x]: continue
        up, dn, lf, rt = P(x, y-1), P(x, y+1), P(x-1, y), P(x+1, y)
        row = 0 if not up else (2 if not dn else 1)
        col = 0 if not lf else (2 if not rt else 1)
        ground[y][x] = [[12, 13, 14], [24, 25, 26], [36, 37, 38]][row][col]

# ── Praça de pedra no cruzamento ──
cx, cy = W//2, H//2
occupied = [[path[y][x] for x in range(W)] for y in range(H)]
for y in range(cy-3, cy+4):
    for x in range(cx-4, cx+6):
        ground[y][x] = 43; occupied[y][x] = True

# ── Construções ──
def house(x, y, kind):
    roof = [[52, 53, 54], [64, 65, 66]] if kind == 'red' else [[48, 49, 50], [60, 61, 62]]
    wall = [84, 86, 84] if kind == 'red' else [88, 90, 88]
    rows = roof + [wall]
    if any(occupied[y+dy][x+dx] for dy in range(-1, 4) for dx in range(-1, 4) if 0 <= y+dy < H and 0 <= x+dx < W): return False
    for dy, r in enumerate(rows):
        for dx, t in enumerate(r):
            over[y+dy][x+dx] = t
    for dy in range(-1, 4):
        for dx in range(-1, 4):
            if 0 <= y+dy < H and 0 <= x+dx < W: occupied[y+dy][x+dx] = True
    return True
def castle(x, y):
    rows = [[96, 97, 97, 98], [108, 109, 109, 110], [108, 111, 112, 110], [120, 113, 114, 122]]
    for dy, r in enumerate(rows):
        for dx, t in enumerate(r): over[y+dy][x+dx] = t
    for dy in range(-1, 5):
        for dx in range(-1, 5): occupied[y+dy][x+dx] = True
castle(cx-1, cy-9)  # "Guilda" ao norte da praça
placed = 0
for _ in range(400):
    if placed >= 11: break
    x = random.randint(cx-18, cx+16); y = random.randint(cy-12, cy+9)
    if 1 < x < W-4 and 1 < y < H-4 and abs(x-cx) + abs(y-cy) > 6:
        # só perto de um caminho
        near = any(P(x+dx, y+dy) for dx in range(-2, 5) for dy in range(3, 6))
        if near and house(x, y, random.choice(['red', 'grey'])): placed += 1

# ── Floresta: densa nas bordas, rala no centro ──
for y in range(H):
    for x in range(W):
        if occupied[y][x] or over[y][x] is not None: continue
        ex = min(x, W-1-x) / (W/2); ey = min(y, H-1-y) / (H/2)
        edge = 1 - min(ex, ey)             # 1 na borda, 0 no centro
        d = math.hypot((x-cx)/W, (y-cy)/H)
        p = 0.05 + 0.85 * max(0, edge - 0.45) ** 1.2 * 2.2 + (0.15 if d > 0.35 else 0)
        r = random.random()
        if r < min(p, 0.93):
            over[y][x] = random.choice([16, 16, 28, 28, 4, 28, 16, 27, 15, 3])
        elif r < min(p, 0.93) + 0.025:
            over[y][x] = random.choice([17, 29, 5])

# ── Cercas e placas junto à praça ──
for x in range(cx-4, cx+6):
    if over[cy+4][x] is None and not path[cy+4][x]: over[cy+4][x] = 81
over[cy+1][cx-5] = 83 if over[cy+1][cx-5] is None else over[cy+1][cx-5]

img = Image.new('RGBA', (W*16, H*16))
for y in range(H):
    for x in range(W):
        img.paste(tile(base[y][x]), (x*16, y*16))
        if ground[y][x] is not None: img.alpha_composite(tile(ground[y][x]), (x*16, y*16))
        if over[y][x] is not None: img.alpha_composite(tile(over[y][x]), (x*16, y*16))
img = img.convert('RGB').resize((W*16*2, H*16*2), Image.NEAREST)
img.save('mapa-mundo.png', optimize=True)
print(img.size)

"""
Gera o cursor do DataQuest: uma manopla dourada em pixel art (estilo RPG) — dedo indicador apontando
para cima, punho redondo com os dedos dobrados, polegar cruzando na frente e pulseira com rebites.
Arte original, feita por formas geométricas — sem assets de terceiros.

Saída (32×32, ponta do dedo = hotspot — ver HOTSPOT, usado também no CSS):
  public/assets/cursors/luva.png        cursor normal
  public/assets/cursors/luva-hover.png  sobre botões e links (mais brilhante, com faísca)

Uso:  python scripts/gerar_cursor.py
"""
import math
from pathlib import Path

from PIL import Image

SIZE = 32
ANGLE = math.radians(-16)  # dedo levemente inclinado para a esquerda
TIP = (9.6, 1.4)           # onde a ponta do dedo fica na imagem
HOTSPOT = (9, 1)           # pixel da ponta — mesmo valor no CSS (--cursor-default / --cursor-hover)
OUT = Path(__file__).resolve().parent.parent / "public" / "assets" / "cursors"

OUTLINE = (40, 22, 4)
# Ouro do mais escuro ao brilho especular
GOLD = [(110, 62, 8), (166, 104, 14), (214, 150, 26), (244, 192, 52), (255, 226, 120), (255, 248, 206)]
LIGHT = (-0.62, -0.78)  # luz vindo de cima-esquerda


def in_ellipse(x, y, cx, cy, rx, ry):
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1


def local_shape(x: float, y: float):
    """Peça da manopla em coordenadas locais (dedo para cima, ponta em (0,0), y cresce para baixo)."""
    # Polegar: faixa diagonal na frente do punho (desenhado por cima)
    ax, ay, bx, by = -5.0, 14.2, 2.6, 19.6
    t = max(0.0, min(1.0, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)))
    if math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay))) <= 2.1:
        return "thumb"
    # Punho redondo
    if in_ellipse(x, y, 2.6, 16.0, 7.4, 6.6):
        return "fist"
    # Indicador: cilindro com ponta arredondada
    if -2.1 <= x <= 2.1 and 2.1 <= y <= 12.0:
        return "finger"
    if math.hypot(x, y - 2.1) <= 2.1:
        return "finger"
    # Pulseira (um pouco mais estreita que o punho) com borda arredondada
    if -3.2 <= x <= 8.6 and 21.8 <= y <= 26.8 and in_ellipse(x, y, 2.7, 24.3, 6.8, 3.4):
        return "cuff"
    return None


# Centro e raios de cada peça, para o sombreado "redondo" (brilho em cima-esquerda, borda escura)
FORMS = {
    "finger": (0.0, 7.0, 2.1, 7.5),
    "fist":   (2.6, 16.0, 7.4, 6.6),
    "thumb":  (-1.2, 16.9, 4.6, 2.6),
    "cuff":   (2.7, 24.3, 6.8, 3.4),
}


def shade(region: str, x: float, y: float, hover: bool) -> int:
    cx, cy, rx, ry = FORMS[region]
    nx, ny = (x - cx) / rx, (y - cy) / ry
    if region == "finger":
        ny *= 0.25  # cilindro: a luz varia mais na largura que no comprimento
    lit = -(nx * LIGHT[0] + ny * LIGHT[1])          # >0 do lado da luz
    edge = min(1.0, nx * nx + ny * ny)               # 0 no centro, 1 na borda
    v = 2.6 + 1.9 * lit - 1.4 * edge
    if region == "cuff":
        v -= 0.9
    if region == "thumb":
        v += 0.6  # está na frente: recebe mais luz
    # Vincos dos dedos dobrados (faixas horizontais no lado direito do punho)
    if region == "fist" and x > 1.2 and any(abs(y - k) < 0.5 for k in (12.8, 15.6, 18.4)):
        v = min(v, 1.0)
    # Juntas do indicador
    if region == "finger" and any(abs(y - k) < 0.45 for k in (5.4, 9.0)):
        v = min(v, 1.6)
    # Rebites da pulseira
    if region == "cuff" and abs(y - 24.3) < 0.8 and any(abs(x - k) < 0.8 for k in (-0.6, 2.7, 6.0)):
        return 5
    if hover:
        v += 0.7
    return max(0, min(5, round(v)))


# Pares de peças separados por uma linha escura (é o que faz a mão "ler" como mão)
SEAMS = {("fist", "finger"), ("thumb", "fist"), ("thumb", "finger"), ("cuff", "fist"), ("cuff", "thumb")}


def to_local(px: float, py: float):
    dx, dy = px - TIP[0], py - TIP[1]
    c, s = math.cos(-ANGLE), math.sin(-ANGLE)
    return dx * c - dy * s, dx * s + dy * c


def render(hover: bool) -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    px = img.load()
    regions = [[None] * SIZE for _ in range(SIZE)]

    for py in range(SIZE):
        for pxl in range(SIZE):
            x, y = to_local(pxl + 0.5, py + 0.5)
            r = local_shape(x, y)
            if r:
                regions[py][pxl] = r
                px[pxl, py] = (*GOLD[shade(r, x, y, hover)], 255)

    # Linhas internas entre peças (só de um lado da divisa → 1 px)
    for py in range(SIZE):
        for pxl in range(SIZE):
            r = regions[py][pxl]
            for dx, dy in ((1, 0), (0, 1), (-1, 0), (0, -1)):
                nx, ny = pxl + dx, py + dy
                if 0 <= nx < SIZE and 0 <= ny < SIZE and (r, regions[ny][nx]) in SEAMS:
                    px[pxl, py] = (*OUTLINE, 255)
                    break

    # Contorno externo de 1 px (com diagonais) — lê bem sobre fundo claro e escuro
    for py in range(SIZE):
        for pxl in range(SIZE):
            if regions[py][pxl]:
                continue
            if any(
                0 <= py + dy < SIZE and 0 <= pxl + dx < SIZE and regions[py + dy][pxl + dx]
                for dy in (-1, 0, 1) for dx in (-1, 0, 1)
            ):
                px[pxl, py] = (*OUTLINE, 255)

    if hover:
        # Faísca ao lado da ponta do dedo
        sx, sy = HOTSPOT[0] + 6, HOTSPOT[1] + 2
        for dx, dy in [(0, 0), (-1, 0), (1, 0), (0, -1), (0, 1)]:
            px[sx + dx, sy + dy] = (255, 252, 230, 255) if (dx, dy) == (0, 0) else (255, 214, 102, 235)
    return img


def check_fits(img: Image.Image):
    bbox = img.getbbox()
    assert bbox and bbox[0] >= 0 and bbox[1] >= 0 and bbox[2] <= SIZE and bbox[3] <= SIZE
    # nada pode encostar na borda (senão o contorno some)
    alpha = img.split()[3]
    for i in range(SIZE):
        for p in ((i, 0), (i, SIZE - 1), (0, i), (SIZE - 1, i)):
            assert alpha.getpixel(p) == 0 or img.getpixel(p)[:3] == OUTLINE, f"encosta na borda em {p}"


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, hover in [("luva.png", False), ("luva-hover.png", True)]:
        img = render(hover)
        check_fits(img)
        img.save(OUT / name)
        print("gerado", OUT / name, "bbox", img.getbbox())
    print("hotspot (CSS):", HOTSPOT)

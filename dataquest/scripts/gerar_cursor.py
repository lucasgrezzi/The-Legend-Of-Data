"""
Gera o cursor do DataQuest: uma manopla dourada em pixel art apontando na diagonal (estilo RPG).
Arte original, feita por formas geométricas — sem assets de terceiros.

Saída (32×32, ponta do dedo = hotspot em (2, 2)):
  public/assets/cursors/luva.png        cursor normal
  public/assets/cursors/luva-hover.png  sobre botões e links (mais brilhante, com faísca)

Uso:  python scripts/gerar_cursor.py
"""
import math
from pathlib import Path

from PIL import Image

SIZE = 32
ANGLE = math.radians(-36)  # dedo apontando para cima-esquerda
OUT = Path(__file__).resolve().parent.parent / "public" / "assets" / "cursors"

# Paleta (ouro do jogo + aço do punho)
OUTLINE = (34, 20, 6, 255)
GOLD = [(122, 74, 14), (184, 124, 28), (232, 170, 48), (250, 214, 110), (255, 244, 190)]
STEEL = [(44, 50, 64), (78, 90, 110), (124, 140, 164), (178, 192, 212)]
GEM = (74, 174, 255)


def local_shape(x: float, y: float):
    """Região da mão em coordenadas locais (dedo para cima, ponta em (0,0), y cresce para baixo)."""
    # Indicador esticado: longo e fino, ponta arredondada
    if -2.3 <= x <= 2.3 and 0 <= y <= 13:
        if y < 2.3 and math.hypot(x, y - 2.3) > 2.4:
            return None
        return "finger"
    # Polegar colado ao indicador, do lado esquerdo
    if -5.6 <= x < -2.3 and 10.5 <= y <= 16.5:
        if x < -4.6 and y < 11.8:
            return None
        return "thumb"
    # Dedos dobrados à direita + palma
    if -2.3 <= x <= 7.6 and 11.5 <= y <= 19.5:
        if x > 5.8 and y < 13.2:  # canto arredondado
            return None
        return "fist"
    if -5.6 <= x < -2.3 and 16.5 < y <= 19.5:
        return "fist"
    # Punho de metal, um pouco mais largo
    if -6.4 <= x <= 8.6 and 19.5 < y <= 26.5:
        return "cuff"
    return None


def to_local(px: float, py: float):
    # Inverte a rotação: pixel da imagem → coordenada local da mão (ponta do dedo em (2.2, 2.2))
    dx, dy = px - 2.2, py - 2.2
    c, s = math.cos(-ANGLE), math.sin(-ANGLE)
    return dx * c - dy * s, dx * s + dy * c


def shade(region: str, x: float, y: float, hover: bool):
    """Luz vindo da esquerda-cima: mais claro no lado esquerdo de cada peça."""
    boost = 1 if hover else 0
    if region == "cuff":
        # Friso dourado no topo do punho e joia no meio
        if y < 21.3:
            return GOLD[min(4, 2 + boost + (1 if x < 1 else 0))]
        if abs(x - 1.1) < 1.4 and abs(y - 23.9) < 1.4:
            return (140, 220, 255) if hover else GEM
        t = (x + 6.4) / 15
        i = 3 if t < 0.25 else 2 if t < 0.55 else 1 if t < 0.85 else 0
        return STEEL[i]

    left, right = {"finger": (-2.3, 2.3), "fist": (-5.6, 7.6), "thumb": (-5.6, -2.3)}[region]
    t = (x - left) / (right - left)
    i = 4 if t < 0.2 else 3 if t < 0.45 else 2 if t < 0.75 else 1
    # Juntas do indicador e nós dos dedos dobrados
    if region == "finger" and (abs(y - 5.2) < 0.45 or abs(y - 9.2) < 0.45):
        i = max(1, i - 2)
    if region == "fist" and x > 2.3 and (abs(y - 14.6) < 0.5 or abs(y - 17.2) < 0.5):
        i = max(0, i - 2)
    return GOLD[min(4, i + boost)]


# Pares de peças que ganham uma linha escura entre si (é o que faz a mão "ler" como mão)
SEAMS = {("fist", "finger"), ("thumb", "finger"), ("fist", "thumb"), ("cuff", "fist"), ("cuff", "thumb")}


def render(hover: bool) -> Image.Image:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    px = img.load()
    filled = [[False] * SIZE for _ in range(SIZE)]
    regions = [[None] * SIZE for _ in range(SIZE)]

    for py in range(SIZE):
        for pxl in range(SIZE):
            x, y = to_local(pxl + 0.5, py + 0.5)
            region = local_shape(x, y)
            if region:
                px[pxl, py] = (*shade(region, x, y, hover), 255)
                filled[py][pxl] = True
                regions[py][pxl] = region

    # Linhas internas entre peças (só de um lado da divisa, para ficar com 1 px)
    for py in range(SIZE):
        for pxl in range(SIZE):
            r = regions[py][pxl]
            for dx, dy in ((1, 0), (0, 1), (-1, 0), (0, -1)):
                nx, ny = pxl + dx, py + dy
                if 0 <= nx < SIZE and 0 <= ny < SIZE and (r, regions[ny][nx]) in SEAMS:
                    px[pxl, py] = (*GOLD[0], 255) if r != "cuff" else OUTLINE
                    break

    # Contorno de 1 px (inclui diagonais) — lê bem sobre fundo claro e escuro
    for py in range(SIZE):
        for pxl in range(SIZE):
            if filled[py][pxl]:
                continue
            near = any(
                0 <= py + dy < SIZE and 0 <= pxl + dx < SIZE and filled[py + dy][pxl + dx]
                for dy in (-1, 0, 1) for dx in (-1, 0, 1)
            )
            if near:
                px[pxl, py] = OUTLINE

    if hover:
        # Faísca ao lado da ponta do dedo
        for dx, dy in [(0, 0), (-1, 0), (1, 0), (0, -1), (0, 1)]:
            sx, sy = 10 + dx, 3 + dy
            px[sx, sy] = (255, 250, 220, 255) if (dx, dy) == (0, 0) else (255, 214, 102, 230)
    return img


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, hover in [("luva.png", False), ("luva-hover.png", True)]:
        render(hover).save(OUT / name)
        print("gerado", OUT / name)

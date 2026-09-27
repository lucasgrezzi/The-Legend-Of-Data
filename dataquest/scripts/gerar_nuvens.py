"""
Gera as nuvens da neblina do mapa (terras inexploradas) em pixel art: nuvens fofas, com base achatada,
topo iluminado e sombra embaixo. Arte original, feita por círculos — sem assets de terceiros.

Saída (tamanho nativo pequeno; o CSS amplia com image-rendering: pixelated):
  public/assets/fog/nuvem-1.png … nuvem-3.png

Uso:  python scripts/gerar_nuvens.py
"""
import random
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "public" / "assets" / "fog"

# Tons frios (combinam com o véu escuro do mapa), do contorno ao brilho
OUTLINE = (58, 66, 88, 255)
SHADOW = (122, 132, 158, 255)
MID = (170, 180, 204, 255)
LIGHT = (212, 219, 236, 255)
SHINE = (238, 242, 250, 255)

# (largura, altura, nº de "bolhas", semente)
VARIANTES = [(48, 24, 4, 7), (64, 28, 5, 21), (36, 20, 3, 42)]


def nuvem(w: int, h: int, bolhas: int, seed: int) -> Image.Image:
    rnd = random.Random(seed)
    base = h - 4  # linha da base achatada
    circles = []
    for i in range(bolhas):
        cx = 6 + (w - 12) * (i + 0.5) / bolhas + rnd.uniform(-2, 2)
        # bolhas do meio mais altas
        mid = 1 - abs((i + 0.5) / bolhas - 0.5) * 2
        r = 3.5 + mid * (h * 0.42) + rnd.uniform(-0.5, 2)
        r = min(r, (base - 1) / 1.8)  # o topo da bolha não pode sair da imagem
        circles.append((cx, base - r * 0.8, r))

    def inside(x: float, y: float) -> float | None:
        """Distância normalizada ao centro da bolha mais próxima (None = fora)."""
        if y > base:
            return None
        best = None
        for cx, cy, r in circles:
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 / r
            if d <= 1 and (best is None or d < best[0]):
                best = (d, cy, r)
        return best

    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = img.load()
    for y in range(h):
        for x in range(w):
            hit = inside(x + 0.5, y + 0.5)
            if not hit:
                continue
            # contorno: algum vizinho fora
            edge = any(inside(x + 0.5 + dx, y + 0.5 + dy) is None for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if edge:
                px[x, y] = OUTLINE
                continue
            d, cy, r = hit
            rel = (y + 0.5 - (cy - r)) / (base - (cy - r) + 1e-6)  # 0 = topo da bolha, 1 = base
            if y >= base - 2:
                c = SHADOW
            elif rel < 0.22 and d < 0.8:
                c = SHINE
            elif rel < 0.5:
                c = LIGHT
            elif rel < 0.8:
                c = MID
            else:
                c = SHADOW
            px[x, y] = c
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for i, (w, h, n, seed) in enumerate(VARIANTES, start=1):
        path = OUT / f"nuvem-{i}.png"
        nuvem(w, h, n, seed).save(path)
        print("salvo", path)


if __name__ == "__main__":
    main()

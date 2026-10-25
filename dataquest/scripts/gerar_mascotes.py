"""
Gera os mascotes da Loja do Mercador em pixel art (arte original, desenhada aqui em grades 16×16).

Saída 32×32: o desenho 16×16 passa por Scale2x (diagonais arredondadas), ganha luz/sombra no corpo e
detalhes à mão (brilho nos olhos, listras, penas…). O CSS usa image-rendering: pixelated.
  public/assets/pets/gato.png, coruja.png, slime.png, dragao.png

Uso:  python scripts/gerar_mascotes.py
"""
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "public" / "assets" / "pets"

K = (20, 16, 24, 255)  # contorno comum a todos

PETS = {
    # Gato laranja sentado, de frente
    "gato": (
        {"k": K, "o": (232, 140, 48, 255), "d": (178, 92, 30, 255), "w": (250, 236, 214, 255),
         "g": (120, 214, 96, 255), "p": (240, 128, 150, 255)},
        [
            "................",
            "..k.........k...",
            ".kok.......kok..",
            ".kook.....kook..",
            ".koookkkkkoook..",
            ".kooooooooooook.",
            ".kokgkoooookgkok",
            ".kokkkoooookkkok",
            ".kooooowpwoooook",
            "..kooowwwwwoook.",
            "...kkoooooookk..",
            "...kodoooooodok.",
            "..kooddoooddook.",
            "..koowwoooowwook",
            "..kkkkkkkkkkkkk.",
            "................",
        ],
    ),
    # Coruja marrom com olhos grandes
    "coruja": (
        {"k": K, "b": (140, 96, 58, 255), "d": (96, 62, 36, 255), "c": (226, 200, 150, 255),
         "y": (255, 214, 80, 255), "w": (250, 246, 236, 255), "a": (240, 150, 50, 255)},
        [
            "................",
            "..kk........kk..",
            "..kbk......kbk..",
            "..kbbkkkkkkbbk..",
            ".kbbbbbbbbbbbbk.",
            ".kbwwwbbbbwwwbk.",
            ".kbwykwbbwykwbk.",
            ".kbwwwbaabwwwbk.",
            ".kdbbbbaabbbbdk.",
            ".kdbccccccccbdk.",
            ".kddcdccccdcddk.",
            ".kddccccccccddk.",
            "..kdcdccccdcdk..",
            "...kccccccccck..",
            "...kakk..kkak...",
            "................",
        ],
    ),
    # Slime verde, gota sorridente
    "slime": (
        {"k": K, "g": (96, 200, 110, 255), "l": (160, 238, 160, 255), "d": (52, 140, 70, 255),
         "w": (250, 255, 250, 255)},
        [
            "................",
            "................",
            "......kkkk......",
            ".....kllggk.....",
            "....klwggggk....",
            "...klwgggggdk...",
            "...kggggggggk...",
            "..kggkggggkggk..",
            "..kggkggggkggk..",
            ".kggggggggggggk.",
            ".kgggkggggkgggk.",
            ".kggggkkkkggggk.",
            ".kdggggggggggdk.",
            ".kddddddddddddk.",
            "..kkkkkkkkkkkk..",
            "................",
        ],
    ),
    # Dragãozinho roxo com asinhas
    "dragao": (
        {"k": K, "p": (150, 92, 214, 255), "d": (98, 56, 156, 255), "b": (236, 196, 120, 255),
         "w": (250, 246, 236, 255), "r": (240, 84, 84, 255), "y": (255, 220, 90, 255)},
        [
            "................",
            "....k....k......",
            "...kyk..kyk.....",
            "...kpkkkkpk.....",
            "..kppppppppk....",
            "..kpwkpppwkpk...",
            "..kppppppppppk..",
            "kk.kpprrppppk...",
            "kdk.kkppppkk.kk.",
            "kddkpbbbbbppkdk.",
            ".kddpbbbbbpkddk.",
            "..kkpbbbbbpkkk..",
            "...kppbbbppk.kk.",
            "...kppkkkppk.kpk",
            "...kkk...kkkkk..",
            "................",
        ],
    ),
}


# Cores de "corpo" de cada mascote: só elas ganham luz e sombra (olhos, boca e contorno ficam como estão)
BODY = {"gato": "odw", "coruja": "bdc", "slime": "gld", "dragao": "pdb"}


def desenhar_16(paleta: dict, grade: list[str]) -> Image.Image:
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    for y, linha in enumerate(grade):
        for x, ch in enumerate(linha.ljust(16, ".")[:16]):
            if ch != ".":
                img.putpixel((x, y), paleta[ch])
    return img


def scale2x(img: Image.Image) -> Image.Image:
    """EPX/Scale2x: dobra o tamanho arredondando as diagonais, sem borrar (clássico de emulador)."""
    w, h = img.size
    src = img.load()
    out = Image.new("RGBA", (w * 2, h * 2))
    dst = out.load()
    get = lambda x, y: src[min(max(x, 0), w - 1), min(max(y, 0), h - 1)]
    for y in range(h):
        for x in range(w):
            p = src[x, y]
            a, b, c, d = get(x, y - 1), get(x + 1, y), get(x - 1, y), get(x, y + 1)
            e0 = a if (c == a and c != d and a != b) else p
            e1 = b if (a == b and a != c and b != d) else p
            e2 = c if (d == c and d != b and c != a) else p
            e3 = d if (b == d and b != a and d != c) else p
            dst[2 * x, 2 * y], dst[2 * x + 1, 2 * y], dst[2 * x, 2 * y + 1], dst[2 * x + 1, 2 * y + 1] = e0, e1, e2, e3
    return out


def tom(c, f):
    """Clareia (f > 1) ou escurece (f < 1) mantendo o alfa."""
    return tuple(min(255, int(v * f)) for v in c[:3]) + (c[3],)


def volume(img: Image.Image, corpo: set) -> Image.Image:
    """Luz vinda de cima à esquerda: borda de cima mais clara, borda de baixo/direita mais escura."""
    w, h = img.size
    src = img.copy().load()
    dst = img.load()
    for y in range(h):
        for x in range(w):
            c = src[x, y]
            if c[3] == 0 or c[:3] not in corpo:
                continue
            def borda(dx, dy):
                xx, yy = x + dx, y + dy
                if not (0 <= xx < w and 0 <= yy < h): return True
                n = src[xx, yy]
                return n[3] == 0 or n[:3] == K[:3]
            if borda(0, -1) or borda(-1, 0):
                dst[x, y] = tom(c, 1.22)
            elif borda(0, 1) or borda(1, 0) or borda(0, 2):
                dst[x, y] = tom(c, 0.78)
    return img


def detalhes(nome: str, img: Image.Image, paleta: dict) -> None:
    """Toques à mão no 32×32: brilho nos olhos, listras, penas, reflexo, faísca."""
    px = img.load()
    def put(pts, cor):
        for x, y in pts:
            if px[x, y][3]:
                px[x, y] = cor
    branco = (255, 255, 255, 255)
    if nome == "gato":
        put([(9, 13), (25, 13)], branco)                               # brilho nos olhos
        put([(13, 9), (15, 9), (17, 9), (13, 10), (17, 10)], tom(paleta["o"], 0.72))  # listras na testa
        put([(5, 22), (6, 23), (25, 22), (24, 23)], tom(paleta["o"], 0.72))           # listras nas patas
    elif nome == "coruja":
        put([(7, 12), (23, 12)], branco)
        for y in (20, 23, 26):                                        # penas do peito em "v"
            put([(11, y), (12, y + 1), (19, y), (18, y + 1), (15, y + 1), (16, y + 1)], tom(paleta["c"], 0.8))
    elif nome == "slime":
        put([(9, 9), (10, 9), (9, 10), (11, 8)], branco)               # reflexo de gelatina
        put([(9, 16), (21, 16)], branco)
        put([(7, 20), (24, 20)], (255, 150, 170, 255))                # bochechas
    elif nome == "dragao":
        put([(7, 11), (19, 11)], branco)
        put([(6, 3), (18, 3)], (255, 245, 180, 255))                   # pontinha brilhante dos chifres
        put([(12, 19), (14, 21), (16, 23)], tom(paleta["b"], 0.8))     # escamas da barriga


def desenhar(nome: str, paleta: dict, grade: list[str]) -> Image.Image:
    img = scale2x(desenhar_16(paleta, grade))
    corpo = {paleta[ch][:3] for ch in BODY.get(nome, "") if ch in paleta}
    volume(img, corpo)
    detalhes(nome, img, paleta)
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for nome, (paleta, grade) in PETS.items():
        desenhar(nome, paleta, grade).save(OUT / f"{nome}.png")
        print("ok", nome)


if __name__ == "__main__":
    main()

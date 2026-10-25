"""
Gera os mascotes da Loja do Mercador em pixel art (arte original, desenhada aqui em grades 16×16).

Saída (32×32, ampliado 2× sem suavizar; o CSS usa image-rendering: pixelated):
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


def desenhar(paleta: dict, grade: list[str]) -> Image.Image:
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    for y, linha in enumerate(grade):
        for x, ch in enumerate(linha.ljust(16, ".")[:16]):
            if ch != ".":
                img.putpixel((x, y), paleta[ch])
    return img.resize((32, 32), Image.NEAREST)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for nome, (paleta, grade) in PETS.items():
        desenhar(paleta, grade).save(OUT / f"{nome}.png")
        print("ok", nome)


if __name__ == "__main__":
    main()

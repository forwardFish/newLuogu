from __future__ import annotations

import json
import warnings
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageChops, ImageDraw, ImageStat

warnings.filterwarnings("ignore", category=DeprecationWarning)

capture_path = Path("docs/auto-execute/results/visual-capture.json")
out_root = Path("docs/auto-execute/screenshots/blocks")
out_root.mkdir(parents=True, exist_ok=True)


Block = tuple[str, tuple[int, int, int, int]]


PAGE_BLOCKS: dict[str, list[Block]] = {
    "home": [
        ("nav", (0, 0, 1024, 78)),
        ("hero-left", (40, 78, 450, 460)),
        ("hero-card", (450, 78, 984, 460)),
        ("features", (40, 460, 984, 640)),
        ("flow", (40, 640, 984, 820)),
        ("path", (40, 820, 984, 1030)),
        ("students", (40, 1030, 984, 1188)),
        ("report", (40, 1188, 984, 1426)),
        ("footer", (0, 1426, 1024, 1536)),
    ],
    "analysis-result": [
        ("topbar", (0, 0, 1448, 74)),
        ("title-hero", (0, 74, 1448, 222)),
        ("summary", (44, 222, 1404, 386)),
        ("score-cards", (44, 386, 1404, 570)),
        ("short-board", (44, 570, 700, 866)),
        ("lock-board", (700, 570, 1404, 866)),
        ("unlock-row", (44, 866, 1404, 1030)),
        ("note", (0, 1030, 1448, 1086)),
    ],
    "today": [
        ("title-hero", (260, 0, 1320, 150)),
        ("stats", (260, 150, 1130, 260)),
        ("rule-card", (260, 260, 1148, 430)),
        ("task-1", (260, 430, 1148, 615)),
        ("task-2", (260, 615, 1148, 800)),
        ("task-3", (260, 800, 1148, 985)),
        ("side-structure", (1148, 200, 1448, 548)),
        ("side-progress", (1148, 548, 1448, 730)),
        ("side-ad", (1148, 730, 1448, 1086)),
    ],
    "payment": [
        ("title-hero", (260, 0, 1448, 230)),
        ("price-left", (260, 230, 750, 830)),
        ("price-right", (750, 230, 1360, 830)),
        ("value-title", (260, 830, 1360, 910)),
        ("value-strip", (260, 910, 1360, 1086)),
    ],
    "report": [
        ("title-hero", (260, 0, 1448, 185)),
        ("stats", (260, 185, 1448, 330)),
        ("conclusion", (260, 330, 1448, 555)),
        ("next-plan", (260, 555, 1448, 780)),
        ("reason", (260, 780, 1448, 965)),
        ("actions", (260, 965, 1448, 1086)),
    ],
    "training-result": [
        ("title-hero", (260, 0, 1448, 190)),
        ("main-form", (260, 190, 1040, 760)),
        ("sink-card", (1040, 190, 1448, 560)),
        ("explain-side", (1040, 560, 1448, 900)),
        ("lower", (260, 760, 1448, 1086)),
    ],
    "dashboard": [
        ("title", (260, 0, 1448, 150)),
        ("metrics", (260, 150, 1448, 330)),
        ("stage-path", (260, 330, 1448, 560)),
        ("panels-left", (260, 560, 640, 930)),
        ("panels-center", (640, 560, 1010, 930)),
        ("panels-right", (1010, 560, 1448, 930)),
        ("blocker", (260, 930, 1448, 1086)),
    ],
    "login": [
        ("brand", (0, 0, 420, 120)),
        ("left-copy", (0, 120, 600, 780)),
        ("form", (600, 120, 1400, 780)),
        ("bottom-status", (80, 780, 1404, 1060)),
    ],
}


def default_blocks(width: int, height: int) -> list[Block]:
    blocks: list[Block] = []
    rows = 3
    cols = 3
    for row in range(rows):
        for col in range(cols):
            x0 = round(width * col / cols)
            x1 = round(width * (col + 1) / cols)
            y0 = round(height * row / rows)
            y1 = round(height * (row + 1) / rows)
            blocks.append((f"r{row + 1}c{col + 1}", (x0, y0, x1, y1)))
    return blocks


def clamp_box(box: tuple[int, int, int, int], width: int, height: int) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = box
    x0 = max(0, min(width, x0))
    x1 = max(0, min(width, x1))
    y0 = max(0, min(height, y0))
    y1 = max(0, min(height, y1))
    if x1 <= x0:
        x1 = min(width, x0 + 1)
    if y1 <= y0:
        y1 = min(height, y0 + 1)
    return x0, y0, x1, y1


def score_block(ref: Image.Image, actual: Image.Image, box: tuple[int, int, int, int]) -> tuple[float, float, Image.Image]:
    ref_crop = ref.crop(box)
    actual_crop = actual.crop(box)
    diff = ImageChops.difference(ref_crop, actual_crop)
    stat = ImageStat.Stat(diff)
    rms = sum(value * value for value in stat.rms) ** 0.5 / (255 * (3 ** 0.5))
    mask = diff.convert("L").point(lambda value: 255 if value > 18 else 0)
    nonzero = sum(1 for value in mask.getdata() if value)
    pixels = diff.width * diff.height
    return (nonzero / pixels if pixels else 0), rms, diff


def save_side_by_side(ref: Image.Image, actual: Image.Image, box: tuple[int, int, int, int], path: Path) -> None:
    ref_crop = ref.crop(box)
    actual_crop = actual.crop(box)
    side = Image.new("RGB", (ref_crop.width * 2 + 18, ref_crop.height), "white")
    side.paste(ref_crop, (0, 0))
    side.paste(actual_crop, (ref_crop.width + 18, 0))
    draw = ImageDraw.Draw(side)
    draw.rectangle((ref_crop.width + 7, 0, ref_crop.width + 10, ref_crop.height), fill=(235, 238, 245))
    side.save(path, quality=88)


def iter_blocks(page_id: str, width: int, height: int) -> Iterable[Block]:
    yield from PAGE_BLOCKS.get(page_id, default_blocks(width, height))


capture = json.loads(capture_path.read_text(encoding="utf-8"))
results = []

for item in capture["pages"]:
    reference = item.get("reference")
    screenshot = item.get("screenshot")
    if not reference or not screenshot:
        continue
    ref_path = Path(reference)
    actual_path = Path(screenshot)
    if not ref_path.exists() or not actual_path.exists():
        continue

    ref = Image.open(ref_path).convert("RGB")
    actual = Image.open(actual_path).convert("RGB")
    actual_for_diff = actual.resize(ref.size, Image.Resampling.LANCZOS) if actual.size != ref.size else actual
    page_dir = out_root / item["id"]
    page_dir.mkdir(parents=True, exist_ok=True)

    block_results = []
    for name, raw_box in iter_blocks(item["id"], ref.width, ref.height):
        box = clamp_box(raw_box, ref.width, ref.height)
        ratio, rms, diff = score_block(ref, actual_for_diff, box)
        side_path = page_dir / f"{name}.side-by-side.jpg"
        diff_path = page_dir / f"{name}.diff.png"
        save_side_by_side(ref, actual_for_diff, box, side_path)
        diff.save(diff_path)
        block_results.append(
            {
                "name": name,
                "box": list(box),
                "diffRatio": round(ratio, 6),
                "rms": round(rms, 6),
                "sideBySide": str(side_path).replace("\\", "/"),
                "diff": str(diff_path).replace("\\", "/"),
            }
        )

    block_results.sort(key=lambda block: (block["diffRatio"], block["rms"]), reverse=True)
    results.append(
        {
            "id": item["id"],
            "path": item.get("path"),
            "reference": reference,
            "screenshot": screenshot,
            "blocks": block_results,
        }
    )

all_blocks = [
    {
        "page": page["id"],
        "path": page["path"],
        **block,
    }
    for page in results
    for block in page["blocks"]
]
all_blocks.sort(key=lambda block: (block["diffRatio"], block["rms"]), reverse=True)

summary = {
    "pages": len(results),
    "blocks": len(all_blocks),
    "topBlocks": all_blocks[:40],
    "results": results,
}

out_path = Path("docs/auto-execute/results/visual-block-compare.json")
out_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({"pages": summary["pages"], "blocks": summary["blocks"], "topBlocks": summary["topBlocks"][:12]}, ensure_ascii=False, indent=2))

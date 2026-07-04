from __future__ import annotations

import json
import warnings
from pathlib import Path
from PIL import Image, ImageChops, ImageStat, ImageDraw

warnings.filterwarnings("ignore", category=DeprecationWarning)

capture_path = Path("docs/auto-execute/results/visual-capture.json")
out_dir = Path("docs/auto-execute/screenshots/compare")
out_dir.mkdir(parents=True, exist_ok=True)

capture = json.loads(capture_path.read_text(encoding="utf-8"))
results = []

for item in capture["pages"]:
    reference = item.get("reference")
    screenshot = item.get("screenshot")
    if not reference or not screenshot:
        results.append({**item, "compareStatus": "NO_REFERENCE" if not reference else "NO_SCREENSHOT"})
        continue

    ref_path = Path(reference)
    actual_path = Path(screenshot)
    if not ref_path.exists() or not actual_path.exists():
        results.append({**item, "compareStatus": "MISSING_FILE"})
        continue

    ref = Image.open(ref_path).convert("RGB")
    actual = Image.open(actual_path).convert("RGB")
    if actual.size != ref.size:
        actual_for_diff = actual.resize(ref.size, Image.Resampling.LANCZOS)
    else:
        actual_for_diff = actual

    diff = ImageChops.difference(ref, actual_for_diff)
    stat = ImageStat.Stat(diff)
    rms = sum(v * v for v in stat.rms) ** 0.5 / (255 * (3 ** 0.5))
    nonzero = 0
    pixels = diff.width * diff.height
    # Count visibly different pixels rather than any antialiasing-level drift.
    for value in diff.convert("L").point(lambda x: 255 if x > 18 else 0).getdata():
        if value:
            nonzero += 1
    diff_ratio = nonzero / pixels if pixels else 0

    diff_path = out_dir / f"{item['id']}.diff.png"
    side_path = out_dir / f"{item['id']}.side-by-side.jpg"
    diff.save(diff_path)

    side = Image.new("RGB", (ref.width * 2 + 24, ref.height), "white")
    side.paste(ref, (0, 0))
    side.paste(actual_for_diff, (ref.width + 24, 0))
    draw = ImageDraw.Draw(side)
    draw.rectangle((ref.width + 10, 0, ref.width + 14, ref.height), fill=(235, 238, 245))
    side.save(side_path, quality=88)

    status = "PASS" if diff_ratio < 0.02 and rms < 0.05 else "VISUAL_DIFF"
    results.append(
        {
            **item,
            "compareStatus": status,
            "referenceSize": list(ref.size),
            "actualSize": list(actual.size),
            "resizedForCompare": actual.size != ref.size,
            "diffRatio": round(diff_ratio, 6),
            "rms": round(rms, 6),
            "diff": str(diff_path).replace("\\", "/"),
            "sideBySide": str(side_path).replace("\\", "/"),
        }
    )

summary = {
    "count": len(results),
    "withReference": sum(1 for r in results if r.get("reference")),
    "visualDiff": sum(1 for r in results if r.get("compareStatus") == "VISUAL_DIFF"),
    "pass": sum(1 for r in results if r.get("compareStatus") == "PASS"),
    "noReference": sum(1 for r in results if r.get("compareStatus") == "NO_REFERENCE"),
    "results": results,
}

Path("docs/auto-execute/results/visual-compare.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({k: summary[k] for k in ["count", "withReference", "pass", "visualDiff", "noReference"]}, ensure_ascii=False, indent=2))

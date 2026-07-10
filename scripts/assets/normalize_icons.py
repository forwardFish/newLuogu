"""Normalize the UI icon source set into fixed 160x160 RGBA runtime assets.

The command is intentionally dry-run by default. It writes a manifest and a
temporary output directory; pass --replace-runtime only after inspecting the
manifest to promote the generated PNGs into public/icons.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

from PIL import Image


ICON_RE = re.compile(r"/icons/(icon-\d+\.png)")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def alpha_bbox(image: Image.Image, threshold: int):
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value >= threshold else 0)
    return mask.getbbox()


def describe(path: Path, source: Path | None = None, threshold: int = 1):
    with Image.open(path) as opened:
        image = opened.convert("RGBA")
        bbox = alpha_bbox(image, threshold)
        width, height = image.size
    item = {
        "file": path.name,
        "sha256": sha256(path),
        "bytes": path.stat().st_size,
        "width": width,
        "height": height,
        "mode": "RGBA",
        "alphaBBox": None if bbox is None else {"x": bbox[0], "y": bbox[1], "w": bbox[2] - bbox[0], "h": bbox[3] - bbox[1]},
    }
    if bbox is not None:
        item["margins"] = {
            "left": bbox[0],
            "top": bbox[1],
            "right": width - bbox[2],
            "bottom": height - bbox[3],
        }
    else:
        item["margins"] = None
    if source is not None:
        item["sourceFile"] = source.as_posix()
    return item


def read_references(root: Path, files: list[Path]) -> set[str]:
    references: set[str] = set()
    for file in files:
        try:
            text = file.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            text = file.read_text(encoding="utf-8-sig")
        references.update(ICON_RE.findall(text))
    return references


def normalize(source: Path, destination: Path, canvas: int, padding: int, threshold: int):
    destination.mkdir(parents=True, exist_ok=True)
    manifest = []
    for input_path in sorted(source.glob("icon-*.png")):
        with Image.open(input_path) as opened:
            source_image = opened.convert("RGBA")
            bbox = alpha_bbox(source_image, threshold)
            if bbox is None:
                output = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
            else:
                cropped = source_image.crop(bbox)
                max_edge = max(1, canvas - padding * 2)
                scale = min(1.0, max_edge / max(cropped.size))
                size = tuple(max(1, round(value * scale)) for value in cropped.size)
                if size != cropped.size:
                    cropped = cropped.resize(size, Image.Resampling.LANCZOS)
                output = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
                output.paste(cropped, ((canvas - cropped.width) // 2, (canvas - cropped.height) // 2), cropped)
            output_path = destination / input_path.name
            output.save(output_path, format="PNG", optimize=True)
        item = describe(output_path, input_path, threshold)
        with Image.open(input_path) as original:
            item["sourceBytes"] = input_path.stat().st_size
            item["sourceWidth"], item["sourceHeight"] = original.size
        manifest.append(item)
    return manifest


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--dest", type=Path, required=True)
    parser.add_argument("--runtime", type=Path, default=Path("public/icons"))
    parser.add_argument("--canvas", type=int, default=160)
    parser.add_argument("--padding", type=int, default=2)
    parser.add_argument("--alpha-threshold", type=int, default=1)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--reference-file", action="append", type=Path, default=[])
    parser.add_argument("--replace-runtime", action="store_true")
    args = parser.parse_args()

    source = args.source.resolve()
    destination = args.dest.resolve()
    runtime = args.runtime.resolve()
    references = read_references(source.parent.parent.parent, args.reference_file)
    source_names = {path.name for path in source.glob("icon-*.png")}
    missing = sorted(references - source_names)
    if missing:
        raise SystemExit(f"Missing icon references: {', '.join(missing)}")
    if args.canvas <= args.padding * 2:
        raise SystemExit("canvas must be greater than twice the padding")

    manifest = normalize(source, destination, args.canvas, args.padding, args.alpha_threshold)
    if len(manifest) != len(source_names):
        raise SystemExit("output icon count does not match source icon count")
    payload = {
        "source": source.as_posix(),
        "destination": destination.as_posix(),
        "runtime": runtime.as_posix(),
        "canvas": args.canvas,
        "padding": args.padding,
        "alphaThreshold": args.alpha_threshold,
        "count": len(manifest),
        "referencedIcons": sorted(references),
        "missingReferences": missing,
        "icons": manifest,
    }
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    args.manifest.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if args.replace_runtime:
        if runtime == source or not runtime.as_posix().endswith("public/icons"):
            raise SystemExit("refusing to replace an unexpected runtime directory")
        runtime.mkdir(parents=True, exist_ok=True)
        for output_path in destination.glob("icon-*.png"):
            shutil.copy2(output_path, runtime / output_path.name)
    print(json.dumps({"count": len(manifest), "destination": destination.as_posix(), "replacedRuntime": args.replace_runtime}, ensure_ascii=False))


if __name__ == "__main__":
    main()

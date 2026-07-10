from __future__ import annotations

import json
from pathlib import Path


def load_json(path: str):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


capture = load_json("docs/auto-execute/results/visual-capture.json")
compare = load_json("docs/auto-execute/results/visual-compare.json")
api = load_json("docs/auto-execute/results/api-smoke.json")
icons = load_json("docs/auto-execute/results/icon-normalized-manifest.json")
block_compare_path = Path("docs/auto-execute/results/visual-block-compare.json")
block_compare = load_json(str(block_compare_path)) if block_compare_path.exists() else {}
api_results = api.get("results", []) if isinstance(api, dict) else api

summary = {
    "visualCapture": {
        "baseUrl": capture.get("baseUrl"),
        "count": len(capture.get("pages", [])),
        "failures": sum(1 for page in capture.get("pages", []) if not page.get("ok")),
    },
    "visualCompare": {key: compare.get(key) for key in ["count", "withReference", "pass", "visualDiff", "noReference"]},
    "visualBlockCompare": {
        "pages": block_compare.get("pages", 0),
        "blocks": block_compare.get("blocks", 0),
        "topBlocks": block_compare.get("topBlocks", [])[:10],
    },
    "apiSmoke": {
        "count": len(api_results),
        "failures": sum(1 for result in api_results if not result.get("ok")),
    },
    "icons": {key: icons.get(key) for key in ["count", "canvas", "padding", "alphaThreshold", "runtime"]},
}

out = Path("docs/auto-execute/results/current-summary.json")
out.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False, indent=2))

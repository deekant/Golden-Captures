#!/usr/bin/env python3
"""Import JPG/PNG from a folder into images/gallery as optimized WebP."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SRC = Path.home() / "Downloads" / "Gallery"
OUT = ROOT / "images" / "gallery"
MAX_W = 1280
QUALITY = 82
START_NUM = 7


def next_event_number() -> int:
    existing = []
    for path in OUT.glob("event-*.webp"):
        stem = path.stem
        if stem.startswith("event-") and stem[6:].isdigit():
            existing.append(int(stem[6:]))
    return max(existing, default=START_NUM - 1) + 1


def convert(src: Path, dest: Path) -> None:
    img = Image.open(src)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    w, h = img.size
    if w > MAX_W:
        new_h = max(1, round(h * MAX_W / w))
        img = img.resize((MAX_W, new_h), Image.Resampling.LANCZOS)
    img.save(dest, "WEBP", quality=QUALITY, method=6)


def main() -> None:
    src_dir = DEFAULT_SRC
    if not src_dir.is_dir():
        raise SystemExit(f"Source folder not found: {src_dir}")

    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(
        p for p in src_dir.iterdir()
        if p.suffix.upper() in (".JPG", ".JPEG", ".PNG", ".WEBP")
    )
    num = next_event_number()
    for src in files:
        dest = OUT / f"event-{num}.webp"
        convert(src, dest)
        print(f"{src.name} -> {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KiB)")
        num += 1


if __name__ == "__main__":
    main()

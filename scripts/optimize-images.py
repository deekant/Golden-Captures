#!/usr/bin/env python3
"""Resize and recompress WebP assets for production."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "images"

JOBS = [
    ("hero/*.webp", 1280, 82),
    ("deliverables/prints.webp", 840, 80),
    ("deliverables/360-clip.webp", 810, 80),
    ("deliverables/audio-guestbook.webp", 810, 80),
    ("gallery/*.webp", 1280, 82),
    ("pricing/standard.webp", 810, 80),
    ("pricing/360.webp", 810, 80),
    ("pricing/retro.webp", 810, 80),
    ("events/wedding.webp", 1280, 82),
    ("testimonials/*.webp", 986, 82),
]


def optimize(path: Path, max_width: int, quality: int) -> None:
    before = path.stat().st_size
    img = Image.open(path)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    w, h = img.size
    if w > max_width:
        new_h = max(1, round(h * max_width / w))
        img = img.resize((max_width, new_h), Image.Resampling.LANCZOS)
    img.save(path, "WEBP", quality=quality, method=6)
    after = path.stat().st_size
    print(f"{path.name}: {w}x{h} -> {img.size[0]}x{img.size[1]}, {before // 1024}KiB -> {after // 1024}KiB")


def main() -> None:
    for pattern, max_w, quality in JOBS:
        for path in sorted(ROOT.glob(pattern)):
            optimize(path, max_w, quality)


if __name__ == "__main__":
    main()

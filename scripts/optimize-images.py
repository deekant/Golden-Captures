#!/usr/bin/env python3
"""Resize WebP assets and generate responsive width variants."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "images"

# (glob, default max width, variant widths, quality)
JOBS = [
    ("hero/hero-0*.webp", 960, (480, 960), 78),
    ("deliverables/prints.webp", 800, (400, 800), 76),
    ("deliverables/360-clip.webp", 760, (380, 760), 76),
    ("deliverables/audio-guestbook.webp", 640, (400, 640), 76),
    ("gallery/*.webp", 1280, (), 82),
    ("pricing/standard.webp", 810, (), 80),
    ("pricing/360.webp", 810, (), 80),
    ("pricing/retro.webp", 810, (), 80),
    ("events/wedding.webp", 1280, (), 82),
    ("testimonials/*.webp", 986, (), 82),
]


def is_variant(path: Path) -> bool:
    """True for files like hero-01-480.webp, not hero-01.webp."""
    stem = path.stem
    parts = stem.rsplit("-", 1)
    return len(parts) == 2 and parts[1].isdigit() and len(parts[1]) >= 3


def resize_to_width(img: Image.Image, max_width: int) -> Image.Image:
    w, h = img.size
    if w <= max_width:
        return img
    new_h = max(1, round(h * max_width / w))
    return img.resize((max_width, new_h), Image.Resampling.LANCZOS)


def save_webp(img: Image.Image, path: Path, quality: int) -> None:
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    img.save(path, "WEBP", quality=quality, method=6)


def process(path: Path, default_w: int, variants: tuple[int, ...], quality: int) -> None:
    if is_variant(path):
        return

    img = Image.open(path)
    before = path.stat().st_size
    default_img = resize_to_width(img, default_w)
    save_webp(default_img, path, quality)
    after_default = path.stat().st_size
    print(
        f"{path.relative_to(ROOT.parent)}: default {default_img.size[0]}x{default_img.size[1]}, "
        f"{before // 1024}KiB -> {after_default // 1024}KiB"
    )

    stem = path.stem
    for variant_w in variants:
        if variant_w == default_w:
            continue
        variant_img = resize_to_width(img, variant_w)
        variant_path = path.parent / f"{stem}-{variant_w}.webp"
        save_webp(variant_img, variant_path, quality)
        print(
            f"  {variant_path.name}: {variant_img.size[0]}x{variant_img.size[1]}, "
            f"{variant_path.stat().st_size // 1024}KiB"
        )


def main() -> None:
    for pattern, default_w, variants, quality in JOBS:
        for path in sorted(ROOT.glob(pattern)):
            process(path, default_w, variants, quality)


if __name__ == "__main__":
    main()

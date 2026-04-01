"""
Run inference: JSON per image + annotated images (Ultralytics save).

From road-damage-detection folder:
  python scripts/predict.py --weights runs/detect/road_damage/weights/best.pt --source path/to/img.jpg --out outputs
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from road_detection.inference import RoadDamageDetector  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Predict road damage on images")
    parser.add_argument("--weights", type=Path, required=True, help="best.pt or last.pt")
    parser.add_argument("--source", type=Path, required=True, help="Image file or folder")
    parser.add_argument("--out", type=Path, default=Path("outputs/predict"))
    parser.add_argument("--conf", type=float, default=0.25)
    parser.add_argument("--iou", type=float, default=0.45)
    args = parser.parse_args()

    detector = RoadDamageDetector(args.weights, conf=args.conf, iou=args.iou)

    if args.source.is_file():
        sources = [args.source]
    elif args.source.is_dir():
        exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
        sources = sorted(p for p in args.source.iterdir() if p.suffix.lower() in exts)
    else:
        raise SystemExit(f"Source not found: {args.source}")

    args.out.mkdir(parents=True, exist_ok=True)

    for img in sources:
        dets = detector.predict(img)
        payload = {
            "image": str(img.resolve()),
            "detections": [
                {
                    "class_id": d.class_id,
                    "class_name": d.class_name,
                    "confidence": round(d.confidence, 4),
                    "box_xyxy": [round(x, 2) for x in d.box_xyxy],
                }
                for d in dets
            ],
        }
        out_json = args.out / f"{img.stem}.json"
        out_json.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"{img.name}: {len(dets)} detection(s) -> {out_json.name}")

    from ultralytics import YOLO

    model = YOLO(str(args.weights))
    model.predict(
        source=str(args.source),
        conf=args.conf,
        iou=args.iou,
        project=str(args.out),
        name="viz",
        save=True,
    )
    print(f"Annotated images: {args.out / 'viz'}")


if __name__ == "__main__":
    main()

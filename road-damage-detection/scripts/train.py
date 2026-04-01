"""
Train YOLOv8 on a YOLO-format dataset.

From road-damage-detection folder:
  pip install -r requirements.txt
  copy configs\\dataset.example.yaml configs\\dataset.yaml
  # edit dataset.yaml path + class names
  python scripts/train.py --data configs/dataset.yaml --epochs 100 --model n
"""

from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Train road-damage YOLO model")
    parser.add_argument(
        "--data",
        type=Path,
        default=Path("configs/dataset.yaml"),
        help="Dataset YAML (see configs/dataset.example.yaml)",
    )
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument(
        "--model",
        type=str,
        default="n",
        choices=("n", "s", "m", "l", "x"),
        help="YOLOv8 size",
    )
    parser.add_argument("--project", type=str, default="runs/detect")
    parser.add_argument("--name", type=str, default="road_damage")
    args = parser.parse_args()

    if not args.data.is_file():
        raise SystemExit(f"Dataset config not found: {args.data.resolve()}")

    from ultralytics import YOLO

    weights = f"yolov8{args.model}.pt"
    model = YOLO(weights)
    model.train(
        data=str(args.data),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=args.project,
        name=args.name,
    )
    best = Path(args.project) / args.name / "weights" / "best.pt"
    print("Done. Best weights:", best.resolve())


if __name__ == "__main__":
    main()

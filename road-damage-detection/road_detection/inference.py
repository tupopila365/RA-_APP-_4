"""Load trained YOLO weights and run detection on images (offline)."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np


@dataclass
class Detection:
    class_id: int
    class_name: str
    confidence: float
    box_xyxy: tuple[float, float, float, float]


class RoadDamageDetector:
    """Thin wrapper around Ultralytics YOLO for local inference."""

    def __init__(self, weights_path: str | Path, conf: float = 0.25, iou: float = 0.45) -> None:
        self._weights = Path(weights_path)
        self._conf = conf
        self._iou = iou
        self._model: Any = None

    def _ensure_model(self) -> None:
        if self._model is None:
            from ultralytics import YOLO

            if not self._weights.is_file():
                raise FileNotFoundError(f"Weights not found: {self._weights.resolve()}")
            self._model = YOLO(str(self._weights))

    def _boxes_to_list(self, r0: Any) -> list[Detection]:
        names = r0.names or {}
        out: list[Detection] = []
        if r0.boxes is None or len(r0.boxes) == 0:
            return out
        xyxy = r0.boxes.xyxy.cpu().numpy()
        confs = r0.boxes.conf.cpu().numpy()
        cls_ids = r0.boxes.cls.cpu().numpy().astype(int)
        for i in range(len(xyxy)):
            cid = int(cls_ids[i])
            name = str(names.get(cid, str(cid)))
            box = tuple(float(x) for x in xyxy[i].tolist())
            out.append(
                Detection(
                    class_id=cid,
                    class_name=name,
                    confidence=float(confs[i]),
                    box_xyxy=box,
                )
            )
        return out

    def predict(self, image_path: str | Path) -> list[Detection]:
        self._ensure_model()
        path = Path(image_path)
        if not path.is_file():
            raise FileNotFoundError(f"Image not found: {path.resolve()}")
        results = self._model.predict(
            source=str(path),
            conf=self._conf,
            iou=self._iou,
            verbose=False,
        )
        if not results:
            return []
        return self._boxes_to_list(results[0])

    def predict_numpy(self, bgr: np.ndarray) -> list[Detection]:
        self._ensure_model()
        results = self._model.predict(
            source=bgr,
            conf=self._conf,
            iou=self._iou,
            verbose=False,
        )
        if not results:
            return []
        return self._boxes_to_list(results[0])

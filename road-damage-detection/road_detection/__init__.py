"""Standalone road damage detection (YOLO). No HTTP or mobile app wiring."""

from road_detection.inference import Detection, RoadDamageDetector

__all__ = ["RoadDamageDetector", "Detection"]

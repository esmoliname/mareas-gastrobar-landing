"""Normaliza el tamaño físico de los USDZ externos: reescribe metersPerUnit
del stage para que el bbox real coincida con sizeM del catálogo (la fuente de
verdad son los GLB ya tuneados). Cada archivo se re-empaqueta conservando el
resto de entradas (texturas) del zip."""
import json
import os
import sys
import tempfile
import zipfile
from pathlib import Path

from pxr import Usd, UsdGeom

ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / "public" / "models"

# sizeM objetivo por modelo externo (mismo valor que src/data/models3d.js)
TARGETS = {
    "pizza": 0.35,
    "cocktail": 0.15,
    "antojos": 0.27,
    "burger": 0.12,
    "seafood": 0.4,
    "grill": 0.3,
    "beer": 0.26,
    "dessert": 0.15,
    "fruit": 0.12,
    "lantern": 0.35,
}


def stage_units_bbox(stage):
    """Bbox en unidades de escena (sin mpu)."""
    bbox = UsdGeom.BBoxCache(Usd.TimeCode.Default(), [UsdGeom.Tokens.default_])
    rng = bbox.ComputeWorldBound(stage.GetPseudoRoot()).ComputeAlignedRange()
    if rng.IsEmpty():
        return None
    mn, mx = rng.GetMin(), rng.GetMax()
    return max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2])


def rewrite_mpu(usdz_path, target):
    with zipfile.ZipFile(usdz_path) as zf:
        entries = zf.infolist()
        usd_name = next(
            n for n in zf.namelist()
            if n.endswith(".usd") or n.endswith(".usdc") or n.endswith(".usda")
        )
        usd_bytes = zf.read(usd_name)
        others = {n: zf.read(n) for n in zf.namelist() if n != usd_name}

    suffix = os.path.splitext(usd_name)[1] or ".usd"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tf:
        tf.write(usd_bytes)
        tmp = tf.name
    try:
        stage = Usd.Stage.Open(tmp)
        units = stage_units_bbox(stage)
        if units is None:
            raise RuntimeError("bbox vacío")
        old_mpu = UsdGeom.GetStageMetersPerUnit(stage)
        new_mpu = target / units
        stage.SetMetadata("metersPerUnit", new_mpu)
        stage.GetRootLayer().Save()
        with open(tmp, "rb") as f:
            new_bytes = f.read()
    finally:
        os.unlink(tmp)

    with zipfile.ZipFile(usdz_path, "w", compression=zipfile.ZIP_STORED) as zf:
        for info in entries:
            data = new_bytes if info.filename == usd_name else others[info.filename]
            zf.writestr(info, data)
    return old_mpu, new_mpu, units


def main():
    for key, target in TARGETS.items():
        path = MODELS_DIR / f"{key}.usdz"
        if not path.exists():
            print(f"{key}: MISSING")
            continue
        try:
            old, new, units = rewrite_mpu(path, target)
            print(f"OK  {key}: mpu {old:.6f} -> {new:.6f}  (unidades {units:.4f} -> {target:.3f} m)")
        except Exception as e:  # noqa: BLE001
            print(f"{key}: ERROR {e}")


if __name__ == "__main__":
    main()
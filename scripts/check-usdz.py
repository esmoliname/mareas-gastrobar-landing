"""Verifica el tamaño físico real (bbox en metros) de cada USDZ del catálogo."""
import json
import os
import sys
import zipfile

from pxr import Usd, UsdGeom

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "models")


def usdz_bbox(path):
    """Abre un .usdz (zip con .usd adentro) y devuelve el bbox en metros."""
    import tempfile
    with zipfile.ZipFile(path) as zf:
        usd_name = next(n for n in zf.namelist() if n.endswith(".usd") or n.endswith(".usdc") or n.endswith(".usda"))
        data = zf.read(usd_name)
    suffix = os.path.splitext(usd_name)[1] or ".usd"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tf:
        tf.write(data)
        tmp = tf.name
    try:
        stage = Usd.Stage.Open(tmp)
    finally:
        os.unlink(tmp)
    prim = stage.GetPseudoRoot()
    bbox = UsdGeom.BBoxCache(Usd.TimeCode.Default(), [UsdGeom.Tokens.default_])
    world = bbox.ComputeWorldBound(prim)
    rng = world.ComputeAlignedRange()
    if rng.IsEmpty():
        return None
    mn, mx = rng.GetMin(), rng.GetMax()
    mpu = UsdGeom.GetStageMetersPerUnit(stage)
    return (
        round((mx[0] - mn[0]) * mpu, 4),
        round((mx[1] - mn[1]) * mpu, 4),
        round((mx[2] - mn[2]) * mpu, 4),
    )


def main():
    names = sys.argv[1:] or [
        "pizza", "cocktail", "mojito", "margarita", "pina", "antojos", "burger",
        "alitas", "nachos", "papas", "seafood", "camarones", "ceviche", "grill",
        "beer", "dessert", "fruit", "frutas", "torta", "lantern",
    ]
    out = {}
    for name in names:
        path = os.path.join(MODELS_DIR, f"{name}.usdz")
        if not os.path.exists(path):
            print(f"{name}: MISSING")
            continue
        try:
            dims = usdz_bbox(path)
            out[name] = dims
            size = max(dims)
            print(f"{name}: x={dims[0]:.4f} y={dims[1]:.4f} z={dims[2]:.4f}  max={size:.4f} m ({size*100:.1f} cm)")
        except Exception as e:  # noqa: BLE001
            print(f"{name}: ERROR {e}")
    tmp_dir = os.path.join(os.path.dirname(__file__), "..", "tmp")
    os.makedirs(tmp_dir, exist_ok=True)
    with open(os.path.join(tmp_dir, "usdz-sizes.json"), "w") as f:
        json.dump(out, f, indent=2)


if __name__ == "__main__":
    main()
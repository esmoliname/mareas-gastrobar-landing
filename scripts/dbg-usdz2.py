import os
import sys
import tempfile
import zipfile

from pxr import Usd, UsdGeom


def dump(path):
    zf = zipfile.ZipFile(path)
    n = zf.namelist()[0]
    data = zf.read(n)
    with tempfile.NamedTemporaryFile(suffix=os.path.splitext(n)[1], delete=False) as tf:
        tf.write(data)
        tmp = tf.name
    stage = Usd.Stage.Open(tmp)
    os.unlink(tmp)
    bbox = UsdGeom.BBoxCache(Usd.TimeCode.Default(), [UsdGeom.Tokens.default_])
    all_prims = []
    stack = list(stage.GetPseudoRoot().GetChildren())
    while stack:
        p = stack.pop()
        all_prims.append(p)
        stack.extend(p.GetChildren())
    for p in all_prims:
        if not p.GetTypeName():
            continue
            rng = bbox.ComputeWorldBound(p).ComputeAlignedRange()
            if rng.IsEmpty():
                continue
            mn, mx = rng.GetMin(), rng.GetMax()
            dims = (mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2])
            print(f"{p.GetPath().pathString}: {dims[0]:.4f} x {dims[1]:.4f} x {dims[2]:.4f}")


for name in sys.argv[1:]:
    print(f"=== {name}.usdz ===")
    dump(os.path.join("public", "models", f"{name}.usdz"))
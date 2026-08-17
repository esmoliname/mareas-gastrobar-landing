import os
import sys
import tempfile
import zipfile

from pxr import Gf, Usd, UsdGeom


def dump(path, prim_path):
    zf = zipfile.ZipFile(path)
    n = zf.namelist()[0]
    data = zf.read(n)
    with tempfile.NamedTemporaryFile(suffix=os.path.splitext(n)[1], delete=False) as tf:
        tf.write(data)
        tmp = tf.name
    stage = Usd.Stage.Open(tmp)
    os.unlink(tmp)
    prim = stage.GetPrimAtPath(prim_path)
    print(f"prim: {prim_path} type={prim.GetTypeName()}")
    for attr in prim.GetAttributes():
        print(f"  {attr.GetName()} = {attr.Get()}  (type {attr.GetTypeName()})")
    bbox = UsdGeom.BBoxCache(Usd.TimeCode.Default(), [UsdGeom.Tokens.default_])
    rng = bbox.ComputeWorldBound(prim).ComputeAlignedRange()
    if not rng.IsEmpty():
        mn, mx = rng.GetMin(), rng.GetMax()
        print(f"bbox: x={mx[0]-mn[0]:.4f} y={mx[1]-mn[1]:.4f} z={mx[2]-mn[2]:.4f}")

    all_prims = []
    stack = list(stage.GetPseudoRoot().GetChildren())
    while stack:
        p = stack.pop()
        all_prims.append(p)
        stack.extend(p.GetChildren())
    for p in all_prims:
        if p.GetTypeName() not in ("Cylinder", "Sphere", "Cone", "Cube", "Mesh"):
            continue
        rng = bbox.ComputeWorldBound(p).ComputeAlignedRange()
        if rng.IsEmpty():
            continue
        mn, mx = rng.GetMin(), rng.GetMax()
        dims = (mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2])
        print(f"  {p.GetPath().pathString}: {dims[0]:.4f} x {dims[1]:.4f} x {dims[2]:.4f}")


dump(os.path.join("public", "models", f"{sys.argv[1]}.usdz"), sys.argv[2])
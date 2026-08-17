import os
import sys
import tempfile
import zipfile

from pxr import Gf, Usd, UsdGeom


def dump(path):
    zf = zipfile.ZipFile(path)
    n = zf.namelist()[0]
    data = zf.read(n)
    with tempfile.NamedTemporaryFile(suffix=os.path.splitext(n)[1], delete=False) as tf:
        tf.write(data)
        tmp = tf.name
    stage = Usd.Stage.Open(tmp)
    os.unlink(tmp)

    def walk(prim, indent=0):
        ops = UsdGeom.Xformable(prim).GetOrderedXformOps()
        extra = ""
        for op in ops:
            extra += f" {op.GetOpName()}={op.Get()}"
        if prim.GetTypeName():
            print(f"{'  ' * indent}{prim.GetPath().pathString} [{prim.GetTypeName()}]{extra}")
        for c in prim.GetChildren():
            walk(c, indent + 2)

    walk(stage.GetPseudoRoot())


for name in sys.argv[1:]:
    print(f"=== {name}.usdz ===")
    dump(os.path.join("public", "models", f"{name}.usdz"))
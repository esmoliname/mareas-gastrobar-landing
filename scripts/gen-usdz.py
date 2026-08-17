# Generador de modelos USDZ para iOS Quick Look (Mareas Gastrobar).
# Espejo de scripts/gen-models.js: mismas recetas, primitivas UsdGeom y
# materiales UsdPreviewSurface. Los archivos .usd se comprimen a .usdz con
# UsdUtils.CreateNewUsdz (zip "stored" con el .usd en la raíz).
# Uso: python scripts/gen-usdz.py
# Requiere: pip install usd-core

import math
import os
import sys
import zipfile
from pathlib import Path

from pxr import Gf, Sdf, Usd, UsdGeom, UsdShade, UsdUtils

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "models"


def make_material(stage, path, color, roughness=0.55, metallic=0.0, opacity=1.0):
    path = str(path).replace("-", "_").replace(".", "_")
    mat = UsdShade.Material.Define(stage, path)
    shader = UsdShade.Shader.Define(stage, path + "/Shader")
    shader.CreateIdAttr("UsdPreviewSurface")
    shader.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f).Set(Gf.Vec3f(*color))
    shader.CreateInput("roughness", Sdf.ValueTypeNames.Float).Set(roughness)
    shader.CreateInput("metallic", Sdf.ValueTypeNames.Float).Set(metallic)
    if opacity < 1.0:
        shader.CreateInput("opacity", Sdf.ValueTypeNames.Float).Set(opacity)
    mat.CreateSurfaceOutput().ConnectToSource(shader.ConnectableAPI(), "surface")
    return mat


def xform(scope, name, pos=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1)):
    prim = UsdGeom.Xform.Define(scope.GetStage(), scope.GetPath().AppendChild(name))
    x = prim.AddTranslateOp()
    x.Set(Gf.Vec3d(*pos))
    r = prim.AddRotateXYZOp()
    r.Set(Gf.Vec3d(*rot))
    s = prim.AddScaleOp()
    s.Set(Gf.Vec3d(*scale))
    return prim


def prim_name(value):
    return "".join(c if c.isalnum() else "_" for c in str(value))


def add_mesh(stage, scope, name, prim_type, mat, pos=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), **params):
    path = scope.GetPath().AppendChild(prim_name(name))
    if prim_type == "sphere":
        prim = UsdGeom.Sphere.Define(stage, path)
    elif prim_type == "cylinder":
        prim = UsdGeom.Cylinder.Define(stage, path)
        # El eje por defecto de la primitiva es Z; el resto del proyecto usa Y
        # (como three.js), así que se alinea explícitamente para que los
        # cilindros queden parados y el bbox coincida con el del GLB.
        prim.CreateAxisAttr(UsdGeom.Tokens.y)
    elif prim_type == "cone":
        prim = UsdGeom.Cone.Define(stage, path)
        prim.CreateAxisAttr(UsdGeom.Tokens.y)
    elif prim_type == "cube":
        prim = UsdGeom.Cube.Define(stage, path)
    elif prim_type == "torus":
        prim = UsdGeom.Torus.Define(stage, path)
    elif prim_type == "capsule":
        prim = UsdGeom.Capsule.Define(stage, path)
        prim.CreateAxisAttr(UsdGeom.Tokens.y)
    else:
        raise ValueError(f"primitiva desconocida: {prim_type}")
    for key, value in params.items():
        prim.GetPrim().CreateAttribute(key, Sdf.ValueTypeNames.Double).Set(value)
    x = prim.AddTranslateOp()
    x.Set(Gf.Vec3d(*pos))
    r = prim.AddRotateXYZOp()
    r.Set(Gf.Vec3d(*rot))
    s = prim.AddScaleOp()
    s.Set(Gf.Vec3d(*scale))
    UsdShade.MaterialBindingAPI(prim).Bind(mat)
    return prim


def torus_mesh(stage, scope, name, mat, major, minor, pos=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), arc=2 * math.pi):
    # El build de usd-core no incluye UsdGeom.Torus: se genera un Mesh
    # paramétrico equivalente (toro acostado en XY, como el schema original).
    path = scope.GetPath().AppendChild(prim_name(name))
    mesh = UsdGeom.Mesh.Define(stage, path)
    radial, tubular = 20, 14
    points, normals = [], []
    for i in range(radial + 1):
        u = (i / radial) * arc
        for j in range(tubular + 1):
            v = (j / tubular) * 2 * math.pi
            r = major + minor * math.cos(v)
            points.append(Gf.Vec3f(r * math.cos(u), r * math.sin(u), minor * math.sin(v)))
            normals.append(Gf.Vec3f(math.cos(v) * math.cos(u), math.cos(v) * math.sin(u), math.sin(v)))
    counts, indices = [], []
    for i in range(radial):
        for j in range(tubular):
            a = i * (tubular + 1) + j
            b = a + tubular + 1
            counts += [4, 4]
            indices += [a, b, b + 1, a + 1, a, a + 1, b + 1, b]
    mesh.CreatePointsAttr(points)
    mesh.CreateFaceVertexCountsAttr(counts)
    mesh.CreateFaceVertexIndicesAttr(indices)
    mesh.CreateNormalsAttr(normals)
    mesh.SetNormalsInterpolation(UsdGeom.Tokens.vertex)
    mesh.GetSubdivisionSchemeAttr().Set(UsdGeom.Tokens.none)
    x = mesh.AddTranslateOp()
    x.Set(Gf.Vec3d(*pos))
    r = mesh.AddRotateXYZOp()
    r.Set(Gf.Vec3d(*rot))
    s = mesh.AddScaleOp()
    s.Set(Gf.Vec3d(*scale))
    UsdShade.MaterialBindingAPI(mesh).Bind(mat)
    return mesh


def plate(stage, scope, d=0.22, color=(0.909, 0.878, 0.816)):
    r = d / 2
    m1 = make_material(stage, scope.GetPath().AppendChild("MPlato"), color, roughness=0.35)
    m2 = make_material(stage, scope.GetPath().AppendChild("MPlatoIn"), (0.851, 0.824, 0.761), roughness=0.4)
    add_mesh(stage, scope, "plato", "cylinder", m1, pos=(0, 0.006, 0), radius=r, height=0.012)
    add_mesh(stage, scope, "plato_in", "cylinder", m2, pos=(0, 0.014, 0), radius=r * 0.68, height=0.006)


def highball(stage, scope, h=0.16, r_base=0.028, r_top=0.034):
    m = make_material(stage, scope.GetPath().AppendChild("MVaso"), (0.749, 0.847, 0.816), roughness=0.08, opacity=0.28)
    add_mesh(stage, scope, "vaso_b", "cylinder", m, pos=(0, 0.001, 0), radius=r_base, height=0.002)
    add_mesh(stage, scope, "vaso_m", "cylinder", m, pos=(0, h * 0.5, 0), radius=(r_base + r_top) / 2, height=h * 0.94)
    add_mesh(stage, scope, "vaso_t", "cylinder", m, pos=(0, h - 0.001, 0), radius=r_top, height=0.002)


def coupe(stage, scope, bowl_r=0.052, h=0.13):
    m = make_material(stage, scope.GetPath().AppendChild("MCopa"), (0.749, 0.847, 0.816), roughness=0.08, opacity=0.3)
    add_mesh(stage, scope, "copa_pie", "cylinder", m, pos=(0, 0.003, 0), radius=0.032, height=0.006)
    add_mesh(stage, scope, "copa_tallo", "cylinder", m, pos=(0, 0.028, 0), radius=0.0055, height=0.055)
    add_mesh(stage, scope, "copa_cuenco", "cylinder", m, pos=(0, 0.045, 0), radius=bowl_r * 0.65, height=0.065)


def straw(stage, scope, h=0.14, x=0.0, z=0.0, rot=0.18):
    m = make_material(stage, scope.GetPath().AppendChild("MPajilla"), (0.878, 0.435, 0.227), roughness=0.3)
    add_mesh(stage, scope, "pajilla", "cylinder", m, pos=(x, h / 2, z), rot=(0, 0, -rot * 57.3), radius=0.003, height=h)


def ice_cube(stage, scope, x, y, z, s=0.016):
    m = make_material(stage, scope.GetPath().AppendChild("MHielo"), (0.91, 0.957, 0.941), roughness=0.15, opacity=0.75)
    add_mesh(stage, scope, f"hielo_{x}_{y}", "cube", m, pos=(x, y, z), size=s)


def lime_wheel(stage, scope, r=0.018, x=0.0, y=0.0, z=0.0):
    m1 = make_material(stage, scope.GetPath().AppendChild("MLima"), (0.247, 0.616, 0.247), roughness=0.5)
    m2 = make_material(stage, scope.GetPath().AppendChild("MLimaIn"), (0.847, 0.91, 0.627), roughness=0.5)
    torus_mesh(stage, scope, "lima", m1, r, 0.0045, pos=(x, y, z), rot=(90, 0, 0))
    add_mesh(stage, scope, "lima_in", "cylinder", m2, pos=(x, y, z), rot=(90, 0, 0), radius=r * 0.82, height=0.002)


def mint(stage, scope, x, y, z, s=1.0, rot=(0, 0, 0)):
    m = make_material(stage, scope.GetPath().AppendChild("MMenta"), (0.247, 0.616, 0.247), roughness=0.6)
    add_mesh(stage, scope, f"menta_{x}_{y}", "sphere", m, pos=(x, y, z), rot=rot, scale=(s, s * 0.35, s), radius=0.009)


def sphere(stage, scope, name, mat, r, pos, rot=(0, 0, 0), scale=(1, 1, 1)):
    add_mesh(stage, scope, name, "sphere", mat, pos=pos, rot=rot, scale=scale, radius=r)


def cone(stage, scope, name, mat, r, h, pos, rot=(0, 0, 0)):
    add_mesh(stage, scope, name, "cone", mat, pos=pos, rot=rot, radius=r, height=h)


RECIPES = {
    "mojito": lambda stage, root: (
        highball(stage, root, 0.16),
        add_mesh(stage, root, "liquido", "cylinder", make_material(stage, root.GetPath().AppendChild("MLiquido"), (0.498, 0.749, 0.353), roughness=0.1, opacity=0.9), pos=(0, 0.042, 0), radius=0.0295, height=0.05),
        ice_cube(stage, root, -0.012, 0.075, 0.006),
        ice_cube(stage, root, 0.01, 0.078, -0.008),
        ice_cube(stage, root, 0.004, 0.07, 0.012),
        mint(stage, root, -0.012, 0.098, -0.01, 1.0, (20, 0, 40)),
        mint(stage, root, 0.012, 0.096, 0.008, 1.0, (-20, 0, -30)),
        mint(stage, root, 0.004, 0.1, -0.014, 0.8, (10, 0, 20)),
        add_mesh(stage, root, "menta_tallo", "cylinder", make_material(stage, root.GetPath().AppendChild("MTallo"), (0.184, 0.49, 0.184), roughness=0.5), pos=(-0.012, 0.106, -0.01), rot=(15, 0, 30), radius=0.002, height=0.03),
        lime_wheel(stage, root, 0.017, 0.028, 0.148, 0.008),
        straw(stage, root, 0.15, -0.006, 0.016, 0.16),
        sphere(stage, root, "fresa", make_material(stage, root.GetPath().AppendChild("MFresa"), (0.851, 0.31, 0.31), roughness=0.35), 0.009, (0.004, 0.108, 0.018)),
    ),
    "margarita": lambda stage, root: (
        coupe(stage, root, 0.052, 0.13),
        add_mesh(stage, root, "liquido", "sphere", make_material(stage, root.GetPath().AppendChild("MLiquido"), (0.91, 0.784, 0.353), roughness=0.12, opacity=0.95), pos=(0, 0.09, 0), scale=(1, 0.62, 1), radius=0.0385),
        add_mesh(stage, root, "sal", "cylinder", make_material(stage, root.GetPath().AppendChild("MSal"), (0.949, 0.937, 0.91), roughness=0.4), pos=(0, 0.129, 0), radius=0.052, height=0.006),
        lime_wheel(stage, root, 0.02, 0.048, 0.128, 0),
        add_mesh(stage, root, "pajilla", "cylinder", make_material(stage, root.GetPath().AppendChild("MPajilla"), (0.878, 0.435, 0.227), roughness=0.3), pos=(0.02, 0.16, 0.012), rot=(0, 0, -0.12 * 57.3), radius=0.0025, height=0.09),
    ),
    "pina": lambda stage, root: (
        add_mesh(stage, root, "vaso_b", "cylinder", make_material(stage, root.GetPath().AppendChild("MVaso"), (0.749, 0.847, 0.816), roughness=0.08, opacity=0.3), pos=(0, 0.002, 0), radius=0.028, height=0.004),
        add_mesh(stage, root, "vaso", "cylinder", make_material(stage, root.GetPath().AppendChild("MVaso"), (0.749, 0.847, 0.816), roughness=0.08, opacity=0.3), pos=(0, 0.05, 0), radius=0.0315, height=0.096),
        add_mesh(stage, root, "liquido", "cylinder", make_material(stage, root.GetPath().AppendChild("MLiquido"), (0.957, 0.937, 0.878), roughness=0.1, opacity=0.96), pos=(0, 0.04, 0), radius=0.03, height=0.052),
        add_mesh(stage, root, "base_pina", "cylinder", make_material(stage, root.GetPath().AppendChild("MPinaBase"), (0.184, 0.616, 0.31), roughness=0.5), pos=(0.028, 0.016, 0.004), radius=0.02, height=0.012),
        cone(stage, root, "pina", make_material(stage, root.GetPath().AppendChild("MPina"), (0.91, 0.714, 0.29), roughness=0.45), 0.02, 0.05, (0.034, 0.07, 0.004), (0, 0, 90)),
        cone(stage, root, "hoja1", make_material(stage, root.GetPath().AppendChild("MHoja"), (0.184, 0.616, 0.31), roughness=0.5), 0.006, 0.02, (0.032, 0.098, -0.002), (0, 0, 90)),
        cone(stage, root, "hoja2", make_material(stage, root.GetPath().AppendChild("MHoja"), (0.184, 0.616, 0.31), roughness=0.5), 0.006, 0.022, (0.046, 0.09, 0.008), (0, 0, 90)),
        cone(stage, root, "hoja3", make_material(stage, root.GetPath().AppendChild("MHoja"), (0.184, 0.616, 0.31), roughness=0.5), 0.006, 0.018, (0.028, 0.088, 0.014), (0, 0, 90)),
        sphere(stage, root, "cereza", make_material(stage, root.GetPath().AppendChild("MCereza"), (0.851, 0.31, 0.31), roughness=0.3), 0.007, (0.005, 0.095, 0.016)),
        straw(stage, root, 0.13, -0.008, 0.018, 0.2),
    ),
    "alitas": lambda stage, root: (
        plate(stage, root, 0.24),
        *[
            (lambda a, i: (
                add_mesh(stage, root, f"alita_{i}", "capsule", make_material(stage, root.GetPath().AppendChild(f"MAlita{i}"), (0.71, 0.396, 0.114), roughness=0.5), pos=(__import__("math").sin(a) * 0.062, 0.021, __import__("math").cos(a) * 0.062), rot=(-a * 57.3 + 90, 0, -35.5), radius=0.011, height=0.042),
                sphere(stage, root, f"alita_{i}_carne", make_material(stage, root.GetPath().AppendChild(f"MAlitaCarne{i}"), (0.71, 0.396, 0.114), roughness=0.5), 0.0145, (__import__("math").sin(a) * 0.062, 0.052, __import__("math").cos(a) * 0.062)),
                sphere(stage, root, f"alita_{i}_glas", make_material(stage, root.GetPath().AppendChild(f"MAlitaGlas{i}"), (0.541, 0.231, 0.063), roughness=0.25, metallic=0.05), 0.012, (__import__("math").sin(a) * 0.068, 0.055, __import__("math").cos(a) * 0.068)),
            ))((i / 6) * 6.283185307179586, i)
            for i in range(6)
        ],
        add_mesh(stage, root, "ranch", "cylinder", make_material(stage, root.GetPath().AppendChild("MRanch"), (0.949, 0.937, 0.91), roughness=0.4), pos=(0, 0.016, 0.05), radius=0.017, height=0.032),
    ),
    "nachos": lambda stage, root: (
        plate(stage, root, 0.28),
        *[
            (lambda a, r, i: add_mesh(stage, root, f"totopo_{i}", "cone", make_material(stage, root.GetPath().AppendChild(f"MTotopo{i}"), (0.91, 0.714, 0.29), roughness=0.6), pos=(__import__("math").sin(a) * r, 0.016, __import__("math").cos(a) * r), rot=(6, (i * 47) % 360, 9), radius=0.017, height=0.008))((i / 14) * 6.283185307179586, 0.04 + ((i * 37) % 5) * 0.011, i)
            for i in range(14)
        ],
        sphere(stage, root, "queso", make_material(stage, root.GetPath().AppendChild("MQueso"), (0.941, 0.627, 0.188), roughness=0.35, opacity=0.88), 0.026, (0, 0.03, 0), scale=(1, 0.42, 1)),
        sphere(stage, root, "guac", make_material(stage, root.GetPath().AppendChild("MGuac"), (0.604, 0.784, 0.353), roughness=0.6), 0.022, (-0.014, 0.035, 0.008), scale=(1, 0.5, 1)),
        sphere(stage, root, "queso2", make_material(stage, root.GetPath().AppendChild("MQueso2"), (0.941, 0.627, 0.188), roughness=0.35, opacity=0.88), 0.018, (0.02, 0.033, -0.012), scale=(1, 0.4, 1)),
        *[
            add_mesh(stage, root, f"pico_{i}", "cube", make_material(stage, root.GetPath().AppendChild(f"MPico{i}"), c, roughness=0.6), pos=p, rot=(17, 11, 6), size=0.008)
            for i, (p, c) in enumerate([((0.006, 0.045, -0.008), (0.851, 0.31, 0.31)), ((-0.004, 0.045, 0.014), (0.247, 0.616, 0.247)), ((0.014, 0.045, 0.006), (0.949, 0.937, 0.91)), ((-0.018, 0.045, -0.006), (0.949, 0.937, 0.91))])
        ],
    ),
    "papas": lambda stage, root: (
        add_mesh(stage, root, "canasta", "cylinder", make_material(stage, root.GetPath().AppendChild("MCanasta"), (0.478, 0.353, 0.227), roughness=0.7), pos=(0, 0.025, 0), radius=0.066, height=0.05),
        add_mesh(stage, root, "borde", "cylinder", make_material(stage, root.GetPath().AppendChild("MBorde"), (0.541, 0.416, 0.267), roughness=0.6), pos=(0, 0.05, 0), radius=0.075, height=0.012),
        *[
            add_mesh(stage, root, f"papa_{i}", "cube", make_material(stage, root.GetPath().AppendChild(f"MPapa{i}"), (0.91, 0.714, 0.29), roughness=0.6), pos=(__import__("math").sin((i / 12) * 6.283185307179586) * 0.032, 0.038, __import__("math").cos((i / 12) * 6.283185307179586) * 0.032), rot=(6, (i * 53) % 360, 3), size=0.008)
            for i in range(12)
        ],
        sphere(stage, root, "queso", make_material(stage, root.GetPath().AppendChild("MQueso"), (0.941, 0.627, 0.188), roughness=0.35, opacity=0.85), 0.03, (0, 0.09, 0), scale=(1, 0.35, 1)),
        add_mesh(stage, root, "jalapeno1", "cylinder", make_material(stage, root.GetPath().AppendChild("MJala"), (0.247, 0.616, 0.247), roughness=0.5), pos=(0.012, 0.092, 0.006), rot=(90, 0, 23), radius=0.011, height=0.008),
        add_mesh(stage, root, "jalapeno2", "cylinder", make_material(stage, root.GetPath().AppendChild("MJala"), (0.247, 0.616, 0.247), roughness=0.5), pos=(-0.01, 0.09, -0.01), rot=(90, 0, -17), radius=0.011, height=0.008),
    ),
    "camarones": lambda stage, root: (
        plate(stage, root, 0.24),
        *[
            (lambda a, i: (
                torus_mesh(stage, root, f"camaron_{i}", make_material(stage, root.GetPath().AppendChild(f"MCamaron{i}"), (0.91, 0.514, 0.478), roughness=0.45), 0.026, 0.011, pos=(__import__("math").sin(a) * 0.058, 0.016, __import__("math").cos(a) * 0.058), rot=(-a * 57.3, 0, 20), arc=0.72 * 6.283185307179586),
                sphere(stage, root, f"camaron_{i}_cabeza", make_material(stage, root.GetPath().AppendChild(f"MCamaronCabeza{i}"), (0.91, 0.514, 0.478), roughness=0.45), 0.011, (__import__("math").sin(a) * 0.058 + 0.002, 0.03, __import__("math").cos(a) * 0.058)),
                cone(stage, root, f"camaron_{i}_cola", make_material(stage, root.GetPath().AppendChild(f"MCamaronCola{i}"), (0.941, 0.627, 0.565), roughness=0.5), 0.009, 0.016, (__import__("math").sin(a) * 0.058 - 0.014, 0.02, __import__("math").cos(a) * 0.058), (0, 0, -63)),
            ))((i / 5) * 6.283185307179586 + 0.6, i)
            for i in range(5)
        ],
        sphere(stage, root, "ajo", make_material(stage, root.GetPath().AppendChild("MAjo"), (0.949, 0.91, 0.753), roughness=0.5, opacity=0.9), 0.028, (0, 0.03, 0), scale=(1, 0.35, 1)),
        cone(stage, root, "limon", make_material(stage, root.GetPath().AppendChild("MLimon"), (0.91, 0.816, 0.125), roughness=0.5), 0.016, 0.028, (0.085, 0.014, 0.03), (0, 0, 90)),
        add_mesh(stage, root, "limon_in", "cylinder", make_material(stage, root.GetPath().AppendChild("MLimonIn"), (0.949, 0.937, 0.91), roughness=0.5), pos=(0.085, 0.02, 0.03), rot=(90, 0, 90), radius=0.013, height=0.002),
        sphere(stage, root, "perejil1", make_material(stage, root.GetPath().AppendChild("MPerejil"), (0.247, 0.616, 0.247), roughness=0.5), 0.005, (0.01, 0.036, 0.02)),
        sphere(stage, root, "perejil2", make_material(stage, root.GetPath().AppendChild("MPerejil"), (0.247, 0.616, 0.247), roughness=0.5), 0.005, (-0.012, 0.035, -0.015)),
    ),
    "ceviche": lambda stage, root: (
        add_mesh(stage, root, "tazon", "sphere", make_material(stage, root.GetPath().AppendChild("MTazon"), (0.847, 0.812, 0.722), roughness=0.5), pos=(0, 0.02, 0), scale=(1, 0.45, 1), radius=0.09),
        add_mesh(stage, root, "borde", "cylinder", make_material(stage, root.GetPath().AppendChild("MBorde"), (0.749, 0.706, 0.604), roughness=0.4), pos=(0, 0.082, 0), radius=0.09, height=0.016),
        *[
            add_mesh(stage, root, f"corvina_{i}", "cube", make_material(stage, root.GetPath().AppendChild(f"MCorvina{i}"), c, roughness=0.6), pos=p, rot=(11, 23, 6), size=0.02)
            for i, (p, c) in enumerate([((-0.02, 0.052, 0.01), (0.949, 0.937, 0.91)), ((0.012, 0.052, 0.02), (0.969, 0.953, 0.925)), ((0.02, 0.052, -0.015), (0.949, 0.937, 0.91)), ((-0.008, 0.052, -0.024), (0.969, 0.953, 0.925)), ((0, 0.052, 0), (0.937, 0.847, 0.784))])
        ],
        torus_mesh(stage, root, "cebolla1", make_material(stage, root.GetPath().AppendChild("MCebolla"), (0.847, 0.706, 0.784), roughness=0.5), 0.012, 0.003, pos=(-0.008, 0.062, 0.03), rot=(90, 0, 17)),
        torus_mesh(stage, root, "cebolla2", make_material(stage, root.GetPath().AppendChild("MCebolla"), (0.784, 0.643, 0.722), roughness=0.5), 0.009, 0.003, pos=(0.03, 0.06, 0.012), rot=(90, 0, -23)),
        sphere(stage, root, "culantro1", make_material(stage, root.GetPath().AppendChild("MCulantro"), (0.247, 0.616, 0.247), roughness=0.5), 0.005, (0.01, 0.066, -0.018)),
        sphere(stage, root, "culantro2", make_material(stage, root.GetPath().AppendChild("MCulantro"), (0.247, 0.616, 0.247), roughness=0.5), 0.005, (-0.024, 0.064, 0.002)),
        lime_wheel(stage, root, 0.016, 0.052, 0.088, 0.03),
        add_mesh(stage, root, "tostada1", "cylinder", make_material(stage, root.GetPath().AppendChild("MTostada"), (0.784, 0.604, 0.353), roughness=0.7), pos=(-0.085, 0.012, -0.045), rot=(28.6, 0, 0), radius=0.035, height=0.009),
        add_mesh(stage, root, "tostada2", "cylinder", make_material(stage, root.GetPath().AppendChild("MTostada"), (0.784, 0.604, 0.353), roughness=0.7), pos=(0.075, 0.02, -0.06), rot=(20, 0, 0), radius=0.035, height=0.009),
    ),
    "frutas": lambda stage, root: (
        add_mesh(stage, root, "bandeja", "cylinder", make_material(stage, root.GetPath().AppendChild("MBandeja"), (0.541, 0.416, 0.267), roughness=0.6), pos=(0, 0.005, 0), radius=0.137, height=0.01),
        add_mesh(stage, root, "borde", "cylinder", make_material(stage, root.GetPath().AppendChild("MBorde"), (0.604, 0.478, 0.329), roughness=0.5), pos=(0, 0.014, 0), radius=0.14, height=0.01),
        sphere(stage, root, "sandia", make_material(stage, root.GetPath().AppendChild("MSandia"), (0.851, 0.31, 0.31), roughness=0.4), 0.045, (-0.07, 0.028, -0.03), scale=(0.65, 0.4, 1)),
        add_mesh(stage, root, "sandia_cascara", "cylinder", make_material(stage, root.GetPath().AppendChild("MSandiaCascara"), (0.184, 0.616, 0.31), roughness=0.5), pos=(-0.07, 0.02, -0.03), radius=0.047, height=0.012),
        cone(stage, root, "pina", make_material(stage, root.GetPath().AppendChild("MPina"), (0.91, 0.714, 0.29), roughness=0.45), 0.024, 0.055, (0.05, 0.033, -0.05), (0, 0, 90)),
        cone(stage, root, "hoja1", make_material(stage, root.GetPath().AppendChild("MHoja"), (0.184, 0.616, 0.31), roughness=0.5), 0.007, 0.022, (0.052, 0.066, -0.052), (0, 0, 90)),
        cone(stage, root, "hoja2", make_material(stage, root.GetPath().AppendChild("MHoja"), (0.184, 0.616, 0.31), roughness=0.5), 0.007, 0.024, (0.064, 0.06, -0.04), (0, 0, 90)),
        lime_wheel(stage, root, 0.024, 0.07, 0.022, 0.045),
        add_mesh(stage, root, "kiwi", "cylinder", make_material(stage, root.GetPath().AppendChild("MKiwi"), (0.604, 0.784, 0.353), roughness=0.4), pos=(-0.02, 0.018, 0.06), rot=(0, 0, 17), radius=0.02, height=0.009),
        add_mesh(stage, root, "kiwi_centro", "cylinder", make_material(stage, root.GetPath().AppendChild("MKiwiCentro"), (0.949, 0.937, 0.91), roughness=0.4), pos=(-0.02, 0.021, 0.06), rot=(90, 0, 17), radius=0.005, height=0.002),
        *[
            (lambda x, z, i: sphere(stage, root, f"uva_{i}", make_material(stage, root.GetPath().AppendChild(f"MUva{i}"), (0.478, 0.31, 0.627), roughness=0.35), 0.007, (x, 0.025, z)))(x, z, i)
            for i, (x, z) in enumerate([(0.02, -0.08), (0.032, -0.074), (0.014, -0.068), (0.026, -0.062), (0.038, -0.084), (0.02, -0.092)])
        ],
        cone(stage, root, "fresa", make_material(stage, root.GetPath().AppendChild("MFresa"), (0.851, 0.31, 0.31), roughness=0.4), 0.014, 0.03, (-0.045, 0.024, 0.07), (11, 0, 0)),
    ),
    "torta": lambda stage, root: (
        plate(stage, root, 0.2),
        add_mesh(stage, root, "piso1", "cylinder", make_material(stage, root.GetPath().AppendChild("MPiso1"), (0.788, 0.541, 0.294), roughness=0.5), pos=(0, 0.033, 0), radius=0.068, height=0.055),
        add_mesh(stage, root, "piso2", "cylinder", make_material(stage, root.GetPath().AppendChild("MPiso2"), (0.91, 0.784, 0.627), roughness=0.5), pos=(0, 0.086, 0), radius=0.048, height=0.05),
        add_mesh(stage, root, "frosting1", "cylinder", make_material(stage, root.GetPath().AppendChild("MFrosting"), (0.949, 0.937, 0.91), roughness=0.4), pos=(0, 0.064, 0), radius=0.07, height=0.012),
        add_mesh(stage, root, "frosting2", "cylinder", make_material(stage, root.GetPath().AppendChild("MFrosting"), (0.949, 0.937, 0.91), roughness=0.4), pos=(0, 0.115, 0), radius=0.05, height=0.01),
        cone(stage, root, "fresa", make_material(stage, root.GetPath().AppendChild("MFresa"), (0.851, 0.31, 0.31), roughness=0.4), 0.012, 0.026, (0.028, 0.132, 0.01), (11, 0, 0)),
        add_mesh(stage, root, "vela", "cylinder", make_material(stage, root.GetPath().AppendChild("MVela"), (0.949, 0.937, 0.91), roughness=0.3), pos=(-0.02, 0.152, 0), radius=0.004, height=0.05),
        cone(stage, root, "llama", make_material(stage, root.GetPath().AppendChild("MLlama"), (0.941, 0.565, 0.188), roughness=0.4), 0.007, 0.016, (-0.02, 0.182, 0)),
        sphere(stage, root, "llama_in", make_material(stage, root.GetPath().AppendChild("MLlamaIn"), (1.0, 0.816, 0.376), roughness=0.3), 0.0045, (-0.02, 0.187, 0)),
    ),
}


def make_usdz(usd_path, usdz_path):
    # El formato USDZ exige un zip con compresión "stored" y el .usd en la raíz.
    with zipfile.ZipFile(usdz_path, "w", compression=zipfile.ZIP_STORED) as zf:
        zf.write(usd_path, arcname=usd_path.name)


def stage_bbox(stage):
    """Devuelve (x, y, z) del bbox mundial del stage en metros."""
    bbox = UsdGeom.BBoxCache(Usd.TimeCode.Default(), [UsdGeom.Tokens.default_])
    rng = bbox.ComputeWorldBound(stage.GetPseudoRoot()).ComputeAlignedRange()
    if rng.IsEmpty():
        return None
    mn, mx = rng.GetMin(), rng.GetMax()
    mpu = UsdGeom.GetStageMetersPerUnit(stage)
    return (mx[0] - mn[0]) * mpu, (mx[1] - mn[1]) * mpu, (mx[2] - mn[2]) * mpu


# Recetas cuyo bbox no coincide con el GLB equivalente: factor objetivo en metros.
TARGET_OVERRIDES = {"papas": 0.162, "frutas": 0.29}


def build_dish(key, recipe):
    usd_path = OUT / f"{key}.usd"
    usdz_path = OUT / f"{key}.usdz"
    stage = Usd.Stage.CreateNew(str(usd_path))
    stage.SetMetadata("metersPerUnit", 1.0)
    stage.SetMetadata("upAxis", "Y")
    default_prim = UsdGeom.Xform.Define(stage, f"/{key}")
    stage.SetDefaultPrim(default_prim.GetPrim())
    recipe(stage, default_prim)
    dims = stage_bbox(stage)
    if dims is None:
        raise RuntimeError(f"{key}: bbox vacío, la receta no genera geometría")
    target = TARGET_OVERRIDES.get(key)
    if target:
        factor = target / max(dims)
        default_prim.AddScaleOp().Set(Gf.Vec3d(factor, factor, factor))
        dims = stage_bbox(stage)
    stage.GetRootLayer().Save()
    make_usdz(usd_path, usdz_path)
    os.remove(usd_path)
    size = usdz_path.stat().st_size / 1024
    print(f"OK  {key}.usdz  ({size:.1f} KB)  bbox x={dims[0]:.4f} y={dims[1]:.4f} z={dims[2]:.4f}  max={max(dims):.4f} m")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for key, recipe in RECIPES.items():
        build_dish(key, recipe)
    print(f"\n{len(RECIPES)} modelos USDZ generados en public/models/")


if __name__ == "__main__":
    main()
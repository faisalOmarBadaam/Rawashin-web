import re
import json
import hashlib
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
VIEWS = SRC / "views"
MODULES = ["clients", "employees", "users"]

EXTS = {".ts", ".tsx", ".js", ".jsx"}

def all_code_files(root):
    return [p for p in root.rglob("*") if p.is_file() and p.suffix in EXTS]

def resolve_import(spec, importer):
    if spec.startswith("@/"):
        target = SRC / spec[2:]
    elif spec.startswith("./") or spec.startswith("../"):
        target = (importer.parent / spec).resolve()
    else:
        return None

    candidates = []
    candidates.append(target)
    for ext in EXTS:
        candidates.append(target.with_suffix(ext))
    for ext in EXTS:
        candidates.append(target / ("index" + ext))

    for c in candidates:
        if c.exists():
            return c.resolve()

    return None

IMPORT_RE = re.compile(r"(?:import|export)\s+(?:[^'\"]*?from\s*)?['\"]([^'\"]+)['\"]")
DYN_RE = re.compile(r"import\(['\"]([^'\"]+)['\"]\)")
REQ_RE = re.compile(r"require\(['\"]([^'\"]+)['\"]\)")

print("🔍 Scanning project...")

all_files = all_code_files(SRC)
refs = {}

for f in all_files:
    try:
        txt = f.read_text(encoding="utf-8", errors="ignore")
    except:
        continue

    specs = IMPORT_RE.findall(txt) + DYN_RE.findall(txt) + REQ_RE.findall(txt)

    for spec in specs:
        resolved = resolve_import(spec, f)
        if resolved:
            refs[resolved] = refs.get(resolved, 0) + 1

rows = []

for module in MODULES:
    module_root = VIEWS / module
    if not module_root.exists():
        continue

    for f in module_root.rglob("*"):
        if not f.is_file() or f.suffix not in EXTS:
            continue

        content = f.read_text(encoding="utf-8", errors="ignore")
        h = hashlib.sha256(content.encode("utf-8")).hexdigest()

        usage = refs.get(f.resolve(), 0)

        rows.append({
            "file": str(f.relative_to(VIEWS)),
            "module": module,
            "hash": h,
            "used_count": usage
        })

# Group by hash
groups = {}
for r in rows:
    groups.setdefault(r["hash"], []).append(r)

report = []

for h, items in groups.items():
    if len(items) > 1:
        report.append({
            "hash": h,
            "files": items,
            "identical": True
        })

print("\n📊 IDENTICAL FILE GROUPS:\n")
print(json.dumps(report, indent=2))

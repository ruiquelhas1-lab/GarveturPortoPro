# tools/xlsx2geojson.py
"""
Conversor para o modelo do Rui (XLSX -> GeoJSON/JSON).
- Lê data/empreendimentos.xlsx (folha 1).
- Cabeçalhos esperados (case-insensitive): 
  nome, concelho, estado, promotor, tipologias, conclusao, preco_m2, notas, latitude, longitude, link
- Gera data/empreendimentos.json (FeatureCollection com Points).
"""
import os, sys, math, json

XLSX_IN = "data/empreendimentos.xlsx"
JSON_OUT = "data/empreendimentos.json"

try:
    import openpyxl  # pip install openpyxl
except Exception as e:
    print("ERRO: openpyxl não está disponível. Instale com 'pip install openpyxl'.", file=sys.stderr)
    sys.exit(1)

REQUIRED = ["nome","concelho","estado","promotor","tipologias","conclusao","preco_m2","notas","latitude","longitude","link"]

def norm(s: str) -> str:
    return (s or "").strip().lower()

def to_num(v):
    if v is None: return None
    s = str(v).strip().replace(",", ".")
    try:
        n = float(s)
        if math.isnan(n) or math.isinf(n):
            return None
        return n
    except:
        return None

if not os.path.exists(XLSX_IN):
    print(f"ERRO: não encontrei o ficheiro {XLSX_IN}", file=sys.stderr)
    sys.exit(1)

import openpyxl
wb = openpyxl.load_workbook(XLSX_IN, data_only=True)
ws = wb.worksheets[0]

# Ler cabeçalhos
headers = [norm(c.value if c is not None else "") for c in next(ws.iter_rows(min_row=1, max_row=1))]
idx = { h:i for i,h in enumerate(headers) }

# Garantir colunas (apenas avisa; não falha se faltar alguma não-crítica)
missing = [c for c in REQUIRED if c not in idx]
if "latitude" not in idx or "longitude" not in idx or "nome" not in idx:
    print("ERRO: é obrigatório existirem as colunas 'nome', 'latitude' e 'longitude' (maiúsculas/minúsculas indiferentes).", file=sys.stderr)
    print(f"Cabeçalhos detetados: {headers}", file=sys.stderr)
    sys.exit(1)
if missing:
    print(f"Aviso: colunas em falta (opcional): {missing}", file=sys.stderr)

feats = []
rows = 0
skipped = 0

for r in ws.iter_rows(min_row=2, values_only=True):
    rows += 1
    def get(col):
        return r[idx[col]] if col in idx else None

    lat = to_num(get("latitude"))
    lng = to_num(get("longitude"))
    nome = (get("nome") or "").strip()

    if not nome or lat is None or lng is None:
        skipped += 1
        continue

    props = {
        "nome": nome,
        "concelho": (get("concelho") or ""),
        "estado": (get("estado") or ""),
        "promotor": (get("promotor") or ""),
        "tipologias": (get("tipologias") or ""),
        "conclusao": (get("conclusao") or ""),
        "preco_m2": (get("preco_m2") or ""),
        "notas": (get("notas") or ""),
        "link": (get("link") or ""),
    }

    feats.append({
        "type": "Feature",
        "properties": props,
        "geometry": {"type":"Point", "coordinates":[lng, lat]}
    })

gj = {"type":"FeatureCollection", "features":feats}

os.makedirs(os.path.dirname(JSON_OUT), exist_ok=True)
with open(JSON_OUT, "w", encoding="utf-8") as f:
    import json
    json.dump(gj, f, ensure_ascii=False, indent=2)

print(f"OK: {len(feats)} pontos gerados a partir de {rows} linhas (ignoradas: {skipped}).")


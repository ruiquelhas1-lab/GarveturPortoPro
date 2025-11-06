# tools/xlsx2geojson.py
"""
Conversor XLSX -> GeoJSON/JSON (robusto a NaN/Inf) para o modelo do Rui.
- Lê data/empreendimentos.xlsx (folha 1).
- Cabeçalhos aceites (case-insensitive, com/sem acentos): 
  nome, concelho, estado, promotor, tipologias, conclusao, preco_m2, notas, latitude, longitude, link
- Gera data/empreendimentos.json (FeatureCollection) SEM NaN/Inf (substitui por None).
"""
import os, sys, math, json, unicodedata

XLSX_IN = "data/empreendimentos.xlsx"
JSON_OUT = "data/empreendimentos.json"

try:
    import openpyxl  # pip install openpyxl
except Exception:
    print("ERRO: openpyxl não está disponível. Instale com 'pip install openpyxl'.", file=sys.stderr)
    sys.exit(1)

REQUIRED = ["nome","latitude","longitude"]
OPTIONAL = ["concelho","estado","promotor","tipologias","conclusao","preco_m2","notas","link"]
ALL = REQUIRED + OPTIONAL

def norm(s: str) -> str:
    s = (s or "").strip().lower()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')  # remove acentos
    return s

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

def sanitize(o):
    """Garante JSON válido: converte floats NaN/Inf para None; força strings nos props."""
    if isinstance(o, float):
        if math.isnan(o) or math.isinf(o):
            return None
        return o
    if isinstance(o, dict):
        out = {}
        for k, v in o.items():
            vv = sanitize(v)
            out[k] = vv
        return out
    if isinstance(o, list):
        return [sanitize(v) for v in o]
    return o

if not os.path.exists(XLSX_IN):
    print(f"ERRO: não encontrei o ficheiro {XLSX_IN}", file=sys.stderr)
    sys.exit(1)

wb = openpyxl.load_workbook(XLSX_IN, data_only=True)
ws = wb.worksheets[0]

# Ler cabeçalhos e mapear de forma tolerante
raw_headers = [c.value if c is not None else "" for c in next(ws.iter_rows(min_row=1, max_row=1))]
headers = [norm(h) for h in raw_headers]
idx = { h:i for i,h in enumerate(headers) }

aliases = {
  "nome": ["nome", "empreendimento", "projeto", "projecto", "name", "titulo", "título"],
  "concelho": ["concelho","municipio","município","city","local"],
  "estado": ["estado","status","fase"],
  "promotor": ["promotor","developer","owner"],
  "tipologias": ["tipologias","tipos","typologies"],
  "conclusao": ["conclusao","conclusão","entrega","completion","ano","ano_conclusao"],
  "preco_m2": ["preco_m2","preco_med_m2","preco_medio_m2","preço_m2","price_m2","price_per_sqm"],
  "notas": ["notas","observacoes","observações","notes"],
  "latitude": ["latitude","lat"],
  "longitude": ["longitude","lng","long","lon","x","y"],
  "link": ["link","url","website"]
}
colmap = {}
for key, cands in aliases.items():
    for cand in cands:
        n = norm(cand)
        if n in idx:
            colmap[key] = idx[n]
            break

missing_required = [k for k in REQUIRED if k not in colmap]
if missing_required:
    print("ERRO: faltam colunas obrigatórias (nome/latitude/longitude).", file=sys.stderr)
    print("Cabeçalhos detetados:", raw_headers, file=sys.stderr)
    sys.exit(1)

print("Mapeamento de colunas:", {k: raw_headers[v] for k,v in colmap.items()})

feats, rows, skipped = [], 0, 0
for r in ws.iter_rows(min_row=2, values_only=True):
    rows += 1
    def get(col):
        j = colmap.get(col)
        return r[j] if j is not None else None

    lat = to_num(get("latitude"))
    lng = to_num(get("longitude"))
    nome_raw = get("nome")
    nome = (str(nome_raw).strip() if nome_raw is not None else "")

    if not nome or lat is None or lng is None:
        skipped += 1
        continue

    props = {}
    for k in ALL:
        if k in ("latitude","longitude","nome"): continue
        v = get(k)
        # Forçar string nos props para evitar floats NaN/infinity
        props[k] = "" if v is None else str(v).strip()

    feats.append({
        "type": "Feature",
        "properties": {"nome": nome, **props},
        "geometry": {"type":"Point", "coordinates":[lng, lat]}
    })

gj = {"type":"FeatureCollection", "features":feats}
gj = sanitize(gj)  # última barreira anti-NaN/Inf

os.makedirs(os.path.dirname(JSON_OUT), exist_ok=True)
with open(JSON_OUT, "w", encoding="utf-8") as f:
    json.dump(gj, f, ensure_ascii=False, indent=2, allow_nan=False)

print(f"OK: {len(feats)} pontos gerados a partir de {rows} linhas (ignoradas: {skipped}).")

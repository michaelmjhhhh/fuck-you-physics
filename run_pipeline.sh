#!/usr/bin/env zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

TOPIC="${1:-all}"            # a4 | b1 | b2 | b3 | b4 | b5 | c1 | c2 | c4 | c5 | all
MODEL="${2:-Gemini-3-flash-preview}"
API_BASE="${3:-https://api.siliconrouter.com/v1}"
IMPORT_FLAG="${4:-import}"    # import | noimport

if [[ ! -f ".env" ]]; then
  echo "missing .env in $ROOT_DIR"
  exit 1
fi

set -a
source ./.env
set +a

if [[ -z "${SILICONROUTER_API_KEY:-}" && -z "${OPENAI_API_KEY:-}" ]]; then
  echo "missing API key: set SILICONROUTER_API_KEY or OPENAI_API_KEY in .env"
  exit 1
fi

MANIFEST_INDEX="./manifests/manifest-index.json"
FILTERED_INDEX="./manifests/manifest-index-${TOPIC}.json"
OUT_DIR="./prepared-questions/llm-extracted-${TOPIC}"
IMPORT_DIR="./prepared-questions/llm-extracted-${TOPIC}-importable"
RETRY_MAX="${RETRY_MAX:-3}"

if [[ "$TOPIC" != "a4" && "$TOPIC" != "b1" && "$TOPIC" != "b2" && "$TOPIC" != "b3" && "$TOPIC" != "b4" && "$TOPIC" != "b5" && "$TOPIC" != "c1" && "$TOPIC" != "c2" && "$TOPIC" != "c4" && "$TOPIC" != "c5" && "$TOPIC" != "all" ]]; then
  echo "invalid topic: $TOPIC (expected a4|b1|b2|b3|b4|b5|c1|c2|c4|c5|all)"
  exit 1
fi

# Always regenerate manifests from current image folders so newly added images are included.
go run ./cmd/importer -manifest-source "." -manifest-output "./manifests"

python3 -c '
import json,sys
topic=sys.argv[1]
src=sys.argv[2]
dst=sys.argv[3]
d=json.load(open(src))
if topic=="all":
    items=d["items"]
elif topic=="a4":
    items=[x for x in d["items"] if x.get("topic_code")=="A4"]
elif topic=="b1":
    items=[x for x in d["items"] if x.get("topic_code")=="B1"]
elif topic=="b2":
    items=[x for x in d["items"] if x.get("topic_code")=="B2"]
elif topic=="b3":
    items=[x for x in d["items"] if x.get("topic_code")=="B3"]
elif topic=="b4":
    items=[x for x in d["items"] if x.get("topic_code")=="B4"]
elif topic=="b5":
    items=[x for x in d["items"] if x.get("topic_code")=="B5"]
elif topic=="c1":
    items=[x for x in d["items"] if x.get("topic_code")=="C1"]
elif topic=="c2":
    items=[x for x in d["items"] if x.get("topic_code")=="C2"]
elif topic=="c4":
    items=[x for x in d["items"] if x.get("topic_code")=="C4"]
elif topic=="c5":
    items=[x for x in d["items"] if x.get("topic_code")=="C5"]
else:
    raise SystemExit("unsupported topic")
d["items"]=items
d["generated_count"]=len(items)
json.dump(d,open(dst,"w"),indent=2)
print(f"manifest items: {len(items)} -> {dst}")
' "$TOPIC" "$MANIFEST_INDEX" "$FILTERED_INDEX"

# Sync selected topic image folders into public/ for Next.js static serving.
python3 -c '
import json,os,shutil,sys
idx=json.load(open(sys.argv[1]))
public_root=sys.argv[2]
os.makedirs(public_root, exist_ok=True)
folders=sorted({(item.get("source_image_path") or "").split("/")[0] for item in idx.get("items",[]) if item.get("source_image_path")})
for folder in folders:
    src=os.path.join(".", folder)
    dst=os.path.join(public_root, folder)
    if not os.path.isdir(src):
        continue
    if os.path.exists(dst):
        shutil.rmtree(dst)
    shutil.copytree(src, dst)
print(f"synced {len(folders)} topic image folder(s) into {public_root}")
' "$FILTERED_INDEX" "./public"

go run ./cmd/importer \
  -llm-manifest-index "$FILTERED_INDEX" \
  -llm-manifest-root "./manifests" \
  -llm-source-root "." \
  -llm-output-dir "$OUT_DIR" \
  -llm-api-base "$API_BASE" \
  -llm-model "$MODEL"

for ((attempt=1; attempt<=RETRY_MAX; attempt++)); do
  RETRY_INDEX="./manifests/manifest-index-retry-${TOPIC}.json"
  RETRY_COUNT="$(python3 -c '
import json,re,sys
report_path=sys.argv[1]
filtered_index_path=sys.argv[2]
retry_index_path=sys.argv[3]
try:
    report=json.load(open(report_path))
except Exception:
    print(0)
    raise SystemExit(0)
errors=report.get("Errors") or []
ids=[]
for e in errors:
    m=re.match(r"^([^:]+):", str(e))
    if m:
        ids.append(m.group(1))
ids=sorted(set(ids))
if not ids:
    print(0)
    raise SystemExit(0)
idx=json.load(open(filtered_index_path))
items=[x for x in idx.get("items",[]) if x.get("id") in ids]
idx["items"]=items
idx["generated_count"]=len(items)
json.dump(idx,open(retry_index_path,"w"),indent=2)
print(len(items))
' "$OUT_DIR/llm-extraction-report.json" "$FILTERED_INDEX" "$RETRY_INDEX")"

  if [[ "$RETRY_COUNT" == "0" ]]; then
    break
  fi

  echo "retry attempt $attempt for $RETRY_COUNT failed item(s)"
  go run ./cmd/importer \
    -llm-manifest-index "$RETRY_INDEX" \
    -llm-manifest-root "./manifests" \
    -llm-source-root "." \
    -llm-output-dir "$OUT_DIR" \
    -llm-api-base "$API_BASE" \
    -llm-model "$MODEL"
done

python3 -c '
import glob,os,shutil,sys
src=sys.argv[1]
dst=sys.argv[2]
os.makedirs(dst,exist_ok=True)
for p in glob.glob(os.path.join(dst,"*.json")):
    os.remove(p)
count=0
for p in glob.glob(os.path.join(src,"*.json")):
    if p.endswith("llm-extraction-report.json"):
        continue
    shutil.copy2(p,dst)
    count+=1
print(f"importable json files: {count} -> {dst}")
' "$OUT_DIR" "$IMPORT_DIR"

if [[ "$IMPORT_FLAG" == "import" ]]; then
  go run ./cmd/importer -db "./ib_physics.db" -schema "./schema.sql" -input "$IMPORT_DIR"
fi

if [[ "$TOPIC" == "a4" || "$TOPIC" == "all" ]]; then
  python3 -c '
import glob,json,sys
src=sys.argv[1]
out=sys.argv[2]
files=[p for p in sorted(glob.glob(src+"/*.json")) if not p.endswith("llm-extraction-report.json")]
if files:
    data=[]
    for p in files:
        obj=json.load(open(p))
        if obj.get("topic_code")=="A4":
            data.append(obj)
    if data:
        json.dump(data,open(out,"w"),indent=2)
        print(f"replaced {out} with {len(data)} A4 questions")
' "$OUT_DIR" "./prepared-questions/a4-rigid-body-mechanics.json"
fi

if [[ "$TOPIC" == "b1" || "$TOPIC" == "all" ]]; then
  python3 -c '
import glob,json,sys
src=sys.argv[1]
out=sys.argv[2]
files=[p for p in sorted(glob.glob(src+"/*.json")) if not p.endswith("llm-extraction-report.json")]
if files:
    data=[]
    for p in files:
        obj=json.load(open(p))
        if obj.get("topic_code")=="B1":
            data.append(obj)
    if data:
        json.dump(data,open(out,"w"),indent=2)
        print(f"replaced {out} with {len(data)} B1 questions")
' "$OUT_DIR" "./prepared-questions/b1-thermal-energy-transfers.json"
fi

if [[ "$TOPIC" == "b2" || "$TOPIC" == "all" ]]; then
  python3 -c '
import glob,json,sys
src=sys.argv[1]
out=sys.argv[2]
files=[p for p in sorted(glob.glob(src+"/*.json")) if not p.endswith("llm-extraction-report.json")]
if files:
    data=[]
    for p in files:
        obj=json.load(open(p))
        if obj.get("topic_code")=="B2":
            data.append(obj)
    if data:
        json.dump(data,open(out,"w"),indent=2)
        print(f"replaced {out} with {len(data)} B2 questions")
' "$OUT_DIR" "./prepared-questions/b2-greenhouse-effect.json"
fi

if [[ "$TOPIC" == "b3" || "$TOPIC" == "all" ]]; then
  python3 -c '
import glob,json,sys
src=sys.argv[1]
out=sys.argv[2]
files=[p for p in sorted(glob.glob(src+"/*.json")) if not p.endswith("llm-extraction-report.json")]
if files:
    data=[]
    for p in files:
        obj=json.load(open(p))
        if obj.get("topic_code")=="B3":
            data.append(obj)
    if data:
        json.dump(data,open(out,"w"),indent=2)
        print(f"replaced {out} with {len(data)} B3 questions")
' "$OUT_DIR" "./prepared-questions/b3-gas-laws.json"
fi

if [[ "$TOPIC" == "b4" || "$TOPIC" == "all" ]]; then
  python3 -c '
import glob,json,sys
src=sys.argv[1]
out=sys.argv[2]
files=[p for p in sorted(glob.glob(src+"/*.json")) if not p.endswith("llm-extraction-report.json")]
if files:
    data=[]
    for p in files:
        obj=json.load(open(p))
        if obj.get("topic_code")=="B4":
            data.append(obj)
    if data:
        json.dump(data,open(out,"w"),indent=2)
        print(f"replaced {out} with {len(data)} B4 questions")
' "$OUT_DIR" "./prepared-questions/b4-thermodynamics.json"
fi

if [[ "$TOPIC" == "b5" || "$TOPIC" == "all" ]]; then
  python3 -c '
import glob,json,sys
src=sys.argv[1]
out=sys.argv[2]
files=[p for p in sorted(glob.glob(src+"/*.json")) if not p.endswith("llm-extraction-report.json")]
if files:
    data=[]
    for p in files:
        obj=json.load(open(p))
        if obj.get("topic_code")=="B5":
            data.append(obj)
    if data:
        json.dump(data,open(out,"w"),indent=2)
        print(f"replaced {out} with {len(data)} B5 questions")
' "$OUT_DIR" "./prepared-questions/b5-current-and-circuits.json"
fi

if [[ "$TOPIC" == "c1" || "$TOPIC" == "all" ]]; then
  python3 -c '
import glob,json,sys
src=sys.argv[1]
out=sys.argv[2]
files=[p for p in sorted(glob.glob(src+"/*.json")) if not p.endswith("llm-extraction-report.json")]
if files:
    data=[]
    for p in files:
        obj=json.load(open(p))
        if obj.get("topic_code")=="C1":
            data.append(obj)
    if data:
        json.dump(data,open(out,"w"),indent=2)
        print(f"replaced {out} with {len(data)} C1 questions")
' "$OUT_DIR" "./prepared-questions/c1-simple-harmonic-motion.json"
fi

if [[ "$TOPIC" == "c2" || "$TOPIC" == "all" ]]; then
  python3 -c '
import glob,json,sys
src=sys.argv[1]
out=sys.argv[2]
files=[p for p in sorted(glob.glob(src+"/*.json")) if not p.endswith("llm-extraction-report.json")]
if files:
    data=[]
    for p in files:
        obj=json.load(open(p))
        if obj.get("topic_code")=="C2":
            data.append(obj)
    if data:
        json.dump(data,open(out,"w"),indent=2)
        print(f"replaced {out} with {len(data)} C2 questions")
' "$OUT_DIR" "./prepared-questions/c2-wave-model.json"
fi

if [[ "$TOPIC" == "c4" || "$TOPIC" == "all" ]]; then
  python3 -c '
import glob,json,sys
src=sys.argv[1]
out=sys.argv[2]
files=[p for p in sorted(glob.glob(src+"/*.json")) if not p.endswith("llm-extraction-report.json")]
if files:
    data=[]
    for p in files:
        obj=json.load(open(p))
        if obj.get("topic_code")=="C4":
            data.append(obj)
    if data:
        json.dump(data,open(out,"w"),indent=2)
        print(f"replaced {out} with {len(data)} C4 questions")
' "$OUT_DIR" "./prepared-questions/c4-standing-waves-and-resonance.json"
fi

if [[ "$TOPIC" == "c5" || "$TOPIC" == "all" ]]; then
  python3 -c '
import glob,json,sys
src=sys.argv[1]
out=sys.argv[2]
files=[p for p in sorted(glob.glob(src+"/*.json")) if not p.endswith("llm-extraction-report.json")]
if files:
    data=[]
    for p in files:
        obj=json.load(open(p))
        if obj.get("topic_code")=="C5":
            data.append(obj)
    if data:
        json.dump(data,open(out,"w"),indent=2)
        print(f"replaced {out} with {len(data)} C5 questions")
' "$OUT_DIR" "./prepared-questions/c5-doppler-effect.json"
fi

python3 -c '
import json,glob,sys
topic=sys.argv[1]
filtered_index_path=sys.argv[2]
out_dir=sys.argv[3]
idx=json.load(open(filtered_index_path))
expected={x.get("id") for x in idx.get("items",[])}
actual={json.load(open(p)).get("id") for p in glob.glob(out_dir+"/*.json") if not p.endswith("llm-extraction-report.json")}
missing=sorted([i for i in expected if i and i not in actual])
if missing:
    print("missing ids after retries:")
    for m in missing:
        print("-",m)
' "$TOPIC" "$FILTERED_INDEX" "$OUT_DIR"

echo "pipeline complete: topic=$TOPIC model=$MODEL import=$IMPORT_FLAG"

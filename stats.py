import json, os, urllib.request, urllib.error
from datetime import datetime, timezone

KEY = os.environ.get("API_FOOTBALL_KEY", "").strip()
LEAGUES = {"P": 39, "E": 140, "I": 135, "B": 78, "F": 61}
SEASON = 2026

def get(league):
    url = f"https://v3.football.api-sports.io/standings?league={league}&season={SEASON}"
    req = urllib.request.Request(url, headers={"x-apisports-key": KEY, "User-Agent": "radar-value"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:300]}")

out, errors = {}, []
errors.append(f"longueur de la cle: {len(KEY)}")
if KEY:
    for code, lid in LEAGUES.items():
        try:
            d = get(lid)
            if d.get("errors"):
                errors.append(f"{code}: {d['errors']}")
                continue
            rows = d["response"][0]["league"]["standings"][0]
            out[code] = [{"rank": r["rank"], "team": r["team"]["name"], "pts": r["points"],
                          "played": r["all"]["played"], "w": r["all"]["win"], "d": r["all"]["draw"],
                          "l": r["all"]["lose"], "gf": r["all"]["goals"]["for"],
                          "ga": r["all"]["goals"]["against"], "form": r.get("form") or ""}
                         for r in rows]
        except Exception as e:
            errors.append(f"{code}: {e}")
            break

print("Erreurs:", errors)
with open("stats.json", "w", encoding="utf-8") as f:
    json.dump({"updated": datetime.now(timezone.utc).isoformat(), "leagues": out, "errors": errors}, f, ensure_ascii=False)

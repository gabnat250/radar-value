import json, os, time, urllib.request, urllib.error
from datetime import datetime, timezone

KEY = os.environ.get("API_FOOTBALL_KEY", "").strip()
LEAGUES = {"P": "PL", "E": "PD", "I": "SA", "B": "BL1", "F": "FL1", "C": "CL"}

def get(code):
    req = urllib.request.Request(f"https://api.football-data.org/v4/competitions/{code}/standings",
                                 headers={"X-Auth-Token": KEY, "User-Agent": "radar-value"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:300]}")

def table(d, kind):
    t = next((s for s in d["standings"] if s["type"] == kind), None)
    return {r["team"]["id"]: r for r in t["table"]} if t else {}

def split(r):
    return {"p": r["playedGames"], "gf": r["goalsFor"], "ga": r["goalsAgainst"]} if r else None

out, errors = {}, [f"longueur de la cle: {len(KEY)}"]
for i, (code, fd) in enumerate(LEAGUES.items()):
    if i:
        time.sleep(7)
    try:
        d = get(fd)
        tot, home, away = table(d, "TOTAL"), table(d, "HOME"), table(d, "AWAY")
        out[code] = [{"rank": r["position"], "team": r["team"]["name"], "pts": r["points"],
                      "played": r["playedGames"], "w": r["won"], "d": r["draw"], "l": r["lost"],
                      "gf": r["goalsFor"], "ga": r["goalsAgainst"],
                      "form": (r.get("form") or "").replace(",", ""), "crest": r["team"].get("crest"),
                      "home": split(home.get(tid)), "away": split(away.get(tid))}
                     for tid, r in sorted(tot.items(), key=lambda x: x[1]["position"])]
    except Exception as e:
        errors.append(f"{code}: {e}")

print("Erreurs:", errors)
with open("stats.json", "w", encoding="utf-8") as f:
    json.dump({"updated": datetime.now(timezone.utc).isoformat(), "leagues": out, "errors": errors}, f, ensure_ascii=False)

import json, os, urllib.request, urllib.parse
from datetime import datetime, timezone

KEY = os.environ["ODDS_API_KEY"].strip()
SPORTS = {
    "soccer_epl": "P",
    "soccer_spain_la_liga": "E",
    "soccer_italy_serie_a": "I",
    "soccer_germany_bundesliga": "B",
    "soccer_france_ligue_one": "F",
    "basketball_nba": "N",
}

def fetch(sport):
    q = urllib.parse.urlencode({"apiKey": KEY, "regions": "eu", "markets": "h2h", "oddsFormat": "decimal"})
    url = f"https://api.the-odds-api.com/v4/sports/{sport}/odds/?{q}"
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)

def analyse(ev, code):
    n = 2 if code == "N" else 3
    fairs, prices, pin = {}, {}, None
    for bk in ev.get("bookmakers", []):
        m = next((x for x in bk["markets"] if x["key"] == "h2h"), None)
        if not m or len(m["outcomes"]) != n:
            continue
        outs = m["outcomes"]
        inv = sum(1 / o["price"] for o in outs)
        probs = {o["name"]: (1 / o["price"]) / inv for o in outs}
        for o in outs:
            fairs.setdefault(o["name"], []).append(probs[o["name"]])
            prices.setdefault(o["name"], []).append((o["price"], bk["title"]))
        if bk["key"] == "pinnacle":
            pin = probs
    if not fairs:
        return None
    res = []
    for name, ps in fairs.items():
        p = pin[name] if pin else sum(ps) / len(ps)
        pl = sorted(prices[name])
        med = pl[len(pl) // 2][0]
        odds, book = max(x for x in pl if x[0] <= med * 1.25)
        ev_val = round(p * odds - 1, 4)
        if not pin or len(pl) < 3 or p < 0.15 or ev_val > 0.10:
            ev_val = 0
        res.append({"name": name, "p": round(p, 4), "best": odds, "book": book, "ev": ev_val})
    return {"league": code, "start": ev["commence_time"], "home": ev["home_team"],
            "away": ev["away_team"], "books": len(ev["bookmakers"]), "outcomes": res}

matches, ok = [], 0
for sport, code in SPORTS.items():
    try:
        for ev in fetch(sport):
            a = analyse(ev, code)
            if a:
                matches.append(a)
        ok += 1
    except Exception as e:
        print("Erreur", sport, e)
if ok == 0:
    raise SystemExit("Aucune donnée récupérée")
matches.sort(key=lambda m: m["start"])
with open("data.json", "w", encoding="utf-8") as f:
    json.dump({"updated": datetime.now(timezone.utc).isoformat(), "matches": matches}, f, ensure_ascii=False)

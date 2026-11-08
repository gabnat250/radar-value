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
    fairs, prices = {}, {}
    for bk in ev.get("bookmakers", []):
        m = next((x for x in bk["markets"] if x["key"] == "h2h"), None)
        if not m:
            continue
        outs = m["outcomes"]
        if len(outs) != (2 if code == "N" else 3):
            continue
        inv = sum(1 / o["price"] for o in outs)
        for o in outs:
            fairs.setdefault(o["name"], []).append((1 / o["price"]) / inv)
            prices.setdefault(o["name"], []).append((o["price"], bk["title"]))
    if not fairs:
        return None
    res = []
    for name, ps in fairs.items():
        p = sum(ps) / len(ps)
        pl = sorted(prices[name])
        med = pl[len(pl) // 2][0]
        odds, book = max(x for x in pl if x[0] <= med * 1.25)
        ev_val = round(p * odds - 1, 4) if len(pl) >= 3 else 0
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

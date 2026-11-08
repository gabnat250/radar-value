import json, re, urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

FEEDS = [
    ("BBC Sport", "foot", "https://feeds.bbci.co.uk/sport/football/rss.xml"),
    ("The Guardian", "foot", "https://www.theguardian.com/football/rss"),
    ("ESPN", "foot", "https://www.espn.com/espn/rss/soccer/news"),
    ("ESPN", "nba", "https://www.espn.com/espn/rss/nba/news"),
    ("BBC Sport", "nba", "https://feeds.bbci.co.uk/sport/basketball/rss.xml"),
]
KW = {
    "Blessure": r"injur|ruled out|sidelined|surgery|setback|will miss|to miss|\bmisses\b|out for|fitness|\bdoubt|questionable|\bknock\b",
    "Suspension": r"suspend|suspension|\bbanned\b|\bban\b|red card|sent off",
    "Entraîneur": r"\bsacked\b|\bsack\b|\bfired\b|resign|new manager|appointed|steps down|parts ways",
    "Alignement": r"team news|line-?up|starting xi|\brested\b|load management|game-time",
}

def tags(title):
    t = title.lower()
    return [k for k, rx in KW.items() if re.search(rx, t)]

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (radar-value)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return ET.fromstring(r.read())

items, errors, seen = [], [], set()
for src, cat, url in FEEDS:
    try:
        n = 0
        for it in fetch(url).iter("item"):
            t = (it.findtext("title") or "").strip()
            u = (it.findtext("link") or "").strip()
            if not t or not u or u in seen:
                continue
            try:
                d = parsedate_to_datetime(it.findtext("pubDate")).astimezone(timezone.utc).isoformat()
            except Exception:
                d = ""
            seen.add(u)
            items.append({"t": t, "u": u, "s": src, "c": cat, "d": d, "k": tags(t)})
            n += 1
            if n >= 25:
                break
        errors.append(f"{src} {cat}: {n} titres")
    except Exception as e:
        errors.append(f"{src} {cat}: erreur {e}")

items.sort(key=lambda x: x["d"], reverse=True)
print("Flux:", errors)
with open("news.json", "w", encoding="utf-8") as f:
    json.dump({"updated": datetime.now(timezone.utc).isoformat(), "items": items[:100], "errors": errors}, f, ensure_ascii=False)

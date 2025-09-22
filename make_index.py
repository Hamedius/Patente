#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, re, unicodedata
from pathlib import Path

def slugify(s: str) -> str:
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "topic"

def parse_leading_num(title: str) -> int:
    m = re.match(r"\s*(\d+)", title)
    return int(m.group(1)) if m else 10**9

def main():
    data_dir = Path("public/data").resolve()
    files = sorted([p for p in data_dir.glob("*.json") if p.name != "index.json"])
    topics = []
    for p in files:
        title = p.stem
        try:
            obj = json.loads(p.read_text(encoding="utf-8"))
            mt = (obj.get("meta") or {})
            title = mt.get("topicTitle") or title
            tid = slugify(mt.get("topicId") or title)
        except Exception:
            tid = slugify(title)
        topics.append({
            "id": tid,
            "title": title,
            "file": p.name
        })
    # مرتب‌سازی: اول بر اساس شمارهٔ ابتدایی عنوان، بعد الفبا
    topics.sort(key=lambda t: (parse_leading_num(t["title"]), t["title"].lower()))
    out = {"topics": topics}
    (data_dir / "index.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] wrote {data_dir/'index.json'} with {len(topics)} topics")

if __name__ == "__main__":
    main()
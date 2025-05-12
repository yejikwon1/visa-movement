# scripts/scraper/update_dol.py

import requests
from bs4 import BeautifulSoup
import re
import json
from datetime import datetime
import os

# 📦 JSONBin 설정
API_KEY = "$2a$10$chnGp34LEzygcMi0MZX3Lez0oi8NoWGnrfskj9TjdapYXh8nou2sC"
BIN_ID = "682122be8561e97a50120085"
HEADERS = {
    "Content-Type": "application/json",
    "X-Master-Key": API_KEY
}
JSONBIN_URL = f"https://api.jsonbin.io/v3/b/{BIN_ID}"

# 🌐 DOL URL
URL = "https://flag.dol.gov/processingtimes"
OUTPUT_DIR = "data/bin"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def extract_analyst_review_days(soup):
    text = soup.get_text(separator="\n")
    pattern = r"Analyst Review\s+([A-Za-z]+ 20\d{2})\s+(\d+)"
    match = re.search(pattern, text)

    if match:
        month = match.group(1)
        days = int(match.group(2))
        return {
            "phase": "Analyst Review",
            "month": month,
            "calendar_days": days
        }
    return None

def upload_to_jsonbin(data):
    try:
        res = requests.put(JSONBIN_URL, headers=HEADERS, json={"record": data})
        res.raise_for_status()
        print("✅ JSONBin 업로드 성공!")
    except Exception as e:
        print(f"❌ JSONBin 업로드 실패: {e}")

def main():
    try:
        print(f"🔍 Fetching: {URL}")
        res = requests.get(URL)
        res.raise_for_status()

        soup = BeautifulSoup(res.text, "html.parser")
        result = extract_analyst_review_days(soup)

        if not result:
            print("❌ 테이블 형식이 예상과 다릅니다.")
            print("❌ 데이터를 추출하지 못했습니다.")
            return

        # 💾 로컬 저장
        timestamp = datetime.now().strftime("%Y-%m-%d")
        output_path = os.path.join(OUTPUT_DIR, f"perm_processing_{timestamp}.json")
        with open(output_path, "w") as f:
            json.dump(result, f, indent=2)
        print(f"✅ 저장 완료: {output_path}")

        # ☁️ JSONBin 업로드
        upload_to_jsonbin(result)

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    main()

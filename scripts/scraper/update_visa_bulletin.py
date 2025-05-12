# update_visa_bulletin.py

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
from parse_html import parse_visa_bulletin

# JSONBin 설정
API_KEY = "$2a$10$chnGp34LEzygcMi0MZX3Lez0oi8NoWGnrfskj9TjdapYXh8nou2sC"
BIN_ID = "682129658561e97a50120314"
HEADERS = {
    "Content-Type": "application/json",
    "X-Master-Key": API_KEY
}

def get_latest_url():
    now = datetime.now()
    month_name = now.strftime("%B").lower()  # ex: 'may'
    year_full = now.year                    # ex: 2025

    # The Bulletin is considered to be in the next fiscal year starting in October, so we handle this exception
    fiscal_year = year_full
    if now.month < 10:
        fiscal_year = year_full

    # 예: /2025/visa-bulletin-for-may-2025.html
    base_url = "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin"
    full_url = f"{base_url}/{fiscal_year}/visa-bulletin-for-{month_name}-{year_full}.html"

    return full_url

def fetch_and_parse_latest():
    url = get_latest_url()
    print(f"🔗 Fetching URL: {url}")
    response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})

    if response.status_code != 200:
        print(f"❌ Failed to load the page. (HTTP {response.status_code})")
        return None

    html_path = "temp_latest.html"
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(response.text)

    parsed_data = parse_visa_bulletin(html_path)
    return parsed_data

def upload_to_jsonbin(data):
    res = requests.put(
        f"https://api.jsonbin.io/v3/b/{BIN_ID}",
        headers=HEADERS,
        json=data
    )
    print("✅ Successfully updated the JSON file:", res.status_code)
    print(res.json())

if __name__ == "__main__":
    data = fetch_and_parse_latest()
    if data:
        upload_to_jsonbin(data)

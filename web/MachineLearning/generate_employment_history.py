import os
import json
import csv
import unicodedata
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(SCRIPT_DIR, '../../web/public/parsed_json') 
OUTPUT_CSV = os.path.join(SCRIPT_DIR, '../../employment_filing_history.csv')

rows = []

def normalize_key(key):
    return ''.join(
        c for c in unicodedata.normalize('NFKD', key)
        if not unicodedata.category(c).startswith('Z')
    ).replace('\xa0', '').replace('\u00a0', '').lower()

TARGET_KEY = normalize_key('AllChargeabilityAreasExceptThoseListed')

for fy_folder in sorted(os.listdir(BASE_DIR)):
    fy_path = os.path.join(BASE_DIR, fy_folder)
    if not os.path.isdir(fy_path):
        continue

    for filename in sorted(os.listdir(fy_path)):
        if not filename.endswith('.json'):
            continue

        file_path = os.path.join(fy_path, filename)

        try:
            with open(file_path, 'r') as f:
                data = json.load(f)

            employment = data.get('dates_for_filing', {}).get('employment', {})
            if not employment:
                continue

            for category, values in employment.items():
                normalized_items = {
                    normalize_key(k): v for k, v in values.items()
                }

                cutoff_raw = normalized_items.get(TARGET_KEY)
                if not cutoff_raw or cutoff_raw in ['C', 'U']:
                    continue

                try:
                    parts = filename.replace('.json', '').split('-')
                    if len(parts) != 2:
                        raise ValueError("Filename not in expected 'month-year.json' format")
                    month_str, year = parts
                    bulletin_date = datetime.strptime(f"{month_str}-{year}", "%B-%Y")
                except Exception as e:
                    print(f"⚠️ Filename parse error in {filename}: {e}")
                    continue

                try:
                    cutoff_date = datetime.strptime(cutoff_raw, "%d%b%y")
                except Exception as e:
                    print(f"⚠️ Cutoff date parse error in {filename} ({category}): {cutoff_raw} ({e})")
                    continue

                rows.append({
                    'date': bulletin_date.strftime("%Y-%m"),
                    'cutoff': cutoff_date.strftime("%Y-%m-%d"),
                    'category': category
                })

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")

# Write CSV
with open(OUTPUT_CSV, 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=['date', 'cutoff', 'category'])
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ Extracted {len(rows)} rows to {OUTPUT_CSV}")

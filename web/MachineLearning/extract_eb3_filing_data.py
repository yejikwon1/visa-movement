import os
import json
import csv
import unicodedata
from datetime import datetime, timedelta
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(SCRIPT_DIR, '../web/public/parsed_json')
OUTPUT_CSV = os.path.join(SCRIPT_DIR, '../../eb3_filing_history.csv')
OUTPUT_FORECAST_JSON = os.path.join(SCRIPT_DIR, '../../eb3_forecast.json')

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

            third_category = None
            for category in employment:
                if normalize_key(category) == normalize_key('3rd'):
                    third_category = employment[category]
                    break

            if not third_category:
                print(f"🚫 Skipped {filename}: No '3rd' category found under employment. Found categories: {list(employment.keys())}")
                continue

            normalized_keys = {
                normalize_key(key): value for key, value in third_category.items()
            }

            cutoff_raw = None
            for key, value in normalized_keys.items():
                if key.startswith("allchargeabilityareasexceptthoselisted"):
                    cutoff_raw = value
                    break

            if not cutoff_raw or cutoff_raw in ['C', 'U']:
                continue

            try:
                parts = filename.replace('.json', '').split('-')
                if len(parts) != 2:
                    raise ValueError("Filename not in expected 'month-year.json' format")
                month_str, year = parts
                bulletin_date = datetime.strptime(f"{month_str}-{year}", "%B-%Y")
                bulletin_month = bulletin_date.strftime("%Y-%m")
            except Exception as e:
                print(f"⚠️ Filename parse error in {filename}: {e}")
                continue

            try:
                cutoff_date = datetime.strptime(cutoff_raw, "%d%b%y")
            except Exception as e:
                print(f"⚠️ Cutoff date parse error in {filename}: {cutoff_raw} ({e})")
                continue

            rows.append({
                'Bulletin Month': bulletin_month,
                'Filing Cutoff Date': cutoff_date.strftime("%Y-%m-%d")
            })

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")

with open(OUTPUT_CSV, 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=['Bulletin Month', 'Filing Cutoff Date'])
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ Extracted {len(rows)} rows to {OUTPUT_CSV}")

# Time series forecast section
if rows:
    df = pd.DataFrame(rows)
    df['Bulletin Month'] = pd.to_datetime(df['Bulletin Month'])
    df['Filing Cutoff Date'] = pd.to_datetime(df['Filing Cutoff Date'])
    df.set_index('Bulletin Month', inplace=True)

    # Create a time series with the number of days since earliest cutoff
    base_date = df['Filing Cutoff Date'].min()
    df['Cutoff Days'] = (df['Filing Cutoff Date'] - base_date).dt.days

    model = ARIMA(df['Cutoff Days'], order=(1, 1, 1))
    model_fit = model.fit()

    forecast = model_fit.forecast(steps=24)
    forecast_dates = [df.index[-1] + pd.DateOffset(months=i+1) for i in range(24)]
    forecast_cutoffs = [base_date + timedelta(days=int(d)) for d in forecast]

    forecast_df = pd.DataFrame({
        'Forecast Month': [d.strftime('%Y-%m') for d in forecast_dates],
        'Forecast Cutoff Date': [d.strftime('%Y-%m-%d') for d in forecast_cutoffs]
    })

    forecast_df.to_json(OUTPUT_FORECAST_JSON, orient='records', indent=2)
    print(f"✅ Saved ARIMA forecast to {OUTPUT_FORECAST_JSON}")

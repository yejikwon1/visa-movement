import os
import json
import unicodedata
from datetime import datetime, timedelta
import pandas as pd
from prophet import Prophet
from statsmodels.tsa.arima.model import ARIMA
# from dateutil.relativedelta import relativedelta # Optional for more complex month additions

# --- Configuration ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
print(f"DEBUG: This script (train_model.py) is located at (SCRIPT_DIR): {SCRIPT_DIR}")

# Path to your historical parsed JSONs (the folder containing FY2016, FY2017, etc.)
# If SCRIPT_DIR is .../visa-movement/web/script/
# And your data is in .../visa-movement/scripts/public/parsed_json/
# Then we go up two levels from SCRIPT_DIR to visa-movement/, then into scripts/public/parsed_json/
BASE_DIR = os.path.join(SCRIPT_DIR, '../../web/public/parsed_json')
# Output path for the ML-generated FAMILY forecast
OUTPUT_FAMILY_FORECAST_JSON = os.path.join(SCRIPT_DIR, '../src/family_forecast.json') # Saving to web/src/

# --- Helper Functions ---
def normalize_key(key):
    if not isinstance(key, str): return ""
    try:
        normalized = unicodedata.normalize('NFKD', key)
        stripped = ''.join(c for c in normalized if not unicodedata.category(c).startswith('Z'))
        no_nbsp = stripped.replace('\xa0', '').replace('\u00a0', '')
        return no_nbsp.lower()
    except TypeError: return ""

# --- Main Script ---
print(f"INFO: Python script location (SCRIPT_DIR): {SCRIPT_DIR}")
print(f"INFO: Attempting to look for historical data in (BASE_DIR): {os.path.abspath(BASE_DIR)}")
if not os.path.isdir(BASE_DIR):
    print(f"❌ CRITICAL ERROR: Base directory for historical JSONs not found: {os.path.abspath(BASE_DIR)}")
    exit()
# Corrected variable name in the print statement below
print(f"INFO: Output family forecast will be saved to (OUTPUT_FAMILY_FORECAST_JSON): {os.path.abspath(OUTPUT_FAMILY_FORECAST_JSON)}")

# !! CRITICAL !! VERIFY AND UPDATE THIS MAP BASED ON YOUR SCRIPT'S DEBUG OUTPUT FOR FAMILY CATEGORIES
# Keys: The result of normalize_key() applied to the raw FAMILY category strings from your input JSONs.
# Values: The app-friendly keys ("F1", "F2A", etc.) to be used in family_forecast.json and React.
RAW_TO_APP_FAMILY_CATEGORY_MAP = {
    normalize_key('F1'): 'F1',
    normalize_key('FIRST'): 'F1', 
    normalize_key('F2A'): 'F2A',
    normalize_key('SECOND A'): 'F2A', 
    normalize_key('F2B'): 'F2B',
    normalize_key('SECOND B'): 'F2B', 
    normalize_key('F3'): 'F3',
    normalize_key('THIRD (F3)'): 'F3', 
    normalize_key('F4'): 'F4',
    normalize_key('FOURTH (F4)'): 'F4', 
    # Add more variations based on your "All unique ORIGINAL raw category keys found" debug output
}

TARGET_COUNTRY_KEY_NORMALIZED = normalize_key('AllChargeabilityAreasExceptThoseListed')

all_family_bulletin_rows = []
processed_files_count = 0
found_raw_family_categories_for_debug = set()

print("INFO: Starting to parse historical JSON files for FAMILY-BASED categories...")
for fy_folder in sorted(os.listdir(BASE_DIR)):
    fy_path = os.path.join(BASE_DIR, fy_folder)
    if not os.path.isdir(fy_path): continue
    for filename in sorted(os.listdir(fy_path)):
        if not filename.endswith('.json'): continue
        file_path = os.path.join(fy_path, filename)
        processed_files_count += 1
        try:
            with open(file_path, 'r', encoding='utf-8') as f: data = json.load(f)
            family_data_section = data.get('dates_for_filing', {}).get('family', {})
            if not family_data_section:
                continue

            for raw_cat_key_json, country_values_json in family_data_section.items():
                if raw_cat_key_json is None: continue
                found_raw_family_categories_for_debug.add(str(raw_cat_key_json))
                normalized_raw_key = normalize_key(str(raw_cat_key_json))
                if not normalized_raw_key: continue
                if not isinstance(country_values_json, dict): continue
                normalized_country_dict = {normalize_key(k): v for k, v in country_values_json.items() if isinstance(k, str)}
                cutoff_raw = normalized_country_dict.get(TARGET_COUNTRY_KEY_NORMALIZED)
                if not cutoff_raw or str(cutoff_raw).upper() in ['C', 'U']: continue
                try:
                    month_str, year_str = filename.replace('.json', '').split('-')
                    bulletin_date = datetime.strptime(f"{month_str}-{year_str}", "%B-%Y")
                    cutoff_date = datetime.strptime(str(cutoff_raw), "%d%b%y")
                except ValueError: continue
                
                app_friendly_family_key = RAW_TO_APP_FAMILY_CATEGORY_MAP.get(normalized_raw_key)
                
                if app_friendly_family_key:
                    all_family_bulletin_rows.append({
                        'bulletin_month_year': bulletin_date,
                        'cutoff_date': cutoff_date,
                        'app_category': app_friendly_family_key
                    })
        except Exception as e: print(f"❌ ERROR processing {file_path} for family data: {e}")

print(f"\nINFO: Processed {processed_files_count} JSON files for family data.")
print(f"‼️ DEBUG: All unique ORIGINAL raw FAMILY category keys found (verify RAW_TO_APP_FAMILY_CATEGORY_MAP by normalizing these): \n{sorted(list(found_raw_family_categories_for_debug))}\n")
if not all_family_bulletin_rows: print("❌ ERROR: No valid family-based data rows extracted. Check map/JSONs."); exit()

family_full_df = pd.DataFrame(all_family_bulletin_rows)
if family_full_df.empty: print("❌ ERROR: Family DataFrame is empty. No data to forecast."); exit()
family_full_df = family_full_df.dropna(subset=['cutoff_date']).sort_values(by=['app_category', 'bulletin_month_year']).drop_duplicates(subset=['app_category', 'bulletin_month_year'], keep='last')

print(f"INFO: Family DataFrame for Prophet input created with {len(family_full_df)} rows.")
family_app_categories_in_df = sorted(list(family_full_df['app_category'].unique()))
print(f"‼️ INFO: App categories in Family DataFrame for Prophet: \n{family_app_categories_in_df}\n")

desired_app_family_cats = ['F1', 'F2A', 'F2B', 'F3', 'F4']
for d_cat in desired_app_family_cats:
    if d_cat not in family_app_categories_in_df:
        print(f"🔥 CRITICAL WARNING: Desired React app family category '{d_cat}' is MISSING from data. Check RAW_TO_APP_FAMILY_CATEGORY_MAP or source data.")

family_output_forecast_data = {}
ARIMA_ORDER = (2, 1, 2) 

for current_app_category_name in family_app_categories_in_df:
    print(f"\nINFO: Processing Hybrid (Prophet + ARIMA) forecast for FAMILY category: {current_app_category_name}")
    category_df = family_full_df[family_full_df['app_category'] == current_app_category_name].copy()
    if category_df.shape[0] < 24: 
        print(f"⚠️ WARNING: Insufficient data for '{current_app_category_name}' ({category_df.shape[0]} pts, need ~24+ for Prophet+ARIMA). Skipping hybrid forecast.")
        continue
    
    base_dt = category_df['cutoff_date'].min()
    category_df['y_days_from_base'] = (category_df['cutoff_date'] - base_dt).dt.days
    prophet_df_for_fitting = category_df[['bulletin_month_year', 'y_days_from_base']].rename(columns={'bulletin_month_year': 'ds', 'y_days_from_base': 'y'})
    
    if prophet_df_for_fitting.shape[0] < 2: 
        print(f"⚠️ WARNING: Not enough data points for Prophet model in '{current_app_category_name}' (need min 2). Skipping.")
        continue

    prophet_model = Prophet(daily_seasonality=False, weekly_seasonality=False, yearly_seasonality=True, changepoint_prior_scale=0.05)
    try: prophet_model.fit(prophet_df_for_fitting)
    except Exception as e_fit_prophet: print(f"❌ ERROR fitting Prophet for '{current_app_category_name}': {e_fit_prophet}"); continue
    
    last_training_data_date = prophet_df_for_fitting['ds'].max()
    in_sample_prophet_forecast = prophet_model.predict(prophet_df_for_fitting[['ds']])
    residuals = prophet_df_for_fitting['y'].values - in_sample_prophet_forecast['yhat'].values
    residuals_df = pd.Series(residuals, index=prophet_df_for_fitting['ds'])

    arima_forecast_on_residuals = None
    try:
        arima_model = ARIMA(residuals_df, order=ARIMA_ORDER, freq='MS')
        arima_results = arima_model.fit()
        future_periods = 36
        arima_pred_residuals_raw = arima_results.forecast(steps=future_periods)
        if isinstance(arima_pred_residuals_raw, pd.Series): arima_pred_residuals = arima_pred_residuals_raw.values
        elif isinstance(arima_pred_residuals_raw, pd.DataFrame): arima_pred_residuals = arima_pred_residuals_raw.iloc[:,0].values
        else: arima_pred_residuals = arima_pred_residuals_raw
        future_residual_index = pd.date_range(start=last_training_data_date + pd.DateOffset(months=1), periods=future_periods, freq='MS')
        if len(arima_pred_residuals) == len(future_residual_index):
            arima_forecast_on_residuals = pd.Series(arima_pred_residuals, index=future_residual_index)
        else: print(f"⚠️ WARNING: Length mismatch for ARIMA residuals for {current_app_category_name}."); arima_forecast_on_residuals = None
    except Exception as e_arima: print(f"⚠️ WARNING: ARIMA on residuals failed for '{current_app_category_name}': {e_arima}. Using Prophet only."); arima_forecast_on_residuals = None

    future_dates_df_prophet = prophet_model.make_future_dataframe(periods=36, freq='MS')
    prophet_only_forecast_df = prophet_model.predict(future_dates_df_prophet)
    prophet_only_forecast_df['yhat_hybrid'] = prophet_only_forecast_df['yhat']
    if arima_forecast_on_residuals is not None:
        temp_prophet_df_indexed = prophet_only_forecast_df.set_index('ds')
        for date_index, residual_value in arima_forecast_on_residuals.items():
            if date_index in temp_prophet_df_indexed.index:
                 temp_prophet_df_indexed.loc[date_index, 'yhat_hybrid'] += residual_value
        prophet_only_forecast_df = temp_prophet_df_indexed.reset_index()
        print(f"✅ INFO: Combined Prophet and ARIMA forecasts for {current_app_category_name}.")
    else: print(f"ℹ️ INFO: Using Prophet-only forecast for {current_app_category_name}.")

    prophet_only_forecast_df['predicted_cutoff_date'] = prophet_only_forecast_df['yhat_hybrid'].apply(
        lambda d: base_dt + timedelta(days=int(round(d)))
    )
    actual_future_forecasts_df = prophet_only_forecast_df[prophet_only_forecast_df['ds'] > last_training_data_date]
    current_category_output_data = {
        ds_datetime.strftime('%Y-%m'): {'cutoff_date': pred_cutoff_dt.strftime('%Y-%m-%d'), 'ordinal': pred_cutoff_dt.toordinal()}
        for ds_datetime, pred_cutoff_dt in zip(actual_future_forecasts_df['ds'], actual_future_forecasts_df['predicted_cutoff_date'])
    }
    if current_category_output_data:
        family_output_forecast_data[current_app_category_name] = current_category_output_data
        print(f"✅ Hybrid forecast data prepared for FAMILY category: '{current_app_category_name}'.")
    else: print(f"ℹ️ INFO: No future entries from Hybrid model for FAMILY category: '{current_app_category_name}'.")

output_dir = os.path.dirname(OUTPUT_FAMILY_FORECAST_JSON) # Corrected variable name
if not os.path.exists(output_dir):
    try: os.makedirs(output_dir); print(f"INFO: Created dir: {output_dir}")
    except OSError as e_mkdir: print(f"❌ ERROR: Could not create dir {output_dir}: {e_mkdir}"); exit()

if family_output_forecast_data:
    try:
        # Corrected variable name in the open() call
        with open(OUTPUT_FAMILY_FORECAST_JSON, 'w', encoding='utf-8') as f: 
            json.dump(family_output_forecast_data, f, indent=2)
        # Corrected variable name in the print statement
        print(f"\n✅ Successfully saved consolidated FAMILY forecast to {os.path.abspath(OUTPUT_FAMILY_FORECAST_JSON)}")
        print(f"   Forecast generated for FAMILY app_categories: {list(family_output_forecast_data.keys())}")
    except Exception as e_save: print(f"\n❌ ERROR saving FAMILY forecast JSON: {e_save}")
else: print("\n⚠️ WARNING: No FAMILY forecast data was generated for ANY category. Output JSON will be empty or not created.")

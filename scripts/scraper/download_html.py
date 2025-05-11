import requests
import os
import argparse # Import argparse for command-line arguments
import datetime # Import datetime for month/year handling
import time     # Import time for delays
import json     # Import json for saving parsed data
from parse_html import parse_visa_bulletin # Import the parser function

def extract_html(url, output_path):
    """
    Fetches HTML content from a given URL and saves it to the specified output path.

    Args:
        url (str): The URL to fetch HTML from.
        output_path (str): The file path to save the HTML content.
    """
    try:
        # Ensure the output directory exists
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            print(f"Creating directory: {output_dir}")
            os.makedirs(output_dir, exist_ok=True) # This will create parent dirs too

        # Send an HTTP GET request to the URL
        print(f"Fetching HTML from: {url}")
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}) # Add User-Agent to mimic browser
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

        # Check if the request was successful
        if response.status_code == 200:
            # Get the HTML content
            html_content = response.text
            # Save the HTML content to the specified file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"Successfully saved HTML to: {output_path}")
            time.sleep(1) # Add a small delay after successful download
            return True # Indicate success
        else:
            print(f"Failed to fetch HTML. Status code: {response.status_code}")
            return False # Indicate failure

    except requests.exceptions.RequestException as e:
        print(f"An error occurred during the request: {e}")
        return False # Indicate failure
    except IOError as e:
        print(f"An error occurred while writing the file: {e}")
        return False # Indicate failure
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False # Indicate failure

# Renamed for clarity
def generate_bulletin_targets(start_fy, end_fy, base_html_dir, base_json_dir):
    """Generates Visa Bulletin URLs and corresponding HTML/JSON output paths."""
    targets = []
    base_url = "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin"
    month_map = {
        1: "january", 2: "february", 3: "march", 4: "april", 5: "may", 6: "june",
        7: "july", 8: "august", 9: "september", 10: "october", 11: "november", 12: "december"
    }

    for fy in range(start_fy, end_fy + 1):
        url_year = fy
        output_html_fy_dir = os.path.join(base_html_dir, f"FY{fy}")
        output_json_fy_dir = os.path.join(base_json_dir, f"FY{fy}")

        for month_offset in range(12):
            month_num = (10 + month_offset - 1) % 12 + 1
            if month_num >= 10:
                file_year = fy - 1
            else:
                file_year = fy

            month_name = month_map[month_num]

            url_path_segment = f"/{url_year}/visa-bulletin-for-{month_name}-{file_year}.html"
            full_url = base_url + url_path_segment

            # Generate both HTML and JSON paths
            filename_base = f"{month_name}-{file_year}"
            html_output_path = os.path.join(output_html_fy_dir, f"{filename_base}.html")
            json_output_path = os.path.join(output_json_fy_dir, f"{filename_base}.json")

            targets.append({
                "url": full_url,
                "html_path": html_output_path,
                "json_path": json_output_path
            })

    return targets


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download Visa Bulletin HTML, parse it, and save as JSON for specified fiscal years.")
    # Updated arguments
    parser.add_argument("html_output_dir", help="The base directory to save the downloaded HTML files (e.g., 'downloaded_html'). Subdirectories FYxxxx will be created.")
    parser.add_argument("json_output_dir", help="The base directory to save the parsed JSON files (e.g., 'parsed_json'). Subdirectories FYxxxx will be created.")
    args = parser.parse_args()

    start_fiscal_year = 2016 # Updated start year to include 2016-2018
    end_fiscal_year = 2025 # Inclusive

    # Normalize base output directory paths
    base_html_output_directory = os.path.normpath(args.html_output_dir)
    base_json_output_directory = os.path.normpath(args.json_output_dir)

    print(f"Generating targets for Fiscal Years {start_fiscal_year} to {end_fiscal_year}...")
    bulletins_to_process = generate_bulletin_targets(start_fiscal_year, end_fiscal_year, base_html_output_directory, base_json_output_directory)

    print(f"\nHTML Output Directory: {base_html_output_directory}")
    print(f"JSON Output Directory: {base_json_output_directory}")
    print(f"Will attempt to download and parse {len(bulletins_to_process)} bulletins...")

    download_success_count = 0
    download_failure_count = 0
    parse_success_count = 0
    parse_failure_count = 0
    failed_items = [] # Store info about failures (url, reason)

    for i, bulletin in enumerate(bulletins_to_process):
        print("-" * 20)
        print(f"Processing bulletin {i+1}/{len(bulletins_to_process)}: {bulletin['url']}")

        # --- Download Step --- 
        if extract_html(bulletin["url"], bulletin["html_path"]):
            download_success_count += 1

            # --- Parsing Step --- 
            print(f"Attempting to parse: {bulletin['html_path']}")
            parsed_data = parse_visa_bulletin(bulletin['html_path'])

            if parsed_data:
                # Ensure the output directory exists for JSON
                json_output_dir = os.path.dirname(bulletin['json_path'])
                if json_output_dir and not os.path.exists(json_output_dir):
                    print(f"Creating directory for JSON: {json_output_dir}")
                    os.makedirs(json_output_dir, exist_ok=True)

                # Save the parsed data as JSON
                try:
                    with open(bulletin['json_path'], 'w', encoding='utf-8') as jf:
                        json.dump(parsed_data, jf, indent=2)
                    print(f"Successfully saved parsed data to: {bulletin['json_path']}")
                    parse_success_count += 1
                except IOError as e:
                    print(f"Error writing JSON file {bulletin['json_path']}: {e}")
                    parse_failure_count += 1
                    failed_items.append({"url": bulletin["url"], "html": bulletin["html_path"], "reason": f"JSON write error: {e}"})
                except Exception as e:
                     print(f"Unexpected error saving JSON {bulletin['json_path']}: {e}")
                     parse_failure_count += 1
                     failed_items.append({"url": bulletin["url"], "html": bulletin["html_path"], "reason": f"JSON unexpected save error: {e}"})
            else:
                print(f"Parsing failed for: {bulletin['html_path']}")
                parse_failure_count += 1
                failed_items.append({"url": bulletin["url"], "html": bulletin["html_path"], "reason": "Parsing function returned None"})

        else: # Download failed
            download_failure_count += 1
            # No need to increment parse_failure_count here, as parsing wasn't attempted
            failed_items.append({"url": bulletin["url"], "html": "N/A (Download Failed)", "reason": "Download failed"})
            # extract_html already prints errors

    print("=" * 40)
    print("Processing finished.")
    print(f"Downloads - Success: {download_success_count}, Failures: {download_failure_count}")
    print(f"Parsing   - Success: {parse_success_count}, Failures: {parse_failure_count}")

    if failed_items:
        print("--- Failures Summary ---")
        for item in failed_items:
            print(f"- URL: {item['url']}")
            print(f"  HTML: {item['html']}")
            print(f"  Reason: {item['reason']}")
        print("------------------------")
    print("=" * 40)

    if download_failure_count > 0 or parse_failure_count > 0:
        exit(1) # Exit with error code if any downloads or parsing failed 
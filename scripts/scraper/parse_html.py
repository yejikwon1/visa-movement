import os
import sys
from bs4 import BeautifulSoup
import json
import re # Import regular expression module
import argparse # Import argparse for command-line arguments
import datetime


def convert_date_format(date_str):
    if date_str in {"C", "U", ""}:
        return date_str
    try:
        dt = datetime.datetime.strptime(date_str, "%d%b%y")
        return dt.strftime("%m-%d-%Y")
    except Exception:
        return date_str

def convert_all_dates(obj):
    if isinstance(obj, dict):
        return {k: convert_all_dates(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_all_dates(item) for item in obj]
    elif isinstance(obj, str):
        return convert_date_format(obj)
    else:
        return obj

def parse_visa_bulletin(html_path):
    """
    Parses the HTML file to extract visa bulletin data.

    Args:
        html_path (str): The path to the saved HTML file.

    Returns:
        dict: A dictionary containing the extracted visa bulletin data,
              or None if parsing fails.
    """
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()

        soup = BeautifulSoup(html_content, 'html.parser')

        print(f"Parsing HTML file: {html_path}")

        def extract_table_data(table):
            """Helper function to extract data from a visa bulletin table."""
            data = {}
            headers = []
            rows = table.find_all('tr')
            if not rows:
                print("Warning: Found a table with no rows.")
                return None # Return None if table has no rows

            # Extract headers (chargeability areas)
            header_cells = rows[0].find_all('td')
            if not header_cells:
                 print("Warning: Found a table header row with no cells.")
                 return None # Return None if header row has no cells

            # Clean header text (remove extra spaces, newlines, replace <br>)
            headers = [' '.join(cell.stripped_strings) for cell in header_cells]
            # Standardize headers slightly for easier key access
            headers = [h.replace('-mainland born', '').replace(' ', '') for h in headers]
            # Ensure the first header is always 'Preference'
            if headers:
                headers[0] = "Preference"
            else:
                 print("Warning: Could not extract headers from table.")
                 return None # Return None if headers couldn't be extracted


            # Extract data rows
            for row in rows[1:]:
                cells = row.find_all('td')
                if not cells:
                    continue
                # Clean preference category name
                preference = ' '.join(cells[0].stripped_strings)
                # Handle multi-line preference names like "5th Set Aside:\nRural..."
                preference = preference.replace(':\n', ' ').replace('\n', ' ')
                if not preference:
                    print(f"Warning: Skipping row with empty preference category in table from {html_path}")
                    continue # Skip rows with empty preference

                data[preference] = {}
                for i, cell in enumerate(cells[1:], 1):
                    if i < len(headers):
                        chargeability_area = headers[i]
                        # Join stripped strings, handling potential multiple lines/tags within a cell
                        date_value = ' '.join(cell.stripped_strings)
                        data[preference][chargeability_area] = date_value
                    else:
                        print(f"Warning: More cells found in row '{preference}' than headers. Skipping extra cells.")
            return data

        # Revised table finding logic based on <u> tag content using regex and find_next
        try:
            # Compile regex patterns to handle &nbsp; and regular spaces
            # Making patterns slightly more flexible regarding spacing and wording variations
            fa_family_pattern = re.compile(r"FINAL\s+ACTION\s+DATES\s+FOR\s+FAMILY(?:-SPONSORED)?\s+PREFERENCE\s+CASES", re.IGNORECASE)
            filing_family_pattern = re.compile(r"DATES\s+FOR\s+FILING\s+(?:FAMILY-SPONSORED)?\s*VISA\s+APPLICATIONS", re.IGNORECASE)
            fa_employment_pattern = re.compile(r"FINAL\s+ACTION\s+DATES\s+FOR\s+EMPLOYMENT(?:-BASED)?\s+PREFERENCE\s+CASES", re.IGNORECASE)
            filing_employment_pattern = re.compile(r"DATES\s+FOR\s+FILING\s+(?:OF)?\s*EMPLOYMENT(?:-BASED)?\s*VISA\s+APPLICATIONS", re.IGNORECASE)

            # Use find_all and iterate for robustness
            all_u_tags = soup.find_all('u')

            final_action_family_p = None
            filing_family_p = None
            final_action_employment_p = None
            filing_employment_p = None

            for u_tag in all_u_tags:
                tag_text = u_tag.get_text(strip=True)
                if fa_family_pattern.search(tag_text):
                    final_action_family_p = u_tag.find_parent('p')
                elif filing_family_pattern.search(tag_text):
                    filing_family_p = u_tag.find_parent('p')
                elif fa_employment_pattern.search(tag_text):
                    final_action_employment_p = u_tag.find_parent('p')
                elif filing_employment_pattern.search(tag_text):
                    filing_employment_p = u_tag.find_parent('p')

            # Check if all parent <p> tags were found
            if not all([final_action_family_p, filing_family_p, final_action_employment_p, filing_employment_p]):
                missing = []
                if not final_action_family_p: missing.append("Final Action Family")
                if not filing_family_p: missing.append("Filing Family")
                if not final_action_employment_p: missing.append("Final Action Employment")
                if not filing_employment_p: missing.append("Filing Employment")
                print(f"Error: Could not find parent <p> tags for headings: {', '.join(missing)}")
                return None

            # Find the next table after each paragraph
            final_action_family_table = final_action_family_p.find_next('table')
            filing_family_table = filing_family_p.find_next('table')
            final_action_employment_table = final_action_employment_p.find_next('table')
            filing_employment_table = filing_employment_p.find_next('table')

        except AttributeError: # Handles case where find() or find_parent() returns None (should be less likely now)
            print("Error: An unexpected structure encountered while finding heading tags or their parents.")
            return None

        if not all([final_action_family_table, filing_family_table, final_action_employment_table, filing_employment_table]):
            missing_tables = []
            if not final_action_family_table: missing_tables.append("Final Action Family")
            if not filing_family_table: missing_tables.append("Filing Family")
            if not final_action_employment_table: missing_tables.append("Final Action Employment")
            if not filing_employment_table: missing_tables.append("Filing Employment")
            print(f"Error: Could not find all required visa bulletin tables after locating headings: {', '.join(missing_tables)}")
            return None

        # Extract data using the helper function
        fa_family_data = extract_table_data(final_action_family_table)
        fa_employment_data = extract_table_data(final_action_employment_table)
        filing_family_data = extract_table_data(filing_family_table)
        filing_employment_data = extract_table_data(filing_employment_table)

        # Check if any table extraction failed
        if not all([fa_family_data, fa_employment_data, filing_family_data, filing_employment_data]):
             print("Error: Failed to extract data from one or more tables. Check table structure.")
             # Optionally return partial data or None
             # return {
             #     "final_action_dates": {"family": fa_family_data, "employment": fa_employment_data},
             #     "dates_for_filing": {"family": filing_family_data, "employment": filing_employment_data}
             # }
             return None # Returning None as per original logic on failure

        extracted_data = {
            "final_action_dates": {
                "family": fa_family_data,
                "employment": fa_employment_data
            },
            "dates_for_filing": {
                "family": filing_family_data,
                "employment": filing_employment_data
            }
        }

        print("Successfully parsed HTML.")
        return extracted_data

    except FileNotFoundError:
        print(f"Error: HTML file not found at {html_path}")
        return None
    except Exception as e:
        print(f"An error occurred during HTML parsing: {e}")
        import traceback
        traceback.print_exc() # Print stack trace for debugging
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Parse visa bulletin data from an HTML file.")
    parser.add_argument("html_path", help="The path to the saved HTML file.")
    parser.add_argument("json_output_path", help="The file path to save the parsed JSON data.")
    args = parser.parse_args()

    # Normalize paths
    html_file_path = os.path.normpath(args.html_path)
    json_output_file_path = os.path.normpath(args.json_output_path)

    # Parse the HTML file
    parsed_data = parse_visa_bulletin(html_file_path)

    if parsed_data:
        parsed_data = convert_all_dates(parsed_data)
        # Ensure the output directory exists for JSON
        json_output_dir = os.path.dirname(json_output_file_path)
        if json_output_dir and not os.path.exists(json_output_dir):
            print(f"Creating directory for JSON: {json_output_dir}")
            os.makedirs(json_output_dir, exist_ok=True)

        # Save the parsed data as JSON
        try:
            with open(json_output_file_path, 'w', encoding='utf-8') as jf:
                json.dump(parsed_data, jf, indent=2)
            print(f"Successfully saved parsed data to: {json_output_file_path}")
        except IOError as e:
            print(f"An error occurred while writing the JSON file: {e}")
            exit(1)
        except Exception as e:
            print(f"An unexpected error occurred while saving JSON: {e}")
            exit(1)
    else:
        print("HTML parsing failed.")
        exit(1) # Exit with error code 
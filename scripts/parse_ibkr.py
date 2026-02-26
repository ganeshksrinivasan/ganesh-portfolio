#!/usr/bin/env python3
"""
IBKR CSV Parser — reads your IBKR activity statement and updates src/data.js
Run automatically by GitHub Actions when you upload a new CSV to ibkr-uploads/
"""

import csv
import re
import os
import sys
from pathlib import Path

def parse_ibkr_csv(filepath):
    """Extract all relevant numbers from the IBKR activity statement CSV."""
    data = {}
    
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    for row in rows:
        if len(row) < 3:
            continue
        
        section = row[0].strip()
        row_type = row[1].strip() if len(row) > 1 else ''
        
        # ── Period (to extract year) ──────────────────────────
        if section == 'Statement' and row_type == 'Data':
            if len(row) >= 4 and row[2].strip() == 'Period':
                period = row[3].strip()
                # Extract the end date year e.g. "January 1, 2026 - February 25, 2026"
                years = re.findall(r'\d{4}', period)
                if years:
                    data['year'] = years[-1]  # use the end year
                    data['period'] = period
        
        # ── Net Asset Value (ending portfolio value + TWRR) ──
        if section == 'Net Asset Value' and row_type == 'Data':
            if len(row) >= 3:
                field = row[2].strip()
                if field == 'Total' and len(row) >= 5:
                    # Current Total is col 5 (index 4)
                    try:
                        data['endValue'] = float(row[4].strip().replace(',', ''))
                    except:
                        pass
                # TWRR is on its own data row with a % value
                if '%' in field:
                    try:
                        twrr_str = field.replace('%', '').strip()
                        data['twrr'] = float(twrr_str)
                    except:
                        pass
        
        # ── Change in NAV ─────────────────────────────────────
        if section == 'Change in NAV' and row_type == 'Data':
            if len(row) >= 4:
                field = row[2].strip()
                try:
                    value = float(row[3].strip().replace(',', ''))
                except:
                    continue
                
                if field == 'Mark-to-Market':
                    data['mtm'] = value
                elif field == 'Deposits & Withdrawals':
                    data['deposits'] = value
                elif field == 'Dividends':
                    data['dividends_gross'] = value
                elif field == 'Withholding Tax':
                    data['withholding_tax'] = value
                elif field == 'Interest':
                    data['interest'] = value
                elif field == 'Starting Value':
                    data['startValue'] = value
                elif field == 'Ending Value':
                    data['endValue_nav'] = value  # double-check

    # Net dividends = gross dividends + withholding tax (tax is negative)
    gross = data.get('dividends_gross', 0)
    wht   = data.get('withholding_tax', 0)
    data['divNet'] = round(gross + wht, 2)
    
    # Use the NAV ending value as the authoritative end value
    if 'endValue_nav' in data:
        data['endValue'] = data['endValue_nav']
    
    return data


def update_data_js(parsed, data_js_path):
    """Update src/data.js with the new year-to-date data."""
    
    year     = parsed.get('year', 'unknown')
    deposits = round(parsed.get('deposits', 0))
    end_val  = round(parsed.get('endValue', 0))
    mtm      = round(parsed.get('mtm', 0))
    twrr     = round(parsed.get('twrr', 0), 2)
    div_net  = round(parsed.get('divNet', 0))
    interest = round(parsed.get('interest', 0), 2)

    with open(data_js_path, 'r') as f:
        content = f.read()

    # Find the last cumDeposits value to calculate new cumulative
    cum_dep_matches = re.findall(r'cumDeposits:\s*(\d+)', content)
    last_cum = int(cum_dep_matches[-1]) if cum_dep_matches else 0
    
    # Find if this year already exists in the file
    year_pattern = rf'{{[^}}]*year:\s*"{year}"[^}}]*}}'
    
    new_entry = (
        f'  {{ year: "{year}", deposits: {deposits}, '
        f'cumDeposits: {last_cum + deposits}, '
        f'endValue: {end_val}, '
        f'mtm: {mtm}, '
        f'twrr: {twrr}, '
        f'divNet: {div_net}, '
        f'interest: {interest} }},\n'
    )

    if re.search(rf'year:\s*"{year}"', content):
        # Year exists — update it
        content = re.sub(year_pattern, new_entry.strip().rstrip(','), content)
        print(f"✅ Updated existing entry for {year}")
    else:
        # New year — insert before the comment line
        insert_marker = '  // ── ADD NEW YEARS BELOW THIS LINE'
        if insert_marker in content:
            content = content.replace(insert_marker, new_entry + insert_marker)
        else:
            # Fallback: insert before closing ];
            content = content.replace('];\n', f'\n{new_entry}];\n')
        print(f"✅ Added new entry for {year}")

    with open(data_js_path, 'w') as f:
        f.write(content)
    
    print(f"\n📊 Summary for {year} ({parsed.get('period', '')}):")
    print(f"   Portfolio Value : ${end_val:,}")
    print(f"   Deposits YTD    : ${deposits:,}")
    print(f"   Mark-to-Market  : ${mtm:,}")
    print(f"   TWRR            : {twrr}%")
    print(f"   Net Dividends   : ${div_net:,}")
    print(f"   Interest        : ${interest:,}")


def main():
    # Find the CSV file in ibkr-uploads/
    uploads_dir = Path('ibkr-uploads')
    csv_files = list(uploads_dir.glob('*.csv'))
    
    if not csv_files:
        print("❌ No CSV file found in ibkr-uploads/ folder")
        sys.exit(1)
    
    # Use the most recently modified file
    csv_file = sorted(csv_files, key=os.path.getmtime)[-1]
    print(f"📂 Reading: {csv_file}")
    
    parsed = parse_ibkr_csv(csv_file)
    
    if 'year' not in parsed:
        print("❌ Could not extract year from CSV")
        sys.exit(1)
    
    data_js = Path('src/data.js')
    update_data_js(parsed, data_js)
    print("\n🚀 data.js updated! Vercel will redeploy automatically.")


if __name__ == '__main__':
    main()

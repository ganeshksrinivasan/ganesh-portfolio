#!/usr/bin/env python3
"""
IBKR CSV Parser — reads your IBKR activity statement and updates src/data.js
Run automatically by GitHub Actions when you upload a new CSV to ibkr-uploads/
"""

import csv, re, os, sys
from pathlib import Path


def parse_ibkr_csv(filepath):
    data    = {}
    monthly = [0.0] * 12

    with open(filepath, 'r', encoding='utf-8-sig') as f:
        rows = list(csv.reader(f))

    for row in rows:
        if len(row) < 3:
            continue
        sec  = row[0].strip()
        kind = row[1].strip()

        if sec == 'Statement' and kind == 'Data' and len(row) >= 4 and row[2].strip() == 'Period':
            years = re.findall(r'\d{4}', row[3])
            if years:
                data['year']   = years[-1]
                data['period'] = row[3].strip()

        if sec == 'Net Asset Value' and kind == 'Data' and len(row) >= 3:
            f = row[2].strip()
            if f == 'Total' and len(row) >= 5:
                try: data['endValue'] = float(row[4].replace(',',''))
                except: pass
            if '%' in f:
                try: data['twrr'] = float(f.replace('%','').strip())
                except: pass

        if sec == 'Change in NAV' and kind == 'Data' and len(row) >= 4:
            f = row[2].strip()
            try: v = float(row[3].replace(',',''))
            except: continue
            if   f == 'Mark-to-Market':          data['mtm']             = v
            elif f == 'Deposits & Withdrawals':  data['deposits']        = v
            elif f == 'Dividends':               data['dividends_gross'] = v
            elif f == 'Withholding Tax':         data['withholding_tax'] = v
            elif f == 'Interest':                data['interest']        = v
            elif f == 'Ending Value':            data['endValue']        = v

        if sec == 'Deposits & Withdrawals' and kind == 'Data' and len(row) >= 6:
            try:
                mi = int(row[3].strip().split('-')[1]) - 1
                monthly[mi] += float(row[5].replace(',',''))
            except: pass

    data['monthly'] = [round(v) for v in monthly]
    data['divNet']  = round(data.get('dividends_gross',0) + data.get('withholding_tax',0), 2)
    return data


def clean_year_from_section(text, year):
    """Remove all lines containing this year (commented or not)."""
    # Remove JS object entries: { year: "2026", ... },
    text = re.sub(rf'[ \t]*//[^\n]*year:\s*"{year}"[^\n]*\n', '', text)
    text = re.sub(rf'[ \t]*\{{[^}}\n]*year:\s*"{year}"[^}}\n]*\}},?[ \t]*\n', '', text)
    # Remove monthly array entries: 2026: [...],
    text = re.sub(rf'[ \t]*//[^\n]*{year}:\s*\[[^\n]*\n', '', text)
    text = re.sub(rf'[ \t]*{year}:\s*\[[^\n]*\n', '', text)
    return text


def update_data_js(parsed, path):
    year     = parsed['year']
    deposits = round(parsed.get('deposits', 0))
    end_val  = round(parsed.get('endValue', 0))
    mtm      = round(parsed.get('mtm', 0))
    twrr     = round(parsed.get('twrr', 0), 2)
    div_net  = parsed.get('divNet', 0)
    interest = round(parsed.get('interest', 0), 2)
    monthly  = parsed.get('monthly', [0]*12)

    content = path.read_text()

    # Find cumDeposits from most recent year that isn't this year
    cum_matches = re.findall(
        rf'year:\s*"(?!{year})[^"]+",\s*deposits:\s*\d+,\s*cumDeposits:\s*(\d+)', content)
    last_cum = int(cum_matches[-1]) if cum_matches else 0

    # Split file at YEARLY_DATA and MONTHLY_DEPOSITS section boundaries
    yearly_split  = 'export const YEARLY_DATA = ['
    monthly_split = 'export const MONTHLY_DEPOSITS = {'

    before_yearly  = content[:content.index(yearly_split)]
    yearly_and_rest = content[content.index(yearly_split):]
    yearly_section = yearly_and_rest[:yearly_and_rest.index(monthly_split)]
    monthly_and_rest = yearly_and_rest[yearly_and_rest.index(monthly_split):]

    # Clean this year from both sections
    yearly_section   = clean_year_from_section(yearly_section, year)
    monthly_and_rest = clean_year_from_section(monthly_and_rest, year)

    # Insert new yearly entry before its marker
    new_yearly = (f'  {{ year: "{year}", deposits: {deposits}, cumDeposits: {last_cum + deposits}, '
                  f'endValue: {end_val}, mtm: {mtm}, twrr: {twrr}, divNet: {div_net}, interest: {interest} }},\n')
    yearly_marker = '  // ── ADD NEW YEARS BELOW THIS LINE'
    yearly_section = yearly_section.replace(yearly_marker, new_yearly + yearly_marker)

    # Insert new monthly entry before its marker
    new_monthly    = f'  {year}: [{", ".join(str(v) for v in monthly)}],\n'
    monthly_and_rest = monthly_and_rest.replace(yearly_marker, new_monthly + yearly_marker, 1)

    path.write_text(before_yearly + yearly_section + monthly_and_rest)

    print(f"✅ YEARLY_DATA updated for {year}")
    print(f"✅ MONTHLY_DEPOSITS updated for {year}")
    print(f"\n📊 {year} ({parsed.get('period','')}):")
    print(f"   Portfolio: ${end_val:,}  |  Deposits: ${deposits:,}  |  TWRR: {twrr}%")
    print(f"   Monthly  : {monthly}")


def main():
    csv_files = list(Path('ibkr-uploads').glob('*.csv'))
    if not csv_files:
        print("❌ No CSV in ibkr-uploads/"); sys.exit(1)
    csv_file = sorted(csv_files, key=os.path.getmtime)[-1]
    print(f"📂 {csv_file}")
    parsed = parse_ibkr_csv(csv_file)
    if 'year' not in parsed:
        print("❌ Could not find year"); sys.exit(1)
    update_data_js(parsed, Path('src/data.js'))
    print("\n🚀 Done! Vercel will redeploy automatically.")

if __name__ == '__main__':
    main()

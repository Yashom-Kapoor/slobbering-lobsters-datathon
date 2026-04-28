import json
import sys
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).parent.parent
CSV_PATH = ROOT / "data" / "clean_year_region.csv"
OUT_JSON = ROOT / "data" / "map_data.json"
OUT_JS   = ROOT / "data" / "map_data_embed.js"

# ISO A3 → ISO 3166-1 numeric (for matching world-atlas TopoJSON feature IDs)
ISO_A3_TO_NUM = {
    "AFG":4,"ALB":8,"DZA":12,"AGO":24,"ARG":32,"ARM":51,"AZE":31,
    "BGD":50,"BLR":112,"BLZ":84,"BEN":204,"BTN":64,"BOL":68,"BIH":70,
    "BWA":72,"BRA":76,"BFA":854,"BDI":108,"CPV":132,"KHM":116,"CMR":120,
    "CAF":140,"TCD":148,"CHN":156,"COL":170,"COM":174,"COG":178,"CRI":188,
    "CUB":192,"CIV":384,"PRK":408,"COD":180,"DJI":262,"DMA":212,"DOM":214,
    "ECU":218,"EGY":818,"SLV":222,"GNQ":226,"ERI":232,"SWZ":748,"ETH":231,
    "FJI":242,"GAB":266,"GMB":270,"GEO":268,"GHA":288,"GRD":308,"GTM":320,
    "GIN":324,"GNB":624,"GUY":328,"HTI":332,"HND":340,"IND":356,"IDN":360,
    "IRN":364,"IRQ":368,"JAM":388,"JOR":400,"KAZ":398,"KEN":404,"KIR":296,
    "XKX":926,"KGZ":417,"LAO":418,"LBN":422,"LSO":426,"LBR":430,"LBY":434,
    "MDG":450,"MWI":454,"MYS":458,"MDV":462,"MLI":466,"MHL":584,"MRT":478,
    "MUS":480,"MEX":484,"FSM":583,"MDA":498,"MNG":496,"MNE":499,"MSR":500,
    "MAR":504,"MOZ":508,"MMR":104,"NAM":516,"NPL":524,"NIC":558,"NER":562,
    "NGA":566,"MKD":807,"PAK":586,"PLW":585,"PAN":591,"PNG":598,"PRY":600,
    "PER":604,"PHL":608,"RWA":646,"SHN":654,"LCA":662,"VCT":670,"WSM":882,
    "SEN":686,"SRB":688,"SLE":694,"SLB":90,"SOM":706,"ZAF":710,"SSD":728,
    "LKA":144,"SDN":729,"SUR":740,"SYR":760,"STP":678,"TJK":762,"TZA":834,
    "THA":764,"TLS":626,"TGO":768,"TON":776,"TUN":788,"TKM":795,"TUR":792,
    "UGA":800,"UKR":804,"UZB":860,"VUT":548,"VEN":862,"VNM":704,"PSE":275,
    "YEM":887,"ZMB":894,"ZWE":716,
}

# Dataset country name → ISO A3
COUNTRY_TO_ISO = {
    "Afghanistan": "AFG",
    "Albania": "ALB",
    "Algeria": "DZA",
    "Angola": "AGO",
    "Argentina": "ARG",
    "Armenia": "ARM",
    "Azerbaijan": "AZE",
    "Bangladesh": "BGD",
    "Belarus": "BLR",
    "Belize": "BLZ",
    "Benin": "BEN",
    "Bhutan": "BTN",
    "Bolivia": "BOL",
    "Bosnia and Herzegovina": "BIH",
    "Botswana": "BWA",
    "Brazil": "BRA",
    "Burkina Faso": "BFA",
    "Burundi": "BDI",
    "Cabo Verde": "CPV",
    "Cambodia": "KHM",
    "Cameroon": "CMR",
    "Central African Republic": "CAF",
    "Chad": "TCD",
    "China (People's Republic of)": "CHN",
    "Colombia": "COL",
    "Comoros": "COM",
    "Congo": "COG",
    "Costa Rica": "CRI",
    "Cuba": "CUB",
    "Côte d'Ivoire": "CIV",
    "Cote d'Ivoire": "CIV",
    "Democratic People's Republic of Korea": "PRK",
    "Democratic Republic of the Congo": "COD",
    "Djibouti": "DJI",
    "Dominica": "DMA",
    "Dominican Republic": "DOM",
    "Ecuador": "ECU",
    "Egypt": "EGY",
    "El Salvador": "SLV",
    "Equatorial Guinea": "GNQ",
    "Eritrea": "ERI",
    "Eswatini": "SWZ",
    "Ethiopia": "ETH",
    "Fiji": "FJI",
    "Gabon": "GAB",
    "Gambia": "GMB",
    "Georgia": "GEO",
    "Ghana": "GHA",
    "Grenada": "GRD",
    "Guatemala": "GTM",
    "Guinea": "GIN",
    "Guinea-Bissau": "GNB",
    "Guyana": "GUY",
    "Haiti": "HTI",
    "Honduras": "HND",
    "India": "IND",
    "Indonesia": "IDN",
    "Iran": "IRN",
    "Iraq": "IRQ",
    "Jamaica": "JAM",
    "Jordan": "JOR",
    "Kazakhstan": "KAZ",
    "Kenya": "KEN",
    "Kiribati": "KIR",
    "Kosovo": "XKX",
    "Kyrgyzstan": "KGZ",
    "Kyrgyz Republic": "KGZ",
    "Lao People's Democratic Republic": "LAO",
    "Lao PDR": "LAO",
    "Lebanon": "LBN",
    "Lesotho": "LSO",
    "Liberia": "LBR",
    "Libya": "LBY",
    "Madagascar": "MDG",
    "Malawi": "MWI",
    "Malaysia": "MYS",
    "Maldives": "MDV",
    "Mali": "MLI",
    "Marshall Islands": "MHL",
    "Mauritania": "MRT",
    "Mauritius": "MUS",
    "Mexico": "MEX",
    "Micronesia": "FSM",
    "Moldova": "MDA",
    "Mongolia": "MNG",
    "Montenegro": "MNE",
    "Montserrat": "MSR",
    "Morocco": "MAR",
    "Mozambique": "MOZ",
    "Myanmar": "MMR",
    "Namibia": "NAM",
    "Nepal": "NPL",
    "Nicaragua": "NIC",
    "Niger": "NER",
    "Nigeria": "NGA",
    "North Macedonia": "MKD",
    "Pakistan": "PAK",
    "Palau": "PLW",
    "Panama": "PAN",
    "Papua New Guinea": "PNG",
    "Paraguay": "PRY",
    "Peru": "PER",
    "Philippines": "PHL",
    "Rwanda": "RWA",
    "Saint Helena": "SHN",
    "Saint Lucia": "LCA",
    "Saint Vincent and the Grenadines": "VCT",
    "Samoa": "WSM",
    "Senegal": "SEN",
    "Serbia": "SRB",
    "Sierra Leone": "SLE",
    "Solomon Islands": "SLB",
    "Somalia": "SOM",
    "South Africa": "ZAF",
    "South Sudan": "SSD",
    "Sri Lanka": "LKA",
    "Sudan": "SDN",
    "Suriname": "SUR",
    "Syrian Arab Republic": "SYR",
    "São Tomé and Príncipe": "STP",
    "Sao Tome and Principe": "STP",
    "Tajikistan": "TJK",
    "Tanzania": "TZA",
    "Thailand": "THA",
    "Timor-Leste": "TLS",
    "Togo": "TGO",
    "Tonga": "TON",
    "Tunisia": "TUN",
    "Turkmenistan": "TKM",
    "Türkiye": "TUR",
    "Turkiye": "TUR",
    "Turkey": "TUR",
    "Uganda": "UGA",
    "Ukraine": "UKR",
    "Uzbekistan": "UZB",
    "Vanuatu": "VUT",
    "Venezuela": "VEN",
    "Viet Nam": "VNM",
    "Vietnam": "VNM",
    "West Bank and Gaza Strip": "PSE",
    "Yemen": "YEM",
    "Zambia": "ZMB",
    "Zimbabwe": "ZWE",
}

SKIP_PATTERNS = [
    "regional", "developing countries", "unspecified", "global or",
    "bilateral", "ex-yugoslavia",
]

def should_skip(country: str) -> bool:
    if not isinstance(country, str):
        return True
    if ";" in country:
        return True
    cl = country.lower()
    return any(p in cl for p in SKIP_PATTERNS)


def round2(x):
    return round(float(x), 4) if pd.notna(x) else 0.0


def main():
    print("Reading CSV...", file=sys.stderr)
    df = pd.read_csv(CSV_PATH, low_memory=False)
    total_rows = len(df)

    # Coerce year to int, drop unparseable
    df["year"] = pd.to_numeric(df["year"], errors="coerce")
    df = df.dropna(subset=["year"])
    df["year"] = df["year"].astype(int)

    # Coerce disbursements to float
    df["usd_disbursements_defl"] = pd.to_numeric(df["usd_disbursements_defl"], errors="coerce").fillna(0.0)

    # Mark skippable rows
    df["_skip"] = df["country"].apply(should_skip)
    skipped = df["_skip"].sum()
    df_map = df[~df["_skip"]].copy()
    print(f"Skipped {skipped}/{total_rows} rows (regional/multi-country/unspecified)", file=sys.stderr)

    # Map country → ISO A3
    df_map["iso"] = df_map["country"].map(COUNTRY_TO_ISO)
    unmapped = df_map[df_map["iso"].isna()]["country"].unique()
    if len(unmapped):
        print(f"WARNING: {len(unmapped)} unmapped countries (skipping): {sorted(unmapped)}", file=sys.stderr)
    df_map = df_map.dropna(subset=["iso"])

    # Normalize sector_description: skip multi-sector rows
    df_map["_multi_sector"] = df_map["sector_description"].apply(
        lambda x: isinstance(x, str) and ";" in x
    )
    df_sector = df_map[~df_map["_multi_sector"]].copy()

    years = sorted(df_map["year"].unique().tolist())

    # --- Build byCountry ---
    country_meta = (
        df_map[["iso", "country", "region_macro"]]
        .drop_duplicates("iso")
        .set_index("iso")
    )

    by_country: dict = {}
    for iso, group in df_map.groupby("iso"):
        meta_row = country_meta.loc[iso] if iso in country_meta.index else None
        name = meta_row["country"] if meta_row is not None else iso
        macro = meta_row["region_macro"] if meta_row is not None else ""
        # Normalize macro (some have ";" from multi-macro rows — take first)
        if isinstance(macro, str) and ";" in macro:
            macro = macro.split(";")[0].strip()

        year_data: dict = {}
        # "all" years
        sector_all = (
            df_sector[df_sector["iso"] == iso]
            .groupby("sector_description")["usd_disbursements_defl"]
            .sum()
            .sort_values(ascending=False)
            .head(10)
        )
        year_data["all"] = {
            "total": round2(group["usd_disbursements_defl"].sum()),
            "count": int(len(group)),
            "sectors": {k: round2(v) for k, v in sector_all.items()},
        }

        for yr in years:
            yg = group[group["year"] == yr]
            if len(yg) == 0:
                continue
            sec_yr = (
                df_sector[(df_sector["iso"] == iso) & (df_sector["year"] == yr)]
                .groupby("sector_description")["usd_disbursements_defl"]
                .sum()
                .sort_values(ascending=False)
                .head(10)
            )
            year_data[str(yr)] = {
                "total": round2(yg["usd_disbursements_defl"].sum()),
                "count": int(len(yg)),
                "sectors": {k: round2(v) for k, v in sec_yr.items()},
            }

        by_country[iso] = {
            "name": str(name),
            "regionMacro": str(macro),
            "years": year_data,
        }

    # --- Global sector breakdown ---
    global_sectors: dict = {}
    for label, mask in [("all", slice(None))] + [(str(y), df_sector["year"] == y) for y in years]:
        sub = df_sector if label == "all" else df_sector[mask]
        gs = (
            sub.groupby("sector_description")["usd_disbursements_defl"]
            .sum()
            .sort_values(ascending=False)
        )
        global_sectors[label] = {k: round2(v) for k, v in gs.items()}

    # --- Global totals & counts ---
    global_totals: dict = {}
    global_counts: dict = {}
    global_totals["all"] = round2(df_map["usd_disbursements_defl"].sum())
    global_counts["all"] = int(len(df_map))
    for yr in years:
        ym = df_map[df_map["year"] == yr]
        global_totals[str(yr)] = round2(ym["usd_disbursements_defl"].sum())
        global_counts[str(yr)] = int(len(ym))

    # --- Top countries (by total disbursements) ---
    top_countries: dict = {}
    country_totals = df_map.groupby("iso")["usd_disbursements_defl"].sum().sort_values(ascending=False)
    top_countries["all"] = [[iso, round2(v)] for iso, v in country_totals.head(20).items()]
    for yr in years:
        ym = df_map[df_map["year"] == yr]
        ct_yr = ym.groupby("iso")["usd_disbursements_defl"].sum().sort_values(ascending=False)
        top_countries[str(yr)] = [[iso, round2(v)] for iso, v in ct_yr.head(20).items()]

    # --- Sector & donor lists ---
    all_sectors = list(global_sectors["all"].keys())
    all_donors = sorted(df["Donor_country"].dropna().unique().tolist())

    output = {
        "isoA3ToNum": ISO_A3_TO_NUM,
        "years": years,
        "sectors": all_sectors,
        "donorCountries": all_donors,
        "byCountry": by_country,
        "globalSectors": global_sectors,
        "globalTotals": global_totals,
        "globalCounts": global_counts,
        "topCountries": top_countries,
    }

    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False), encoding="utf-8")
    OUT_JS.write_text(f"const MAP_DATA = {json.dumps(output, ensure_ascii=False)};", encoding="utf-8")

    print(f"Written {OUT_JSON}", file=sys.stderr)
    print(f"  Countries mapped: {len(by_country)}", file=sys.stderr)
    print(f"  Years: {years}", file=sys.stderr)
    print(f"  Sectors: {len(all_sectors)}", file=sys.stderr)
    size_kb = OUT_JSON.stat().st_size / 1024
    print(f"  JSON size: {size_kb:.1f} KB", file=sys.stderr)


if __name__ == "__main__":
    main()

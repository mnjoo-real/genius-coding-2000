from pathlib import Path
import pandas as pd

RAW_PATH = Path("data/raw/ZIP_COUNTY.xlsx")
OUT_PATH = Path("data/processed/zip_county_crosswalk.csv")

SOURCE = "HUD-USPS ZIP Code Crosswalk"

# 네가 받은 HUD 파일 quarter에 맞게 수정해도 됨
DATA_QUARTER = "2025Q4"


def clean_text(value):
    if pd.isna(value):
        return ""
    return str(value).strip()


def clean_zip(value):
    """
    Preserve ZIP leading zeros.
    Excel sometimes reads ZIP as 1234.0, so normalize it to 5 digits.
    """
    text = clean_text(value)

    if not text:
        return ""

    # Handles values like 1234.0 from Excel
    if text.endswith(".0"):
        text = text[:-2]

    return text.zfill(5)


def clean_fips(value):
    """
    Preserve 5-digit county FIPS / STCOFIPS.
    HUD COUNTY column is usually 5-digit state+county FIPS.
    """
    text = clean_text(value)

    if not text:
        return ""

    if text.endswith(".0"):
        text = text[:-2]

    return text.zfill(5)


def clean_ratio(value):
    if pd.isna(value) or value == "":
        return ""

    try:
        return float(value)
    except (TypeError, ValueError):
        return ""


def find_column(columns, candidates):
    """
    Finds a column even if capitalization or spacing differs.
    """
    normalized = {str(col).strip().upper(): col for col in columns}

    for candidate in candidates:
        key = candidate.strip().upper()
        if key in normalized:
            return normalized[key]

    return None


def main():
    if not RAW_PATH.exists():
        raise FileNotFoundError(f"Missing input file: {RAW_PATH}")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    df = pd.read_excel(RAW_PATH, dtype=str)

    zip_col = find_column(df.columns, ["ZIP"])
    county_col = find_column(df.columns, ["COUNTY"])
    res_ratio_col = find_column(df.columns, ["RES_RATIO"])
    bus_ratio_col = find_column(df.columns, ["BUS_RATIO"])
    oth_ratio_col = find_column(df.columns, ["OTH_RATIO"])
    tot_ratio_col = find_column(df.columns, ["TOT_RATIO"])

    required = {
        "ZIP": zip_col,
        "COUNTY": county_col,
        "RES_RATIO": res_ratio_col,
        "BUS_RATIO": bus_ratio_col,
        "OTH_RATIO": oth_ratio_col,
        "TOT_RATIO": tot_ratio_col,
    }

    missing = [name for name, col in required.items() if col is None]
    if missing:
        raise ValueError(
            "Missing expected HUD columns: "
            + ", ".join(missing)
            + f"\nAvailable columns: {list(df.columns)}"
        )

    # Optional columns. HUD ZIP-COUNTY files may not include these.
    city_col = find_column(df.columns, ["CITY", "USPS_ZIP_PREF_CITY", "ZIP_CITY"])
    state_col = find_column(df.columns, ["STATE", "STATE_ABBR", "STATEABBRV"])
    county_name_col = find_column(df.columns, ["COUNTY_NAME", "COUNTYNAME"])

    rows = []

    for _, row in df.iterrows():
        zip_code = clean_zip(row.get(zip_col))
        stcofips = clean_fips(row.get(county_col))

        if not zip_code or not stcofips:
            continue

        rows.append(
            {
                "zip": zip_code,
                "county_fips": stcofips[-3:],
                "stcofips": stcofips,
                "city": clean_text(row.get(city_col)) if city_col else "",
                "state_abbr": clean_text(row.get(state_col)) if state_col else "",
                "county_name": clean_text(row.get(county_name_col)) if county_name_col else "",
                "res_ratio": clean_ratio(row.get(res_ratio_col)),
                "bus_ratio": clean_ratio(row.get(bus_ratio_col)),
                "oth_ratio": clean_ratio(row.get(oth_ratio_col)),
                "tot_ratio": clean_ratio(row.get(tot_ratio_col)),
                "source": SOURCE,
                "data_quarter": DATA_QUARTER,
            }
        )

    out_df = pd.DataFrame(rows)

    # Deduplicate by zip + stcofips.
    # If duplicates exist, keep the row with the highest tot_ratio, then res_ratio.
    out_df["sort_tot_ratio"] = pd.to_numeric(out_df["tot_ratio"], errors="coerce").fillna(0)
    out_df["sort_res_ratio"] = pd.to_numeric(out_df["res_ratio"], errors="coerce").fillna(0)

    out_df = out_df.sort_values(
        by=["zip", "sort_tot_ratio", "sort_res_ratio"],
        ascending=[True, False, False],
    )

    out_df = out_df.drop_duplicates(subset=["zip", "stcofips"], keep="first")

    out_df = out_df.drop(columns=["sort_tot_ratio", "sort_res_ratio"])

    output_columns = [
        "zip",
        "county_fips",
        "stcofips",
        "city",
        "state_abbr",
        "county_name",
        "res_ratio",
        "bus_ratio",
        "oth_ratio",
        "tot_ratio",
        "source",
        "data_quarter",
    ]

    out_df = out_df[output_columns]

    out_df.to_csv(OUT_PATH, index=False)

    print(f"Created: {OUT_PATH}")
    print(f"Rows: {len(out_df)}")
    print("Columns:")
    print(list(out_df.columns))

    sample_zips = ["33101", "14623", "90001", "77001", "80202"]
    print("\nSample ZIP checks:")
    print(out_df[out_df["zip"].isin(sample_zips)].sort_values(["zip", "tot_ratio"]))


if __name__ == "__main__":
    main()
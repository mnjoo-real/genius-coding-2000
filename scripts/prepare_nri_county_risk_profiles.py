from pathlib import Path
import pandas as pd

RAW_PATH = Path("data/raw/NRI_Table_Counties.csv")
OUT_PATH = Path("data/processed/county_risk_profiles.csv")

SOURCE = "FEMA National Risk Index v1.20, December 2025"
METHODOLOGY_NOTE = (
    "County-level FEMA NRI hazard Risk Index Scores mapped to app categories "
    "using rank-weighted hazard scores and county-relative percentile ranks for educational planning use."
)


def to_number(value):
    if pd.isna(value) or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def round_score(value):
    number = to_number(value)
    if number is None:
        return None
    return int(round(number))


def choose_weighted_score_and_rating(row, score_cols, rating_cols):
    scored_components = []

    for score_col, rating_col in zip(score_cols, rating_cols):
        score = to_number(row.get(score_col))
        if score is None:
            continue

        scored_components.append((score, row.get(rating_col)))

    if not scored_components:
        return None, None

    scored_components.sort(key=lambda item: item[0], reverse=True)

    weights = list(range(len(scored_components), 0, -1))
    weighted_average = sum(score * weight for (score, _), weight in zip(scored_components, weights)) / sum(weights)
    rounded_score = int(round(weighted_average))

    closest_rating = min(
        scored_components,
        key=lambda item: abs(item[0] - weighted_average),
    )[1]

    return rounded_score, closest_rating


def clean_text(value):
    if pd.isna(value):
        return ""
    return str(value).strip()


def main():
    if not RAW_PATH.exists():
        raise FileNotFoundError(f"Missing input file: {RAW_PATH}")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Keep FIPS codes as strings so leading zeros are preserved.
    df = pd.read_csv(
        RAW_PATH,
        dtype={
            "STCOFIPS": str,
            "STATEFIPS": str,
            "COUNTYFIPS": str,
            "STATEABBRV": str,
        },
        low_memory=False,
    )

    rows = []

    for _, row in df.iterrows():
        flood_score, flood_rating = choose_weighted_score_and_rating(
            row,
            ["CFLD_RISKS", "IFLD_RISKS"],
            ["CFLD_RISKR", "IFLD_RISKR"],
        )

        storm_score, storm_rating = choose_weighted_score_and_rating(
            row,
            ["HRCN_RISKS", "SWND_RISKS", "TRND_RISKS"],
            ["HRCN_RISKR", "SWND_RISKR", "TRND_RISKR"],
        )

        winter_score, winter_rating = choose_weighted_score_and_rating(
            row,
            ["WNTW_RISKS", "ISTM_RISKS", "CWAV_RISKS"],
            ["WNTW_RISKR", "ISTM_RISKR", "CWAV_RISKR"],
        )

        rows.append(
            {
                "stcofips": clean_text(row.get("STCOFIPS")),
                "state_name": clean_text(row.get("STATE")),
                "state_abbr": clean_text(row.get("STATEABBRV")),
                "state_fips": clean_text(row.get("STATEFIPS")),
                "county_name": clean_text(row.get("COUNTY")),
                "county_type": clean_text(row.get("COUNTYTYPE")),
                "county_fips": clean_text(row.get("COUNTYFIPS")),
                "population": round_score(row.get("POPULATION")),
                "composite_risk_score": round_score(row.get("RISK_SCORE")),
                "composite_risk_rating": clean_text(row.get("RISK_RATNG")),
                "flood_risk": flood_score,
                "flood_risk_rating": clean_text(flood_rating),
                "wildfire_risk": round_score(row.get("WFIR_RISKS")),
                "wildfire_risk_rating": clean_text(row.get("WFIR_RISKR")),
                "heat_risk": round_score(row.get("HWAV_RISKS")),
                "heat_risk_rating": clean_text(row.get("HWAV_RISKR")),
                "storm_risk": storm_score,
                "storm_risk_rating": clean_text(storm_rating),
                "winter_storm_risk": winter_score,
                "winter_storm_risk_rating": clean_text(winter_rating),
                "source": SOURCE,
                "methodology_note": METHODOLOGY_NOTE,
                "nri_version": clean_text(row.get("NRI_VER")),
            }
        )

    out_df = pd.DataFrame(rows)

    # Remove completely invalid rows if any.
    out_df = out_df[out_df["stcofips"].astype(str).str.len() > 0]

    relative_source_columns = [
        "flood_risk",
        "wildfire_risk",
        "heat_risk",
        "storm_risk",
        "winter_storm_risk",
    ]

    for column in relative_source_columns:
        numeric_scores = pd.to_numeric(out_df[column], errors="coerce")
        out_df[f"{column}_relative"] = numeric_scores.rank(method="average", pct=True).round(6)

    out_df.to_csv(OUT_PATH, index=False)

    print(f"Created: {OUT_PATH}")
    print(f"Rows: {len(out_df)}")
    print("Columns:")
    print(list(out_df.columns))


if __name__ == "__main__":
    main()

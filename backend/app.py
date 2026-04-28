from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

# -----------------------------
# LOAD DATA
# -----------------------------

df = pd.read_csv("./data/dropped_rows.csv")
df["sdg_focus"] = df["sdg_focus"].astype(str).str.strip()
df["region"] = df["region"].astype(str).str.strip()
df["country"] = df["country"].astype(str).str.strip()
df["year"] = pd.to_numeric(df["year"], errors="coerce")
df["usd_disbursements_defl"] = pd.to_numeric(df["usd_disbursements_defl"], errors="coerce").fillna(0)

url = "https://raw.githubusercontent.com/datasets/country-codes/master/data/country-codes.csv"
countries_df = pd.read_csv(url)
countries_df = countries_df[["CLDR display name", "ISO3166-1-Alpha-3"]]
countries_df.columns = ["Name", "ISO"]
countries_df["Name"] = countries_df["Name"].astype(str).str.strip()
countries_df["ISO"] = countries_df["ISO"].astype(str).str.strip()

# -----------------------------
# HELPERS
# -----------------------------

def filter_data(sdg, region):
    data = df.copy()
    if sdg != "all":
        data = data[data["sdg_focus"] == sdg]
    if region != "all":
        data = data[data["region"] == region]
    data = data[~data["country"].str.contains(';', na=False)]
    return data


def compute_growth(data):
    by_year = data.groupby("year")["usd_disbursements_defl"].sum().reset_index().sort_values("year")
    if len(by_year) < 2:
        return 0
    return float(by_year["usd_disbursements_defl"].iloc[-1] - by_year["usd_disbursements_defl"].iloc[0])

# -----------------------------
# LOOKUP ROUTES
# -----------------------------

@app.route("/regions")
def regions():
    vals = sorted(df["region"].dropna().unique().tolist())
    return jsonify(vals)


@app.route("/sdgs")
def sdgs():
    vals = sorted(df["sdg_focus"].dropna().unique().tolist())
    return jsonify(vals)


@app.route("/countries")
def countries():
    vals = sorted(df["country"].dropna().unique().tolist())
    return jsonify(vals)

# -----------------------------
# SUMMARY & DATA ROUTES
# -----------------------------

@app.route("/")
def home():
    return jsonify({"message": "Backend live"})


@app.route("/data/<sdg>/<region>")
def region_data(sdg, region):
    data = filter_data(sdg, region)
    return jsonify(data.to_dict(orient="records"))


@app.route("/summary/<sdg>/<region>")
def region_data_summary(sdg, region):
    data = filter_data(sdg, region)
    growth = compute_growth(data)
    total_funding = float(data["usd_disbursements_defl"].sum())
    num_orgs = int(data["organization_name"].nunique())
    num_proj = int(data["grant_recipient_project_title"].nunique())
    num_countries = int(data["country"].nunique())

    return jsonify({
        "growth": growth,
        "num_orgs": num_orgs,
        "num_proj": num_proj,
        "num_countries": num_countries,
        "total_funding": total_funding,
    })


@app.route("/data/<sdg>/<region>/funding_by_country")
def funding_by_country(sdg, region):
    data = filter_data(sdg, region)
    data = data[data["country"].isin(countries_df["Name"])]
    result = (
        data.groupby("country")["usd_disbursements_defl"]
        .sum()
        .reset_index()
        .rename(columns={"usd_disbursements_defl": "total_funding"})
    )
    # Merge ISO codes for the map
    result = result.merge(countries_df, left_on="country", right_on="Name", how="left").drop(columns=["Name"])
    return jsonify(result.to_dict(orient="records"))


@app.route("/data/<sdg>/<region>/by_year")
def funding_by_year(sdg, region):
    data = filter_data(sdg, region)
    result = (
        data.groupby("year")["usd_disbursements_defl"]
        .sum()
        .reset_index()
        .rename(columns={"usd_disbursements_defl": "total_funding"})
        .sort_values("year")
    )
    result["year"] = result["year"].astype(int)
    return jsonify(result.to_dict(orient="records"))


@app.route("/data/<sdg>/<region>/metrics_by_country")
def metrics_by_country(sdg, region):
    data = filter_data(sdg, region)
    data = data[data["country"].isin(countries_df["Name"])]

    agg = data.groupby("country").agg(
        total_funding=("usd_disbursements_defl", "sum"),
        num_orgs=("organization_name", "nunique"),
        num_proj=("grant_recipient_project_title", "nunique"),
    ).reset_index()

    # Compute per-country growth
    def country_growth(cdf):
        by_year = cdf.groupby("year")["usd_disbursements_defl"].sum().reset_index().sort_values("year")
        if len(by_year) < 2:
            return 0
        return float(by_year["usd_disbursements_defl"].iloc[-1] - by_year["usd_disbursements_defl"].iloc[0])

    growth_map = data.groupby("country").apply(country_growth).reset_index()
    growth_map.columns = ["country", "growth"]

    agg = agg.merge(growth_map, on="country", how="left")
    agg = agg.merge(countries_df, left_on="country", right_on="Name", how="left").drop(columns=["Name"])

    agg["total_funding"] = agg["total_funding"].astype(float)
    agg["growth"] = agg["growth"].astype(float)
    agg["num_orgs"] = agg["num_orgs"].astype(int)
    agg["num_proj"] = agg["num_proj"].astype(int)

    return jsonify(agg.to_dict(orient="records"))


@app.route("/data/<sdg>/<region>/country_detail/<country_name>")
def country_detail(sdg, region, country_name):
    data = filter_data(sdg, region)
    data = data[data["country"] == country_name]

    by_year = (
        data.groupby("year")["usd_disbursements_defl"]
        .sum()
        .reset_index()
        .rename(columns={"usd_disbursements_defl": "total_funding"})
        .sort_values("year")
    )
    by_year["year"] = by_year["year"].astype(int)

    top_orgs = (
        data.groupby("organization_name")["usd_disbursements_defl"]
        .sum()
        .reset_index()
        .rename(columns={"usd_disbursements_defl": "total_funding"})
        .sort_values("total_funding", ascending=False)
        .head(5)
    )

    by_sdg = (
        data.groupby("sdg_focus")["usd_disbursements_defl"]
        .sum()
        .reset_index()
        .rename(columns={"usd_disbursements_defl": "total_funding"})
        .sort_values("total_funding", ascending=False)
    )

    return jsonify({
        "by_year": by_year.to_dict(orient="records"),
        "top_orgs": top_orgs.to_dict(orient="records"),
        "by_sdg": by_sdg.to_dict(orient="records"),
        "summary": {
            "total_funding": float(data["usd_disbursements_defl"].sum()),
            "num_orgs": int(data["organization_name"].nunique()),
            "num_proj": int(data["grant_recipient_project_title"].nunique()),
        }
    })

# -----------------------------
# TABLE ROUTE
# -----------------------------

SORTABLE_COLS = {
    "year", "organization_name", "region", "country",
    "usd_disbursements_defl", "grant_recipient_project_title",
    "Donor_country", "sdg_focus",
}

@app.route("/table")
def table():
    sdg = request.args.get("sdg", "all")
    region = request.args.get("region", "all")
    sort_by = request.args.get("sort_by", "usd_disbursements_defl")
    sort_dir = request.args.get("sort_dir", "desc")
    page = max(1, int(request.args.get("page", 1)))
    per_page = min(200, max(10, int(request.args.get("per_page", 50))))

    if sort_by not in SORTABLE_COLS:
        sort_by = "usd_disbursements_defl"

    data = filter_data(sdg, region)
    data = data.sort_values(sort_by, ascending=(sort_dir == "asc"), na_position="last")

    total = len(data)
    start = (page - 1) * per_page
    page_data = data.iloc[start: start + per_page][list(SORTABLE_COLS)]

    return jsonify({
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, (total + per_page - 1) // per_page),
        "data": page_data.to_dict(orient="records"),
    })

# -----------------------------
# ORGANIZATION FORM
# -----------------------------

@app.route("/organizations", methods=["POST"])
def add_organization():
    global df
    body = request.get_json(force=True)

    required = [
        "organization_name", "year", "region", "country",
        "Donor_country", "sdg_focus", "usd_disbursements_defl",
        "grant_recipient_project_title",
    ]
    missing = [f for f in required if not body.get(f) and body.get(f) != 0]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        year = int(body["year"])
        funding = float(body["usd_disbursements_defl"])
    except (ValueError, TypeError):
        return jsonify({"error": "year must be an integer and usd_disbursements_defl must be a number"}), 400

    if not (2000 <= year <= 2030):
        return jsonify({"error": "year must be between 2000 and 2030"}), 400
    if funding < 0:
        return jsonify({"error": "usd_disbursements_defl must be >= 0"}), 400

    new_row = {
        "year": year,
        "organization_name": str(body["organization_name"]).strip(),
        "region": str(body["region"]).strip(),
        "country": str(body["country"]).strip(),
        "usd_disbursements_defl": funding,
        "grant_recipient_project_title": str(body["grant_recipient_project_title"]).strip(),
        "Donor_country": str(body["Donor_country"]).strip(),
        "sdg_focus": str(body["sdg_focus"]).strip(),
        "mission_desc": str(body.get("mission_desc", "")).strip(),
    }

    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    return jsonify({"message": "Organization added successfully", "row": new_row}), 201

# -----------------------------
# RUN APP
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)

# -----------------------------
# LOAD DATA
# -----------------------------

df = pd.read_csv("./data/dropped_rows.csv")
df["sdg_focus"] = df["sdg_focus"].astype(str).str.strip()
df["region"] = df["region"].astype(str).str.strip()
df["country"] = df["country"].astype(str).str.strip()

url = "https://raw.githubusercontent.com/datasets/country-codes/master/data/country-codes.csv"
countries_df = pd.read_csv(url)
countries_df = countries_df[["CLDR display name", "ISO3166-1-Alpha-3"]]
countries_df.columns = ["Name", "ISO"]
countries_df["Name"] = countries_df["Name"].astype(str).str.strip()
countries_df["ISO"] = countries_df["ISO"].astype(str).str.strip()

# -----------------------------
# ROUTES
# -----------------------------

@app.route("/")
def home():
    return jsonify({
        "message": "Backend live",
    })

@app.route("/data/<sdg>/<region>")
def region_data(sdg, region):
    data = df[(df["sdg_focus"] == sdg) & (df["region"] == region)]
    data = data[~data["country"].str.contains(';')]
    return jsonify(data.to_dict(orient="records"))

@app.route("/summary/<sdg>/<region>")
def region_data_summary(sdg, region):
    data = df[(df["sdg_focus"] == sdg) & (df["region"] == region)]
    data = data[~data["country"].str.contains(';')]
    total_min = data[["year", "usd_disbursements_defl"]].groupby("year").sum().reset_index()["usd_disbursements_defl"].iloc[0]
    total_max = data[["year", "usd_disbursements_defl"]].groupby("year").sum().reset_index()["usd_disbursements_defl"].iloc[-1]
    growth = total_max - total_min
    total_funding = data['usd_disbursements_defl'].sum()
    num_orgs = len(data["organization_name"].unique())
    num_proj = len(data["grant_recipient_project_title"].unique())
    num_countries = len(data["country"].unique())

    return jsonify({
        "growth": growth,
        "num_orgs": num_orgs,
        "num_proj": num_proj,
        "num_countries": num_countries,
        "total_funding": total_funding
    })

@app.route("/data/<sdg>/<region>/funding_by_country")
def funding_by_country(sdg, region):
    data = df[(df["sdg_focus"] == sdg) & (df["region"] == region)]
    data = data[data["country"].isin(countries_df["Name"])]
    data = data[["country", "usd_disbursements_defl"]].groupby("country").sum().reset_index()
    return jsonify(data.to_dict(orient="records"))

# -----------------------------
# RUN APP
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)
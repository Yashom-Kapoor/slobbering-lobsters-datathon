# Product Requirements Document
## SDG Funding Intelligence Dashboard

---

## Overview

A single-page web application that lets analysts and researchers explore global SDG (Sustainable Development Goal) funding data by region, visualize key metrics on an interactive world map, and submit organization entries to extend the dataset.

**Tech stack assumed:** React frontend, existing Flask backend (`app.py`), Leaflet or Mapbox GL for maps, Recharts or Chart.js for supplementary charts.

---

## Problem Statement

The existing dataset (`dropped_rows.csv`) contains rich funding flows across organizations, countries, regions, SDGs, and years. Currently there is no UI to explore it. Analysts must query the Flask API manually and have no way to contribute new organization records.

---

## Users

| Persona | Goal |
|---|---|
| Policy researcher | Understand which regions/SDGs receive growing vs. shrinking funding |
| Program officer | Find how many orgs and projects operate in a specific region for a given SDG |
| Data curator | Add new organizations to the dataset without touching raw files |

---

## Core Features

### 1. Interactive Map

The map is the primary surface. It renders a choropleth or bubble layer over countries, colored/sized by the currently selected metric.

**Metric selector (pill/tab UI above the map):**

| Metric | Backing field | Description |
|---|---|---|
| Total Funding | `usd_disbursements_defl` sum | Total deflated USD disbursed per country |
| Funding Growth | `growth` from `/summary` endpoint | Change in annual disbursements first → last year |
| # Organizations | `num_orgs` from `/summary` | Unique organizations active in country/region |
| # Projects | `num_proj` from `/summary` | Unique project titles |
| # Countries | `num_countries` from `/summary` | (Regional view only) countries with activity |

**Map interactions:**
- Hover over a country: tooltip showing country name + current metric value
- Click a country: side panel slides open with a breakdown chart (funding by year as a line chart for that country)
- Choropleth color scale updates when metric changes; legend updates to match

**Filters (left sidebar or top bar):**
- SDG Focus — multi-select dropdown (all unique `sdg_focus` values from dataset)
- Region — single select (all unique `region` values)
- Year range — dual-handle slider (min/max from dataset years)

All filters fire a request to `/data/<sdg>/<region>` or `/summary/<sdg>/<region>` and re-render the map layer.

---

### 2. Summary Stats Bar

A horizontal strip below the map header showing live-updated KPI cards. Values come from `/summary/<sdg>/<region>` and animate (number tween) on filter change.

| Card | Value |
|---|---|
| Total Funding | `total_funding` formatted as $X.XXM / $X.XXB |
| Funding Growth | `growth` with a +/- indicator and arrow |
| Organizations | `num_orgs` |
| Projects | `num_proj` |
| Countries Covered | `num_countries` |

---

### 3. Organization Entry Form

A collapsible drawer or modal accessible via a persistent "+ Add Organization" button.

**Form fields:**

| Field | Type | Validation | Maps to column |
|---|---|---|---|
| Organization Name | text input | required, max 200 chars | `organization_name` |
| Year | number input | required, 2000–2030 | `year` |
| Region | select (from existing regions) | required | `region` |
| Country | select (filtered by region) | required | `country` |
| Donor Country | text input | required | `Donor_country` |
| SDG Focus | select (from existing SDGs) | required | `sdg_focus` |
| USD Disbursements | number input | required, ≥ 0 | `usd_disbursements_defl` |
| Project Title | text input | required, max 300 chars | `grant_recipient_project_title` |
| Mission Description | textarea | optional, max 500 chars | `mission_desc` |

**Submission behavior:**
- POST to a new `/organizations` endpoint (see backend requirement below)
- On success: toast notification "Organization added", map refreshes
- On validation error: inline field errors, no submission
- On server error: toast with error message, form stays open

---

### 4. Country Detail Side Panel

Opens when user clicks a country on the map.

**Sections:**
1. **Header** — country name, flag emoji or ISO code
2. **KPI row** — funding, # orgs, # projects for the active filter context
3. **Funding over time** — line chart (`year` × `usd_disbursements_defl`) for that country
4. **Top organizations** — ranked list of top 5 orgs by total funding in that country
5. **SDG breakdown** — small horizontal bar chart of funding by SDG for that country

Panel closes via an X button or clicking outside.

---

## Backend Requirements (new endpoints needed)

| Method | Route | Purpose |
|---|---|---|
| POST | `/organizations` | Accept new org record, validate, append to dataset |
| GET | `/data/<sdg>/<region>/by_year` | Return annual funding totals for time-series charts |
| GET | `/countries` | Return list of all unique countries (for form dropdown) |
| GET | `/sdgs` | Return list of all unique SDG focus values |
| GET | `/regions` | Return list of all unique regions |

---

## Map Technical Spec

- **Library:** Leaflet with GeoJSON world layer (Natural Earth 110m), or Mapbox GL if a token is available
- **Layer type:**
  - Choropleth for "Total Funding", "# Organizations", "# Projects" (continuous color scale, e.g. sequential blue)
  - Bubble overlay for "Funding Growth" (bubble size = abs(growth), color = positive/negative)
- **Country matching:** join dataset `country` names to GeoJSON features via ISO3 codes (use the `countries_df` mapping already in `app.py`)
- **Missing data:** countries with no data render as light gray with tooltip "No data for current filters"
- **Base tiles:** OpenStreetMap (no API key) or Carto light (free tier)

---

## UI/UX Requirements

- **Layout:** top navbar → filter bar → map (70% viewport height) → stats bar → footer
- **Responsive:** map collapses to full width on mobile; side panel becomes a bottom sheet
- **Color palette:** neutral base (white/light gray), single accent (blue or teal), red/green only for growth +/-
- **Loading states:** skeleton loaders on KPI cards; spinner overlay on map while data loads
- **No GSAP required** (that was a prior PRD); use CSS transitions for panel open/close and counter animations with a simple JS tween

---

## Out of Scope (v1)

- User authentication / access control
- Editing or deleting existing organizations
- Export to CSV/PDF
- Real-time collaborative editing
- Predictive / ML-based metric forecasting

---

## Acceptance Criteria

1. Selecting any SDG + Region combination updates the map choropleth, stats bar, and URL query params within 2 seconds on a local dev machine.
2. The organization form rejects submission when any required field is empty and shows an inline error per field.
3. After successful form submission, the map re-fetches and renders the new data point without a full page reload.
4. Clicking a country with data opens the side panel and renders all three charts with correct values matching raw API responses.
5. Countries with no data for the current filter show a gray fill and a "No data" tooltip rather than breaking the map.
6. The year-range slider correctly narrows results when dragged; the KPI cards animate to new values.

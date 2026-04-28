# Mission-Focused Decisions for Gates Foundation and OECD

## Introduction
This project is built around the framework of mission-oriented innovation policies (MOIPs), as developed by the OECD in [Forging New Frontiers in Mission-Oriented Innovation Policies](https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/12/forging-new-frontiers-in-mission-oriented-innovation-policies_66a374d5/d13d0142-en.pdf). Rather than allocating resources through fragmented or reactive approaches, MOIPs define clear, ambitious goals (“missions”) that mobilize coordinated action across governments, industries, and research institutions to tackle complex societal challenges.

Our core idea is to operationalize this framework using a simple but powerful structure:
missions = Sustainable Development Goal (SDG) target + geographic region.

For example, a mission like SDG 3.8 (universal health coverage) in Eastern Africa represents a concrete, measurable, and context-specific objective. This framing allows us to move beyond abstract policy discussions and toward targeted, data-driven decision-making about where interventions—and funding—can have the greatest impact.

By combining OECD mission design principles with real-world development data, this project aims to:

- Identify high-priority missions based on regional needs and gaps
- Provide data-backed insights to guide funding and policy decisions
- Enable a more systemic, coordinated approach to global development challenges

Ultimately, our goal is to transform how organizations—such as the OECD or major philanthropic actors—decide where to act next, shifting from broad sectoral funding to focused, mission-driven strategies with clear outcomes.

## How to use our project

### Steps to run project
1. Clone repository
2. Create a new virtual environment `python3 -m venv venv`
3. Turn on the virtual environment `source venv/bin/activate` (Mac/Linux), `source venv/source/activate` (Windows Git Bash)
4. Install python packages `pip install -r requirements.txt`
5. Navigate to `frontend` folder and run `npm install`
6. Run backend: Navigate to `backend` folder and run python3 app.py
7. Copy url and paste in `/frontend/src/api.js` as `BASE` variable value
8. Run frontend: Navigate to `frontend` folder and run `npm run dev`
9. Enjoy our mission-oriented visualization!

### How to use as a decision-making tool
This project transforms mission-oriented policy design, as outlined by the OECD, into an interactive, data-driven exploration tool. Users define a mission by selecting a Sustainable Development Goal (SDG) target and a geographic region (e.g., SDG 3.8 — Universal Health Coverage in Eastern Africa), and the platform generates a structured view of all related development activity.

For each mission, the platform provides a concise snapshot of its scale and momentum, including trends in funding over time, the number of active projects, participating organizations, and countries involved. It also visualizes funding distribution geographically through choropleth maps, making it easy to identify concentration patterns, regional disparities, and underserved areas.

In addition, users can explore the organizational landscape behind each mission, including all participating entities and ranked views of top donors based on total funding, number of projects, or breadth of involvement.

By combining these perspectives, the tool enables users to quickly assess where activity is growing, where gaps exist, and how resources are currently allocated, supporting more informed, mission-aligned funding and policy decisions.

### Credits
Thank you OECD for the dataset and research used to create this dashboard.


## Other repo information (ignore below)

### File Structure

`/app`\
Webapp dashboard

`/data`\
Raw or processed data\
Download data here: https://drive.google.com/drive/folders/1vkR6GsZSPHOF6Xa5_PhFMmOeUBwXuY4J?usp=drive_link\
OCED-Dataset.csv: 
- Original, raw dataset

clean_year_region.csv:
- Year column cleaned (year ranges, eg. 2020-2023, split into separate years with funding evenly distributed across 4 years)
- Region column cleaned(region ranges, eg. West Africa; Americas; Caribbean) split into separate regions with funding evenly distributed across all regions

`/notebooks`\
Jupyter Notebook files for scratch work

`/src`\
Python files for finalized pipelines

### Installation
Use VSCode.
1. Create a virtual environment in project root: `python3 -m venv venv`
2. Activate it: `source venv/bin/activate` (mac/linux), `source venv/source/activate` (windows git bash)
3. Install packages: `pip install -r requirements.txt`
4. Register venv as Jupyter kernel: `python -m ipykernel install --user --name=datathon-env`

When running notebooks, click Select Kernel and choose "datathon-env".

### Adding new packages
Ensure you run `pip freeze > requirements.txt` to update requirements.txt if you add new packages.

### Notebooks Documentation
clean_year_region: 
- Year column cleaned (year ranges, eg. 2020-2023, split into separate years with funding evenly distributed across 4 years)
- Region column cleaned(region ranges, eg. West Africa; Americas; Caribbean) split into separate regions with funding evenly distributed across all regions

funding_region_and_year:
- Currently:   
    - Combined all years
    - Created plotly map across 4 arbitrary countries measuring funding

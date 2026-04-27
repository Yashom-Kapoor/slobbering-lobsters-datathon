# Slobbering Lobsters Datathon Repo

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
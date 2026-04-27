# Slobbering Lobsters Datathon Repo

### File Structure

`/app`\
Webapp dashboard

`/data`\
Raw or processed data

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
# PythonTemplate

### Set Up

- ensure you have python 3.13 version
- run `brew install diamond`
- run `python -m venv venv`
- run `source venv/bin/activate`
- run `chmod 444 requirements.txt`
- run `chmod +x compile_requirements.sh`
- run `pip install -r requirements.txt`
- run `pre-commit install --install-hooks`
- run `nbstripout --install --attributes .gitattributes`


docker build -t back-biohackathon .
docker run -p 5123:5123 back-biohackathon
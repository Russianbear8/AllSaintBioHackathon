node version 20.19

prepare

docker build -t front-biohackathon .

docker run -p 4173:4173 front-biohackathon

docker compose up --build

Developer's guide
Frontend:

Frontend is written using D3.js which includes following files:

    index.html -- the main html file
    map.js -- the d3.js file for map visualization and user interaction
    nyc.json -- the NYC topojson file that contains NYC neighborhood information.
    project.css -- the css for the project.

In the map.js file, it will make call our api server to get the housing price data and the crime data.
  .defer(d3.json, "http://54.89.25.157/boroughs")
  .defer(d3.json, "http://54.89.25.157/crimes")

It can also change to use local file in case of no internet
  .defer(d3.csv,"NY_neighborhood_avg_sales_all.csv")
  .defer(d3.csv,"crime_index_per_neighborhood_data/crime_all.csv")

Package and Execute the code

Use hosted website
We have hosted our application in the cloud, you can access it at http://40.84.17.159/

Run the application locally
we use docker and docker-compose to package and run our application

1. Install docker and docker-compose
2. Run docker-compose up -d to start the web server
2. go to http://localhost/ to access the web application

Note that the web app will use the api server hosted in the cloud. See API session if you want to setup the api server locally.


API
The API returns the housing and crime data from postgres db. The database has been seeded with the data as specified in NY_neighborhood_avg_sales_2018.csv for housing data and crime_all.csv for crime data.

The API app is built in python and has dependencies as specified in the requirements.txt. If you want to run this API locally:

Install virtualenv https://docs.python-guide.org/dev/virtualenvs/
Create virtual env virtualenv .venv
Install dependencies pip install -r requirements.txt
Please note you need to have postgresql installed as well (see postgres session for details).
Start the API using gunicorn -b 0.0.0.0:5000 app:api --reload. API server is started on http://localhost:5000

Hosted API Information:
Server IP: 54.89.25.157 Endpoints: /boroughs to get the aggregate housing data i.e http://54.89.25.157/boroughs Endpoints: /crimes to get the aggregate crime data i.e http://54.89.25.157/crimes


Data store:
We use postgres database as our datastore. Easiest way to run posrgres database locally is using docker container

1. Start local postgrest database docker run --name postgres -e POSTGRES_PASSWORD=cse6242 -p 5432:5432 -d postgres
2. login to postgres database use user postgres and password cse6242
3. Create a database in postgres CREATE DATABASE neighbourhood;


Machine learning model

Customized recommendation model
Run jupyter notebook recommendation.ipynb

Price prediction
Run python price_prediction.py to generate prediction
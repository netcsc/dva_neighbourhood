import json
import falcon
from middleware import SQLAlchemySessionManager
from db import db_session
from models import Borough, Crime

"""Recommendation"""
class RecommmendationApi(object):
    def on_get(self, req, res):
        res.status = falcon.HTTP_200  # This is the default status
        #use request params from client
        #min price, max price, crime weight?

"""Aggregate borough data"""
class BoroughCollection(object):
    def on_get(self, req, res):
        boroughs = self.session.query(Borough).all()
        data = [borough.to_json() for borough in boroughs]
        res.status = falcon.HTTP_200  # This is the default status
        res.body = json.dumps(data)

class CrimeCollection(object):
    def on_get(self, req, res):
        crimes = self.session.query(Crime).all()
        data = [crime.to_json() for crime in crimes]
        res.status = falcon.HTTP_200  # This is the default status
        res.body = json.dumps(data)

# Create the Falcon application object
api = falcon.API(middleware=[
    SQLAlchemySessionManager(db_session),
])

# Add a route to serve the resource
api.add_route('/boroughs', BoroughCollection())

api.add_route('/crimes', CrimeCollection())
# Add a route for recommendations


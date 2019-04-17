from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, Integer, String, Float

Base=declarative_base()

class Borough(Base):
    __tablename__= 'borough'
    id = Column(Integer,primary_key=True)
    borough_id = Column(Integer)
    region_name = Column(String(100))
    name = Column(String(100))
    transaction_volume = Column(Float)
    property_count = Column(Float)
    average_sale_price = Column(Float)
    year = Column(String(100))

    def to_json(self):
        return {
            'borough_id': self.borough_id,
            'region_name': self.region_name,
            'name': self.name,
            'transaction_volume': self.transaction_volume,
            'property_count': self.property_count,
            'average_sale_price': self.average_sale_price,
            'year': self.year
        }


class Crime(Base):
    __tablename__= 'crime'
    id = Column(Integer,primary_key=True)
    neighborhood_id = Column(Integer)
    neighborhood = Column(String(100))
    crime_rate = Column(Integer)
    year = Column(String(100))

    def to_json(self):
        return {
            'neighborhood_id': self.neighborhood_id,
            'neighborhood': self.neighborhood_id,
            'crime_rate': self.crime_rate,
            'year': self.year
        }

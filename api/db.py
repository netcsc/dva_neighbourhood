from sqlalchemy import create_engine
from models import Base
from sqlalchemy.orm import sessionmaker, scoped_session
from config import DATABASE_URI, CSV_FILE_PATH

db_session = scoped_session(sessionmaker())
engine = create_engine(DATABASE_URI)
db_session.configure(bind=engine)

def recreate_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

def init_db():
    Base.metadata.create_all(engine)    

def seed_db():
    with open(CSV_FILE_PATH, 'r') as f:    
        conn = engine.raw_connection()
        cursor = conn.cursor()
        cmd = """COPY borough(borough_id,region_name,name,transaction_volume,property_count,average_sale_price) FROM STDIN WITH (FORMAT CSV, HEADER TRUE, NULL 'NA')"""
        cursor.copy_expert(cmd, f)
        conn.commit()

if __name__ == "db":
    from sqlalchemy import create_engine
    recreate_db()
    seed_db()
    
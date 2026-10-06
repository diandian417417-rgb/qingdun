from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


URL = "mysql+pymysql://root:123456@localhost:3306/qingdun?charset=utf8mb4"

engine = create_engine(URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()
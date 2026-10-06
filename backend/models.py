from sqlalchemy import Column, Integer, String, Text, DateTime, func
from database import Base

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    author = Column(String(50))
    content = Column(Text)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, server_default=func.now())
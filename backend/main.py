from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="青盾后端")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class PostIn(BaseModel):
    author: str
    content: str

@app.get("/api/ping")
def ping():
    return {"msg": "青盾后端已启动"}

@app.post("/api/post")
def create_post(data: PostIn, db: Session = Depends(get_db)):
    p = models.Post(author=data.author, content=data.content, status="approved")
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": p.id, "status": p.status}

@app.get("/api/posts")
def list_posts(db: Session = Depends(get_db)):
    return db.query(models.Post).all()
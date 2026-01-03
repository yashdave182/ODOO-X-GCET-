from fastapi import FastAPI

from app.routes import auth, users
from app.database import Base, engine
from app.seed import seed_admin

app = FastAPI(title="Dayflow HRMS")

app.include_router(auth.router)
app.include_router(users.router)


@app.on_event("startup")
def on_startup():
    
    Base.metadata.create_all(bind=engine)

    seed_admin()


@app.get("/")
def health_check():
    return {"status": "Backend running"}

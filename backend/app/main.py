from app.database import Base, engine
from app.routes import auth
from app.seed import seed_admin
from fastapi import FastAPI

app = FastAPI(title="Dayflow HRMS")

app.include_router(auth.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    seed_admin()


@app.get("/")
def health_check():
    return {"status": "Backend running"}

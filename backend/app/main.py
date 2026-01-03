from fastapi import FastAPI

app = FastAPI(title="Dayflow HRMS")

@app.get("/")
def health_check():
    return {"status": "Backend running"}

from fastapi import FastAPI
from app.api import users, roles, projects, tasks, auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FSE Task Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "Backend App is up and running successfully..."}

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(projects.router)
app.include_router(tasks.router)
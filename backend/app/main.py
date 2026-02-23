from fastapi import FastAPI
from app.db.base import Base
from app.db.session import engine
from app.api import users, roles, projects, tasks
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FSE Task Tracker")

Base.metadata.create_all(bind=engine)

# for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(users.router)
app.include_router(roles.router)
app.include_router(projects.router)
app.include_router(tasks.router)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import users, projects, snapshots, ws

# Crée les tables au démarrage (dev — en prod, utiliser Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cartographe API",
    description="API backend pour la cartographie applicative collaborative",
    version="1.0.0",
)

# CORS — ajuster les origines en production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(users.router, prefix="/api", tags=["Auth & Users"])
app.include_router(projects.router, prefix="/api", tags=["Projects"])
app.include_router(snapshots.router, prefix="/api", tags=["Snapshots"])
app.include_router(ws.router, tags=["WebSocket"])


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok", "version": "1.0.0"}

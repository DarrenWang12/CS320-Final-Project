from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import uvicorn
import pathlib

from .auth.spotify import router as spotify_router
from .storage.firestore_storage import init_firestore

# Load environment variables from .env file
# Look for .env in the backend directory (parent of src)
backend_dir = pathlib.Path(__file__).parent.parent
load_dotenv(dotenv_path=backend_dir / ".env")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Firestore
    try:
        init_firestore()
        print("✓ Application startup complete")
    except Exception as e:
        print(f"✗ Failed to initialize Firestore: {e}")
        print("⚠ Application will start but Firestore operations will fail")
    yield
    # Shutdown: Cleanup if needed
    print("Application shutdown")


app = FastAPI(
    title="CS320 Final Project API",
    lifespan=lifespan
)

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes
app.include_router(spotify_router, tags=["spotify"])

@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI", "status": "success"}

@app.get("/api/test")
async def test_endpoint():
    """Test endpoint that can be called from the frontend"""
    return {
        "message": "Backend works",
        "status": "ok",
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


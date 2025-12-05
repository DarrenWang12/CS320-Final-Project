from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
import pathlib

from .auth.spotify import router as spotify_router

# Load environment variables from .env file
# Look for .env in the backend directory (parent of src)
backend_dir = pathlib.Path(__file__).parent.parent
load_dotenv(dotenv_path=backend_dir / ".env")

app = FastAPI(title="CS320 Final Project API")

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
app.include_router(spotify_router)

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


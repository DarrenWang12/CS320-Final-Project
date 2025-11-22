from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="CS320 Final Project API")

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


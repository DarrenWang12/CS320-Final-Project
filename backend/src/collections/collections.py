from fastapi import APIRouter
from typing import Optional

router = APIRouter()

@router.get("/api/collections")
async def get_collections():
    """Get user's music collections/playlists"""
    # Mock data for now
    collections = [
        {
            "id": 1,
            "name": "Happy Vibes",
            "mood": "Happy",
            "songCount": 25,
            "lastUpdated": "2 days ago",
            "color": "#4CAF50",
            "songs": [
                {"title": "Blinding Lights", "artist": "The Weeknd"},
                {"title": "Levitating", "artist": "Dua Lipa"},
                {"title": "Good as Hell", "artist": "Lizzo"}
            ]
        },
        {
            "id": 2,
            "name": "Chill Nights",
            "mood": "Calm",
            "songCount": 18,
            "lastUpdated": "1 week ago",
            "color": "#9C27B0",
            "songs": [
                {"title": "Watermelon Sugar", "artist": "Harry Styles"},
                {"title": "Sunflower", "artist": "Post Malone"},
                {"title": "Circles", "artist": "Post Malone"}
            ]
        },
        {
            "id": 3,
            "name": "Workout Energy",
            "mood": "Energized",
            "songCount": 32,
            "lastUpdated": "3 days ago",
            "color": "#FFC107",
            "songs": [
                {"title": "Thunder", "artist": "Imagine Dragons"},
                {"title": "Believer", "artist": "Imagine Dragons"},
                {"title": "Stronger", "artist": "Kelly Clarkson"}
            ]
        },
        {
            "id": 4,
            "name": "Rainy Day Blues",
            "mood": "Sad",
            "songCount": 15,
            "lastUpdated": "5 days ago",
            "color": "#2196F3",
            "songs": [
                {"title": "Someone Like You", "artist": "Adele"},
                {"title": "Fix You", "artist": "Coldplay"},
                {"title": "Hurt", "artist": "Johnny Cash"}
            ]
        }
    ]
    
    return {"collections": collections}

@router.post("/api/collections")
async def create_collection(name: str, mood: str):
    """Create a new music collection"""
    # Mock implementation
    return {
        "success": True,
        "collection": {
            "id": 999,
            "name": name,
            "mood": mood,
            "songCount": 0,
            "lastUpdated": "just now",
            "color": "#4CAF50",
            "songs": []
        }
    }

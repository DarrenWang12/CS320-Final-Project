"""
Collections API routes for managing mood-based playlists
"""
import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..storage.memory_storage import storage

router = APIRouter()

class Song(BaseModel):
    title: str
    artist: str
    spotify_id: Optional[str] = None
    duration: Optional[str] = None

class Collection(BaseModel):
    id: Optional[int] = None
    name: str
    mood: str
    songs: List[Song] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class CreateCollectionRequest(BaseModel):
    name: str
    mood: str
    songs: List[Song] = []

@router.get("/api/collections")
def get_collections(user_id: Optional[str] = None):
    """
    Get all collections for a user (or mock data for demo)
    In production, this would filter by authenticated user
    """
    # Mock collections data for demo
    collections = [
        {
            "id": 1,
            "name": "Happy Vibes",
            "mood": "Happy",
            "songCount": 25,
            "lastUpdated": "2 days ago",
            "color": "#4CAF50",
            "songs": [
                {"title": "Blinding Lights", "artist": "The Weeknd", "duration": "3:20"},
                {"title": "Levitating", "artist": "Dua Lipa", "duration": "3:23"},
                {"title": "Good as Hell", "artist": "Lizzo", "duration": "2:39"}
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
                {"title": "Watermelon Sugar", "artist": "Harry Styles", "duration": "2:54"},
                {"title": "Sunflower", "artist": "Post Malone", "duration": "2:38"},
                {"title": "Circles", "artist": "Post Malone", "duration": "3:35"}
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
                {"title": "Thunder", "artist": "Imagine Dragons", "duration": "3:07"},
                {"title": "Believer", "artist": "Imagine Dragons", "duration": "3:24"},
                {"title": "Stronger", "artist": "Kelly Clarkson", "duration": "3:42"}
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
                {"title": "Someone Like You", "artist": "Adele", "duration": "4:45"},
                {"title": "Fix You", "artist": "Coldplay", "duration": "4:54"},
                {"title": "Hurt", "artist": "Johnny Cash", "duration": "3:38"}
            ]
        }
    ]
    
    return {"collections": collections}

@router.post("/api/collections")
def create_collection(collection_data: CreateCollectionRequest, user_id: Optional[str] = None):
    """
    Create a new collection
    In production, this would save to database with authenticated user
    """
    # For demo, just return the created collection with an ID
    new_collection = {
        "id": 5,  # Mock ID
        "name": collection_data.name,
        "mood": collection_data.mood,
        "songCount": len(collection_data.songs),
        "lastUpdated": "just now",
        "songs": [song.dict() for song in collection_data.songs],
        "created_at": "2024-12-08T00:00:00Z"
    }
    
    return {"collection": new_collection, "message": "Collection created successfully"}

@router.get("/api/collections/{collection_id}")
def get_collection(collection_id: int, user_id: Optional[str] = None):
    """
    Get a specific collection by ID
    """
    # Mock data - in production this would query the database
    if collection_id == 1:
        collection = {
            "id": 1,
            "name": "Happy Vibes",
            "mood": "Happy",
            "songCount": 25,
            "lastUpdated": "2 days ago",
            "color": "#4CAF50",
            "songs": [
                {"title": "Blinding Lights", "artist": "The Weeknd", "duration": "3:20", "spotify_id": "0VjIjW4GlUZAMYd2vXMi3b"},
                {"title": "Levitating", "artist": "Dua Lipa", "duration": "3:23", "spotify_id": "463CkQjx2Zk1yXoBuierM9"},
                {"title": "Good as Hell", "artist": "Lizzo", "duration": "2:39", "spotify_id": "1P17dC1amhFzptugyAO7Il"}
            ]
        }
        return {"collection": collection}
    
    raise HTTPException(status_code=404, detail="Collection not found")

@router.delete("/api/collections/{collection_id}")
def delete_collection(collection_id: int, user_id: Optional[str] = None):
    """
    Delete a collection
    """
    # In production, this would delete from database
    return {"message": f"Collection {collection_id} deleted successfully"}

@router.put("/api/collections/{collection_id}")
def update_collection(collection_id: int, collection_data: CreateCollectionRequest, user_id: Optional[str] = None):
    """
    Update a collection
    """
    # In production, this would update the database
    updated_collection = {
        "id": collection_id,
        "name": collection_data.name,
        "mood": collection_data.mood,
        "songCount": len(collection_data.songs),
        "lastUpdated": "just now",
        "songs": [song.dict() for song in collection_data.songs],
        "updated_at": "2024-12-08T00:00:00Z"
    }
    
    return {"collection": updated_collection, "message": "Collection updated successfully"}

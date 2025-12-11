from fastapi import APIRouter, Query, HTTPException, Body
from typing import List, Optional
from pydantic import BaseModel

from ..ml.mood_recommender import get_recommender
from ..ml.dataset_loader import get_preprocessor
from ..storage.firestore_storage import get_user_sessions, save_user_session

router = APIRouter()

class RecommendationResponse(BaseModel):
    track_id: str
    track_name: str
    artists: str
    album_name: str
    track_genre: str
    popularity: int
    similarity: float
    similarity_percent: float

class SearchResult(BaseModel):
    index: int
    track_id: str
    track_name: str
    artists: str
    album_name: str
    track_genre: str

class LogSessionRequest(BaseModel):
    firebase_user_id: str
    track_id: str
    mood: str
    intensity: int = 50
    track_name: Optional[str] = None
    artist_name: Optional[str] = None
    session_type: str = "track"

@router.post("/api/sessions/log")
async def log_mood_session(request: LogSessionRequest):
    """
    Log a mood-song session for personalization.
    ####the frontend should call this when user tags a track/playlist with a mood. ####
    """
    moods = ["Happy", "Sad", "Energized", "Angry", "Calm"]
    
    if request.mood not in moods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mood."
        )
    
    if not (0 <= request.intensity <= 100):
        raise HTTPException(
            status_code=400,
            detail="Intensity must be between 0 and 100"
        )
    
    try:
        session_data = save_user_session(
            firebase_user_id=request.firebase_user_id,
            track_id=request.track_id,
            mood=request.mood,
            intensity=request.intensity,
            track_name=request.track_name,
            artist_name=request.artist_name,
            session_type=request.session_type
        )
        
        return {
            "success": True,
            "session_id": session_data["id"],
            "message": "Mood session logged successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging session: {str(e)}")

@router.get("/api/sessions")
async def get_user_sessions_endpoint(
    firebase_user_id: str = Query(..., description="Firebase user ID"),
    mood: Optional[str] = Query(None, description="Optional mood filter"),
    limit: Optional[int] = Query(None, ge=1, le=100, description="Optional limit")):
    """
    Get user's logged mood sessions.
    """
    try:
        sessions = get_user_sessions(
            firebase_user_id=firebase_user_id,
            mood=mood,
            limit=limit
        )
        
        return {
            "count": len(sessions),
            "sessions": sessions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sessions: {str(e)}")

@router.get("/api/recommendations")
async def get_mood_recommendations(
    mood: str = Query(..., description="Mood: Happy, Sad, Energized, Angry, or Calm"),
    limit: int = Query(20, ge=1, le=50, description="Number of recommendations"),
    firebase_user_id: Optional[str] = Query(None, description="Firebase user ID for personalization"),
    personalization_weight: float = Query(0.7, ge=0.0, le=1.0, description="Personalization weight (0=general, 1=user-specific)")
):
    """
    Get song recommendations based on mood.
    If firebase_user_id is provided, uses personalized recommendations based on user's logged sessions.
    """
    valid_moods = ["Happy", "Sad", "Energized", "Angry", "Calm"]
    
    if mood not in valid_moods:
        raise HTTPException(
            status_code=400,
            detail="Invalid mood"
        )
    
    try:
        if firebase_user_id:
            # user's mood song history from database
            sessions = get_user_sessions(firebase_user_id=firebase_user_id)
            
            # make personalized recommender
            recommender = get_recommender(user_id=firebase_user_id)
            
            # learn from user sessions
            if sessions:
                recommender.learn_from_user_sessions(sessions)
            
            recommendations = recommender.get_mood_recommendations(
                mood=mood, 
                top_k=limit,
                personalization_weight=personalization_weight
            )
            
            return {
                "mood": mood,
                "count": len(recommendations),
                "personalized": True,
                "user_sessions_count": len(sessions),
                "recommendations": recommendations
            }
        else:
            # no user_id so we use general recommendations instead
            recommender = get_recommender()
            recommendations = recommender.get_mood_recommendations(mood=mood, top_k=limit)
            
            return {
                "mood": mood,
                "count": len(recommendations),
                "personalized": False,
                "recommendations": recommendations
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@router.get("/api/suggest")
async def search_songs(
    q: str = Query(..., min_length=1, description="Search query (song name or artist)"),
    limit: int = Query(20, ge=1, le=50, description="Maximum number of results")
):
    """
    Search for songs by track name or artist name.
    """
    try:
        preprocessor = get_preprocessor()
        results = preprocessor.search_tracks(q, limit=limit)
        
        if results.empty:
            return {
                "query": q,
                "count": 0,
                "results": []
            }
        
        return {
            "query": q,
            "count": len(results),
            "results": results.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching songs: {str(e)}")

@router.get("/api/recommendations/by-track")
async def get_track_recommendations(
    index: int = Query(..., ge=0, description="Track index from search results"),
    limit: int = Query(10, ge=1, le=50, description="Number of recommendations")
):
    """
    Get songs similar to a specific track (by index).
    Use this after searching for a song with /api/suggest.
    """
    try:
        recommender = get_recommender()
        recommendations = recommender.get_similar_songs(track_index=index, top_k=limit)
        
        if not recommendations:
            raise HTTPException(status_code=404, detail="Track not found")
        
        return {
            "track_index": index,
            "count": len(recommendations),
            "recommendations": recommendations
        }
    except IndexError:
        raise HTTPException(status_code=404, detail="Track index out of range")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

"""
Analytics API routes for music listening insights
"""
from typing import Optional, List
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class MoodStat(BaseModel):
    mood: str
    percentage: float
    color: str
    hours: float

class ListeningData(BaseModel):
    day: str
    hours: float

class TopArtist(BaseModel):
    name: str
    plays: int
    change: str

class TopGenre(BaseModel):
    name: str
    percentage: float
    color: str

@router.get("/api/analytics/overview")
def get_analytics_overview(time_filter: str = "This Week", user_id: Optional[str] = None):
    """
    Get analytics overview including mood distribution, listening time, etc.
    In production, this would query user's actual listening data
    """
    
    # Mock analytics data
    overview = {
        "total_listening_hours": 41.0,
        "daily_average": 5.9,
        "top_mood": "Happy",
        "mood_percentage": 35,
        "week_change": "+23%",
        "mood_stats": [
            {"mood": "Happy", "percentage": 35, "color": "#4CAF50", "hours": 14.2},
            {"mood": "Energized", "percentage": 25, "color": "#FFC107", "hours": 10.1},
            {"mood": "Calm", "percentage": 20, "color": "#9C27B0", "hours": 8.3},
            {"mood": "Sad", "percentage": 15, "color": "#2196F3", "hours": 6.1},
            {"mood": "Angry", "percentage": 5, "color": "#F44336", "hours": 2.3}
        ],
        "listening_data": [
            {"day": "Mon", "hours": 3.2},
            {"day": "Tue", "hours": 2.8},
            {"day": "Wed", "hours": 4.1},
            {"day": "Thu", "hours": 3.7},
            {"day": "Fri", "hours": 5.2},
            {"day": "Sat", "hours": 6.8},
            {"day": "Sun", "hours": 4.9}
        ],
        "top_artists": [
            {"name": "The Weeknd", "plays": 47, "change": "+12%"},
            {"name": "Dua Lipa", "plays": 39, "change": "+8%"},
            {"name": "Post Malone", "plays": 34, "change": "-3%"},
            {"name": "Olivia Rodrigo", "plays": 28, "change": "+15%"},
            {"name": "Imagine Dragons", "plays": 25, "change": "+5%"}
        ],
        "top_genres": [
            {"name": "Pop", "percentage": 32, "color": "#4CAF50"},
            {"name": "Hip-Hop", "percentage": 28, "color": "#FFC107"},
            {"name": "Rock", "percentage": 18, "color": "#F44336"},
            {"name": "Electronic", "percentage": 12, "color": "#2196F3"},
            {"name": "Indie", "percentage": 10, "color": "#9C27B0"}
        ]
    }
    
    return {"analytics": overview, "time_filter": time_filter}

@router.get("/api/analytics/mood-history")
def get_mood_history(days: int = 30, user_id: Optional[str] = None):
    """
    Get mood listening history over time
    """
    # Mock mood history data
    mood_history = []
    import datetime
    
    base_date = datetime.datetime.now() - datetime.timedelta(days=days)
    
    for i in range(days):
        date = base_date + datetime.timedelta(days=i)
        mood_history.append({
            "date": date.strftime("%Y-%m-%d"),
            "dominant_mood": ["Happy", "Energized", "Calm", "Sad"][i % 4],
            "listening_hours": 2.5 + (i % 5) * 0.8,
            "mood_distribution": {
                "Happy": max(0, 40 - (i % 10) * 2),
                "Energized": max(0, 25 + (i % 8) * 2),
                "Calm": max(0, 20 + (i % 6) * 1),
                "Sad": max(0, 10 + (i % 4) * 2),
                "Angry": max(0, 5 + (i % 3))
            }
        })
    
    return {"mood_history": mood_history}

@router.get("/api/analytics/recommendations-accuracy")
def get_recommendations_accuracy(user_id: Optional[str] = None):
    """
    Get accuracy metrics for mood-based recommendations
    """
    accuracy_data = {
        "overall_accuracy": 87.3,
        "mood_accuracy": {
            "Happy": 92.1,
            "Energized": 88.7,
            "Calm": 85.4,
            "Sad": 83.2,
            "Angry": 79.8
        },
        "user_feedback": {
            "liked": 76,
            "disliked": 12,
            "neutral": 45
        },
        "improvement_suggestions": [
            "More variety in Happy mood recommendations",
            "Better detection of energy levels",
            "Include more recent releases"
        ]
    }
    
    return {"recommendations_accuracy": accuracy_data}

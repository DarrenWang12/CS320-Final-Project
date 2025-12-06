# backend/src/ml/feature_extraction.py (UPDATED)

from typing import Dict, Optional
import numpy as np
from .dataset_loader import kaggle_loader

def extract_track_features_hybrid(track_data: Dict) -> Dict:
    """
    Extract features using BOTH Spotify API data AND Kaggle dataset
    This gives you the best of both worlds!
    """
    track_id = track_data.get("track_id")
    
    # try to get audio features from dataset
    kaggle_features = kaggle_loader.get_audio_features(track_id) if track_id else None
    
    # if we have features
    if kaggle_features:
        return {
            'valence': kaggle_features['valence'],
            'energy': kaggle_features['energy'],
            'danceability': kaggle_features['danceability'],
            'acousticness': kaggle_features['acousticness'],
            'instrumentalness': kaggle_features['instrumentalness'],
            'tempo': kaggle_features['tempo'] / 200.0,  # normalize (still have to do this better)
            'loudness': (kaggle_features['loudness'] + 60) / 60.0,  # normalize -60 to 0 dB
            'speechiness': kaggle_features['speechiness'],
            
            # Spotify metadata
            'popularity': track_data.get('popularity', 50) / 100.0,
            'duration': track_data.get('duration_ms', 200000) / 60000.0,
            'explicit': 1.0 if track_data.get('explicit') else 0.0,
            
            'genre': kaggle_features.get('track_genre', 'unknown')
        }
    else:
        # Fallback to manual feature extraction
        return extract_track_features_manual(track_data)

def extract_track_features_manual(track_data: Dict) -> Dict:
    """
    Fallback when track not in Kaggle dataset
    Uses only Spotify API metadata (duration, popularity, genre)
    """
    duration_min = track_data.get("duration_ms", 200000) / 60000
    popularity = track_data.get("popularity", 50)
    explicit = 1 if track_data.get("explicit") else 0
    
    # genres from artists
    all_genres = []
    for artist in track_data.get("artists", []):
        all_genres.extend(artist.get("genres", []))
    
    # features from genre
    valence = estimate_valence_from_genres(all_genres)
    energy = estimate_energy_from_genres(all_genres)
    
    return {
        'valence': valence,
        'energy': energy,
        'danceability': 0.5,
        'popularity': popularity / 100.0,
        'duration': duration_min,
        'explicit': explicit,
        'tempo': 0.5,
        'loudness': 0.5,
        'acousticness': 0.5,
        'speechiness': 0.1,
        'instrumentalness': 0.3,
        'genre': ','.join(all_genres[:3]) if all_genres else 'unknown'
    }

def estimate_valence_from_genres(genres: list) -> float:
    """Rough valence estimate from genres, work in progress"""
    happy_genres = ['pop', 'dance', 'funk', 'disco', 'happy']
    sad_genres = ['sad', 'emo', 'blues', 'melancholic']
    
    score = 0.5
    for genre in genres:
        genre_lower = genre.lower()
        if any(h in genre_lower for h in happy_genres):
            score += 0.2
        elif any(s in genre_lower for s in sad_genres):
            score -= 0.2
    
    return max(0.0, min(1.0, score))

def estimate_energy_from_genres(genres: list) -> float:
    """Rough energy estimate from genres, work in progress"""
    high_energy = ['rock', 'metal', 'edm', 'dance', 'electronic', 'punk']
    low_energy = ['ambient', 'classical', 'acoustic', 'chill', 'folk']
    
    score = 0.5
    for genre in genres:
        genre_lower = genre.lower()
        if any(h in genre_lower for h in high_energy):
            score += 0.2
        elif any(l in genre_lower for l in low_energy):
            score -= 0.2
    
    return max(0.0, min(1.0, score))
import numpy as np
from typing import List, Dict, Optional
from sklearn.metrics.pairwise import cosine_similarity
from .dataset_loader import get_preprocessor

class MoodRecommender:
    """
    Recommends songs based on mood using cosine similarity.
    Each mood has a prototype feature vector that represents its characteristics.
    """
    
    # Mood prototypes - feature vectors representing each mood
    # These are based on typical audio feature combinations for each mood
    MOOD_PROTOTYPES = {
        "Happy": {
            "valence": 0.8,      # High positivity
            "energy": 0.65,       # Medium-high energy
            "danceability": 0.75, # High danceability
            "acousticness": 0.2,  # Low acoustic (more electronic/pop)
            "tempo_norm": 0.6,    # Medium-fast tempo
            "speechiness": 0.1,   # Low speechiness
        },
        "Sad": {
            "valence": 0.25,      # Low positivity
            "energy": 0.35,       # Low energy
            "danceability": 0.4,  # Low danceability
            "acousticness": 0.6,  # Higher acoustic
            "tempo_norm": 0.3,    # Slower tempo
            "speechiness": 0.15,  # Slightly higher (emotional lyrics)
        },
        "Energized": {
            "valence": 0.7,       # High positivity
            "energy": 0.85,       # Very high energy
            "danceability": 0.8,  # High danceability
            "acousticness": 0.15, # Low acoustic
            "tempo_norm": 0.75,   # Fast tempo
            "speechiness": 0.12,  # Medium speechiness
        },
        "Angry": {
            "valence": 0.3,       # Low positivity
            "energy": 0.9,        # Very high energy
            "danceability": 0.5,  # Medium danceability
            "acousticness": 0.1,  # Very low acoustic
            "tempo_norm": 0.7,    # Fast tempo
            "speechiness": 0.2,   # Higher speechiness (aggressive)
        },
        "Calm": {
            "valence": 0.6,       # Medium-high positivity
            "energy": 0.25,       # Low energy
            "danceability": 0.45, # Low danceability
            "acousticness": 0.75, # High acoustic
            "tempo_norm": 0.25,   # Slow tempo
            "speechiness": 0.08,  # Low speechiness
        }
    }
    
    def __init__(self, user_id: Optional[str] = None):
        self.preprocessor = get_preprocessor()
        self.feature_matrix = self.preprocessor.feature_matrix
        self.df = self.preprocessor.df
        self.user_id = user_id
        self.user_mood_centroids = {}  # Learned mood centroids per user
        
        if self.feature_matrix is None:
            raise ValueError("Preprocessor must be initialized first")
    
    def _create_mood_prototype_vector(self, mood: str) -> Optional[np.ndarray]:
        """
        Convert mood prototype dictionary into a feature vector matching
        the preprocessed feature matrix dimensions.
        """
        if mood not in self.MOOD_PROTOTYPES:
            return None
        
        mood_proto = self.MOOD_PROTOTYPES[mood]
        
        # Get feature column names from the preprocessed dataframe
        # We need to match the exact feature structure
        feature_df, _ = self.preprocessor.prepare_feature_columns(self.df.head(1))
        
        # Create a prototype row with default values
        prototype_row = feature_df.iloc[0].copy()
        
        # Set mood-specific values for known features
        if 'valence' in prototype_row.index:
            prototype_row['valence'] = mood_proto['valence']
        if 'energy' in prototype_row.index:
            prototype_row['energy'] = mood_proto['energy']
        if 'danceability' in prototype_row.index:
            prototype_row['danceability'] = mood_proto['danceability']
        if 'acousticness' in prototype_row.index:
            prototype_row['acousticness'] = mood_proto['acousticness']
        if 'tempo_norm' in prototype_row.index:
            prototype_row['tempo_norm'] = mood_proto['tempo_norm']
        if 'speechiness' in prototype_row.index:
            prototype_row['speechiness'] = mood_proto['speechiness']
        
        # Scale the prototype using the same scaler
        prototype_vector = self.preprocessor.scaler.transform([prototype_row.values])
        return prototype_vector[0]
    
    def learn_from_user_sessions(self, sessions: List[Dict]):
        """
        Learn user-specific mood preferences from logged sessions.
        
        Args:
            sessions: List of {trackId, mood, intensity, ...} dicts from Firestore
        """
        # Group sessions by mood
        mood_sessions = {}
        for session in sessions:
            mood = session.get('mood')
            if not mood:
                continue
            if mood not in mood_sessions:
                mood_sessions[mood] = []
            mood_sessions[mood].append(session)
        
        # Compute user-specific mood centroids
        for mood, mood_sessions_list in mood_sessions.items():
            # Get feature vectors for all tracks user tagged with this mood
            track_vectors = []
            for session in mood_sessions_list:
                # Handle both camelCase (from Firestore) and snake_case
                track_id = session.get('trackId') or session.get('track_id')
                if not track_id:
                    continue
                    
                # Find track in dataset
                track_idx = self._find_track_index(track_id)
                if track_idx is not None:
                    track_vector = self.feature_matrix[track_idx]
                    # Weight by intensity if provided (0-100 scale, convert to 0-1)
                    intensity = session.get('intensity', 50)
                    weight = float(intensity) / 100.0 if intensity else 0.5
                    track_vectors.append((track_vector, weight))
            
            if track_vectors:
                # Compute weighted centroid
                vectors = np.array([v for v, _ in track_vectors])
                weights = np.array([w for _, w in track_vectors])
                # Normalize weights
                weights = weights / weights.sum() if weights.sum() > 0 else weights
                centroid = np.average(vectors, axis=0, weights=weights)
                self.user_mood_centroids[mood] = centroid
    
    def get_mood_recommendations(
        self, 
        mood: str, 
        top_k: int = 20,
        min_similarity: float = 0.0,
        personalization_weight: float = 0.7
    ) -> List[Dict]:
        """
        Get song recommendations for a given mood.
        If user has learned preferences, blends general prototype with user-specific centroid.
        
        Args:
            mood: One of "Happy", "Sad", "Energized", "Angry", "Calm"
            top_k: Number of recommendations to return
            min_similarity: Minimum similarity score threshold
            personalization_weight: 0.0 = only general, 1.0 = only user-specific (default 0.7)
        
        Returns:
            List of track dictionaries with similarity scores
        """
        if mood not in self.MOOD_PROTOTYPES:
            raise ValueError(f"Unknown mood: {mood}. Must be one of {list(self.MOOD_PROTOTYPES.keys())}")
        
        # Create general mood prototype vector
        general_prototype = self._create_mood_prototype_vector(mood)
        if general_prototype is None:
            return []
        
        # Blend with user-specific centroid if available
        if self.user_id and mood in self.user_mood_centroids:
            user_centroid = self.user_mood_centroids[mood]
            # Blend: weighted average
            blended_prototype = (
                personalization_weight * user_centroid +
                (1 - personalization_weight) * general_prototype
            )
        else:
            # No user data yet, use general prototype
            blended_prototype = general_prototype
        
        # Reshape for cosine similarity calculation
        mood_vector = blended_prototype.reshape(1, -1)
        
        # Calculate cosine similarity between mood prototype and all songs
        similarities = cosine_similarity(mood_vector, self.feature_matrix).flatten()
        
        # Get top K indices
        top_indices = similarities.argsort()[::-1][:top_k]
        
        # Filter by minimum similarity
        top_indices = [idx for idx in top_indices if similarities[idx] >= min_similarity]
        
        # Build results
        recommendations = []
        for idx in top_indices:
            track_info = self.preprocessor.get_track_by_index(idx)
            if track_info:
                track_info['similarity'] = float(similarities[idx])
                track_info['similarity_percent'] = round(similarities[idx] * 100, 1)
                recommendations.append(track_info)
        
        return recommendations
    
    def get_similar_songs(
        self,
        track_index: int,
        top_k: int = 10
    ) -> List[Dict]:
        """
        Get songs similar to a specific track (by index).
        Useful for "song-based" recommendations.
        """
        if track_index >= len(self.feature_matrix):
            return []
        
        # Get the track's feature vector
        track_vector = self.feature_matrix[track_index].reshape(1, -1)
        
        # Calculate similarities
        similarities = cosine_similarity(track_vector, self.feature_matrix).flatten()
        
        # Get top K (excluding the track itself)
        top_indices = similarities.argsort()[::-1][1:top_k+1]
        
        recommendations = []
        for idx in top_indices:
            track_info = self.preprocessor.get_track_by_index(idx)
            if track_info:
                track_info['similarity'] = float(similarities[idx])
                track_info['similarity_percent'] = round(similarities[idx] * 100, 1)
                recommendations.append(track_info)
        
        return recommendations
    
    def _find_track_index(self, track_id: str) -> Optional[int]:
        """Find track index in dataset by track_id"""
        if self.df is None:
            return None
        matches = self.df[self.df['track_id'] == track_id]
        if len(matches) > 0:
            return matches.index[0]
        return None


_recommender_instance = None

def get_recommender(user_id: Optional[str] = None) -> MoodRecommender:
    """Get or create the global recommender instance"""
    global _recommender_instance
    # for personalized recommendations, create new instance per user
    if user_id:
        return MoodRecommender(user_id=user_id)

    if _recommender_instance is None:
        _recommender_instance = MoodRecommender()
    return _recommender_instance

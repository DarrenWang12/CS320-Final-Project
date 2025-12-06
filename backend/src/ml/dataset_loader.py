import pandas as pd
import numpy as np
from typing import Dict, Optional
import os
import pathlib
import pickle
import hashlib
from datetime import datetime

class SpotifyKaggleLoader:
    """
    Loads the Kaggle Spotify dataset with intelligent caching
    """
    def __init__(self, csv_path: str = None):
        if csv_path is None:
            backend_dir = pathlib.Path(__file__).parent.parent.parent
            csv_path = backend_dir / "data" / "dataset.csv"
        
        self.csv_path = pathlib.Path(csv_path)
        self.cache_dir = self.csv_path.parent / ".cache"
        self.cache_dir.mkdir(exist_ok=True)
        
        self.df = None
        self.track_index = {}
        
        if os.path.exists(self.csv_path):
            self.load_dataset_cached()
        else:
            print("Audio features will be estimated from genres only")
    
    def _get_csv_hash(self) -> str:
        """Generate hash of CSV file for cache validation"""
        with open(self.csv_path, 'rb') as f:
            # read first 1MB for hash
            file_hash = hashlib.md5(f.read(1024 * 1024)).hexdigest()
        return file_hash
    
    def _get_cache_path(self) -> pathlib.Path:
        """Get path for cached pickle file"""
        return self.cache_dir / "dataset.pkl"
    
    def _get_cache_metadata_path(self) -> pathlib.Path:
        """Get path for cache metadata"""
        return self.cache_dir / "dataset_meta.pkl"
    
    def _is_cache_valid(self):
        cache_path = self._get_cache_path()
        meta_path = self._get_cache_metadata_path()
        if not cache_path.exists() or not meta_path.exists():
            return False
        with open(meta_path, 'rb') as f:
            metadata = pickle.load(f)
        return metadata.get('csv_hash') == self._get_csv_hash()

    
    def _save_to_cache(self):
        """Save DataFrame and index to cache"""
        cache_path = self._get_cache_path()
        meta_path = self._get_cache_metadata_path()
                
        try:
            cache_data = {
                'df': self.df,
                'track_index': self.track_index
            }
            with open(cache_path, 'wb') as f:
                pickle.dump(cache_data, f, protocol=pickle.HIGHEST_PROTOCOL)
            
            # metadata
            metadata = {
                'csv_hash': self._get_csv_hash(),
                'created_at': datetime.now(),
                'num_tracks': len(self.df),
                'num_indexed': len(self.track_index)
            }
            with open(meta_path, 'wb') as f:
                pickle.dump(metadata, f)
            
        except Exception as e:
            print(f"Failed to save cache: {e}")
    
    def _load_from_cache(self) -> bool:
        """Load DataFrame and index from cache"""
        cache_path = self._get_cache_path()
                
        try:
            with open(cache_path, 'rb') as f:
                cache_data = pickle.load(f)
            
            self.df = cache_data['df']
            self.track_index = cache_data['track_index']
            
            return True
        except Exception as e:
            return False
    
    def load_dataset_cached(self):
        """Load dataset with caching"""
        # load from cache first
        if self._is_cache_valid():
            if self._load_from_cache():
                return
        
        # cache miss or invalid - load from CSV        
        self.df = pd.read_csv(self.csv_path)
        
        # lookup index by track_id
        self.track_index = {
            row['track_id']: idx 
            for idx, row in self.df.iterrows() 
            if pd.notna(row['track_id'])
        } 
        self._save_to_cache()
    
    def get_audio_features(self, track_id: str) -> Optional[Dict]:
        """
        Get audio features for a Spotify track ID
        
        Returns dict with:
        - valence: 0-1 (happiness)
        - energy: 0-1 (intensity)
        - danceability: 0-1
        - acousticness: 0-1
        - instrumentalness: 0-1
        - speechiness: 0-1
        - liveness: 0-1
        - tempo: BPM
        - loudness: dB
        - duration_ms: milliseconds
        - popularity: 0-100
        - track_genre: genre label
        """
        if self.df is None or track_id not in self.track_index:
            return None
        
        idx = self.track_index[track_id]
        row = self.df.iloc[idx]
        
        return {
            # mood related features
            'valence': float(row['valence']),
            'energy': float(row['energy']),
            'danceability': float(row['danceability']),

            # secondary features
            'acousticness': float(row['acousticness']),
            'instrumentalness': float(row['instrumentalness']),
            'speechiness': float(row['speechiness']),
            'liveness': float(row['liveness']),
            
            # properties
            'tempo': float(row['tempo']),
            'loudness': float(row['loudness']),
            'key': int(row['key']),
            'mode': int(row['mode']),
            'time_signature': int(row['time_signature']),
            
            # metadata
            'duration_ms': int(row['duration_ms']),
            'popularity': int(row['popularity']),
            'explicit': bool(row['explicit']),
            'track_genre': str(row['track_genre'])
        }
    
    def search_by_genre(self, genre: str, limit: int = 100) -> pd.DataFrame:
        """Get tracks by genre (for building mood playlists)"""
        if self.df is None:
            return pd.DataFrame()
        
        genre_matches = self.df[self.df['track_genre'] == genre]
        return genre_matches.head(limit)
    
    def get_high_valence_tracks(self, min_valence: float = 0.7, limit: int = 50) -> pd.DataFrame:
        """Get happy songs (high valence)"""
        if self.df is None:
            return pd.DataFrame()
        
        return self.df[self.df['valence'] >= min_valence].head(limit)
    
    def get_low_valence_tracks(self, max_valence: float = 0.3, limit: int = 50) -> pd.DataFrame:
        """Get sad songs (low valence)"""
        if self.df is None:
            return pd.DataFrame()
        
        return self.df[self.df['valence'] <= max_valence].head(limit)
    
    def get_dataset_stats(self) -> Dict:
        """Get statistics about the dataset"""
        if self.df is None:
            return {}
        
        return {
            'total_tracks': len(self.df),
            'unique_genres': self.df['track_genre'].nunique(),
            'genres': sorted(self.df['track_genre'].unique().tolist()),
            'valence_mean': float(self.df['valence'].mean()),
            'energy_mean': float(self.df['energy'].mean()),
            'tempo_mean': float(self.df['tempo'].mean()),
        }
    
    def clear_cache(self):
        """Clear cached data (maybe debugging)"""
        cache_path = self._get_cache_path()
        meta_path = self._get_cache_metadata_path()
        
        if cache_path.exists():
            cache_path.unlink()
        
        if meta_path.exists():
            meta_path.unlink()

# instance
kaggle_loader = SpotifyKaggleLoader()
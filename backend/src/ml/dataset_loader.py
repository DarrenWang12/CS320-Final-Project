import pandas as pd
import numpy as np
from typing import Dict, Optional, Tuple
import pathlib
from sklearn.preprocessing import StandardScaler
import pickle

class MoodDatasetPreprocessor:
    """
    Preprocessor for mood-based music recommendations.
    Loads and preprocesses the Spotify dataset for similar mood matching.
    """
    
    def __init__(self, csv_path: Optional[pathlib.Path] = None):
        if csv_path is None:
            backend_dir = pathlib.Path(__file__).parent.parent.parent
            csv_path = backend_dir / "data" / "dataset.csv"
        
        self.csv_path = pathlib.Path(csv_path)
        self.df = None
        # Preprocessed embeddings
        self.feature_matrix = None
        self.scaler = StandardScaler()
        # we store track info separately
        self.track_metadata = None
        
    def load_raw_data(self) -> pd.DataFrame:
        """Load the raw CSV dataset"""
        if not self.csv_path.exists():
            raise FileNotFoundError(f"Dataset not found at {self.csv_path}")
        
        df = pd.read_csv(self.csv_path)
        return df
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove rows with missing critical audio features"""
        features = [
            'danceability', 'energy', 'valence', 'acousticness',
            'tempo', 'loudness', 'speechiness', 'instrumentalness', 'liveness'
        ]
        
        initial_count = len(df)
        df_clean = df.dropna(subset=features).copy()
        removed = initial_count - len(df_clean)
           
        return df_clean.reset_index(drop=True)
    
    def encode_categorical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Encode categorical features for numerical processing"""
        df_encoded = df.copy()
        
        # mode: major (1) or minor (0)
        if 'mode' in df_encoded.columns:
            df_encoded['mode'] = df_encoded['mode'].map({'Major': 1, 'Minor': 0})
            df_encoded['mode'] = df_encoded['mode'].fillna(0)  # Default to minor if missing
        
        # one-hot encode key (0-11 representing musical keys)
        if 'key' in df_encoded.columns:
            df_encoded = pd.get_dummies(df_encoded, columns=['key'], prefix='key', dtype=float)
        
        # one-hot encode time_signature (usually 3, 4, or 5)
        if 'time_signature' in df_encoded.columns:
            df_encoded = pd.get_dummies(df_encoded, columns=['time_signature'], prefix='ts', dtype=float)
        
        return df_encoded
    
    def prepare_feature_columns(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Separate continuous features for scaling and metadata for preservation.
        Returns: (feature_df, metadata_df)
        """
        # normalize popularity to 0-1
        if 'popularity' in df.columns:
            df['popularity_norm'] = df['popularity'] / 100.0
        
        # normalize loudness from dB range (-60 to 0) to 0-1
        if 'loudness' in df.columns:
            df['loudness_norm'] = (df['loudness'] + 60) / 60.0
            df['loudness_norm'] = df['loudness_norm'].clip(0, 1)
        
        # normalize tempo (typical range 50-200 BPM) to 0-1
        if 'tempo' in df.columns:
            df['tempo_norm'] = (df['tempo'] - 50) / 150.0
            df['tempo_norm'] = df['tempo_norm'].clip(0, 1)
        
        # normalize duration_ms to minutes
        if 'duration_ms' in df.columns:
            df['duration_min'] = df['duration_ms'] / 60000.0
        
        # select all numerical columns for feature matrix
        feature_columns = [col for col in df.columns if df[col].dtype in ['float64', 'int64', 'float32', 'int32']]

        # exclude metadata columns
        exclude_cols = ['popularity', 'duration_ms', 'loudness', 'tempo']
        feature_columns = [col for col in feature_columns if col not in exclude_cols]
        
        feature_df = df[feature_columns].copy()
        
        # metadata to preserve
        metadata_cols = ['track_id', 'track_name', 'artists', 'album_name', 
                        'track_genre', 'popularity', 'explicit']
        metadata_df = df[[col for col in metadata_cols if col in df.columns]].copy()
        
        return feature_df, metadata_df
    
    def scale_features(self, feature_df: pd.DataFrame) -> np.ndarray:
        """Scale features to have mean 0 and std 1 for similarity calculations"""
        scaled_features = self.scaler.fit_transform(feature_df)
        return scaled_features
    
    def preprocess(self) -> None:
        """
        Main preprocessing pipeline: load, clean, encode, scale, and prepare embeddings
        """
        df = self.load_raw_data()
        
        df = self.clean_data(df)
        
        df = self.encode_categorical_features(df)
        
        # separate features and metadata
        feature_df, metadata_df = self.prepare_feature_columns(df)
        
        # scale features
        self.feature_matrix = self.scale_features(feature_df)
        
        # store metadata with original DataFrame
        self.df = df
        self.track_metadata = metadata_df
        
    
    def get_track_by_index(self, idx: int) -> Optional[Dict]:
        """Get track metadata by index"""
        if self.df is None or idx >= len(self.df):
            return None
        
        row = self.df.iloc[idx]
        return {
            'track_id': str(row.get('track_id', '')),
            'track_name': str(row.get('track_name', '')),
            'artists': str(row.get('artists', '')),
            'album_name': str(row.get('album_name', '')),
            'track_genre': str(row.get('track_genre', '')),
            'popularity': int(row.get('popularity', 0)),
            'explicit': bool(row.get('explicit', False)),
            'valence': float(row.get('valence', 0.5)),
            'energy': float(row.get('energy', 0.5)),
            'danceability': float(row.get('danceability', 0.5)),
        }
    
    def search_tracks(self, query: str, limit: int = 20) -> pd.DataFrame:
        """Search tracks by name or artist"""
        if self.df is None:
            return pd.DataFrame()
        
        query_lower = query.lower()
        mask = (
            self.df['track_name'].str.lower().str.contains(query_lower, na=False) |
            self.df['artists'].str.lower().str.contains(query_lower, na=False)
        )
        
        results = self.df[mask].head(limit).copy()
        # Add index column for reference
        results['index'] = results.index
        return results[['index', 'track_id', 'track_name', 'artists', 'album_name', 'track_genre']]
    
    def save_preprocessed(self, output_dir: Optional[pathlib.Path] = None):
        """Save preprocessed data for faster loading"""
        if self.feature_matrix is None:
            raise ValueError("Must run preprocess() first")
        
        if output_dir is None:
            output_dir = self.csv_path.parent
        
        output_dir = pathlib.Path(output_dir)
        output_dir.mkdir(exist_ok=True)
        
        # feature matrix
        np.save(output_dir / "mood_embeddings.npy", self.feature_matrix)
        
        # save scaler
        with open(output_dir / "scaler.pkl", 'wb') as f:
            pickle.dump(self.scaler, f)
        
        # save metadata
        self.track_metadata.to_parquet(output_dir / "track_metadata.parquet", index=False)
        
        # save full dataframe (for search functionality)
        self.df.to_parquet(output_dir / "full_dataset.parquet", index=False)
        
    
    def load_preprocessed(self, data_dir: Optional[pathlib.Path] = None) -> bool:
        """Load previously preprocessed data"""
        if data_dir is None:
            data_dir = self.csv_path.parent
        
        data_dir = pathlib.Path(data_dir)
        
        embeddings_path = data_dir / "mood_embeddings.npy"
        scaler_path = data_dir / "scaler.pkl"
        metadata_path = data_dir / "track_metadata.parquet"
        dataset_path = data_dir / "full_dataset.parquet"
        
        if not all(p.exists() for p in [embeddings_path, scaler_path, metadata_path, dataset_path]):
            return False
        
        try:
            self.feature_matrix = np.load(embeddings_path)
            
            with open(scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            
            self.track_metadata = pd.read_parquet(metadata_path)
            self.df = pd.read_parquet(dataset_path)
            
            return True

        except Exception as e:
            print(f"Error loading preprocessed data: {e}")
            return False


_preprocessor_instance = None

def get_preprocessor() -> MoodDatasetPreprocessor:
    """Get or create the global preprocessor instance"""
    global _preprocessor_instance
    if _preprocessor_instance is None:
        _preprocessor_instance = MoodDatasetPreprocessor()

        if not _preprocessor_instance.load_preprocessed():
            _preprocessor_instance.preprocess()
            # save for next time
            _preprocessor_instance.save_preprocessed()

    return _preprocessor_instance
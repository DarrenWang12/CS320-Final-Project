"""
Firestore storage for Spotify tokens and user data.
"""
import os
import json
from datetime import datetime, timedelta
from typing import Optional
import pathlib
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables
backend_dir = pathlib.Path(__file__).parent.parent.parent
load_dotenv(dotenv_path=backend_dir / ".env")

# Global Firestore client
_db: Optional[firestore.Client] = None

SPOTIFY_TOKENS_COLLECTION = "spotifyTokens"
ONE_HOUR_IN_SECONDS = 3600


def init_firestore():
    """
    Initialize Firebase Admin SDK and Firestore client.
    Must be called once at application startup.
    
    Supports two methods for credentials:
    1. FIREBASE_SERVICE_ACCOUNT_PATH - path to JSON file
    2. FIREBASE_SERVICE_ACCOUNT_JSON - JSON string directly
    """
    global _db
    
    if _db is not None:
        return  # Already initialized
    
    if firebase_admin._apps:
        # Already initialized, just get the client
        try:
            _db = firestore.client()
            return
        except Exception as e:
            raise RuntimeError(f"Firebase Admin already initialized but cannot get Firestore client: {e}")
    
    # Try to get credentials from environment variables
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    cred_json_str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    
    cred = None
    
    # Option 1: Load from file path
    if cred_path and os.path.exists(cred_path):
        try:
            cred = credentials.Certificate(cred_path)
            print(f"✓ Loaded Firebase credentials from file: {cred_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to load Firebase credentials from file {cred_path}: {e}")
    
    # Option 2: Load from JSON string
    elif cred_json_str:
        try:
            cred_dict = json.loads(cred_json_str)
            cred = credentials.Certificate(cred_dict)
            print("✓ Loaded Firebase credentials from JSON string")
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: {e}")
        except Exception as e:
            raise RuntimeError(f"Failed to load Firebase credentials from JSON: {e}")
    
    # Option 3: Try default credentials (for cloud environments like GCP)
    else:
        try:
            firebase_admin.initialize_app()
            _db = firestore.client()
            print("✓ Initialized Firebase Admin with default credentials")
            return
        except Exception as e:
            raise RuntimeError(
                f"Firebase credentials not found. Please set either:\n"
                f"  - FIREBASE_SERVICE_ACCOUNT_PATH (path to JSON file), or\n"
                f"  - FIREBASE_SERVICE_ACCOUNT_JSON (JSON string), or\n"
                f"  - Configure default credentials for your environment.\n"
                f"Error: {e}"
            )
    
    # Initialize with credentials
    if cred:
        try:
            firebase_admin.initialize_app(cred)
            _db = firestore.client()
            print("✓ Firebase Admin SDK initialized successfully")
            print(f"Debug: Firestore client project: {_db.project}")
        except Exception as e:
            raise RuntimeError(f"Failed to initialize Firebase Admin SDK: {e}")


def get_db() -> firestore.Client:
    """
    Get the Firestore client. Raises error if not initialized.
    """
    if _db is None:
        raise RuntimeError(
            "Firestore not initialized. Please call init_firestore() at application startup."
        )
    return _db


def save_spotify_tokens(
    firebase_user_id: str,
    spotify_user_id: str,
    access_token: str,
    refresh_token: Optional[str],
    expires_in: int,
    scope: str,
    email: Optional[str] = None
):
    """
    Save Spotify tokens to Firestore with 1-hour TTL.
    
    Args:
        firebase_user_id: Firebase Auth user ID
        spotify_user_id: Spotify user ID
        access_token: Spotify access token
        refresh_token: Spotify refresh token
        expires_in: Token expiration time in seconds from Spotify
        scope: Spotify scopes
        email: User email from Firebase
    """
    db = get_db()
    token_doc_ref = db.collection(SPOTIFY_TOKENS_COLLECTION).document(firebase_user_id)
    
    # Calculate expiration time (1 hour from now or Spotify's expires_in, whichever is shorter)
    expiration_time = min(expires_in, ONE_HOUR_IN_SECONDS)
    expires_at = datetime.utcnow() + timedelta(seconds=expiration_time)
    
    token_data = {
        "firebaseUserId": firebase_user_id,
        "spotifyUserId": spotify_user_id,
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "scope": scope,
        "email": email,
        "expiresAt": expires_at,
        "createdAt": firestore.SERVER_TIMESTAMP,
        "updatedAt": firestore.SERVER_TIMESTAMP,
    }
    
    token_doc_ref.set(token_data)
    return token_data


def get_spotify_tokens(firebase_user_id: str) -> Optional[dict]:
    """
    Get Spotify tokens from Firestore.
    
    Args:
        firebase_user_id: Firebase Auth user ID
        
    Returns:
        Token data dict or None if not found.
        NOTE: This function does NOT check expiration - expired tokens are returned
        so the caller can refresh them. Expiration handling should be done by the caller.
    """
    db = get_db()
    token_doc_ref = db.collection(SPOTIFY_TOKENS_COLLECTION).document(firebase_user_id)
    
    print(f"Debug Firestore path: {token_doc_ref.path}, collection: {SPOTIFY_TOKENS_COLLECTION}, doc_id: {firebase_user_id}")
    print(f"Debug Firestore project: {db.project}")
    
    token_doc = token_doc_ref.get()
    
    print(f"Debug Firestore doc exists: {token_doc.exists}")
    
    if not token_doc.exists:
        print(f"Debug: Document does not exist at path: {token_doc_ref.path}")
        return None
    
    token_data = token_doc.to_dict()
    
    print(f"Debug Firestore data keys: {list(token_data.keys()) if token_data else 'None'}")
    if token_data:
        print(f"Debug: accessToken present: {'accessToken' in token_data}")
        if token_data.get('accessToken'):
            print(f"Debug: accessToken value (first 20 chars): {token_data['accessToken'][:20]}")
        
        # Check expiration for logging only (don't filter it out)
        if "expiresAt" in token_data:
            expires_at = token_data["expiresAt"]
            # Handle Firestore Timestamp
            if hasattr(expires_at, 'timestamp'):
                expires_at_dt = datetime.fromtimestamp(expires_at.timestamp())
            elif isinstance(expires_at, datetime):
                expires_at_dt = expires_at
            else:
                expires_at_dt = expires_at
            
            if isinstance(expires_at_dt, datetime):
                is_expired = expires_at_dt <= datetime.utcnow()
                print(f"Debug: Token expiration check - expires_at: {expires_at_dt}, now: {datetime.utcnow()}, expired: {is_expired}")
    
    # Return the data regardless of expiration - let the caller handle refresh logic
    return token_data


def update_spotify_access_token(
    firebase_user_id: str,
    access_token: str,
    expires_in: int
):
    """
    Update Spotify access token (for refresh scenarios).
    
    Args:
        firebase_user_id: Firebase Auth user ID
        access_token: New access token
        expires_in: New expiration time in seconds
    """
    db = get_db()
    token_doc_ref = db.collection(SPOTIFY_TOKENS_COLLECTION).document(firebase_user_id)
    
    # Calculate expiration time (1 hour from now or Spotify's expires_in, whichever is shorter)
    expiration_time = min(expires_in, ONE_HOUR_IN_SECONDS)
    expires_at = datetime.utcnow() + timedelta(seconds=expiration_time)
    
    print(f"Debug: Updating token for user {firebase_user_id}, new expires_at: {expires_at}")
    
    token_doc_ref.update({
        "accessToken": access_token,
        "expiresAt": expires_at,
        "updatedAt": firestore.SERVER_TIMESTAMP,
    })


def delete_spotify_tokens(firebase_user_id: str):
    """
    Delete Spotify tokens (for logout).
    
    Args:
        firebase_user_id: Firebase Auth user ID
    """
    db = get_db()
    token_doc_ref = db.collection(SPOTIFY_TOKENS_COLLECTION).document(firebase_user_id)
    token_doc_ref.update({
        "accessToken": None,
        "refreshToken": None,
        "deletedAt": firestore.SERVER_TIMESTAMP,
    })


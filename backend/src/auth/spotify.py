"""
Spotify OAuth authentication routes
"""
import os
import base64
import secrets
from urllib.parse import urlencode
from datetime import datetime, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, Request, Response, HTTPException, Query
from starlette.responses import RedirectResponse
from dotenv import load_dotenv

from ..storage.memory_storage import storage  # Keep for state management
from ..storage.firestore_storage import (
    save_spotify_tokens as save_tokens_firestore,
    get_spotify_tokens as get_tokens_firestore,
    update_spotify_access_token as update_token_firestore,
)

# Load environment variables from .env file
# Look for .env in the backend directory (parent of src)
import pathlib
backend_dir = pathlib.Path(__file__).parent.parent.parent
load_dotenv(dotenv_path=backend_dir / ".env")

router = APIRouter()

# Spotify OAuth URLs
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_ME_URL = "https://api.spotify.com/v1/me"

# Environment variables
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI_RAW = os.getenv("SPOTIFY_REDIRECT_URI")
REDIRECT_URI = REDIRECT_URI_RAW.rstrip('/') if REDIRECT_URI_RAW else None
SCOPES = os.getenv("SPOTIFY_SCOPES", "user-read-email user-read-private user-read-recently-played user-top-read")
FRONTEND_URL = os.getenv("APP_FRONTEND_URL", "http://127.0.0.1:3000")


def _basic_auth_header(client_id: str, client_secret: str) -> str:
    """Generate Basic Auth header for Spotify token requests"""
    creds = f"{client_id}:{client_secret}".encode("utf-8")
    return "Basic " + base64.b64encode(creds).decode("utf-8")


@router.get("/auth/spotify/login")
def spotify_login(request: Request, response: Response, firebase_user_id: Optional[str] = None):
    """
    Initiates Spotify OAuth flow.
    Generates a state token for CSRF protection and redirects to Spotify.
    Requires firebase_user_id query parameter.
    """
    if not firebase_user_id:
        raise HTTPException(
            status_code=400,
            detail="firebase_user_id is required. Please sign in with Firebase first."
        )
    
    if not CLIENT_ID or not REDIRECT_URI:
        raise HTTPException(
            status_code=500,
            detail=f"Spotify OAuth not configured. CLIENT_ID: {bool(CLIENT_ID)}, REDIRECT_URI: {REDIRECT_URI}. Please check your .env file."
        )
    
    redirect_uri = REDIRECT_URI.rstrip('/') if REDIRECT_URI else None
    
    if not redirect_uri:
        raise HTTPException(
            status_code=500,
            detail="SPOTIFY_REDIRECT_URI is not set in .env file"
        )
    
    # Generate state for CSRF protection
    state = secrets.token_hex(16)
    
    # Store state in memory storage (temporary, for validation)
    storage.store_state(state)
    
    # Build Spotify authorization URL
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "scope": SCOPES,
        "redirect_uri": redirect_uri,  # Use cleaned redirect URI
        "state": state,
    }
    
    url = f"{SPOTIFY_AUTH_URL}?{urlencode(params)}"
    response = RedirectResponse(url=url)
    
    # Set cookies: state for CSRF protection and firebase_user_id for callback
    response.set_cookie(
        key="spotify_auth_state",
        value=state,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=600,
    )
    response.set_cookie(
        key="firebase_user_id",
        value=firebase_user_id,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=600,
    )
    
    return response


@router.get("/auth/spotify/callback")
async def spotify_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None
):
    """
    Handles the callback from Spotify OAuth.
    Exchanges authorization code for access token and stores user data.
    """
    # Check for OAuth errors
    if error:
        raise HTTPException(status_code=400, detail=f"Spotify OAuth error: {error}")
    # Get state from cookie
    cookie_state = request.cookies.get("spotify_auth_state")
    # Validate state
    if not state or not cookie_state or state != cookie_state:
        raise HTTPException(status_code=400, detail="State mismatch - possible CSRF attack")
    if not storage.validate_state(state):
        raise HTTPException(status_code=400, detail="Invalid or expired state")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
    if not CLIENT_ID or not CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Spotify OAuth not configured."
        )
    redirect_uri = REDIRECT_URI.rstrip('/')
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            SPOTIFY_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": _basic_auth_header(CLIENT_ID, CLIENT_SECRET),
            },
        )
    if token_res.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail="Failed to get tokens from Spotify"
        )
    token_json = token_res.json()
    access_token = token_json["access_token"]
    refresh_token = token_json.get("refresh_token")
    expires_in = token_json["expires_in"]
    scope = token_json.get("scope", "")
    # Fetch Spotify user profile
    async with httpx.AsyncClient() as client:
        me_res = await client.get(
            SPOTIFY_ME_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if me_res.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail="Failed to fetch Spotify profile"
        )
    me = me_res.json()  # contains id, email, display_name, etc.
    
    spotify_user_id = me["id"]
    spotify_email = me.get("email")
    
    # Get Firebase user ID from cookie
    firebase_user_id = request.cookies.get("firebase_user_id")
    if not firebase_user_id:
        raise HTTPException(
            status_code=400,
            detail="Firebase user ID not found. Please sign in with Firebase first."
        )
    
    # Get Firebase user email (we'll use the email from Firebase Auth, but fallback to Spotify email)
    # For now, we'll use the Firebase user ID to link the tokens
    firebase_email = spotify_email  # In production, get from Firebase Auth token
    
    # Store tokens in Firestore
    save_tokens_firestore(
        firebase_user_id=firebase_user_id,
        spotify_user_id=spotify_user_id,
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        scope=scope,
        email=firebase_email
    )
    
    # Redirect to frontend
    redirect_url = f"{FRONTEND_URL}/dashboard"
    response = RedirectResponse(url=redirect_url)
    # Clear the state and firebase_user_id cookies
    response.delete_cookie("spotify_auth_state")
    response.delete_cookie("firebase_user_id")
    
    return response


@router.post("/auth/spotify/refresh")
async def spotify_refresh(spotify_user_id: str):
    """
    Refreshes an expired Spotify access token using the refresh token.
    This should typically be called internally by your backend, not directly by the frontend.
    """
    if not CLIENT_ID or not CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Spotify OAuth not configured. Please check your .env file."
        )
    
    # Get account from storage
    account = storage.get_spotify_account(spotify_user_id)
    
    if not account:
        raise HTTPException(status_code=404, detail="Spotify account not found")
    
    if not account.refresh_token:
        raise HTTPException(
            status_code=400,
            detail="No refresh token stored for this account"
        )
    
    # Refresh the token
    async with httpx.AsyncClient() as client:
        res = await client.post(
            SPOTIFY_TOKEN_URL,
            data={
                "grant_type": "refresh_token",
                "refresh_token": account.refresh_token,
            },
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": _basic_auth_header(CLIENT_ID, CLIENT_SECRET),
            },
        )
    
    if res.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail="Failed to refresh token"
        )
    
    data = res.json()
    new_access_token = data["access_token"]
    new_expires_in = data["expires_in"]
    new_refresh_token = data.get("refresh_token")  # Sometimes Spotify returns a new one
    
    # Update storage
    storage.save_spotify_tokens(
        spotify_user_id=spotify_user_id,
        access_token=new_access_token,
        refresh_token=new_refresh_token or account.refresh_token,
        scope=account.scope,
        expires_in=new_expires_in,
        user_id=account.user_id
    )
    
    return {
        "status": "ok",
        "access_token": new_access_token,
        "expires_in": new_expires_in
    }


@router.get("/api/me/recently-played")
async def get_recently_played(firebase_user_id: str = Query(..., description="Firebase user ID")):
    """
    Get user's recently played tracks from Spotify.
    Requires firebase_user_id to retrieve tokens from Firestore.
    """
    SPOTIFY_RECENTLY_PLAYED_URL = "https://api.spotify.com/v1/me/player/recently-played"
    
    if not CLIENT_ID or not CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Spotify OAuth not configured."
        )
    
    # Get tokens from Firestore
    try:
        token_data = get_tokens_firestore(firebase_user_id)
        print(f"Debug: Retrieved token data for user {firebase_user_id}: {bool(token_data)}")
        if token_data:
            print(f"Debug: Token data keys: {list(token_data.keys())}")
            print(f"Debug: Has accessToken: {bool(token_data.get('accessToken'))}")
    except Exception as e:
        print(f"Error getting tokens from Firestore: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving tokens: {str(e)}"
        )
    
    if not token_data or not token_data.get("accessToken"):
        print(f"Debug: No token data found for user {firebase_user_id}")
        raise HTTPException(
            status_code=401,
            detail="Spotify not connected. Please connect your Spotify account."
        )
    
    access_token = token_data["accessToken"]
    refresh_token = token_data.get("refreshToken")
    expires_at = token_data.get("expiresAt")
    
    # Check if token is expired and refresh if needed
    if expires_at:
        # Handle Firestore Timestamp
        if hasattr(expires_at, 'timestamp'):
            # Firestore Timestamp object
            expires_at_dt = datetime.fromtimestamp(expires_at.timestamp())
        elif isinstance(expires_at, datetime):
            expires_at_dt = expires_at
        else:
            # Try to convert if it's a different format
            expires_at_dt = expires_at
        
        if isinstance(expires_at_dt, datetime) and expires_at_dt <= datetime.utcnow():
            # Token expired, refresh it
            if not refresh_token:
                raise HTTPException(
                    status_code=400,
                    detail="Token expired and no refresh token available"
                )
            
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    SPOTIFY_TOKEN_URL,
                    data={
                        "grant_type": "refresh_token",
                        "refresh_token": refresh_token,
                    },
                    headers={
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": _basic_auth_header(CLIENT_ID, CLIENT_SECRET),
                    },
                )
            
            if res.status_code == 200:
                data = res.json()
                new_access_token = data["access_token"]
                new_expires_in = data["expires_in"]
                new_refresh_token = data.get("refresh_token", refresh_token)
                
                # Update token in Firestore
                update_token_firestore(firebase_user_id, new_access_token, new_expires_in)
                access_token = new_access_token
            else:
                raise HTTPException(status_code=400, detail="Failed to refresh token")
    
    # Fetch recently played tracks
    async with httpx.AsyncClient() as client:
        res = await client.get(
            SPOTIFY_RECENTLY_PLAYED_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            params={"limit": 20},
        )
    
    if res.status_code != 200:
        raise HTTPException(
            status_code=res.status_code,
            detail=f"Spotify API error: {res.text}"
        )
    
    return res.json()


@router.get("/auth/spotify/debug")
def spotify_debug():
    """
    Debug endpoint to check Spotify OAuth configuration.
    Use this to verify your redirect URI matches what's in your Spotify app settings.
    Visit: http://127.0.0.1:8000/auth/spotify/debug
    """
    redirect_uri_cleaned = REDIRECT_URI.rstrip('/') if REDIRECT_URI else None
    
    # Show what will be sent to Spotify
    if redirect_uri_cleaned and CLIENT_ID:
        test_params = {
            "response_type": "code",
            "client_id": CLIENT_ID,
            "scope": SCOPES,
            "redirect_uri": redirect_uri_cleaned,
            "state": "test_state",
        }
        test_url = f"{SPOTIFY_AUTH_URL}?{urlencode(test_params)}"
    else:
        test_url = None
    
    return {
        "client_id_configured": bool(CLIENT_ID),
        "client_id_preview": CLIENT_ID[:10] + "..." if CLIENT_ID else None,
        "client_secret_configured": bool(CLIENT_SECRET),
        "redirect_uri_raw": REDIRECT_URI_RAW,
        "redirect_uri_cleaned": redirect_uri_cleaned,
        "redirect_uri_length": len(redirect_uri_cleaned) if redirect_uri_cleaned else 0,
        "scopes": SCOPES,
        "frontend_url": FRONTEND_URL,
        "test_authorization_url": test_url,
        "instructions": {
            "step1": "Copy the 'redirect_uri_cleaned' value above",
            "step2": "Go to https://developer.spotify.com/dashboard",
            "step3": "Select your app and click Settings",
            "step4": "Under 'Redirect URIs', make sure you have EXACTLY this (copy-paste it):",
            "step5": redirect_uri_cleaned or "ERROR: redirect_uri not configured",
            "step6": "Click 'Add' if it's not there, then 'Save'",
            "step7": "Make sure there are NO other redirect URIs that might conflict",
            "step8": "The redirect URI must match EXACTLY (case-sensitive, no trailing slash, exact port)"
        },
        "common_issues": [
            "Redirect URI has trailing slash in Spotify Dashboard",
            "Redirect URI uses 'localhost' instead of '127.0.0.1'",
            "Port number doesn't match (must be 8000)",
            "Extra spaces or quotes around the redirect URI",
            "Multiple redirect URIs in dashboard causing confusion"
        ]
    }


@router.get("/auth/spotify/logout")
def spotify_logout(response: Response):
    """
    Logout endpoint - clears any session data
    """
    # In a real app, you'd clear session data, invalidate tokens, etc.
    # For now, just return success
    response.delete_cookie("spotify_auth_state")
    return {"status": "logged_out", "message": "Successfully logged out"}

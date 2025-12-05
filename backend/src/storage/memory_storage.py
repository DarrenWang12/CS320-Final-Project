"""
In-memory storage for Spotify tokens and user data, temporary solution until we implement a proper database.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict
from dataclasses import dataclass, field


@dataclass
class SpotifyAccount:
    """Represents a Spotify account linked to a user"""
    spotify_user_id: str
    access_token: str
    refresh_token: Optional[str]
    scope: str
    expires_at: datetime
    user_id: Optional[int] = None  # Will be used when we add user management
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class User:
    """Represents a user in the system"""
    id: int
    email: Optional[str]
    spotify_user_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)


class MemoryStorage:
    """Simple in-memory storage for development"""
    
    def __init__(self):
        self.spotify_accounts: Dict[str, SpotifyAccount] = {} # key: spotify_user_id
        self.users: Dict[int, User] = {} # key: user_id
        self.user_id_counter = 1
        self.state_store: Dict[str, str] = {} # key: state, value: timestamp (for cleanup)
    
    def get_or_create_user(self, email: Optional[str], spotify_user_id: str) -> User:
        """Get existing user or create a new one"""
        # Check if user exists by spotify_user_id
        for user in self.users.values():
            if user.spotify_user_id == spotify_user_id:
                return user
        
        # Create new user
        user_id = self.user_id_counter
        self.user_id_counter += 1
        user = User(id=user_id, email=email, spotify_user_id=spotify_user_id)
        self.users[user_id] = user
        return user
    
    def save_spotify_tokens(
        self,
        spotify_user_id: str,
        access_token: str,
        refresh_token: Optional[str],
        scope: str,
        expires_in: int,
        user_id: Optional[int] = None
    ) -> SpotifyAccount:
        """Save or update Spotify tokens"""
        expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        
        if spotify_user_id in self.spotify_accounts:
            # Update existing account
            account = self.spotify_accounts[spotify_user_id]
            account.access_token = access_token
            if refresh_token:
                account.refresh_token = refresh_token
            account.scope = scope
            account.expires_at = expires_at
            account.updated_at = datetime.utcnow()
            if user_id:
                account.user_id = user_id
        else:
            # Create new account
            account = SpotifyAccount(
                spotify_user_id=spotify_user_id,
                access_token=access_token,
                refresh_token=refresh_token,
                scope=scope,
                expires_at=expires_at,
                user_id=user_id
            )
            self.spotify_accounts[spotify_user_id] = account
        
        return account
    
    def get_spotify_account(self, spotify_user_id: str) -> Optional[SpotifyAccount]:
        """Get Spotify account by spotify_user_id"""
        return self.spotify_accounts.get(spotify_user_id)
    
    def get_spotify_account_by_user_id(self, user_id: int) -> Optional[SpotifyAccount]:
        """Get Spotify account by user_id"""
        for account in self.spotify_accounts.values():
            if account.user_id == user_id:
                return account
        return None
    
    def store_state(self, state: str):
        """Store a state value for CSRF protection"""
        self.state_store[state] = datetime.utcnow().isoformat()
    
    def validate_state(self, state: str) -> bool:
        """Validate and remove a state value"""
        if state in self.state_store:
            del self.state_store[state]
            return True
        return False


# Global instance for the storage
storage = MemoryStorage()

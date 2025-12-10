import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

const SPOTIFY_TOKENS_COLLECTION = 'spotifyTokens';
const ONE_HOUR_IN_SECONDS = 3600;

/**
 * Store Spotify tokens in Firestore with 1-hour TTL
 * @param {string} firebaseUserId - Firebase Auth user ID
 * @param {string} spotifyUserId - Spotify user ID
 * @param {string} accessToken - Spotify access token
 * @param {string} refreshToken - Spotify refresh token
 * @param {number} expiresIn - Token expiration time in seconds
 * @param {string} scope - Spotify scopes
 * @param {string} email - User email from Firebase
 */
export async function saveSpotifyTokens(
  firebaseUserId,
  spotifyUserId,
  accessToken,
  refreshToken,
  expiresIn,
  scope,
  email
) {
  const tokenDocRef = doc(db, SPOTIFY_TOKENS_COLLECTION, firebaseUserId);
  
  // Calculate expiration time (1 hour from now or Spotify's expires_in, whichever is shorter)
  const expirationTime = Math.min(expiresIn, ONE_HOUR_IN_SECONDS);
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + expirationTime * 1000)
  );
  
  await setDoc(tokenDocRef, {
    firebaseUserId,
    spotifyUserId,
    accessToken,
    refreshToken,
    scope,
    email,
    expiresAt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return tokenDocRef;
}

/**
 * Get Spotify tokens from Firestore
 * @param {string} firebaseUserId - Firebase Auth user ID
 * @returns {Promise<Object|null>} Token data or null if not found/expired
 */
export async function getSpotifyTokens(firebaseUserId) {
  const tokenDocRef = doc(db, SPOTIFY_TOKENS_COLLECTION, firebaseUserId);
  const tokenDoc = await getDoc(tokenDocRef);
  
  if (!tokenDoc.exists()) {
    return null;
  }
  
  const tokenData = tokenDoc.data();
  const now = Timestamp.now();
  
  // Check if token is expired
  if (tokenData.expiresAt && tokenData.expiresAt.toMillis() < now.toMillis()) {
    return null; // Token expired
  }
  
  return tokenData;
}

/**
 * Update Spotify access token (for refresh scenarios)
 * @param {string} firebaseUserId - Firebase Auth user ID
 * @param {string} accessToken - New access token
 * @param {number} expiresIn - New expiration time in seconds
 */
export async function updateSpotifyAccessToken(
  firebaseUserId,
  accessToken,
  expiresIn
) {
  const tokenDocRef = doc(db, SPOTIFY_TOKENS_COLLECTION, firebaseUserId);
  
  const expirationTime = Math.min(expiresIn, ONE_HOUR_IN_SECONDS);
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + expirationTime * 1000)
  );
  
  await updateDoc(tokenDocRef, {
    accessToken,
    expiresAt,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete Spotify tokens (for logout)
 * @param {string} firebaseUserId - Firebase Auth user ID
 */
export async function deleteSpotifyTokens(firebaseUserId) {
  const tokenDocRef = doc(db, SPOTIFY_TOKENS_COLLECTION, firebaseUserId);
  // Firestore doesn't have a delete method in the client SDK for security
  // We'll mark it as deleted or let it expire naturally
  // For now, we'll update it to mark as deleted
  await updateDoc(tokenDocRef, {
    accessToken: null,
    refreshToken: null,
    deletedAt: serverTimestamp(),
  });
}


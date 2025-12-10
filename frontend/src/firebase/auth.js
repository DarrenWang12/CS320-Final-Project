import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    return { success: true, user, token };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}




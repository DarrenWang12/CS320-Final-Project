import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChange, getCurrentUser } from "../src/firebase/auth";
import FirebaseAuth from "../components/FirebaseAuth";

export default function Home() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const router = useRouter();

  useEffect(() => {
    // Check Firebase auth state
    const unsubscribe = onAuthStateChange((user) => {
      setFirebaseUser(user);
      setLoading(false);
      
      // If user is authenticated and has Spotify tokens, redirect to dashboard
      if (user) {
        checkSpotifyAuth(user);
      }
    });

    // Check backend connection
    fetch("http://127.0.0.1:8000/api/test")
      .then((response) => response.json())
      .then((data) => {
        setBackendStatus("Connected!");
      })
      .catch((error) => {
        console.error("Error connecting to backend:", error);
        setBackendStatus("Failed to connect");
      });

    return () => unsubscribe();
  }, []);

  const checkSpotifyAuth = async (user) => {
    try {
      const { getSpotifyTokens } = await import("../src/firebase/firestore");
      const tokens = await getSpotifyTokens(user.uid);
      if (tokens && tokens.accessToken) {
        // User has both Firebase and Spotify auth, redirect to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error checking Spotify auth:", error);
    }
  };

  const handleFirebaseAuthSuccess = (user) => {
    setFirebaseUser(user);
    // Don't redirect yet - wait for Spotify auth
  };

  const handleSpotifyLogin = () => {
    if (!firebaseUser) {
      alert("Please sign in with Firebase first");
      return;
    }
    // Pass Firebase user ID as state parameter for callback
    const firebaseUserId = firebaseUser.uid;
    window.location.href = `http://127.0.0.1:8000/auth/spotify/login?firebase_user_id=${firebaseUserId}`;
  };

  if (loading) {
    return (
      <div style={{ 
        fontFamily: "system-ui", 
        padding: 20, 
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a1a",
        color: "#fff"
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: "system-ui", 
      minHeight: "100vh",
      backgroundColor: "#1a1a1a",
      color: "#fff",
      padding: "20px"
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ 
            fontSize: "48px", 
            margin: "20px 0",
            background: "linear-gradient(135deg, #4CAF50, #81C784)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            MoodTune
          </h1>
          <p style={{ color: "#888", fontSize: "18px" }}>
            Your emotional soundtrack
          </p>
        </div>

        {!firebaseUser ? (
          <FirebaseAuth onAuthSuccess={handleFirebaseAuthSuccess} />
        ) : (
          <div style={{
            maxWidth: "400px",
            margin: "50px auto",
            padding: "30px",
            backgroundColor: "#2a2a2a",
            borderRadius: "15px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            textAlign: "center"
          }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#4CAF50",
                margin: "0 auto 15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                ✓
              </div>
              <h2 style={{ color: "#4CAF50", marginBottom: "10px" }}>
                Welcome, {firebaseUser.displayName || firebaseUser.email}!
              </h2>
              <p style={{ color: "#888", fontSize: "14px" }}>
                Now connect your Spotify account to get started
              </p>
            </div>

            <button
              onClick={handleSpotifyLogin}
              style={{
                width: "100%",
                backgroundColor: "#1DB954",
                color: "white",
                border: "none",
                padding: "14px 24px",
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "25px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginTop: "20px"
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#1ed760";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#1DB954";
                e.target.style.transform = "scale(1)";
              }}
            >
              Connect Spotify
            </button>
          </div>
        )}

        <div style={{ 
          marginTop: "30px", 
          padding: "15px", 
          backgroundColor: "#2a2a2a", 
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <p style={{ color: "#888", fontSize: "12px", margin: 0 }}>
            Backend Status: <span style={{ color: backendStatus === "Connected!" ? "#4CAF50" : "#F44336" }}>{backendStatus}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
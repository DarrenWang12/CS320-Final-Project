import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { getCurrentUser, onAuthStateChange } from "../src/firebase/auth";
import { getSpotifyTokens } from "../src/firebase/firestore";

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState("Happy");
  const [intensity, setIntensity] = useState(50);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [recentlyPlayedLoading, setRecentlyPlayedLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check Firebase auth state
    const unsubscribe = onAuthStateChange(async (user) => {
      if (!user) {
        // Not authenticated, redirect to home
        router.push("/");
        return;
      }
      
      setFirebaseUser(user);
      
      // Check if user has Spotify tokens
      try {
        const { getSpotifyTokens } = await import("../src/firebase/firestore");
        const tokens = await getSpotifyTokens(user.uid);
        if (!tokens || !tokens.accessToken) {
          // No Spotify tokens, redirect to home to connect Spotify
          router.push("/");
          return;
        }
        
        // Fetch recently played tracks
        fetchRecentlyPlayed(user.uid);
      } catch (error) {
        console.error("Error checking Spotify auth:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchRecentlyPlayed = async (firebaseUserId) => {
    setRecentlyPlayedLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/me/recently-played?firebase_user_id=${firebaseUserId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRecentlyPlayed(data.items || []);
      } else {
        console.error("Failed to fetch recently played:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching recently played tracks:", error);
    } finally {
      setRecentlyPlayedLoading(false);
      setLoading(false);
    }
  };

  // Mock recommended songs
  const recommendedSongs = [
    { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", albumCover: "🎵" },
    { title: "Levitating", artist: "Dua Lipa", duration: "3:23", albumCover: "🎵" },
    { title: "Good 4 U", artist: "Olivia Rodrigo", duration: "2:58", albumCover: "🎵" },
    { title: "Stay", artist: "The Kid LAROI & Justin Bieber", duration: "2:21", albumCover: "🎵" },
    { title: "Industry Baby", artist: "Lil Nas X & Jack Harlow", duration: "3:32", albumCover: "🎵" }
  ];

  const moods = [
    { name: "Happy", color: "#4CAF50" },
    { name: "Sad", color: "#2196F3" },
    { name: "Energized", color: "#FFC107" },
    { name: "Angry", color: "#F44336" },
    { name: "Calm", color: "#9C27B0" }
  ];

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Main Content */}
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        <h2 style={{ 
          fontSize: "56px", 
          margin: "30px 0", 
          background: "linear-gradient(135deg, #4CAF50, #81C784, #A5D6A7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: "bold"
        }}>
          How are you feeling?
        </h2>
        <p style={{ color: "#888", fontSize: "18px" }}>
          Select your current mood to get personalized recommendations
        </p>
      </div>

      {/* Mood Selection */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 15, 
        marginBottom: 50,
        maxWidth: "1000px",
        margin: "0 auto 50px auto",
        padding: "0 20px"
      }}>
        {moods.map((mood) => (
          <button
            key={mood.name}
            onClick={() => setSelectedMood(mood.name)}
            style={{
              background: selectedMood === mood.name 
                ? `linear-gradient(135deg, ${mood.color}20, ${mood.color}10)` 
                : "linear-gradient(135deg, #333, #2a2a2a)",
              color: "white",
              border: selectedMood === mood.name 
                ? `2px solid ${mood.color}` 
                : "2px solid #555",
              padding: "25px 20px",
              borderRadius: "16px",
              cursor: "pointer",
              fontSize: "16px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              fontWeight: selectedMood === mood.name ? "600" : "500",
              boxShadow: selectedMood === mood.name 
                ? `0 0 15px ${mood.color}25` 
                : "0 2px 10px rgba(0,0,0,0.15)",
              transform: selectedMood === mood.name ? "translateY(-1px)" : "none",
              letterSpacing: "0.5px"
            }}
          >
            <span style={{ 
              fontSize: "17px", 
              color: selectedMood === mood.name ? mood.color : "#fff" 
            }}>
              {mood.name}
            </span>
          </button>
        ))}
      </div>

      {/* Mood Intensity Slider */}
      <div style={{ 
        maxWidth: "600px", 
        margin: "0 auto 40px auto",
        backgroundColor: "#2a2a2a",
        padding: "20px",
        borderRadius: "15px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ color: "#4CAF50", fontWeight: "bold" }}>Mood Intensity</span>
          <span style={{ color: "#4CAF50", fontWeight: "bold" }}>{intensity}%</span>
        </div>
        
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#555",
              borderRadius: "5px",
              outline: "none",
              appearance: "none",
            }}
          />
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888" }}>
          <span>Subtle</span>
          <span>Intense</span>
        </div>

        <button 
          onClick={async () => {
            // Fetch recommendations directly without modal
            try {
              const response = await fetch(`http://localhost:8000/api/recommendations?mood=${selectedMood}`);
              const data = await response.json();
              // Handle recommendations here - could update state or show inline
              console.log('Recommendations:', data.recommendations);
              alert(`Getting ${selectedMood} recommendations!`);
            } catch (error) {
              console.error('Error fetching recommendations:', error);
              alert(`Getting ${selectedMood} recommendations!`);
            }
          }}
          style={{
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            padding: "15px 30px",
            borderRadius: "25px",
            cursor: "pointer",
            width: "100%",
            marginTop: 20,
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#F57C00";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 8px 25px rgba(255, 152, 0, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#FF9800";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}>
          <span style={{ fontSize: "20px" }}></span>
          Get {selectedMood} Recommendations
        </button>
      </div>

      {/* Recently Played Tracks */}
      <div style={{ maxWidth: "800px", margin: "0 auto 50px auto" }}>
        <h3 style={{ color: "#4CAF50", marginBottom: 20, fontSize: "24px" }}>
          Recently Played
        </h3>
        
        <div style={{ backgroundColor: "#2a2a2a", borderRadius: "15px", padding: "20px" }}>
          {recentlyPlayedLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              Loading recently played tracks...
            </div>
          ) : recentlyPlayed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              No recently played tracks found. Start listening to music on Spotify!
            </div>
          ) : (
            recentlyPlayed.map((item, index) => {
              const track = item.track;
              const artists = track.artists.map(a => a.name).join(", ");
              const durationMs = track.duration_ms;
              const minutes = Math.floor(durationMs / 60000);
              const seconds = Math.floor((durationMs % 60000) / 1000);
              const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;
              const albumImage = track.album.images[0]?.url || null;
              
              return (
                <div
                  key={item.played_at || index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "15px 0",
                    borderBottom: index < recentlyPlayed.length - 1 ? "1px solid #444" : "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#333"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <div style={{
                    width: 50,
                    height: 50,
                    backgroundColor: "#4CAF50",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    marginRight: 15,
                    overflow: "hidden",
                    backgroundImage: albumImage ? `url(${albumImage})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}>
                    {!albumImage && "🎵"}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "bold", marginBottom: 5, color: "#fff" }}>
                      {track.name}
                    </div>
                    <div style={{ color: "#888", fontSize: "14px" }}>
                      {artists}
                    </div>
                  </div>
                  
                  <div style={{ color: "#888", fontSize: "14px" }}>
                    {duration}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recommended Songs */}
      <div style={{ maxWidth: "800px", margin: "0 auto 50px auto" }}>
        <h3 style={{ color: "#4CAF50", marginBottom: 20, fontSize: "24px" }}>
          Recommended For You
        </h3>
        
        <div style={{ backgroundColor: "#2a2a2a", borderRadius: "15px", padding: "20px" }}>
          {recommendedSongs.map((song, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "15px 0",
                borderBottom: index < recommendedSongs.length - 1 ? "1px solid #444" : "none",
                cursor: "pointer"
              }}
            >
              <div style={{
                width: 50,
                height: 50,
                backgroundColor: "#4CAF50",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                marginRight: 15
              }}>
                {song.albumCover}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold", marginBottom: 5 }}>{song.title}</div>
                <div style={{ color: "#888", fontSize: "14px" }}>{song.artist}</div>
              </div>
              
              <div style={{ color: "#888", fontSize: "14px" }}>
                {song.duration}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}




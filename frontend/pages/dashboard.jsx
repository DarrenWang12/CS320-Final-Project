import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";
import { getCurrentUser, onAuthStateChange } from "../src/firebase/auth";
import { getSpotifyTokens } from "../src/firebase/firestore";

const SpotifyEmbedPlayer = dynamic(() => import("../components/SpotifyEmbedPlayer"), { ssr: false });

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState("Happy");
  const [intensity, setIntensity] = useState(50);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [recentlyPlayedLoading, setRecentlyPlayedLoading] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [selectedTrackUri, setSelectedTrackUri] = useState(null);
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
    { name: "Happy", color: "#4CAF50", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
	      <g fill="none" fill-rule="evenodd">
		      <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
		      <path fill="currentColor" d="M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12m6.5-2c-.195 0-.444.124-.606.448a1 1 0 0 1-1.788-.896C6.542 8.68 7.413 8 8.5 8s1.957.68 2.394 1.552a1 1 0 0 1-1.788.896C8.944 10.124 8.696 10 8.5 10m7 0c-.195 0-.444.124-.606.448a1 1 0 1 1-1.788-.896C13.543 8.68 14.413 8 15.5 8s1.957.68 2.394 1.552a1 1 0 0 1-1.788.896c-.162-.324-.41-.448-.606-.448m-6.896 4.338a1 1 0 0 1 1.412-.088c.53.468 1.223.75 1.984.75s1.455-.282 1.984-.75a1 1 0 1 1 1.324 1.5A4.98 4.98 0 0 1 12 17a4.98 4.98 0 0 1-3.308-1.25a1 1 0 0 1-.088-1.412" />
	      </g>
      </svg> )
    },
    { name: "Sad", color: "#2196F3", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
	      <g fill="none" fill-rule="evenodd">
		      <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
		      <path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 9c1.267 0 2.427.473 3.308 1.25a1 1 0 1 1-1.324 1.5A3 3 0 0 0 12 15c-.761 0-1.455.282-1.984.75a1 1 0 1 1-1.323-1.5A5 5 0 0 1 12 13M8.5 8a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m7 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3" />
	      </g>
      </svg> )
    },
    { name: "Energized", color: "#FFC107", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
	      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6.194 11.397l5.998-8.085c.47-.632 1.348-.239 1.348.603v6.258c0 .505.345.913.77.913h2.918c.663 0 1.016.927.578 1.518l-5.998 8.084c-.47.632-1.348.239-1.348-.603v-6.258c0-.505-.345-.913-.77-.913H6.771c-.663 0-1.016-.927-.578-1.517" />
      </svg> )
    },
    { name: "Angry", color: "#F44336", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
        <g fill="none">
          <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
          <path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16m0 9c1.268 0 2.427.473 3.308 1.25a1 1 0 1 1-1.324 1.5A3 3 0 0 0 12 15c-.761 0-1.455.282-1.984.75a1 1 0 1 1-1.323-1.5A5 5 0 0 1 12 13M8.34 8.06l.107.046l2 1a1 1 0 0 1-.787 1.835l-.107-.047l-2-1a1 1 0 0 1 .677-1.867l.11.032Zm7.213.046a1 1 0 0 1 .996 1.73l-.102.058l-2 1a1 1 0 0 1-.996-1.73l.102-.058z" />
        </g>
      </svg> )
    },
    { name: "Calm", color: "#9C27B0", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
	      <path fill="currentColor" d="M12 17.5q.85 0 1.6-.312T15 16.3q.225-.2.225-.525T15 15.25t-.537-.2t-.563.2q-.425.325-.9.525t-1 .2t-1-.2t-.9-.525q-.25-.2-.562-.2t-.538.2t-.225.525T9 16.3q.65.55 1.4.875t1.6.325m0 4.5q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m-3.5-8q.8 0 1.438-.5t.987-1.225q.125-.325.013-.638T10.5 9.25q-.275-.075-.55.063t-.4.412q-.175.325-.437.55T8.5 10.5t-.625-.237T7.45 9.7q-.125-.275-.4-.4t-.55-.05q-.325.075-.437.388t.037.637q.3.75.95 1.238T8.5 12m7 0q.8 0 1.438-.5t.987-1.225q.125-.325.013-.637T17.5 9.25q-.275-.075-.55.063t-.4.412q-.175.325-.437.55t-.613.225t-.625-.237t-.425-.563q-.125-.275-.4-.4t-.55-.05q-.325.075-.438.388t.038.637q.3.75.95 1.238T15.5 12" />
      </svg> )
    }
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
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
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
              fontSize: "28px",
              color: selectedMood === mood.name ? mood.color : "#fff"
            }}>
              {mood.icon}
            </span>
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
                  onClick={() => setSelectedTrackUri(track.uri)}
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

      {/* Spotify Player */}
      {selectedTrackUri && (
        <div style={{ maxWidth: "800px", margin: "0 auto 50px auto" }}>
          <h3 style={{ color: "#4CAF50", marginBottom: 20, fontSize: "24px" }}>
            Now Playing
          </h3>
          <SpotifyEmbedPlayer initialUri={selectedTrackUri} />
        </div>
      )}

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




import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState("Happy");
  const [intensity, setIntensity] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(240); // 4 minutes in seconds
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettings && !event.target.closest('[data-settings-dropdown]')) {
        setShowSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % recommendedSongs.length);
    setCurrentTime(0);
  };

  const prevSong = () => {
    setCurrentSongIndex((prev) => (prev - 1 + recommendedSongs.length) % recommendedSongs.length);
    setCurrentTime(0);
  };

  const handleLogout = async () => {
    try {
      // Call the logout endpoint
      const response = await fetch('http://localhost:8000/auth/spotify/logout', {
        method: 'GET',
        credentials: 'include',
      });
      
      // Always redirect to home page after logout attempt
      window.location.href = 'http://localhost:3000/';
    } catch (error) {
      console.error('Error logging out:', error);
      // Fallback: redirect to home page anyway
      window.location.href = 'http://localhost:3000/';
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  if (loading) {
    return (
      <div style={{ fontFamily: "system-ui", padding: 20, textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: "system-ui", 
      padding: 20, 
      backgroundColor: "#1a1a1a", 
      color: "#ffffff", 
      minHeight: "100vh" 
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ 
            backgroundColor: "#4CAF50", 
            borderRadius: "50%", 
            width: 40, 
            height: 40, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "20px" 
          }}>
            🎵
          </div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>Mood Music</h1>
        </div>
        
        <div style={{ display: "flex", gap: 20 }}>
          <span style={{ cursor: "pointer", opacity: 0.8 }}>Discover</span>
          <span style={{ cursor: "pointer", opacity: 0.8 }}>My Moods</span>
          <span style={{ cursor: "pointer", opacity: 0.8 }}>Analytics</span>
        </div>
        
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 15 }}>
          <div style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "20px",
            fontSize: "14px"
          }}>
            Connected ✓
          </div>
          
          <div style={{ position: "relative" }} data-settings-dropdown>
            <button
              onClick={toggleSettings}
              style={{
                backgroundColor: showSettings ? "#333" : "transparent",
                border: "2px solid #555",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "18px",
                color: "white",
                transition: "all 0.3s ease"
              }}
            >
              ⚙️
            </button>
            
            {showSettings && (
              <div style={{
                position: "absolute",
                top: "50px",
                right: "0",
                backgroundColor: "#2a2a2a",
                border: "1px solid #555",
                borderRadius: "10px",
                minWidth: "200px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                zIndex: 1000
              }}>
                <div style={{
                  padding: "15px 20px",
                  borderBottom: "1px solid #555",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#4CAF50"
                }}>
                  Settings
                </div>
                
                <div style={{ padding: "10px 0" }}>
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      // Add profile settings functionality here
                    }}
                    style={{
                      width: "100%",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "white",
                      padding: "12px 20px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#333"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  >
                    👤 Profile Settings
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      // Add preferences functionality here
                    }}
                    style={{
                      width: "100%",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "white",
                      padding: "12px 20px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#333"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  >
                    🎵 Music Preferences
                  </button>
                  
                  <div style={{ height: "1px", backgroundColor: "#555", margin: "10px 0" }} />
                  
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#F44336",
                      padding: "12px 20px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#F4433620"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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

        <button style={{
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          padding: "15px 30px",
          borderRadius: "25px",
          cursor: "pointer",
          width: "100%",
          marginTop: 20,
          fontSize: "16px",
          fontWeight: "bold"
        }}>
          Get Song Recommendations
        </button>
      </div>

      {/* Recommended Songs */}
      <div style={{ maxWidth: "800px", margin: "0 auto 100px auto" }}>
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
              onClick={() => setCurrentSongIndex(index)}
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

      {/* Music Player */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#333",
        padding: "15px 20px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        borderTop: "1px solid #555"
      }}>
        {/* Current Song Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 15, minWidth: "250px" }}>
          <div style={{
            width: 50,
            height: 50,
            backgroundColor: "#F44336",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px"
          }}>
            🎵
          </div>
          
          <div>
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>
              {recommendedSongs[currentSongIndex]?.title || "Name of Song"}
            </div>
            <div style={{ color: "#888", fontSize: "12px" }}>
              {recommendedSongs[currentSongIndex]?.artist || "By Name of Artist"}
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          gap: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <button
              onClick={prevSong}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "20px"
              }}
            >
              ⏮
            </button>
            
            <button
              onClick={togglePlay}
              style={{
                background: "none",
                border: "none",
                color: "#4CAF50",
                cursor: "pointer",
                fontSize: "24px",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            
            
            <button
              onClick={nextSong}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "20px"
              }}
            >
              ⏭
            </button>
          </div>
          
          {/* Progress Bar */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 10, 
            width: "100%", 
            maxWidth: "400px" 
          }}>
            <span style={{ fontSize: "12px", color: "#888", minWidth: "40px" }}>
              {formatTime(currentTime)}
            </span>
            
            <div style={{ 
              flex: 1, 
              height: "4px", 
              backgroundColor: "#555", 
              borderRadius: "2px",
              position: "relative"
            }}>
              <div style={{
                height: "100%",
                backgroundColor: "#4CAF50",
                borderRadius: "2px",
                width: `${(currentTime / duration) * 100}%`
              }} />
            </div>
            
            <span style={{ fontSize: "12px", color: "#888", minWidth: "40px" }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: "100px" }}>
          <span>🔊</span>
          <div style={{ 
            width: "60px", 
            height: "4px", 
            backgroundColor: "#555", 
            borderRadius: "2px" 
          }}>
            <div style={{
              height: "100%",
              backgroundColor: "#4CAF50",
              borderRadius: "2px",
              width: "70%"
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}


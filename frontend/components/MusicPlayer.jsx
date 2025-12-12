import React, { useState, useEffect } from 'react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(240); // 4 minutes in seconds
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  // Mock recommended songs
  const recommendedSongs = [
    { title: "Blinding Lights", artist: "The Weeknd", duration: "3:20", albumCover: "🎵" },
    { title: "Levitating", artist: "Dua Lipa", duration: "3:23", albumCover: "🎵" },
    { title: "Good 4 U", artist: "Olivia Rodrigo", duration: "2:58", albumCover: "🎵" },
    { title: "Stay", artist: "The Kid LAROI & Justin Bieber", duration: "2:21", albumCover: "🎵" },
    { title: "Industry Baby", artist: "Lil Nas X & Jack Harlow", duration: "3:32", albumCover: "🎵" }
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

  return (
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
      borderTop: "1px solid #555",
      zIndex: 100
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
            {/* Skip-backward SVG from iconify */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	            <path fill="currentColor" d="M18 14.17L15.83 12L18 9.83zM20 19V5l-7 7m-9 7h2V5H4m7 9.17L8.83 12L11 9.83zM13 19V5l-7 7" />
            </svg>
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
            {/* Fast-Forward SVG from iconify */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	            <path fill="currentColor" d="M6 9.83L8.17 12L6 14.17zM4 5v14l7-7m9-7h-2v14h2m-7-9.17L15.17 12L13 14.17zM11 5v14l7-7" />
            </svg>
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
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	          <path fill="currentColor" d="M14 20.725v-2.05q2.25-.65 3.625-2.5t1.375-4.2t-1.375-4.2T14 5.275v-2.05q3.1.7 5.05 3.138T21 11.975t-1.95 5.613T14 20.725M3 15V9h4l5-5v16l-5-5zm11 1V7.95q1.175.55 1.838 1.65T16.5 12q0 1.275-.663 2.363T14 16m-4-7.15L7.85 11H5v2h2.85L10 15.15zM7.5 12" />
          </svg>
        </span>
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
  );
}

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("This Week");
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    // Fetch analytics from backend
    fetch(`http://localhost:8000/api/analytics/overview?time_filter=${timeFilter}`)
      .then(response => response.json())
      .then(data => {
        setAnalyticsData(data.analytics);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      });
  }, [timeFilter]);

  // Use fetched data or fallback to mock data
  const moodStats = analyticsData?.mood_stats || [
    { mood: "Happy", percentage: 35, color: "#4CAF50", hours: 14.2 },
    { mood: "Energized", percentage: 25, color: "#FFC107", hours: 10.1 },
    { mood: "Calm", percentage: 20, color: "#9C27B0", hours: 8.3 },
    { mood: "Sad", percentage: 15, color: "#2196F3", hours: 6.1 },
    { mood: "Angry", percentage: 5, color: "#F44336", hours: 2.3 }
  ];

  const listeningData = analyticsData?.listening_data || [
    { day: "Mon", hours: 3.2 },
    { day: "Tue", hours: 2.8 },
    { day: "Wed", hours: 4.1 },
    { day: "Thu", hours: 3.7 },
    { day: "Fri", hours: 5.2 },
    { day: "Sat", hours: 6.8 },
    { day: "Sun", hours: 4.9 }
  ];

  const topArtists = analyticsData?.top_artists || [
    { name: "The Weeknd", plays: 47, change: "+12%" },
    { name: "Dua Lipa", plays: 39, change: "+8%" },
    { name: "Post Malone", plays: 34, change: "-3%" },
    { name: "Olivia Rodrigo", plays: 28, change: "+15%" },
    { name: "Imagine Dragons", plays: 25, change: "+5%" }
  ];

  const topGenres = analyticsData?.top_genres || [
    { name: "Pop", percentage: 32, color: "#4CAF50" },
    { name: "Hip-Hop", percentage: 28, color: "#FFC107" },
    { name: "Rock", percentage: 18, color: "#F44336" },
    { name: "Electronic", percentage: 12, color: "#2196F3" },
    { name: "Indie", percentage: 10, color: "#9C27B0" }
  ];

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <p>Loading analytics...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <div style={{ position: "relative", textAlign: "center", marginBottom: 40 }}>
        <h2 style={{ 
          fontSize: "48px", 
          margin: "20px 0", 
          background: "linear-gradient(135deg, #2196F3, #64B5F6, #90CAF9)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: "bold"
        }}>
          Your Music Analytics
        </h2>
        <p style={{ color: "#888", fontSize: "18px", marginBottom: 20 }}>
          Discover your listening patterns and mood trends
        </p>
        
        {/* Get Recently Played Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => {
              console.log('Fetching recently played songs...');
              // TODO: Implement fetch recently played songs functionality
              alert('Getting recently played songs...');
            }}
            style={{
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              padding: "15px 40px",
              borderRadius: "25px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
              minWidth: "200px"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#1976D2";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(33, 150, 243, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#2196F3";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(33, 150, 243, 0.3)";
            }}
          >
            Get Recently Played
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 25, 
        maxWidth: "1000px",
        margin: "0 auto 40px auto",
        padding: "0 20px"
      }}>
        {/* Total Listening Hours */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px",
          textAlign: "center",
          border: "2px solid #4CAF50"
        }}>
          <h3 style={{ color: "#4CAF50", fontSize: "16px", margin: "0 0 10px 0" }}>
            Total Hours
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "white", margin: "0 0 5px 0" }}>
            {moodStats.reduce((total, stat) => total + stat.hours, 0).toFixed(1)}h
          </p>
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
            {timeFilter.toLowerCase()}
          </p>
        </div>

        {/* Top Mood */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px",
          textAlign: "center",
          border: `2px solid ${moodStats[0]?.color}`
        }}>
          <h3 style={{ color: moodStats[0]?.color, fontSize: "16px", margin: "0 0 10px 0" }}>
            Dominant Mood
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "white", margin: "0 0 5px 0" }}>
            {moodStats[0]?.mood}
          </p>
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
            {moodStats[0]?.percentage}% of listening
          </p>
        </div>

        {/* Songs Played */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px",
          textAlign: "center",
          border: "2px solid #FFC107"
        }}>
          <h3 style={{ color: "#FFC107", fontSize: "16px", margin: "0 0 10px 0" }}>
            Songs Played
          </h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", color: "white", margin: "0 0 5px 0" }}>
            {topArtists.reduce((total, artist) => total + artist.plays, 0)}
          </p>
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
            tracks discovered
          </p>
        </div>

      </div>

      {/* Charts Section */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr",
        gap: 30, 
        maxWidth: "1200px",
        margin: "0 auto 40px auto",
        padding: "0 20px"
      }}>
        {/* Mood Distribution */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px"
        }}>
          <h3 style={{ color: "white", fontSize: "20px", marginBottom: 20 }}>
            Mood Distribution
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {moodStats.map((stat) => (
              <div key={stat.mood}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: 8
                }}>
                  <span style={{ color: stat.color, fontWeight: "600" }}>
                    {stat.mood}
                  </span>
                  <span style={{ color: "white" }}>
                    {stat.percentage}% ({stat.hours}h)
                  </span>
                </div>
                <div style={{
                  height: "8px",
                  backgroundColor: "#444",
                  borderRadius: "4px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${stat.percentage}%`,
                    backgroundColor: stat.color,
                    borderRadius: "4px",
                    transition: "width 0.5s ease"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px"
        }}>
          <h3 style={{ color: "white", fontSize: "20px", marginBottom: 20 }}>
            Weekly Activity
          </h3>
          <div style={{ 
            display: "flex", 
            alignItems: "end", 
            justifyContent: "space-between",
            height: "200px",
            padding: "20px 0"
          }}>
            {listeningData.map((day) => (
              <div key={day.day} style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                flex: 1
              }}>
                <div style={{
                  width: "24px",
                  height: `${(day.hours / Math.max(...listeningData.map(d => d.hours))) * 160}px`,
                  backgroundColor: "#2196F3",
                  borderRadius: "4px 4px 0 0",
                  marginBottom: 10,
                  transition: "height 0.5s ease"
                }} />
                <div style={{ 
                  fontSize: "12px", 
                  color: "#888",
                  marginBottom: 5
                }}>
                  {day.day}
                </div>
                <div style={{ 
                  fontSize: "10px", 
                  color: "#666"
                }}>
                  {day.hours}h
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Artists & Genres */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr",
        gap: 30, 
        maxWidth: "1200px",
        margin: "0 auto 40px auto",
        padding: "0 20px"
      }}>
        {/* Top Artists */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px"
        }}>
          <h3 style={{ color: "white", fontSize: "20px", marginBottom: 20 }}>
            Top Artists
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {topArtists.map((artist, index) => (
              <div key={artist.name} style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: index < topArtists.length - 1 ? "1px solid #444" : "none"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                  <div style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: "#4CAF50",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white"
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ color: "white", fontWeight: "500" }}>
                    {artist.name}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "white", fontSize: "14px" }}>
                    {artist.plays} plays
                  </div>
                  <div style={{ 
                    color: artist.change.startsWith('+') ? "#4CAF50" : "#F44336", 
                    fontSize: "12px" 
                  }}>
                    {artist.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Genres */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px"
        }}>
          <h3 style={{ color: "white", fontSize: "20px", marginBottom: 20 }}>
            Top Genres
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {topGenres.map((genre, index) => (
              <div key={genre.name} style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: index < topGenres.length - 1 ? "1px solid #444" : "none"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                  <div style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: genre.color,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white"
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ color: "white", fontWeight: "500" }}>
                    {genre.name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: "60px",
                    height: "6px",
                    backgroundColor: "#444",
                    borderRadius: "3px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${genre.percentage}%`,
                      backgroundColor: genre.color,
                      borderRadius: "3px"
                    }} />
                  </div>
                  <span style={{ color: "white", fontSize: "14px", minWidth: "35px" }}>
                    {genre.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

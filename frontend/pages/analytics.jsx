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

  const maxHours = Math.max(...listeningData.map(d => d.hours));

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
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={{ 
          fontSize: "48px", 
          margin: "20px 0", 
          background: "linear-gradient(135deg, #4CAF50, #81C784, #A5D6A7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: "bold"
        }}>
          Your Music Analytics
        </h2>
        <p style={{ color: "#888", fontSize: "18px" }}>
          Insights into your listening habits and mood patterns
        </p>
      </div>

      {/* Time Filter */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        gap: 15, 
        marginBottom: 40
      }}>
        {["This Week", "This Month", "Last 3 Months", "This Year"].map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            style={{
              backgroundColor: timeFilter === filter ? "#4CAF50" : "transparent",
              color: timeFilter === filter ? "white" : "#888",
              border: timeFilter === filter ? "2px solid #4CAF50" : "2px solid #555",
              padding: "8px 16px",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: timeFilter === filter ? "600" : "400",
              transition: "all 0.3s ease"
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 25, 
        maxWidth: "1400px",
        margin: "0 auto 40px auto",
        padding: "0 20px"
      }}>
        {/* Total Listening Time */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px",
          textAlign: "center"
        }}>
          <h3 style={{ color: "#4CAF50", fontSize: "16px", margin: "0 0 15px 0" }}>
            Total Listening Time
          </h3>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: "white", margin: "10px 0" }}>
            {analyticsData?.total_listening_hours || 41.0}
          </div>
          <div style={{ color: "#888", fontSize: "14px" }}>
            hours this week
          </div>
          <div style={{ color: "#4CAF50", fontSize: "12px", marginTop: 10 }}>
            {analyticsData?.week_change || "+23%"} from last week
          </div>
        </div>

        {/* Average Daily Sessions */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px",
          textAlign: "center"
        }}>
          <h3 style={{ color: "#FFC107", fontSize: "16px", margin: "0 0 15px 0" }}>
            Daily Sessions
          </h3>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: "white", margin: "10px 0" }}>
            {analyticsData?.daily_average || 5.9}
          </div>
          <div style={{ color: "#888", fontSize: "14px" }}>
            hours per day average
          </div>
          <div style={{ color: "#FFC107", fontSize: "12px", marginTop: 10 }}>
            +8% from last week
          </div>
        </div>

        {/* Top Mood */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px",
          textAlign: "center"
        }}>
          <h3 style={{ color: "#9C27B0", fontSize: "16px", margin: "0 0 15px 0" }}>
            Most Common Mood
          </h3>
          <div style={{ fontSize: "32px", fontWeight: "bold", color: "white", margin: "10px 0" }}>
            {analyticsData?.top_mood || "Happy"}
          </div>
          <div style={{ color: "#888", fontSize: "14px" }}>
            {analyticsData?.mood_percentage || 35}% of listening time
          </div>
          <div style={{ color: "#9C27B0", fontSize: "12px", marginTop: 10 }}>
            {moodStats[0]?.hours || 14.2} hours this week
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr",
        gap: 25, 
        maxWidth: "1400px",
        margin: "0 auto 40px auto",
        padding: "0 20px"
      }}>
        {/* Mood Distribution */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px"
        }}>
          <h3 style={{ color: "#4CAF50", fontSize: "18px", marginBottom: 25 }}>
            Mood Distribution
          </h3>
          {moodStats.map((mood, index) => (
            <div key={mood.mood} style={{ marginBottom: 15 }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: 8
              }}>
                <span style={{ fontSize: "14px", color: "white" }}>{mood.mood}</span>
                <span style={{ fontSize: "14px", color: "#888" }}>{mood.percentage}%</span>
              </div>
              <div style={{
                height: "8px",
                backgroundColor: "#444",
                borderRadius: "4px",
                overflow: "hidden"
              }}>
                <div style={{
                  height: "100%",
                  width: `${mood.percentage}%`,
                  backgroundColor: mood.color,
                  borderRadius: "4px",
                  transition: "width 0.8s ease"
                }} />
              </div>
              <div style={{ 
                fontSize: "12px", 
                color: "#666", 
                marginTop: 4,
                textAlign: "right"
              }}>
                {mood.hours} hours
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Listening Activity */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px"
        }}>
          <h3 style={{ color: "#4CAF50", fontSize: "18px", marginBottom: 25 }}>
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
                  width: "30px",
                  height: `${(day.hours / maxHours) * 160}px`,
                  backgroundColor: "#4CAF50",
                  borderRadius: "4px 4px 0 0",
                  marginBottom: 10,
                  transition: "height 0.8s ease"
                }} />
                <div style={{ 
                  fontSize: "12px", 
                  color: "#888",
                  marginBottom: 5
                }}>
                  {day.day}
                </div>
                <div style={{ 
                  fontSize: "11px", 
                  color: "#666"
                }}>
                  {day.hours}h
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Lists */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr",
        gap: 25, 
        maxWidth: "1400px",
        margin: "0 auto 50px auto",
        padding: "0 20px"
      }}>
        {/* Top Artists */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px"
        }}>
          <h3 style={{ color: "#4CAF50", fontSize: "18px", marginBottom: 20 }}>
            Top Artists This Week
          </h3>
          {topArtists.map((artist, index) => (
            <div key={artist.name} style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: index < topArtists.length - 1 ? "1px solid #444" : "none"
            }}>
              <div style={{
                width: 30,
                height: 30,
                backgroundColor: "#4CAF50",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
                marginRight: 15,
                color: "white"
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "white" }}>
                  {artist.name}
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {artist.plays} plays
                </div>
              </div>
              <div style={{ 
                fontSize: "12px", 
                color: artist.change.startsWith('+') ? "#4CAF50" : "#F44336",
                fontWeight: "500"
              }}>
                {artist.change}
              </div>
            </div>
          ))}
        </div>

        {/* Top Genres */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "20px",
          padding: "25px"
        }}>
          <h3 style={{ color: "#4CAF50", fontSize: "18px", marginBottom: 20 }}>
            Favorite Genres
          </h3>
          {topGenres.map((genre, index) => (
            <div key={genre.name} style={{ marginBottom: 15 }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: 8
              }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    backgroundColor: genre.color,
                    borderRadius: "50%",
                    marginRight: 10
                  }} />
                  <span style={{ fontSize: "14px", color: "white" }}>{genre.name}</span>
                </div>
                <span style={{ fontSize: "14px", color: "#888" }}>{genre.percentage}%</span>
              </div>
              <div style={{
                height: "6px",
                backgroundColor: "#444",
                borderRadius: "3px",
                overflow: "hidden",
                marginLeft: 22
              }}>
                <div style={{
                  height: "100%",
                  width: `${genre.percentage}%`,
                  backgroundColor: genre.color,
                  borderRadius: "3px",
                  transition: "width 0.8s ease"
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

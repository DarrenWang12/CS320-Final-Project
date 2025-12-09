import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function Collections() {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    // Fetch collections from backend
    fetch('http://localhost:8000/api/collections')
      .then(response => response.json())
      .then(data => {
        setCollections(data.collections || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching collections:', error);
        // Fall back to mock data
        const mockCollections = [
          {
            id: 1,
            name: "Happy Vibes",
            mood: "Happy",
            songCount: 25,
            lastUpdated: "2 days ago",
            color: "#4CAF50",
            songs: [
              { title: "Blinding Lights", artist: "The Weeknd" },
              { title: "Levitating", artist: "Dua Lipa" },
              { title: "Good as Hell", artist: "Lizzo" }
            ]
          },
          {
            id: 2,
            name: "Chill Nights",
            mood: "Calm",
            songCount: 18,
            lastUpdated: "1 week ago",
            color: "#9C27B0",
            songs: [
              { title: "Watermelon Sugar", artist: "Harry Styles" },
              { title: "Sunflower", artist: "Post Malone" },
              { title: "Circles", artist: "Post Malone" }
            ]
          },
          {
            id: 3,
            name: "Workout Energy",
            mood: "Energized",
            songCount: 32,
            lastUpdated: "3 days ago",
            color: "#FFC107",
            songs: [
              { title: "Thunder", artist: "Imagine Dragons" },
              { title: "Believer", artist: "Imagine Dragons" },
              { title: "Stronger", artist: "Kelly Clarkson" }
            ]
          },
          {
            id: 4,
            name: "Rainy Day Blues",
            mood: "Sad",
            songCount: 15,
            lastUpdated: "5 days ago",
            color: "#2196F3",
            songs: [
              { title: "Someone Like You", artist: "Adele" },
              { title: "Fix You", artist: "Coldplay" },
              { title: "Hurt", artist: "Johnny Cash" }
            ]
          }
        ];
        setCollections(mockCollections);
        setLoading(false);
      });
  }, []);

  // Remove filtering - show all collections
  const filteredCollections = collections;

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <p>Loading collections...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ 
          fontSize: "48px", 
          margin: "20px 0", 
          background: "linear-gradient(135deg, #4CAF50, #81C784, #A5D6A7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: "bold",
          textAlign: "center"
        }}>
          Your Music Collections
        </h2>
        
        {/* Subtitle and Create Button on same line */}
        <div style={{ 
          position: "relative",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px"
        }}>
          {/* Centered subtitle */}
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#888", fontSize: "18px", margin: 0 }}>
              Organize and discover your mood-based playlists
            </p>
          </div>
          
          {/* Absolutely positioned button */}
          <button style={{
            position: "absolute",
            top: "50%",
            right: "20px",
            transform: "translateY(-50%)",
            backgroundColor: "transparent",
            color: "#4CAF50",
            border: "2px dashed #4CAF50",
            padding: "12px 24px",
            borderRadius: "15px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#4CAF5010";
            e.target.style.transform = "translateY(-50%) translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.transform = "translateY(-50%)";
          }}
          >
            <span style={{ fontSize: "16px" }}>+</span>
            Create New Collection
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: 25, 
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px"
      }}>
        {filteredCollections.map((collection) => (
          <div
            key={collection.id}
            style={{
              backgroundColor: "#2a2a2a",
              borderRadius: "20px",
              padding: "25px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              border: `2px solid transparent`,
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-5px)";
              e.target.style.boxShadow = `0 10px 30px ${collection.color}20`;
              e.target.style.borderColor = collection.color;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
              e.target.style.borderColor = "transparent";
            }}
          >
            {/* Collection Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: "20px", 
                  fontWeight: "bold",
                  color: collection.color 
                }}>
                  {collection.name}
                </h3>
                <p style={{ 
                  margin: "5px 0", 
                  color: "#888", 
                  fontSize: "14px" 
                }}>
                  {collection.songCount} songs • {collection.lastUpdated}
                </p>
              </div>
              <div style={{
                backgroundColor: `${collection.color}20`,
                color: collection.color,
                padding: "6px 12px",
                borderRadius: "15px",
                fontSize: "12px",
                fontWeight: "600"
              }}>
                {collection.mood}
              </div>
            </div>

            {/* Sample Songs */}
            <div style={{ marginBottom: 20 }}>
              {collection.songs.slice(0, 3).map((song, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  marginBottom: 8,
                  opacity: 0.8
                }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    backgroundColor: collection.color,
                    borderRadius: "50%",
                    marginRight: 10
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                      {song.title}
                    </span>
                    <span style={{ color: "#666", fontSize: "12px", marginLeft: 8 }}>
                      by {song.artist}
                    </span>
                  </div>
                </div>
              ))}
              {collection.songCount > 3 && (
                <p style={{ color: "#666", fontSize: "12px", fontStyle: "italic", margin: "8px 0 0 16px" }}>
                  +{collection.songCount - 3} more songs
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{
                flex: 1,
                backgroundColor: collection.color,
                color: "white",
                border: "none",
                padding: "10px 15px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "opacity 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.opacity = "0.8"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
              >
                ▶ Play All
              </button>
              <button style={{
                backgroundColor: "transparent",
                color: "#888",
                border: "1px solid #555",
                padding: "10px 15px",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#333";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#888";
              }}
              >
                ⋯
              </button>
            </div>
          </div>
        ))}
      </div>

    </Layout>
  );
}

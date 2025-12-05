import React, { useState, useEffect } from "react";
import Header from "../components/header";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [backendData, setBackendData] = useState(null);

  useEffect(() => {
    // Call the test endpoint on component mount
    fetch("http://127.0.0.1:8000/api/test")
      .then((response) => response.json())
      .then((data) => {
        setBackendData(data);
        setBackendStatus("Connected!");
      })
      .catch((error) => {
        console.error("Error connecting to backend:", error);
        setBackendStatus("Failed to connect");
      });
  }, []);

  const handleSpotifyLogin = () => {
    // Redirect to Spotify login endpoint
    window.location.href = "http://127.0.0.1:8000/auth/spotify/login";
  };

  return (
    <div style={{ fontFamily: "system-ui", padding: 20 }}>
      <Header />
      <h1>Hello from Next.js</h1>
      <p>Frontend is running.</p>
      
      <div style={{ marginTop: 30, padding: 20, backgroundColor: "#1DB954", borderRadius: 8, textAlign: "center" }}>
        <h2 style={{ color: "white", marginBottom: 15 }}>Spotify Authentication</h2>
        <button
          onClick={handleSpotifyLogin}
          style={{
            backgroundColor: "white",
            color: "#1DB954",
            border: "none",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "25px",
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          Sign in with Spotify
        </button>
      </div>

      <div style={{ marginTop: 20, padding: 15, backgroundColor: "#f0f0f0", borderRadius: 5 }}>
        <h2>Backend Connection Status</h2>
        <p>
          <strong>Status:</strong> {backendStatus}
        </p>
        {backendData && (
          <div>
            <p>
              <strong>Message:</strong> {backendData.message}
            </p>
            <pre style={{ backgroundColor: "#fff", padding: 10, borderRadius: 3 }}>
              {JSON.stringify(backendData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
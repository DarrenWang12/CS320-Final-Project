import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is a placeholder
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ fontFamily: "system-ui", padding: 20, textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 20 }}>
      <h1>Welcome to Your Dashboard!</h1>
      <div style={{ marginTop: 20, padding: 20, backgroundColor: "#f0f0f0", borderRadius: 8 }}>
        <h2>Spotify Authentication Successful</h2>
        <p>You have successfully signed in with Spotify.</p>
        <p style={{ marginTop: 10, color: "#666" }}>
          Your Spotify tokens have been stored securely on the backend.
        </p>
        <p style={{ marginTop: 10, color: "#666" }}>
          You can now use the API endpoints to fetch your listening history and get recommendations.
        </p>
      </div>
      
      <div style={{ marginTop: 30 }}>
        <h2>Next Steps</h2>
        <ul>
          <li>Fetch your recently played tracks</li>
          <li>Get your top tracks and artists</li>
          <li>Generate personalized recommendations</li>
        </ul>
      </div>
    </div>
  );
}


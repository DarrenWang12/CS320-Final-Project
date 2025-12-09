import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

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

  // Helper function to check if current route matches
  const isActiveTab = (path) => {
    return router.pathname === path;
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      marginBottom: 40,
      padding: "20px 24px",
      borderBottom: "1px solid #333"
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ 
          backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
          borderRadius: "12px", 
          width: 32, 
          height: 32, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: "16px" 
        }}>
          🎵
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", color: "#ffffff", fontWeight: "600" }}>MoodTune</h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Your emotional soundtrack</p>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ 
            cursor: "pointer", 
            color: isActiveTab('/dashboard') ? "#ffffff" : "#888",
            backgroundColor: isActiveTab('/dashboard') ? "#333" : "transparent",
            fontSize: "14px",
            fontWeight: "500",
            padding: "8px 16px",
            borderRadius: "8px",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            
            Discover
          </div>
        </Link>
        
        <Link href="/collections" style={{ textDecoration: 'none' }}>
          <div style={{ 
            cursor: "pointer", 
            color: isActiveTab('/collections') ? "#ffffff" : "#888",
            backgroundColor: isActiveTab('/collections') ? "#333" : "transparent",
            fontSize: "14px",
            fontWeight: "500",
            padding: "8px 16px",
            borderRadius: "8px",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            
            Collections
          </div>
        </Link>
        
        <Link href="/analytics" style={{ textDecoration: 'none' }}>
          <div style={{ 
            cursor: "pointer", 
            color: isActiveTab('/analytics') ? "#ffffff" : "#888",
            backgroundColor: isActiveTab('/analytics') ? "#333" : "transparent",
            fontSize: "14px",
            fontWeight: "500",
            padding: "8px 16px",
            borderRadius: "8px",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            
            Analytics
          </div>
        </Link>
      </div>
      
      {/* User Actions */}
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
                  Profile Settings
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
                  Music Preferences
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
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

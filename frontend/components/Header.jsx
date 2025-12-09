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
      padding: "0 20px"
    }}>
      {/* Logo */}
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
        <h1 style={{ margin: 0, fontSize: "24px", color: "#ffffff" }}>Mood Music</h1>
      </div>
      
      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: 30 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <span style={{ 
            cursor: "pointer", 
            color: isActiveTab('/dashboard') ? "#4CAF50" : "#ffffff",
            opacity: isActiveTab('/dashboard') ? 1 : 0.8,
            fontSize: "16px",
            fontWeight: isActiveTab('/dashboard') ? "600" : "400",
            borderBottom: isActiveTab('/dashboard') ? "2px solid #4CAF50" : "none",
            paddingBottom: "4px",
            transition: "all 0.3s ease"
          }}>
            Dashboard
          </span>
        </Link>
        
        <Link href="/collections" style={{ textDecoration: 'none' }}>
          <span style={{ 
            cursor: "pointer", 
            color: isActiveTab('/collections') ? "#4CAF50" : "#ffffff",
            opacity: isActiveTab('/collections') ? 1 : 0.8,
            fontSize: "16px",
            fontWeight: isActiveTab('/collections') ? "600" : "400",
            borderBottom: isActiveTab('/collections') ? "2px solid #4CAF50" : "none",
            paddingBottom: "4px",
            transition: "all 0.3s ease"
          }}>
            Collections
          </span>
        </Link>
        
        <Link href="/analytics" style={{ textDecoration: 'none' }}>
          <span style={{ 
            cursor: "pointer", 
            color: isActiveTab('/analytics') ? "#4CAF50" : "#ffffff",
            opacity: isActiveTab('/analytics') ? 1 : 0.8,
            fontSize: "16px",
            fontWeight: isActiveTab('/analytics') ? "600" : "400",
            borderBottom: isActiveTab('/analytics') ? "2px solid #4CAF50" : "none",
            paddingBottom: "4px",
            transition: "all 0.3s ease"
          }}>
            Analytics
          </span>
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
  );
}

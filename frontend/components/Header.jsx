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
      // Sign out from Firebase
      const { signOutUser } = await import('../src/firebase/auth');
      const { deleteSpotifyTokens } = await import('../src/firebase/firestore');
      
      // Get current user before signing out
      const { getCurrentUser } = await import('../src/firebase/auth');
      const user = getCurrentUser();
      
      if (user) {
        // Delete Spotify tokens from Firestore
        await deleteSpotifyTokens(user.uid);
      }
      
      // Sign out from Firebase
      await signOutUser();
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      // Fallback: redirect to home page anyway
      window.location.href = '/';
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
          {/* SVG Music Note from iconify */}
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
            <path fill="#4CAF50" fill-rule="evenodd" d="M12 2.25a.75.75 0 0 0-.75.75v11.26a4.25 4.25 0 1 0 1.486 2.888A1 1 0 0 0 12.75 17V7.75H18a2.75 2.75 0 1 0 0-5.5zm.75 4H18a1.25 1.25 0 1 0 0-2.5h-5.25zm-4.25 8.5a2.75 2.75 0 1 0 0 5.5a2.75 2.75 0 0 0 0-5.5" clip-rule="evenodd"/>
          </svg>
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
            {/* SVG Settings from iconify */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zM11 20h1.975l.35-2.65q.775-.2 1.438-.587t1.212-.938l2.475 1.025l.975-1.7l-2.15-1.625q.125-.35.175-.737T17.5 12t-.05-.787t-.175-.738l2.15-1.625l-.975-1.7l-2.475 1.05q-.55-.575-1.212-.962t-1.438-.588L13 4h-1.975l-.35 2.65q-.775.2-1.437.588t-1.213.937L5.55 7.15l-.975 1.7l2.15 1.6q-.125.375-.175.75t-.05.8q0 .4.05.775t.175.75l-2.15 1.625l.975 1.7l2.475-1.05q.55.575 1.213.963t1.437.587zm1.05-4.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5M12 12"/>
            </svg>
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

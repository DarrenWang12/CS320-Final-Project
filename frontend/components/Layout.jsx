import React from 'react';
import Header from './Header';
import MusicPlayer from './MusicPlayer';

export default function Layout({ children }) {
  return (
    <div style={{ 
      fontFamily: "system-ui", 
      backgroundColor: "#1a1a1a", 
      color: "#ffffff", 
      minHeight: "100vh",
      paddingBottom: "100px" // Space for music player
    }}>
      <Header />
      <main style={{ padding: "0 20px" }}>
        {children}
      </main>
      <MusicPlayer />
    </div>
  );
}

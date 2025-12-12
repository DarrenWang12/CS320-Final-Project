import React, { useEffect, useRef, useState } from "react";

export default function SpotifyEmbedPlayer({
  initialUri = "spotify:track:11dFghVXANMlKmJXsNCbNl",
  width = "100%",
  height = 152,
}) {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);
  const [currentUri, setCurrentUri] = useState(initialUri);

  useEffect(() => {
    // Load the iFrame API script once
    if (!document.querySelector('script[src="https://open.spotify.com/embed/iframe-api/v1"]')) {
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      document.body.appendChild(script);
    }

    // Spotify calls this global when ready
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      if (!containerRef.current) return;

      IFrameAPI.createController(
        containerRef.current,
        { uri: currentUri, width, height },
        (EmbedController) => {
          controllerRef.current = EmbedController;
        }
      );
    };

    return () => {
      controllerRef.current = null;
    };
  }, []);

  // Update URI when prop changes
  useEffect(() => {
    if (controllerRef.current && currentUri !== initialUri) {
      setCurrentUri(initialUri);
      controllerRef.current.loadUri(initialUri);
    }
  }, [initialUri]);

  return (
    <div style={{ 
      maxWidth: "100%", 
      backgroundColor: "#2a2a2a", 
      borderRadius: "15px", 
      padding: "20px",
      marginTop: "20px"
    }}>
      <div ref={containerRef} style={{ borderRadius: "12px", overflow: "hidden" }} />
    </div>
  );
}

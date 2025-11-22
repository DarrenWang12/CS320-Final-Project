import React, { useState, useEffect } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [backendData, setBackendData] = useState(null);

  useEffect(() => {
    // Call the test endpoint on component mount
    fetch("http://localhost:8000/api/test")
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

  return (
    <div style={{ fontFamily: "system-ui", padding: 20 }}>
      <h1>Hello from Next.js</h1>
      <p>Frontend is running.</p>
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
"use client";
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", background: "#fbf7f4", color: "#2a1d1a", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1>Something went wrong on our side</h1>
          <p>Your data is safe. Try again in a moment.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "12px 20px", borderRadius: 999, border: 0, background: "#2a1d1a", color: "#fff" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

// src/pages/ProductionHub.jsx
import React from "react";

export default function ProductionHub({ setPage }) {
  return (
    <div style={{ display: "grid", gap: 12, padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Production Status</h1>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          className="btn primary"
          onClick={() => setPage("production-stage")}
        >
          Stage
        </button>
        <button
          className="btn dark"
          onClick={() => setPage("production-audio")}
        >
          Audio
        </button>
      </div>
      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Pick a department to view progress.
      </p>
    </div>
  );
}

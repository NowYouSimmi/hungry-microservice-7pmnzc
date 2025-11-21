// src/pages/StatusHub.jsx
import React from "react";

export default function StatusHub({ setPage }) {
  const box = {
    background: "rgba(15,23,42,0.55)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: 14,
    padding: 16,
  };
  const btn = {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.35)",
    textDecoration: "none",
    color: "white",
    background: "rgba(31,41,55,0.6)",
    minWidth: 140,
    textAlign: "center",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "16px 18px 24px" }}>
      <div style={box}>
        <h1 style={{ marginTop: 0, marginBottom: 6 }}>Department Progress</h1>
        <p style={{ opacity: 0.85, marginTop: 0, marginBottom: 14 }}>
          Choose a department to view its production checklist.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button style={btn} onClick={() => setPage("productionstatus-stage")}>
            Stage
          </button>
          <button style={btn} onClick={() => setPage("productionstatus-audio")}>
            Audio
          </button>
        </div>
      </div>
    </div>
  );
}

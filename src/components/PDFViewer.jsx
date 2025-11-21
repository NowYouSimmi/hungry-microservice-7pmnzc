// src/components/PDFViewer.jsx
import React from "react";

export default function PDFViewer({ src, title = "Document", onBack }) {
  if (!src) {
    return (
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          minHeight: "100vh",
          padding: "1rem",
        }}
      >
        <button onClick={onBack} style={backBtnStyle}>
          ← Back
        </button>
        <p>No document selected.</p>
      </div>
    );
  }

  const absoluteSrc = src.startsWith("http")
    ? src
    : `${window.location.origin}${src}`;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backgroundColor: "#111827",
        }}
      >
        <button onClick={onBack} style={backBtnStyle}>
          ← Back
        </button>
        <h1 style={{ color: "#fff", fontSize: "1rem", fontWeight: 600 }}>
          {title}
        </h1>
        <button
          onClick={() =>
            window.open(absoluteSrc, "_blank", "noopener,noreferrer")
          }
          style={openBtnStyle}
        >
          Open in new tab
        </button>
      </div>

      <iframe
        src={absoluteSrc}
        title={title}
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
}

const backBtnStyle = {
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "9999px",
  padding: "0.25rem 0.75rem",
  color: "#fff",
  cursor: "pointer",
  fontSize: "0.8rem",
};

const openBtnStyle = {
  marginLeft: "auto",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "9999px",
  padding: "0.25rem 0.75rem",
  color: "#fff",
  fontSize: "0.75rem",
  cursor: "pointer",
};

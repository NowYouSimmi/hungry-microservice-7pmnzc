import React from "react";

export default function PhotoGallery({ images, title, onBack }) {
  return (
    <div className="page">
      <div className="gallery-top">
        <button className="btn ghost" onClick={onBack}>
          ← Back
        </button>
        <h1 style={{ margin: 0 }}>{title}</h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "12px",
          marginTop: "1rem",
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            style={{
              background: "rgba(15,23,42,0.4)",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(148,163,184,0.15)",
            }}
          >
            <img
              src={img}
              alt={`Gallery ${i}`}
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

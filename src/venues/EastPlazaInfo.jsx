// src/venues/EastPlazaInfo.jsx
import React, { useState } from "react";

function Section({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`venue-accordion ${open ? "venue-accordion-open" : ""}`}>
      <button
        className="btn dark venue-accordion-toggle"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span style={{ opacity: 0.8 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && <div className="venue-accordion-body">{children}</div>}
    </div>
  );
}

export default function EastPlazaInfo({ onBack }) {
  return (
    <div className="page">
      <h1>East Plaza</h1>

      <div
        className="venue-panel"
        style={{ marginTop: "0.75rem", marginBottom: "1.5rem" }}
      >
        {/* Stage Options */}
        <Section title="Stage Options">
          <div className="venue-subsection">
            <h3>Stage 1: Small</h3>
            <ul>
              <li>
                <strong>Stage:</strong> 8.4m × 4.8m
              </li>
              <li>
                <strong>Truss:</strong> 9.6m × 4.9m
              </li>
            </ul>
          </div>

          <div className="venue-subsection">
            <h3>Stage 2: Medium</h3>
            <ul>
              <li>
                <strong>Stage:</strong> 10.8m (w) × 4.8m (d)
              </li>
              <li>
                <strong>Truss:</strong> 11.6m × 4.9m
              </li>
            </ul>
          </div>

          <div className="venue-subsection">
            <h3>Stage 3: Large</h3>
            <ul>
              <li>
                <strong>Stage:</strong> 10.8m × 6m
              </li>
              <li>
                <strong>Truss:</strong> 11.6m × 5.9m
              </li>
            </ul>
          </div>
        </Section>

        {/* Seating */}
        <Section title="Seating">
          <ul>
            <li>
              <strong>House right courtesy seating:</strong> 94 seats
            </li>
            <li>
              <strong>Full seating:</strong> 214 seats
            </li>
          </ul>
        </Section>

        {/* Control Position */}
        <Section title="Control Position">
          <ul>
            <li>
              <strong>Audio position:</strong> 2m × 2m × 500mm (high)
            </li>
            <li>
              <strong>LX &amp; Video:</strong> 4m (w) × 2m (d) × 500mm (high)
            </li>
            <li>
              <strong>Distance from stage:</strong> 17.5m
            </li>
          </ul>
        </Section>
      </div>

      <button className="btn ghost" onClick={onBack}>
        ← Back to Venues
      </button>
    </div>
  );
}

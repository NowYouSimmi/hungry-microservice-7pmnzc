// src/venues/LoadingInfo.jsx
import React from "react";

export default function LoadingInfo() {
  return (
    <div className="venue-panel">
      <h2 style={{ marginBottom: "0.5rem" }}>
        C3 Loading Dock &amp; Stage Access Information
      </h2>

      {/* C3 Loading Dock */}
      <div className="venue-subsection">
        <h3>■ C3 Loading Dock</h3>
        <ul>
          <li>
            <strong>Maximum Vehicle Height:</strong> 2.4m{" "}
            <span style={{ opacity: 0.7 }}>
              (updated as of 2024 — previously 3m)
            </span>
          </li>
          <li>
            <strong>Maximum Vehicle Weight:</strong> 3t
          </li>
        </ul>
      </div>

      {/* Cargo Lift */}
      <div className="venue-subsection">
        <h3>■ Cargo Lift Dimensions</h3>
        <ul>
          <li>
            <strong>Load Capacity:</strong> 7,500 kg
          </li>
          <li>
            <strong>Door Opening:</strong> 2.9m (w) × 2.9m (h)
          </li>
          <li>
            <strong>Internal Measurements:</strong>
            <br />
            Diagonal: 2.55m &nbsp; | &nbsp; Length: 5.24m &nbsp; | &nbsp;
            Height: 2.56m
          </li>
        </ul>
      </div>

      {/* Red Stage Access */}
      <div className="venue-subsection">
        <h3>■ Red Stage Access</h3>
        <ul>
          <li>
            <strong>Upstage Doors:</strong> 3.19m (w) × 3.10m (h)
          </li>
          <li>
            <strong>Stage L/R Get-in Doors:</strong> 2.9m (w) × 2.8m (h)
          </li>
          <li>
            <strong>Clearance to Gantry SL/SR:</strong> 7m
          </li>
        </ul>
      </div>
    </div>
  );
}

// src/pages/Suppliers.jsx
import React, { useEffect, useState } from "react";

// 👇 your latest web app URL
const SUPPLIER_URL =
  "https://script.google.com/macros/s/AKfycbyzKffEBzS8ozFHO2V1zEDjevGmsn6r78k1AX3jzCPcYL1wxSC1aI-RrNLbF9soWErErQ/exec";

export default function Suppliers({ setPage }) {
  const [suppliers, setSuppliers] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(SUPPLIER_URL, {
          method: "GET",
          // mode: "cors" // usually default, leave it
        });
        const text = await res.text();

        // try to parse whatever we got
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          console.error("Response was not plain JSON:", text);
          throw new Error("Supplier API did not return JSON.");
        }

        const arr = Array.isArray(json.suppliers) ? json.suppliers : [];
        setSuppliers(arr);
        setError("");
      } catch (e) {
        console.error(e);
        setError(
          "Failed to fetch supplier contacts. Check script sharing or response format."
        );
      }
    })();
  }, []);

  const filtered = suppliers.filter((row) => {
    const haystack = Object.values(row || {})
      .map((v) => String(v ?? ""))
      .join(" ")
      .toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="page">
      <h1>Supplier Contacts</h1>

      <div className="field">
        <label>Search suppliers</label>
        <input
          type="text"
          placeholder="e.g., Rigging, Lighting, Audio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && (
        <div className="error" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr", gap: 12, marginTop: 16 }}
      >
        {filtered.map((s, i) => (
          <div key={i} className="card">
            <div className="card-title">
              {s["Company Name"] || s["company"] || "Unnamed supplier"}
            </div>
            <div className="card-sub">{s["Sector"] || ""}</div>

            {/* main phone */}
            {s["Main Number"] && (
              <div style={{ marginTop: 4 }}>
                📞{" "}
                <a
                  href={`tel:${s["Main Number"]}`}
                  style={{ color: "#4fc3f7" }}
                >
                  {s["Main Number"]}
                </a>
              </div>
            )}

            {/* website */}
            {s["Website"] && (
              <div style={{ marginTop: 4 }}>
                🌐{" "}
                <a
                  href={s["Website"]}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#4fc3f7" }}
                >
                  {s["Website"]}
                </a>
              </div>
            )}

            {/* general email */}
            {s["General Email"] && (
              <div style={{ marginTop: 4 }}>
                ✉️{" "}
                <a
                  href={`mailto:${s["General Email"]}`}
                  style={{ color: "#4fc3f7" }}
                >
                  {s["General Email"]}
                </a>
              </div>
            )}

            {/* named person */}
            {(s["Contact Name"] || s["Personal Contact"]) && (
              <div style={{ marginTop: 4 }}>
                👤 {s["Contact Name"] || s["Personal Contact"]}
              </div>
            )}

            {/* personal email */}
            {s["Personal Email"] && (
              <div style={{ marginTop: 4 }}>
                📧{" "}
                <a
                  href={`mailto:${s["Personal Email"]}`}
                  style={{ color: "#4fc3f7" }}
                >
                  {s["Personal Email"]}
                </a>
              </div>
            )}

            {/* on epro */}
            {s["On Epro (Y/N)"] && (
              <div style={{ marginTop: 4 }}>
                On Epro: <strong>{s["On Epro (Y/N)"]}</strong>
              </div>
            )}

            {/* notes */}
            {s["Notes of Services/Goods"] && (
              <div className="muted" style={{ marginTop: 6 }}>
                {s["Notes of Services/Goods"]}
              </div>
            )}
          </div>
        ))}

        {!error && filtered.length === 0 && (
          <div className="muted">No suppliers match your search.</div>
        )}
      </div>

      <button
        className="btn ghost"
        style={{ marginTop: 16 }}
        onClick={() => setPage("home")}
      >
        ← Back to Home
      </button>
    </div>
  );
}

import React from "react";

export default function InventoryHub({ setPage }) {
  return (
    <div style={{ padding: "1.25rem" }}>
      <h1
        className="text-2xl"
        style={{ marginBottom: "1rem", fontWeight: 700 }}
      >
        Inventory
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <button
          className="btn dark"
          style={{ padding: "1.25rem", borderRadius: 14, textAlign: "left" }}
          onClick={() => setPage("inventory-stage")}
        >
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Stage Inventory
          </div>
          <div
            style={{ opacity: 0.7, fontSize: "0.85rem", marginTop: 6 }}
          ></div>
        </button>

        <button
          className="btn dark"
          style={{ padding: "1.25rem", borderRadius: 14, textAlign: "left" }}
          onClick={() => setPage("audio")}
        >
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Audio Inventory
          </div>
          <div
            style={{ opacity: 0.7, fontSize: "0.85rem", marginTop: 6 }}
          ></div>
        </button>

        <button
          className="btn dark"
          style={{ padding: "1.25rem", borderRadius: 14, textAlign: "left" }}
          onClick={() => setPage("inventory-video")}
        >
          <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Video Inventory
          </div>
          <div
            style={{ opacity: 0.7, fontSize: "0.85rem", marginTop: 6 }}
          ></div>
        </button>
      </div>
    </div>
  );
}

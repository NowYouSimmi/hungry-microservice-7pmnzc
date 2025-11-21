import React from "react";
import logo from "../assets/ShowVault_logo_white.png";

export default function Home({ setPage }) {
  return (
    <div className="home">
      <img
        src={logo}
        alt="ShowVault"
        className="home-logo"
        style={{
          maxWidth: "220px",
          margin: "32px auto 16px",
          display: "block",
        }}
      />

      <div
        className="home-actions"
        style={{
          display: "grid",
          gap: "14px",
          maxWidth: "280px",
          margin: "0 auto",
        }}
      >
        {/* 1. Inventory */}
        <button className="btn" onClick={() => setPage("inventory")}>
          🎛 Inventory
        </button>

        {/* 2. Show Specs */}
        <button className="btn" onClick={() => setPage("showList")}>
          🎭 Show Specs
        </button>

        {/* 3. Schedule */}
        <button className="btn" onClick={() => setPage("schedule")}>
          📅 Schedule
        </button>

        {/* 4. Production Status */}
        <button
          className="btn"
          onClick={() => setPage("productionstatus")}
          title="View production checklist progress across shows"
        >
          📋 Production Status
        </button>

        {/* 5. Venue Information */}
        <button className="btn" onClick={() => setPage("venues")}>
          🏟 Venue Information
        </button>

        {/* 6. Supplier Contacts */}
        <button className="btn" onClick={() => setPage("suppliers")}>
          📇 Supplier Contacts
        </button>

        {/* 7. Rigging Calculator */}
        <button className="btn" onClick={() => setPage("rigCalc")}>
          🧮 Rigging Calculator
        </button>

        {/* ⭐ 8. How to CAD */}
        <button className="btn" onClick={() => setPage("how-to-cad")}>
          📐 How To CAD
        </button>

        {/* 9. Purchase Orders */}
        <button
          className="btn"
          onClick={() => setPage("purchaseorders")}
          title="View and manage Purchase Orders"
        >
          🧾 Purchase Orders
        </button>

        {/* 10. Hours */}
        <button
          className="btn dark"
          onClick={() => setPage("hours")}
          title="View and log working hours"
        >
          ⏱ Hours
        </button>

        {/* (Optional) Spaces Usage — currently placed below all the requested items */}
        <button className="btn" onClick={() => setPage("spaces-usage")}>
          📌 Spaces Usage
        </button>
      </div>

      <p
        className="muted"
        style={{ textAlign: "center", marginTop: "28px", fontSize: "0.9em" }}
      >
        <span style={{ color: "#9ecfff" }}>ShowVault</span> — NYUAD Arts Center
        tools
      </p>
    </div>
  );
}

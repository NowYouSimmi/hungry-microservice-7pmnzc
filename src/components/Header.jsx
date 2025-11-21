// src/components/Header.jsx
import React, { useState } from "react";

export default function Header({ setPage, page }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNav(target) {
    setPage(target);
    setMenuOpen(false);
  }

  // Default back behaviour: return to home
  function handleBack() {
    setPage("home");
  }

  return (
    <div className="app-header">
      {page !== "home" && (
        <div className="menu-container" style={{ display: "flex", gap: "8px" }}>
          {/* ⭐ Back Button */}
          <button className="btn ghost" onClick={handleBack}>
            ← Back
          </button>

          {/* Menu Button */}
          <button className="btn ghost" onClick={() => setMenuOpen(!menuOpen)}>
            ☰ Menu
          </button>

          {menuOpen && (
            <div className="dropdown-menu">
              <button onClick={() => handleNav("home")}>🏠 Home</button>
              <button onClick={() => handleNav("inventory")}>
                🎛 Inventory
              </button>
              <button onClick={() => handleNav("showList")}>
                🎭 Show Specs
              </button>
              <button onClick={() => handleNav("venues")}>🏟️ Venues</button>
              <button onClick={() => handleNav("spaces-usage")}>
                📌 Spaces Usage
              </button>
              <button onClick={() => handleNav("suppliers")}>
                📇 Suppliers
              </button>
              <button onClick={() => handleNav("rigCalc")}>
                🧮 Rigging Calc
              </button>
              <button onClick={() => handleNav("schedule")}>📅 Schedule</button>
              <button onClick={() => handleNav("productionstatus")}>
                📋 Production Status
              </button>
              <button onClick={() => handleNav("purchaseorders")}>
                🧾 Purchase Orders
              </button>
              <button onClick={() => handleNav("hours")}>⏱ Hours</button>

              {/* ⭐ NEW MENU ITEM — HOW TO CAD */}
              <button onClick={() => handleNav("how-to-cad")}>
                📐 How to CAD
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

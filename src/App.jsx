// src/App.jsx
import React, { useState, useEffect } from "react";
import Header from "./components/Header.jsx";

import Home from "./pages/Home.jsx";
import Inventory from "./pages/Inventory.jsx";
import InvEquipment from "./pages/InvEquipment.jsx";
import InvInUse from "./pages/InvInUse.jsx";
import ShowSpecs from "./pages/ShowSpecs.jsx";
import Venues from "./pages/Venues.jsx";
import Suppliers from "./pages/Suppliers.jsx";
import RiggingCalc from "./pages/RiggingCalc.jsx";
import Schedule from "./pages/Schedule.jsx";
import PDFViewer from "./components/PDFViewer.jsx";
import PhotoGallery from "./pages/PhotoGallery.jsx";
import POs from "./pages/POs.jsx";
import SpacesUsage from "./pages/SpacesUsage";
import HowToCAD from "./pages/HowToCAD.jsx";

// ✅ Hours pages
import Hours from "./pages/Hours.jsx";
import PersonHours from "./pages/PersonHours.jsx";

// ✅ Production Status hub and page
import StatusHub from "./pages/StatusHub.jsx";
import ProductionStatus from "./pages/ProductionStatus.jsx";

// ✅ Inventory hub and Audio page
import InventoryHub from "./pages/InventoryHub.jsx";
import AudioInventory from "./pages/AudioInventory.jsx";

// ✅ NEW: Video Inventory page
import VideoInventory from "./pages/VideoInventory.jsx";

import "./App.css";

// approved Net IDs (case-insensitive)
const APPROVED_LOGINS = [
  "cp2532",
  "eg129",
  "pb139",
  "rs5186",
  "st110",
  "gr73",
  "js9640",
  "tt2571",
  "lc4938",
  "ch4360",
  "jp4854",
  "bl2580",
  "lg3115",
  "ma10073",
  "sam9644",
  "ld72",
  "sa9252",
];

// ✅ Only these NetIDs can view restricted pages (Hours + POs)
const RESTRICTED_ACCESS = ["cp2532", "js9640", "gr73"];

const AUTH_KEY = "stagevault-auth-v1";

// ✅ Helper to target a specific Google Sheet tab for ProductionStatus
function urlForSheet(sheetName) {
  const base =
    "https://script.google.com/macros/s/AKfycbxb2yNU8itdZUICoROgkaaAC_kY-N9rv6IuJjsdMrOS-9jP5l_NTUxpWIiV5tp_9ZyS/exec";
  const qs = new URLSearchParams({
    mode: "normalized",
    format: "json",
    sheet: sheetName,
  }).toString();
  return `${base}?${qs}`;
}

export default function App() {
  const [user, setUser] = useState(null); // { id, role }
  const [page, setPage] = useState("home");
  const [pdfData, setPdfData] = useState(null);
  const [galleryData, setGalleryData] = useState(null);

  // restore login
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.role) setUser(parsed);
      }
    } catch (err) {
      console.warn("could not restore login", err);
    }
  }, []);

  const handleLogin = (input) => {
    const clean = input.trim().toLowerCase();
    if (!clean) return;

    if (clean === "guest") {
      const guest = { id: "guest", role: "guest" };
      setUser(guest);
      localStorage.setItem(AUTH_KEY, JSON.stringify(guest));
      setPage("venues");
      return;
    }

    if (APPROVED_LOGINS.includes(clean)) {
      const full = { id: clean, role: "full" };
      setUser(full);
      localStorage.setItem(AUTH_KEY, JSON.stringify(full));
      setPage("home");
      return;
    }

    alert("Invalid Net ID. Please enter an approved Net ID or type 'Guest'.");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    setPage("home");
  };

  // support legacy slugs
  const legacyMap = {
    "inventory-hub": "inventory",
    "inventory-equipment": "inventory-equipment",
    "inventory-inuse": "inventory-inuse",
    "audio-inventory": "audio",
  };
  const effectivePage = legacyMap[page] || page;

  const openPDF = (url, title = "Document") => {
    setPdfData({ url, title });
    setPage("pdf");
  };

  const openGallery = (images, title = "Gallery") => {
    setGalleryData({ images, title });
    setPage("gallery");
  };

  // ===== LOGIN SCREEN =====
  if (!user) {
    return (
      <div className="login-page" style={loginPageStyle}>
        <div className="login-card" style={loginCardStyle}>
          <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
            <h1 style={{ margin: 0 }}>StageVault</h1>
            <p
              style={{ opacity: 0.6, marginTop: "0.4rem", fontSize: "0.75rem" }}
            >
              NYUAD Arts Center · Internal
            </p>
          </div>
          <LoginForm onLogin={handleLogin} />
          <p
            style={{
              opacity: 0.55,
              fontSize: "0.68rem",
              marginTop: "0.75rem",
              textAlign: "center",
            }}
          >
            Enter your <strong>Net ID</strong> to access the app. Type{" "}
            <strong>Guest</strong> for limited venue-only access.
          </p>
        </div>
      </div>
    );
  }

  // ===== GUEST VIEW =====
  if (user.role === "guest") {
    return (
      <div className="app">
        <header className="app-header">
          <div className="menu-container">
            <button className="btn dark" onClick={handleLogout}>
              Logout ({user.id})
            </button>
          </div>
        </header>

        {/* ⭐ page wrapper for guest content */}
        <div className="page">
          <Venues
            openPDF={openPDF}
            openGallery={openGallery}
            setPage={setPage}
          />
        </div>

        {/* full-screen overlays should stay OUTSIDE .page */}
        {effectivePage === "pdf" && pdfData && (
          <PDFViewer
            src={pdfData.url}
            title={pdfData.title}
            onBack={() => setPage("venues")}
          />
        )}
        {effectivePage === "gallery" && galleryData && (
          <PhotoGallery
            images={galleryData.images}
            title={galleryData.title}
            onBack={() => setPage("venues")}
          />
        )}
      </div>
    );
  }

  // ===== FULL ACCESS VIEW =====
  return (
    <div className="app">
      <Header setPage={setPage} page={effectivePage} />

      {/* user badge stays fixed */}
      <div
        style={{
          position: "fixed",
          top: 8,
          right: 10,
          fontSize: "0.7rem",
          opacity: 0.6,
          zIndex: 1200,
        }}
      >
        {user.id}
        {" · "}
        <button
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          logout
        </button>
      </div>

      {/* ⭐ main page wrapper */}
      <main className="page">
        {effectivePage === "home" && <Home setPage={setPage} />}

        {/* Inventory hub (choose Stage or Audio) */}
        {effectivePage === "inventory" && <InventoryHub setPage={setPage} />}

        {/* Stage Inventory — your existing inventory page */}
        {effectivePage === "inventory-stage" && <Inventory />}

        {/* Audio Inventory — new page (ONLY ONCE) */}
        {effectivePage === "audio" && <AudioInventory />}

        {/* 🔹 NEW: Video Inventory */}
        {effectivePage === "inventory-video" && <VideoInventory />}

        {/* EXISTING */}
        {effectivePage === "inventory-equipment" && (
          <InvEquipment setPage={setPage} />
        )}
        {effectivePage === "inventory-inuse" && <InvInUse setPage={setPage} />}
        {effectivePage === "showList" && <ShowSpecs />}
        {effectivePage === "venues" && (
          <Venues
            openPDF={openPDF}
            openGallery={openGallery}
            setPage={setPage}
          />
        )}
        {effectivePage === "suppliers" && <Suppliers setPage={setPage} />}
        {effectivePage === "rigCalc" && <RiggingCalc />}
        {effectivePage === "schedule" && <Schedule />}
        {effectivePage === "how-to-cad" && <HowToCAD />}

        {/* ⭐ NEW: Spaces Usage page */}
        {effectivePage === "spaces-usage" && <SpacesUsage />}

        {/* ✅ Restricted: Purchase Orders page */}
        {effectivePage === "purchaseorders" ? (
          RESTRICTED_ACCESS.includes(user.id) ? (
            <POs setPage={setPage} />
          ) : (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                opacity: 0.7,
                fontSize: "0.9rem",
              }}
            >
              🚫 You do not have access to the Purchase Orders page.
            </div>
          )
        ) : null}

        {/* ✅ Production Status Hub + Department pages */}
        {effectivePage === "productionstatus" && (
          <StatusHub setPage={setPage} />
        )}

        {effectivePage === "productionstatus-stage" && (
          <ProductionStatus
            title="Stage — Production Status"
            dataUrl={urlForSheet("Events Checklist")}
            onBack={() => setPage("productionstatus")}
            hideOwner={false}
          />
        )}

        {effectivePage === "productionstatus-audio" && (
          <ProductionStatus
            title="Audio — Production Status"
            dataUrl={urlForSheet("Checklist- Audio")}
            onBack={() => setPage("productionstatus")}
            hideOwner={true}
          />
        )}

        {/* ✅ Restricted: Hours pages */}
        {["hours", "hours-josie", "hours-gareth"].includes(effectivePage) ? (
          RESTRICTED_ACCESS.includes(user.id) ? (
            <>
              {effectivePage === "hours" && <Hours setPage={setPage} />}
              {effectivePage === "hours-josie" && (
                <PersonHours person="josie" setPage={setPage} />
              )}
              {effectivePage === "hours-gareth" && (
                <PersonHours person="gareth" setPage={setPage} />
              )}
            </>
          ) : (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                opacity: 0.7,
                fontSize: "0.9rem",
              }}
            >
              🚫 You do not have access to the Hours page.
            </div>
          )
        ) : null}
      </main>

      {/* ⭐ overlays OUTSIDE .page so they can be full-width */}
      {effectivePage === "pdf" && pdfData && (
        <PDFViewer
          src={pdfData.url}
          title={pdfData.title}
          onBack={() => setPage("venues")}
        />
      )}
      {effectivePage === "gallery" && galleryData && (
        <PhotoGallery
          images={galleryData.images}
          title={galleryData.title}
          onBack={() => setPage("venues")}
        />
      )}
    </div>
  );
}

/* ===== small inline login form component ===== */
function LoginForm({ onLogin }) {
  const [val, setVal] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onLogin(val);
  };

  return (
    <form onSubmit={submit} className="login-form">
      <label style={{ display: "block", marginBottom: "0.75rem" }}>
        <span
          style={{
            display: "block",
            marginBottom: "0.35rem",
            fontSize: "0.78rem",
          }}
        >
          Net ID
        </span>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Enter Net ID or 'Guest'"
          style={{
            width: "100%",
            background: "rgba(15,23,42,0.35)",
            border: "1px solid rgba(148,163,184,0.35)",
            borderRadius: "10px",
            padding: "0.5rem 0.6rem",
            color: "white",
          }}
          autoFocus
        />
      </label>
      <button type="submit" className="btn primary" style={{ width: "100%" }}>
        Enter
      </button>
    </form>
  );
}

/* ===== inline styles ===== */
const loginPageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #111827, #020617 60%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1.5rem",
};

const loginCardStyle = {
  background: "rgba(15,23,42,0.5)",
  border: "1px solid rgba(148,163,184,0.18)",
  borderRadius: "18px",
  padding: "1.5rem 1.6rem 1.5rem",
  width: "min(380px, 96vw)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 12px 45px rgba(0,0,0,0.25)",
};

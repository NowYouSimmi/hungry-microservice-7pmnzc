import React, { useState } from "react";
import RedTheatreInfo from "../venues/RedTheatreInfo.jsx";
import BlackBoxInfo from "../venues/BlackBoxInfo.jsx";
import BlueHallInfo from "../venues/BlueHallInfo.jsx";
import LoadingInfo from "../venues/LoadingInfo.jsx";
import EastPlazaInfo from "../venues/EastPlazaInfo.jsx"; // ⭐ NEW IMPORT

export default function Venues({ openPDF, openGallery, setPage }) {
  const [selectedVenue, setSelectedVenue] = useState(null);

  if (selectedVenue === "red") {
    return (
      <RedTheatreInfo
        openPDF={openPDF}
        openGallery={openGallery}
        onBack={() => setSelectedVenue(null)}
      />
    );
  }

  if (selectedVenue === "black") {
    return (
      <BlackBoxInfo
        openPDF={openPDF}
        openGallery={openGallery}
        onBack={() => setSelectedVenue(null)}
      />
    );
  }

  if (selectedVenue === "blue") {
    return (
      <BlueHallInfo
        openPDF={openPDF}
        openGallery={openGallery}
        onBack={() => setSelectedVenue(null)}
      />
    );
  }

  // ⭐ NEW: East Plaza page
  if (selectedVenue === "east") {
    return <EastPlazaInfo onBack={() => setSelectedVenue(null)} />;
  }

  // Loading Dock Info
  if (selectedVenue === "loading") {
    return <LoadingInfo onBack={() => setSelectedVenue(null)} />;
  }

  return (
    <div className="page">
      <h1>Venues</h1>

      <div
        className="home-actions"
        style={{
          display: "grid",
          gap: "12px",
          maxWidth: "360px",
          margin: "1rem auto",
        }}
      >
        <button className="btn dark" onClick={() => setSelectedVenue("red")}>
          Red Theatre
        </button>

        <button className="btn dark" onClick={() => setSelectedVenue("black")}>
          Black Box
        </button>

        <button className="btn dark" onClick={() => setSelectedVenue("blue")}>
          Blue Hall
        </button>

        {/* ⭐ UPDATED: now opens real EastPlazaInfo */}
        <button className="btn dark" onClick={() => setSelectedVenue("east")}>
          East Plaza
        </button>

        <button
          className="btn dark"
          onClick={() => setSelectedVenue("loading")}
        >
          Loading Info
        </button>
      </div>

      <button
        className="btn ghost"
        style={{ marginTop: "1.5rem" }}
        onClick={() => setPage("home")}
      >
        ← Back to Home
      </button>
    </div>
  );
}

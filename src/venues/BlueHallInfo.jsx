import React, { useState } from "react";

export default function BlueHallInfo({ openPDF, openGallery }) {
  const [openSections, setOpenSections] = useState({
    location: false,
    access: false,
    stage: false,
    pit: false,
    seating: false,
    rigging: false,
    loose: false,
    masking: false,
    accessEquip: false,
    backstage: false,
    flybars: false,
    photos: false,
    docs: false,
  });

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const labelColor = "#a78bfa";
  const valueColor = "#ffffff";
  const smallColor = "#d1d5db";

  const label = { color: labelColor, fontWeight: 600 };
  const value = { color: valueColor };

  // 📸 BLUE HALL PHOTO LIBRARY (your real files)
  const blueHallPhotos = [
    "RH fish eye.jpg",
    "RH stage.jpg",
    "Blue Hall .jpg", // yes, with the space before .jpg
  ];

  // 📄 BLUE HALL INFO-DOC IMAGES (the layouts/sections you just showed)
  // put these in: /public/Photos/BlueHallDocs/
  const blueHallDocImages = [
    {
      title: "Blue Hall – Layout 1",
      imgFile: "Recital Blue Hall-Layout1.pdf.jpg",
    },
    {
      title: "Blue Hall – Plan",
      imgFile: "Recital Blue Hall.pdf.jpg",
    },
    {
      title: "Blue Hall – Section",
      imgFile: "Recital Blue Hall section.pdf.jpg",
    },
    {
      title: "Blue Hall – Dimensioned / ID",
      imgFile: "Recital Blue Hall ID.pdf.jpg",
    },
  ];

  const openGalleryFallback = (path) => {
    window.open(path, "_blank", "noopener,noreferrer");
  };

  const Section = ({ id, title, children }) => (
    <div
      style={{
        marginBottom: "1rem",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        paddingBottom: "1rem",
      }}
    >
      <button
        onClick={() => toggleSection(id)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          color: "#ffffff",
          fontSize: "1.05rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          padding: "0.3rem 0",
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
          {openSections[id] ? "▾" : "▸"}
        </span>
      </button>

      {openSections[id] && (
        <div
          style={{
            marginTop: "0.75rem",
            paddingLeft: "0.5rem",
            display: "grid",
            gap: "0.35rem",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        maxWidth: "70rem",
        margin: "0 auto",
        padding: "1.5rem 2rem 3rem",
        color: "#ffffff",
        backgroundColor: "transparent",
        lineHeight: 1.6,
      }}
    >
      <h1
        style={{
          fontSize: "1.9rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          color: "#ffffff",
        }}
      >
        Blue Hall — Technical Specification
      </h1>

      {/* 2. ACCESS & LOADING */}
      <Section id="access" title="Access & Loading">
        <p>
          <span style={label}>Loading Bay:</span>{" "}
          <span style={value}>Underground, vehicles under 3.3 m</span>
        </p>
        <p>
          <span style={label}>Vehicle Access Pass:</span>{" "}
          <span style={value}>Required prior to arrival</span>
        </p>
        <p>
          <span style={label}>Load Route:</span>{" "}
          <span style={value}>Trucks → cargo lift → workshop → venue</span>
        </p>
        <p
          style={{
            color: smallColor,
            fontSize: "0.85rem",
            marginTop: "0.4rem",
          }}
        >
          <span style={label}>Cargo Lift:</span> 7,500 kg; door 2.9 m × 2.9 m;
          internal: diagonal 2.55 m, length 5.24 m, height 2.56 m.
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          <span style={label}>Stage Right load-in doors:</span> 2.9 m (w) × 2.8
          m (h)
        </p>
      </Section>

      {/* 3. STAGE */}
      <Section id="stage" title="Stage">
        <p>
          <span style={label}>Type:</span>{" "}
          <span style={value}>Recital hall stage</span>
        </p>
        <p>
          <span style={label}>Depth of stage:</span>{" "}
          <span style={value}>6.8 m (22.5 ft)</span>
        </p>
        <p>
          <span style={label}>Width:</span>{" "}
          <span style={value}>12 m (40 ft)</span>
        </p>
        <p>
          <span style={label}>Height:</span>{" "}
          <span style={value}>9 m (30 ft)</span>
        </p>
        <p>
          <span style={label}>Natural floor:</span>{" "}
          <span style={value}>Blonde wood</span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Steps from auditorium to stage (these can be covered).
        </p>
      </Section>

      {/* 4. PIT / LIFT (none) */}
      <Section id="pit" title="Orchestra Pit / Stage Lift">
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Blue Hall does not include a dedicated orchestra pit / stage lift. Use
          auditorium-to-stage steps for access.
        </p>
      </Section>

      {/* 5. SEATING */}
      <Section id="seating" title="Seating">
        <p>
          <span style={label}>Stalls:</span> <span style={value}>150</span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Capacity may reduce for cameras, tech desk, or floor staging.
        </p>
      </Section>

      {/* 6. RIGGING & FLYING */}
      <Section id="rigging" title="Rigging & Flying">
        <p>
          <span style={label}>Control System:</span>{" "}
          <span style={value}>
            Raynok Imperium operator console (in-house operator provided)
          </span>
        </p>
        <p>
          <span style={label}>Motorised Fly Bars:</span>{" "}
          <span style={value}>7</span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Because of the permanent lighting rig, projection screen and
          microphones, bars <strong>1, 3, 5, 6 and 7</strong> are unavailable
          unless agreed with Head of Lighting & Director of Production.
        </p>
      </Section>

      {/* 7. LOOSE EQUIPMENT */}
      <Section id="loose" title="Loose Equipment">
        <p>
          <span style={label}>Note:</span>{" "}
          <span style={value}>
            Must be requested in advance and is dependent on availability.
          </span>
        </p>
        <p style={{ marginTop: "0.4rem" }}>
          <span style={label}>Truss:</span>{" "}
          <span style={value}>
            Prolyte X30V (3 m, 2 m, 1.5 m, 1 m) silver; Prolyte X30D Trilyte (3
            m, 1 m) silver; Prolyte H30L ladder (3 m) black; Thomas GP12 (3 m, 2
            m, 1.5 m, 1 m) silver
          </span>
        </p>
        <p>
          <span style={label}>LiteDeck:</span>{" "}
          <span style={value}>
            4 ft × 8 ft (1.2 m × 2.4 m), 4 ft × 4 ft (1.2 m × 1.2 m), 1 m × 2 m
          </span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Selection of handrails, pre-cut legs and steps available.
        </p>
        <p>
          <span style={label}>Orchestra chairs:</span>{" "}
          <span style={value}>Wenger Symphony or Nota</span>
        </p>
        <p>
          <span style={label}>Conductor:</span>{" "}
          <span style={value}>Wenger conductor riser & music stand</span>
        </p>
      </Section>

      {/* 8. MASKING / ACOUSTICS */}
      <Section id="masking" title="Acoustics & Masking">
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          13 motorised acoustic banners on 3 walls, individually adjustable.
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Curved, live-sounding sycamore walls and a vaulted ceiling.
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Additional black masking can be added on request.
        </p>
      </Section>

      {/* 9. ACCESS EQUIPMENT */}
      <Section id="accessEquip" title="Access Equipment">
        <p>
          <span style={label}>Genie DPL-35s:</span>{" "}
          <span style={value}>Lifts 2 people to 40 ft (12 m)</span>
        </p>
        <p>
          <span style={label}>Genie AWP-40s:</span>{" "}
          <span style={value}>Lifts 1 person to 46 ft (14 m)</span>
        </p>
        <p>
          <span style={label}>Ladders:</span>{" "}
          <span style={value}>6 ft – 16 ft (1.8 m – 4.8 m)</span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          In-house operators unless touring technicians are IPAF certified.
        </p>
      </Section>

      {/* 10. BACKSTAGE */}
      <Section id="backstage" title="Backstage Accommodations">
        <p>
          <span style={label}>Dressing rooms (2 pax):</span>{" "}
          <span style={value}>Rooms 37 & 38</span>
        </p>
        <p>
          <span style={label}>Dressing rooms (8 pax):</span>{" "}
          <span style={value}>Rooms 11, 16, 17 & 44</span>
        </p>
        <p>
          <span style={label}>Dressing rooms (12 pax):</span>{" "}
          <span style={value}>Rooms 22, 23, 34 & 35</span>
        </p>
        <p style={{ marginTop: "0.35rem" }}>
          <span style={label}>Wardrobe:</span>{" "}
          <span style={value}>
            2 × washing machines, 2 × dryers, ironing & steaming equipment,
            sewing machines
          </span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Wardrobe technician can be arranged if requested in advance.
        </p>
        <p>
          <span style={label}>Green Room:</span>{" "}
          <span style={value}>Available</span>
        </p>
      </Section>

      {/* 11. FLY BAR SPECS / LIGHTING */}
      <Section id="flybars" title="Fly Bar Specs / LX / AV">
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          7 motorised fly bars in total. Because of permanent lighting rig,
          projection screen and microphones, bars 1, 3, 5, 6 & 7 are usually
          unavailable. Speak to Head of Lighting for exceptions.
        </p>

        <div
          style={{
            display: "grid",
            gap: "0.4rem",
            marginTop: "0.6rem",
          }}
        >
          <BHBarLine
            bar="1"
            status="Unavailable"
            note="Permanent LX / projection"
            label={label}
            value={value}
          />
          <BHBarLine
            bar="2"
            status="Available"
            note="By arrangement"
            label={label}
            value={value}
          />
          <BHBarLine
            bar="3"
            status="Unavailable"
            note="Mic / LX"
            label={label}
            value={value}
          />
          <BHBarLine
            bar="4"
            status="Available"
            note="By arrangement"
            label={label}
            value={value}
          />
          <BHBarLine
            bar="5"
            status="Unavailable"
            note="Fixed rig"
            label={label}
            value={value}
          />
          <BHBarLine
            bar="6"
            status="Unavailable"
            note="Fixed rig"
            label={label}
            value={value}
          />
          <BHBarLine
            bar="7"
            status="Unavailable"
            note="Fixed rig / screen"
            label={label}
            value={value}
          />
        </div>

        <p
          style={{
            color: smallColor,
            fontSize: "0.78rem",
            marginTop: "0.6rem",
          }}
        >
          Lighting: ETC Ion (4 universe), ETC Sensor 3 dimmers, houselights DMX,
          fixed overhead rig (VL550 & Lustr+), LED Lustr+ rehearsal/performance,
          3 × FOH lighting bridges.
        </p>
        <p style={{ color: smallColor, fontSize: "0.78rem" }}>
          Audio: Yamaha CL3, Meyer UP1A; on request: Meyer Mina array, Meyer
          HP500 subs.
        </p>
        <p style={{ color: smallColor, fontSize: "0.78rem" }}>
          Video: Christie L2K1500 2K projector, 6.35 m × 3.57 m perforated
          Stewart screen (white), cameras: Panasonic AK-HC1800, Panasonic
          HE-130.
        </p>
      </Section>

      {/* 12. PHOTO LIBRARY (your real three images) */}
      <Section id="photos" title="Photo Library">
        <p style={{ color: "#d1d5db", fontSize: "0.85rem" }}>
          Reference photos of Blue Hall — audience view, recital setup, and
          empty stage.
        </p>

        <div
          style={{
            marginTop: "0.8rem",
            display: "grid",
            gap: "0.9rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          }}
        >
          {blueHallPhotos.map((filename) => {
            const encoded = encodeURIComponent(filename);
            const src = `/Photos/Blue%20Hall/${encoded}`;
            return (
              <figure
                key={filename}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                <img
                  src={src}
                  alt={filename}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    display: "block",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const all = blueHallPhotos.map(
                      (f) => `/Photos/Blue%20Hall/${encodeURIComponent(f)}`
                    );
                    if (openGallery) {
                      openGallery(all, "Blue Hall – Photo Library");
                    } else {
                      openGalleryFallback(src);
                    }
                  }}
                />
                <figcaption
                  style={{
                    fontSize: "0.7rem",
                    color: "#d1d5db",
                    padding: "0 0.4rem 0.4rem",
                    wordBreak: "break-word",
                  }}
                >
                  {filename}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Section>

      {/* 13. INFO DOCUMENTS */}
      <Section id="docs" title="Info Documents">
        <p style={{ color: "#d1d5db", fontSize: "0.85rem" }}>
          Blue Hall plan, layout and section as image previews. Click to view
          larger.
        </p>

        <div
          style={{
            marginTop: "0.8rem",
            display: "grid",
            gap: "0.9rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}
        >
          {blueHallDocImages.map((doc) => {
            const encoded = encodeURIComponent(doc.imgFile);
            const src = `/Photos/BlueHallDocs/${encoded}`;
            return (
              <figure
                key={doc.title}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                <img
                  src={src}
                  alt={doc.title}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    display: "block",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const all = blueHallDocImages.map((d) => {
                      const e2 = encodeURIComponent(d.imgFile);
                      return `/Photos/BlueHallDocs/${e2}`;
                    });
                    if (openGallery) {
                      openGallery(all, "Blue Hall – Info Documents");
                    } else {
                      openGalleryFallback(src);
                    }
                  }}
                />
                <figcaption
                  style={{
                    fontSize: "0.7rem",
                    color: "#d1d5db",
                    padding: "0 0.4rem 0.4rem",
                    wordBreak: "break-word",
                  }}
                >
                  {doc.title}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Section>

      <p
        style={{
          color: "#9ca3af",
          fontSize: "0.75rem",
          marginTop: "1.25rem",
          fontStyle: "italic",
        }}
      >
        *All technical data subject to confirmation with Director of Production
        and Head of Stage.*
      </p>
    </div>
  );
}

/* helper for the short 7-bar rig in Blue Hall */
function BHBarLine({ bar, status, note, label, value }) {
  const isUnavailable = status && status.toLowerCase() === "unavailable";
  return (
    <div
      style={{
        backgroundColor: isUnavailable
          ? "rgba(239, 68, 68, 0.12)"
          : "rgba(255,255,255,0.015)",
        border: `1px solid ${
          isUnavailable ? "rgba(239, 68, 68, 0.6)" : "rgba(167,139,250,0.08)"
        }`,
        borderRadius: "8px",
        padding: "0.45rem 0.7rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
      }}
    >
      <span style={{ ...label, minWidth: "62px" }}>Bar {bar}</span>
      <span style={value}>
        <strong style={label}>Status:</strong> {status}
      </span>
      {note ? (
        <span style={value}>
          <strong style={label}>Note:</strong> {note}
        </span>
      ) : null}
    </div>
  );
}

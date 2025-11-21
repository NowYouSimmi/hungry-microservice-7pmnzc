import React, { useState } from "react";

export default function BlackBoxInfo({ openPDF, openGallery }) {
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
    flybars: false, // we'll repurpose for "gantry & hoist tracks"
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

  // PHOTOS – these are the Black Box pics from your earlier snippet
  const blackBoxPhotos = [
    "Black Box.jpg",
    "Black Box (1).jpg",
    "Black Box 2.jpg",
    "Black BoxEnd On.jpg",
    "Black Box for Toshi.jpg",
    "Black Box Catwalk.JPG",
    "BB Farfalle.jpg",
  ];

  // DOC IMAGES – your Black Box drawings that you said live in public/photos/RedTheatreDocs
  const blackBoxDocImages = [
    {
      title: "EBT Black Box Thrust – A4 Layout",
      imgFile: "EBT Black Box Thrust-A4 Layout.pdf.jpg",
      // if you later put the actual PDF in /docs, add pdf: "/docs/..."
    },
    {
      title: "Black Box Studio Section 2018",
      imgFile: "Black Box Studio Section  2018.pdf.jpg", // note the double space
    },
    {
      title: "Black Box Studio 2018 – Plan",
      imgFile: "Black Box Studio 2018.pdf.jpg",
    },
    {
      title: "Black Box Studio 2018 – End On",
      imgFile: "Black Box Studio 2018 End on.pdf.jpg",
    },
    {
      title: "Black Box End On Stage",
      imgFile: "Black Box End On Stage.pdf.jpg",
    },
    {
      title: "Black Box 227",
      imgFile: "Black Box 227.pdf.jpg",
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
        Black Box — Technical Specification
      </h1>

      {/* 2. ACCESS & LOADING */}
      <Section id="access" title="Access & Loading">
        <p>
          <span style={label}>Loading Bay:</span>{" "}
          <span style={value}>Underground, vehicles under 3.3 m</span>
        </p>
        <p>
          <span style={label}>Vehicle Access Pass:</span>{" "}
          <span style={value}>Required before arrival</span>
        </p>
        <p>
          <span style={label}>Load Route:</span>{" "}
          <span style={value}>Trucks → cargo lift → workshop → Black Box</span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          <span style={label}>Cargo Lift:</span> 7,500 kg; door 2.9 m × 2.9 m;
          internal: diagonal 2.55 m, length 5.24 m, height 2.56 m
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          <span style={label}>Stage Left load-in door:</span> 2.9 m (W) × 2.8 m
          (H)
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          <span style={label}>Note:</span> Access from cargo lift to the Black
          Box uses corridors with smaller turning circles. Coordinate with the
          Director of Production for oversized scenic.
        </p>
      </Section>

      {/* 3. STAGE / ROOM */}
      <Section id="stage" title="Stage / Room">
        <p>
          <span style={label}>Type:</span>{" "}
          <span style={value}>Black Box / Various configurations</span>
        </p>
        <p>
          <span style={label}>Depth of Room:</span>{" "}
          <span style={value}>18 m (61 ft)</span>
        </p>
        <p>
          <span style={label}>Width of Room:</span>{" "}
          <span style={value}>17 m (58 ft)</span>
        </p>
        <p>
          <span style={label}>Height to Gantry:</span>{" "}
          <span style={value}>7 m (22 ft)</span>
        </p>
        <p>
          <span style={label}>End-on Stage Depth:</span>{" "}
          <span style={value}>7 m (22 ft)</span>
        </p>
        <p>
          <span style={label}>Floor:</span>{" "}
          <span style={value}>Black wood (natural)</span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          <span style={label}>Dance Floor:</span> Black vinyl dance floor
          available on request.
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          <span style={label}>Doors:</span> 3 single access doors to upstage; 2
          double doors for audience on DS wall.
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          <span style={label}>Technical Gantry / Catwalks:</span> Catwalks above
          performance area with multiple rigging points; gantry around upper
          level for operator positions.
        </p>
      </Section>

      {/* 4. PIT / STAGE LIFTS */}
      <Section id="pit" title="Stage Lifts (Central)">
        <p>
          <span style={label}>System:</span>{" "}
          <span style={value}>Serapid rigid chain lift system</span>
        </p>
        <p>
          <span style={label}>Quantity:</span>{" "}
          <span style={value}>4 × stage lifts (individually or together)</span>
        </p>
        <p>
          <span style={label}>Single Lift Size:</span>{" "}
          <span style={value}>7.3 m × 3.1 m</span>
        </p>
        <p>
          <span style={label}>Total Platform Size:</span>{" "}
          <span style={value}>14.6 m (W) × 6.2 m (D) – 48 ft × 20 ft</span>
        </p>
        <p>
          <span style={label}>Highest Point:</span>{" "}
          <span style={value}>+600 mm</span>
        </p>
        <p>
          <span style={label}>Lowest Point:</span>{" "}
          <span style={value}>–600 mm</span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Lifts can act as a central stage (raised) or lowered for audience
          seating.
        </p>
      </Section>

      {/* 5. SEATING */}
      <Section id="seating" title="Seating">
        <p>
          <span style={label}>Portable Audience Chairs:</span>{" "}
          <span style={value}>272 × Wenger</span>
        </p>
        <p>
          <span style={label}>Full Seating Bank (floor level):</span>{" "}
          <span style={value}>147</span>
        </p>
        <p>
          <span style={label}>Full Seating Bank (into lowered pit):</span>{" "}
          <span style={value}>179</span>
        </p>
        <p>
          <span style={label}>Courtesy Seating Only:</span>{" "}
          <span style={value}>28</span>
        </p>
        <p>
          <span style={label}>Standing Room Only:</span>{" "}
          <span style={value}>330</span>
        </p>
        <p>
          <span style={label}>In-the-Round Seating:</span>{" "}
          <span style={value}>170</span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Seating capacity will vary depending on production desk size and
          position.
        </p>
      </Section>

      {/* 6. RIGGING & FLYING (Black Box version) */}
      <Section id="rigging" title="Rigging & Flying">
        <p>
          <span style={label}>Control System:</span>{" "}
          <span style={value}>
            Raynok Imperium operator console (in-house operator provided)
          </span>
        </p>
        <p>
          <span style={label}>Hoists:</span>{" "}
          <span style={value}>12 × moveable chain hoists, each 250 kg WLL</span>
        </p>
        <p>
          <span style={label}>Tracks:</span>{" "}
          <span style={value}>
            Tracks running US/DS and SL/SR (tracks marked in green on plan)
          </span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Use gantry / catwalk rigging points above performance area; confirm
          any unusual loads with Technical Team.
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
            Prolyte X30V (3 m, 2 m, 1.5 m, 1 m), Prolyte X30D Trilyte (3 m, 1
            m), Prolyte H30L Ladder (3 m), Thomas GP12 (3 m, 2 m, 1.5 m, 1 m)
          </span>
        </p>
        <p>
          <span style={label}>Chain Hoist:</span>{" "}
          <span style={value}>320 kg D8+ (silver or black) + control</span>
        </p>
        <p>
          <span style={label}>LiteDeck:</span>{" "}
          <span style={value}>
            4 ft × 8 ft (1.2 m × 2.4 m), 4 ft × 4 ft (1.2 m × 1.2 m), 1 m × 2 m
          </span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Handrails, pre-cut legs and steps available on request.
        </p>
        <p>
          <span style={label}>Orchestra Chairs:</span>{" "}
          <span style={value}>Wenger Symphony / Nota</span>
        </p>
        <p>
          <span style={label}>Conductor:</span>{" "}
          <span style={value}>Wenger conductor riser & music stand</span>
        </p>
      </Section>

      {/* 8. MASKING */}
      <Section id="masking" title="Masking">
        <p>
          <span style={label}>Legs:</span>{" "}
          <span style={value}>4 × 9 m + 8 (venue stock)</span>
        </p>
        <p>
          <span style={label}>Borders:</span>{" "}
          <span style={value}>8 × 1.5 m — 3</span>
        </p>
        <p>
          <span style={label}>Full Black:</span>{" "}
          <span style={value}>13.8 m × 6.1 m — 1</span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Perforated metal walls can be dressed with black masking if required.
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          All touring scenic elements should be non-combustible / IFR. Timber
          should meet Class 1 to BS 476 Pt 7, with visible stamp or
          certification.
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
          <span style={label}>Dressing Rooms (2 pax):</span>{" "}
          <span style={value}>Rooms 37 & 38</span>
        </p>
        <p>
          <span style={label}>Dressing Rooms (8 pax):</span>{" "}
          <span style={value}>Rooms 11, 16, 17 & 44</span>
        </p>
        <p>
          <span style={label}>Dressing Rooms (12 pax):</span>{" "}
          <span style={value}>Rooms 22, 23, 34 & 35</span>
        </p>
        <p style={{ marginTop: "0.4rem" }}>
          <span style={label}>Wardrobe:</span>{" "}
          <span style={value}>
            2 × washing machines, 2 × dryers, ironing & steaming equipment,
            sewing machines
          </span>
        </p>
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Wardrobe technician can be arranged if requested in advance.
        </p>
        <p style={{ marginTop: "0.4rem" }}>
          <span style={label}>Company Office:</span>{" "}
          <span style={value}>
            13 A power, desk, sofa, printer, fridge/freezer, sink (if available)
          </span>
        </p>
        <p>
          <span style={label}>Green Room:</span>{" "}
          <span style={value}>Available</span>
        </p>
      </Section>

      {/* 11. FLY BAR SPECS (Black Box variant) */}
      <Section id="flybars" title="Gantry, catwalks & hoist tracks">
        <p style={{ color: smallColor, fontSize: "0.85rem" }}>
          Black Box does not use a theatre-style 35-line fly tower like Red
          Theatre. Instead it uses gantry / catwalk access with
          Raynok-controlled moveable chain hoists (12 × 250 kg) on US/DS and
          SL/SR tracks. Confirm track positions on the plan export.
        </p>
        <div
          style={{
            display: "grid",
            gap: "0.4rem",
            marginTop: "0.5rem",
          }}
        >
          <BBTrackLine
            name="US–DS Track 1"
            wll="3 × 250 kg"
            notes="Moveable; Raynok control"
            label={label}
            value={value}
          />
          <BBTrackLine
            name="US–DS Track 2"
            wll="3 × 250 kg"
            notes="Moveable; Raynok control"
            label={label}
            value={value}
          />
          <BBTrackLine
            name="SL–SR Track 1"
            wll="3 × 250 kg"
            notes="Moveable; Raynok control"
            label={label}
            value={value}
          />
          <BBTrackLine
            name="SL–SR Track 2"
            wll="3 × 250 kg"
            notes="Moveable; Raynok control"
            label={label}
            value={value}
          />
        </div>
      </Section>

      {/* 12. PHOTO LIBRARY (Black Box) */}
      <Section id="photos" title="Photo Library">
        <p style={{ color: "#d1d5db", fontSize: "0.85rem" }}>
          Reference photos of Black Box — different seating, lighting and stage
          configurations.
        </p>

        <div
          style={{
            marginTop: "0.8rem",
            display: "grid",
            gap: "0.9rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          }}
        >
          {blackBoxPhotos.map((filename) => {
            const encoded = encodeURIComponent(filename);
            const src = `/Photos/Black%20Box/${encoded}`;
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
                    const all = blackBoxPhotos.map(
                      (f) => `/Photos/Black%20Box/${encodeURIComponent(f)}`
                    );
                    if (openGallery) {
                      openGallery(all, "Black Box – Photo Library");
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

      {/* 13. INFO DOCUMENTS (Black Box drawings as images) */}
      <Section id="docs" title="Info Documents">
        <p style={{ color: "#d1d5db", fontSize: "0.85rem" }}>
          Black Box plans, sections, end-on and thrust layouts — exported to
          image. Stored in <code>/photos/RedTheatreDocs/</code> for now.
        </p>

        <div
          style={{
            marginTop: "0.8rem",
            display: "grid",
            gap: "0.9rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}
        >
          {blackBoxDocImages.map((doc) => {
            const encoded = encodeURIComponent(doc.imgFile);
            const src = `/photos/RedTheatreDocs/${encoded}`;
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
                    const all = blackBoxDocImages.map((d) => {
                      const e2 = encodeURIComponent(d.imgFile);
                      return `/photos/RedTheatreDocs/${e2}`;
                    });
                    if (openGallery) {
                      openGallery(all, "Black Box – Info Documents");
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

        {/* optional PDF links if you add them later */}
        {blackBoxDocImages.some((d) => d.pdf) ? (
          <div style={{ marginTop: "1rem" }}>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "0.75rem",
                marginBottom: "0.35rem",
              }}
            >
              Original PDFs:
            </p>
            {blackBoxDocImages.map((doc) =>
              doc.pdf ? (
                <div key={doc.title}>
                  <a
                    href={doc.pdf}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#a78bfa",
                      fontSize: "0.75rem",
                      textDecoration: "underline",
                    }}
                  >
                    {doc.title}
                  </a>
                </div>
              ) : null
            )}
          </div>
        ) : null}
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

/* Black Box "line" for gantry/hoist tracks to keep the flybars layout alive */
function BBTrackLine({ name, wll, notes, label, value }) {
  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.015)",
        border: "1px solid rgba(167,139,250,0.08)",
        borderRadius: "8px",
        padding: "0.45rem 0.7rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
      }}
    >
      <span style={{ ...label, minWidth: "120px" }}>{name}</span>
      <span style={value}>
        <strong style={label}>Capacity:</strong> {wll}
      </span>
      {notes ? (
        <span style={value}>
          <strong style={label}>Notes:</strong> {notes}
        </span>
      ) : null}
    </div>
  );
}

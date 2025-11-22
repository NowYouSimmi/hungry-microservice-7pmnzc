// src/pages/ShowSpecs.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";

/* =========================================================
   CONSTANTS
   ========================================================= */
const DATA_URL =
  "https://script.google.com/macros/s/AKfycbw-LKx4-dCTaoSIaW0U8vbP2R8m8QCEgZpvvGS1JgVLUHWvwRzKJj-c7s6hCRd_NpA/exec";

// Lighting (LX)
const LIGHTING_URL =
  "https://script.google.com/macros/s/AKfycbyGGTU9IvrJtQaEOgDuIQfjGzz-kSWKNGwl-2iVELpek7doiyhZ-xE764BVJLSTsD_u/exec";

// Audio
const AUDIO_URL =
  "https://script.google.com/macros/s/AKfycbxkzWHBU2kziNfywtkh7SFp3W6GdVFuQX61bOFKWf8u11AXarNa3P4LQQq4AkxSnauA/exec";

// Video
const VIDEO_URL =
  "https://script.google.com/macros/s/AKfycbwBQZDVvoNJzovW5bIapJBLApT9AYWva-nxpmc2T3Uybo0K5S6k2yy_JyF3bSGcSnTy/exec";

// Shared button style
const buttonStyle = {
  background: "#1d1d1f",
  border: "1px solid #333",
  color: "#fff",
  borderRadius: "6px",
  padding: "6px 10px",
  minWidth: "160px",
  textAlign: "left",
  cursor: "pointer",
  height: "34px",
};

/* =========================================================
   UTILS
   ========================================================= */
function isCancelledShow(s) {
  if (!s) return false;
  if (s.cancelled === true) return true;
  if (s.cancelled && String(s.cancelled).toLowerCase() === "cancelled")
    return true;
  if (s.status && String(s.status).toLowerCase() === "cancelled") return true;
  if (s.Status && String(s.Status).toLowerCase() === "cancelled") return true;
  return false;
}

function extractStartDate(value) {
  if (!value) return null;
  const m = String(value).match(/\d{4}-\d{2}-\d{2}/);
  if (!m) return null;
  return new Date(`${m[0]}T12:00:00`);
}

function normalizeDates(raw) {
  if (!raw) return { start: null, label: "—" };

  if (Array.isArray(raw)) {
    const dates = raw
      .map(extractStartDate)
      .filter(Boolean)
      .sort((a, b) => a - b);
    if (!dates.length) return { start: null, label: raw.join(", ") };
    return {
      start: dates[0],
      label: dates
        .map((d) =>
          d.toLocaleDateString([], {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        )
        .join(" • "),
    };
  }

  const d = extractStartDate(raw);
  return {
    start: d,
    label: d
      ? d.toLocaleDateString([], {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : String(raw),
  };
}

function formatDateLabel(v) {
  return normalizeDates(v).label;
}
function formatTimeValue(v) {
  if (!v) return "—";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
    const d = new Date(v);
    if (!isNaN(d))
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return v;
  }
  if (typeof v === "string") return v;
  if (v instanceof Date)
    return v.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (typeof v === "number") {
    const ms = (v - 25569) * 86400 * 1000;
    const d = new Date(ms);
    if (!isNaN(d))
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return String(v);
}

function pickShowsFromResponse(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.shows)) return json.shows;
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json.items)) return json.items;
  if (Array.isArray(json.result)) return json.result;
  return [];
}

function pickField(obj, keys, fmt) {
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== "") return fmt ? fmt(obj[k]) : obj[k];
  }
  return "";
}

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   NEW: Assigned Producer resolver
   ========================================================= */
function getAssignedProducer(s) {
  // 1) Named fields first
  const byKey =
    pickField(s, [
      "Assigned Producer",
      "assignedProducer",
      "Producer",
      "producer",
      "Show Lead",
    ]) || "";
  if (byKey) return String(byKey).trim();

  // 2) Fallback to column A if original was array-shaped
  if (Array.isArray(s?._row)) {
    const candidate = String(s._row[0] ?? "").trim();
    if (
      candidate &&
      !/\d/.test(candidate) &&
      candidate.length <= 40 &&
      !/public|internal|invited|performance|cancel/i.test(candidate)
    ) {
      return candidate;
    }
  }
  return "";
}

/* =========================================================
   RENDER HELPERS
   ========================================================= */
function InfoRow({ label, value }) {
  return (
    <div
      className="info-row"
      style={{
        display: "grid",
        gridTemplateColumns: "var(--labelW, 160px) 1fr",
        alignItems: "start",
        gap: "8px",
        lineHeight: 1.5,
        fontSize: "0.9rem",
        color: "#fff",
        wordBreak: "break-word",
      }}
    >
      <div
        className="info-label"
        style={{
          textAlign: "left",
          fontWeight: 600,
          opacity: 0.85,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={label}
      >
        {label}:
      </div>
      <div className="info-value" style={{ textAlign: "left" }}>
        {value || "—"}
      </div>
    </div>
  );
}

function TwoColumnSpecs({
  rows,
  labelWidthLeft = "160px",
  labelWidthRight = "160px",
}) {
  const mid = Math.ceil(rows.length / 2);
  const left = rows.slice(0, mid);
  const right = rows.slice(mid);

  return (
    <>
      <style>{`
        @media (max-width: 740px) {
          .specs-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div
        className="specs-2col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px 24px",
        }}
      >
        <div
          style={{ display: "grid", gap: "6px", ["--labelW"]: labelWidthLeft }}
        >
          {left.map(({ label, value }, i) => (
            <InfoRow key={`${label}-${i}`} label={label} value={value} />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gap: "6px",
            ["--labelW"]: labelWidthRight,
          }}
        >
          {right.map(({ label, value }, i) => (
            <InfoRow key={`${label}-${i}`} label={label} value={value} />
          ))}
        </div>
      </div>
    </>
  );
}

/* =========================================================
   MULTI-SELECT DROPDOWN (Types filter)
   ========================================================= */
function MultiSelectDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleOption(value) {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  }

  return (
    <div ref={ref} style={{ position: "relative", minWidth: "180px" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ ...buttonStyle, width: "100%" }}
      >
        {selected.length ? `${label}: ${selected.join(", ")}` : `${label}: All`}
        <span style={{ float: "right", opacity: 0.7 }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            right: 0,
            zIndex: 999,
            background: "#1d1d1f",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "6px 8px 8px",
            display: "grid",
            gap: "4px",
            maxHeight: "220px",
            overflowY: "auto",
            boxShadow: "0 12px 20px rgba(0,0,0,0.3)",
          }}
        >
          {(options || []).map((opt) => (
            <label
              key={opt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                color: "#fff",
                fontSize: "0.85rem",
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOption(opt)}
              />
              {opt}
            </label>
          ))}

          <button
            type="button"
            style={{
              ...buttonStyle,
              background: "#222",
              fontSize: "0.75rem",
              padding: "4px 6px",
              minWidth: "unset",
              height: "30px",
            }}
            onClick={() => {
              onChange([]);
              setOpen(false);
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DISPLAY ORDERS
   ========================================================= */
const LX_DISPLAY_ORDER = [
  "Dates",
  "Show Name",
  "Venue",
  "Public / Internal / Invited",
  "Event Type",
  "Status",
  "Show Lead",
  "Visiting LD Contact",
  "Lighting Plan Received",
  "Booms",
  "Floor Package",
  "LX Special Bars",
  "Cyc / GroundRow",
  "Haze/Smoke",
  "FollowSpots",
  "Operating Position",
  "Production Desks",
  "Lighting Freelancer",
  "Notes",
];

const AUDIO_DISPLAY_ORDER = [
  "Dates",
  "Show Name",
  "Venue",
  "Event Type",
  "Status",
  "Artist",
  "Q&A",
  "Time",
  "Duration",
  "Interval",
  "Capacity",
  "Contact",
  "Visiting Engineer",
  "Engineer Contact",
  "Monitors",
  "Monitor Desk",
  "Visiting Monitor Contact",
  "Piano",
  "Backline/Rentals",
  "Walk in/Playback",
  "Show Leed",
  "Rider",
  "Custom Sound Notes",
];

const VIDEO_HIDE_FIELDS = new Set(["Custom Sound Notes"]);
const VIDEO_DISPLAY_ORDER = [
  "Dates",
  "Show Name",
  "Venue",
  "Public / Internal / Invited",
  "Event Type",
  "Status",
  "Show Lead",
  "Archived",
  "Projections (projector & lens)",
  "Projections (screen)",
  "Projections Operating Position",
  "On stage monitors",
  "Technicians",
];

/* =========================================================
   DEPT FETCH HELPERS (simplified: 1 request per dept)
   ========================================================= */
function monthDayVariants(start) {
  const mm = start.toLocaleString("en-US", { month: "short" });
  const d = start.getDate();
  const dd = String(d).padStart(2, "0");
  return [
    `${mm} ${d}`,
    `${mm} ${dd}`,
    `${d} ${mm}`,
    `${dd} ${mm}`,
    `${mm}-${d}`,
    `${mm}-${dd}`,
  ];
}

function firstItemsAsObjects(json) {
  const items = Array.isArray(json?.items) ? json.items : [];
  const headers = Array.isArray(json?.headers) ? json.headers : null;

  if (headers) {
    return items.map((row) => {
      if (Array.isArray(row)) {
        const obj = {};
        headers.forEach((h, i) => (obj[String(h || "").trim()] = row[i]));
        return obj;
      }
      return row && typeof row === "object" ? row : { value: row };
    });
  }

  return items.map((row, idx) => {
    if (row && typeof row === "object" && !Array.isArray(row)) return row;
    if (Array.isArray(row)) {
      const obj = {};
      row.forEach((v, i) => (obj[`Col ${i + 1}`] = v));
      return obj;
    }
    return { value: row, index: idx };
  });
}

function nonEmptyCount(obj) {
  return Object.values(obj).reduce(
    (n, v) => (v != null && String(v).trim() !== "" ? n + 1 : n),
    0
  );
}

function scoreCandidate(obj, showName, venueLabel, start) {
  const sname = String(showName || "").toLowerCase();
  const svenue = String(venueLabel || "").toLowerCase();

  const nameFields = ["Show Name", "Show", "Title", "name"];
  const venueFields = ["Venue", "Location", "venue"];
  const dateFields = ["Dates", "Date", "date", "When", "Event Date"];

  let score = 0;

  // Name match
  for (const f of nameFields) {
    if (obj[f] && String(obj[f]).toLowerCase().includes(sname)) {
      score += 4;
      break;
    }
  }

  // Venue match
  for (const f of venueFields) {
    if (obj[f] && String(obj[f]).toLowerCase().includes(svenue)) {
      score += 3;
      break;
    }
  }

  // Date-ish match
  if (start) {
    const y = String(start.getFullYear());
    const mds = monthDayVariants(start);
    const hay = dateFields
      .map((f) => (obj[f] ? String(obj[f]).toLowerCase() : ""))
      .join(" | ");

    if (hay) {
      if (hay.includes(y.toLowerCase())) score += 2;
      for (const md of mds) {
        if (hay.includes(md.toLowerCase())) {
          score += 2;
          break;
        }
      }
    }
  }

  // Reward "rich" rows
  score += Math.min(5, Math.floor(nonEmptyCount(obj) / 5));
  return score;
}

// NEW: single-call version – fetch whole tab once, pick best row in React
async function fetchBestRowSimple(
  url,
  { action, showName, venueLabel, start }
) {
  const params = new URLSearchParams();
  if (action) params.set("action", action);
  params.set("cb", Date.now());

  const fullUrl = `${url}?${params.toString()}`;
  const r = await fetch(fullUrl);
  const json = await r.json();
  const objs = firstItemsAsObjects(json);

  let best = null;
  let bestScore = -1;

  for (const obj of objs) {
    const sc = scoreCandidate(obj, showName, venueLabel, start);
    if (sc > bestScore) {
      bestScore = sc;
      best = { obj, queryUrl: fullUrl, raw: json };
    }
  }

  return {
    best: best || null,
    tried: [fullUrl],
  };
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */
export default function ShowSpecs() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filters
  const [query, setQuery] = useState("");
  const [filterTypes, setFilterTypes] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterVenue, setFilterVenue] = useState("");
  const [futureOnly, setFutureOnly] = useState(true);
  const [hideUndated, setHideUndated] = useState(true);
  const [hideCancelled, setHideCancelled] = useState(true);

  // selection
  const [selectedShow, setSelectedShow] = useState(null);

  // tabs
  const [activeDept, setActiveDept] = useState("Stage");

  // cache: showId -> { Lighting: {status,data,error,debug}, Audio: {...}, Video: {...} }
  const [deptState, setDeptState] = useState({});
  const [debugMode, setDebugMode] = useState(false);

  /* ----------------- load shows list ----------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const r = await fetch(
          `${DATA_URL}?action=shows&includeCancelled=true&cb=${Date.now()}`,
          { cache: "no-store" }
        );
        const json = await r.json();
        const arr = pickShowsFromResponse(json);
        const cleaned = (Array.isArray(arr) ? arr : []).map((row, i) => {
          if (Array.isArray(row)) {
            return {
              _row: row, // keep original raw row for column A producer fallback
              dates: row[0],
              showName: row[1],
              venue: row[2],
              eventType: row[3],
              time: row[7],
              id: `ROW-${i + 2}`,
            };
          }
          return { ...row, id: row.id || `ROW-${i + 2}` };
        });
        setShows(cleaned);
      } catch (e) {
        setErr(String(e.message || e));
        setShows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ----------------- options for filters ----------------- */
  const eventTypes = useMemo(() => {
    const s = new Set();
    shows.forEach((sh) => sh.eventType && s.add(sh.eventType));
    return [...s].sort();
  }, [shows]);

  const venues = useMemo(() => {
    const s = new Set();
    shows.forEach((sh) => sh.venue && s.add(String(sh.venue).trim()));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [shows]);

  const months = useMemo(() => {
    const s = new Set();
    shows.forEach((sh) => {
      const { start } = normalizeDates(sh.dates);
      if (start)
        s.add(
          `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(
            2,
            "0"
          )}`
        );
    });
    return [...s].sort();
  }, [shows]);

  /* ----------------- filtered shows ----------------- */
  const filtered = useMemo(() => {
    const now = new Date();
    const q = query.trim().toLowerCase();
    return shows.filter((s) => {
      const { start } = normalizeDates(s.dates);
      const cancelled = isCancelledShow(s);

      const matchQuery =
        !q ||
        [
          s.showName,
          s["Show Name"],
          s.venue,
          s.eventType,
          s.artist,
          s["Artist"],
        ]
          .filter(Boolean)
          .some((p) => String(p).toLowerCase().includes(q));

      const matchVenue =
        !filterVenue ||
        String(s.venue || "")
          .trim()
          .toLowerCase() === filterVenue.trim().toLowerCase();

      const showType = (s.eventType || "").toLowerCase();
      const matchType =
        filterTypes.length === 0 ||
        filterTypes.some((t) => t.toLowerCase() === showType);

      const matchMonth = !filterMonth
        ? true
        : (() => {
            if (!start) return false;
            const ym = `${start.getFullYear()}-${String(
              start.getMonth() + 1
            ).padStart(2, "0")}`;
            return ym === filterMonth;
          })();

      const matchFuture =
        !futureOnly || !start
          ? true
          : start >= new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const matchUndated = !hideUndated || !!start;
      const matchCancelled = !hideCancelled || !cancelled;

      return (
        matchQuery &&
        matchVenue &&
        matchType &&
        matchMonth &&
        matchFuture &&
        matchUndated &&
        matchCancelled
      );
    });
  }, [
    shows,
    query,
    filterTypes,
    filterMonth,
    filterVenue,
    futureOnly,
    hideUndated,
    hideCancelled,
  ]);

  /* =========================================================
     LOADERS
     ========================================================= */
  async function loadLightingForShow(show) {
    if (!show) return;
    const showId = show.id || norm(show.showName || show["Show Name"]);
    if (deptState[showId]?.Lighting?.status === "ready") return;

    setDeptState((prev) => ({
      ...prev,
      [showId]: { ...(prev[showId] || {}), Lighting: { status: "loading" } },
    }));

    try {
      const showName = (
        pickField(show, ["showName", "Show Name"]) || String(show.id || "")
      ).trim();
      const venueLabel = String(show.venue || show["Venue"] || "").trim();
      const { start } = normalizeDates(show.dates);

      const { best, tried } = await fetchBestRowSimple(LIGHTING_URL, {
        // keep no action here unless your LX script expects one
        action: undefined,
        showName,
        venueLabel,
        start,
      });

      if (!best) {
        setDeptState((prev) => ({
          ...prev,
          [showId]: {
            ...(prev[showId] || {}),
            Lighting: {
              status: "error",
              error:
                "No Lighting row found in LX tab (check name/venue/date or headers).",
              debug: { tried },
            },
          },
        }));
        return;
      }

      setDeptState((prev) => ({
        ...prev,
        [showId]: {
          ...(prev[showId] || {}),
          Lighting: {
            status: "ready",
            data: best.obj,
            debug: { tried, picked: best.queryUrl, sample: best.raw },
          },
        },
      }));
    } catch (e) {
      setDeptState((prev) => ({
        ...prev,
        [showId]: {
          ...(prev[showId] || {}),
          Lighting: { status: "error", error: String(e.message || e) },
        },
      }));
    }
  }

  async function loadAudioForShow(show) {
    if (!show) return;
    const showId = show.id || norm(show.showName || show["Show Name"]);
    if (deptState[showId]?.Audio?.status === "ready") return;

    setDeptState((prev) => ({
      ...prev,
      [showId]: { ...(prev[showId] || {}), Audio: { status: "loading" } },
    }));

    try {
      const showName = (
        pickField(show, ["showName", "Show Name"]) || String(show.id || "")
      ).trim();
      const venueLabel = String(show.venue || show["Venue"] || "").trim();
      const { start } = normalizeDates(show.dates);

      const { best, tried } = await fetchBestRowSimple(AUDIO_URL, {
        action: "audio",
        showName,
        venueLabel,
        start,
      });

      if (!best) {
        setDeptState((prev) => ({
          ...prev,
          [showId]: {
            ...(prev[showId] || {}),
            Audio: {
              status: "error",
              error: "No Audio row found in Audio tab.",
              debug: { tried },
            },
          },
        }));
        return;
      }

      setDeptState((prev) => ({
        ...prev,
        [showId]: {
          ...(prev[showId] || {}),
          Audio: {
            status: "ready",
            data: best.obj,
            debug: { tried, picked: best.queryUrl, sample: best.raw },
          },
        },
      }));
    } catch (e) {
      setDeptState((prev) => ({
        ...prev,
        [showId]: {
          ...(prev[showId] || {}),
          Audio: { status: "error", error: String(e.message || e) },
        },
      }));
    }
  }

  async function loadVideoForShow(show) {
    if (!show) return;
    const showId = show.id || norm(show.showName || show["Show Name"]);
    if (deptState[showId]?.Video?.status === "ready") return;

    setDeptState((prev) => ({
      ...prev,
      [showId]: { ...(prev[showId] || {}), Video: { status: "loading" } },
    }));

    try {
      const showName = (
        pickField(show, ["showName", "Show Name"]) || String(show.id || "")
      ).trim();
      const venueLabel = String(show.venue || show["Venue"] || "").trim();
      const { start } = normalizeDates(show.dates);

      const { best, tried } = await fetchBestRowSimple(VIDEO_URL, {
        action: "video",
        showName,
        venueLabel,
        start,
      });

      if (!best) {
        setDeptState((prev) => ({
          ...prev,
          [showId]: {
            ...(prev[showId] || {}),
            Video: {
              status: "error",
              error: "No Video row found in Video tab.",
              debug: { tried },
            },
          },
        }));
        return;
      }

      setDeptState((prev) => ({
        ...prev,
        [showId]: {
          ...(prev[showId] || {}),
          Video: {
            status: "ready",
            data: best.obj,
            debug: { tried, picked: best.queryUrl, sample: best.raw },
          },
        },
      }));
    } catch (e) {
      setDeptState((prev) => ({
        ...prev,
        [showId]: {
          ...(prev[showId] || {}),
          Video: { status: "error", error: String(e.message || e) },
        },
      }));
    }
  }

  // NEW: prefetch all depts when a show is selected (runs once per show)
  useEffect(() => {
    if (!selectedShow) return;
    loadLightingForShow(selectedShow);
    loadAudioForShow(selectedShow);
    loadVideoForShow(selectedShow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShow]);

  /* =========================================================
     DETAIL PANEL HELPER
     ========================================================= */
  function DebugBlock({ state, showId, dept }) {
    const payload = state?.[showId]?.[dept];
    if (!payload || !payload.debug) return null;
    return (
      <details style={{ fontSize: "0.8rem", opacity: 0.9 }}>
        <summary>Debug: show API details</summary>
        <div style={{ marginTop: 8 }}>
          <div>
            <strong>Picked URL</strong>:{" "}
            <code>{payload.debug.picked || "—"}</code>
          </div>
          {Array.isArray(payload.debug.tried) && (
            <>
              <div style={{ marginTop: 6 }}>
                <strong>Tried URLs</strong>:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {payload.debug.tried.map((u, i) => (
                  <li key={i}>
                    <code>{u}</code>
                  </li>
                ))}
              </ul>
            </>
          )}
          {payload.debug.sample && (
            <>
              <div style={{ marginTop: 6 }}>
                <strong>Sample JSON</strong>:
              </div>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(payload.debug.sample, null, 2)}
              </pre>
            </>
          )}
        </div>
      </details>
    );
  }

  function renderDeptPanel(s, active, state) {
    const showId = s.id || norm(s.showName || s["Show Name"]);

    if (active === "Stage") {
      const STAGE_FIELDS = [
        { label: "Dates", keys: ["dates", "Dates"], fmt: formatDateLabel },
        { label: "Show Name", keys: ["showName", "Show Name", "name"] },
        { label: "Venue", keys: ["venue", "Venue"] },
        { label: "Event Type", keys: ["eventType", "Event Type", "Type"] },
        { label: "Status", keys: ["status", "Status"] },
        { label: "Artist", keys: ["artist", "Artist"] },
        { label: "Q&A", keys: ["Q&A", "QandA", "Q & A", "qa"] },
        { label: "Time", keys: ["time", "Time"], fmt: formatTimeValue },
        { label: "Duration", keys: ["duration", "Duration"] },
        { label: "Interval", keys: ["interval", "Interval"] },
        { label: "Capacity", keys: ["capacity", "Capacity"] },
        { label: "Contact", keys: ["contact", "Contact"] },
        { label: "Pros Width", keys: ["prosWidth", "Pros Width"] },
        { label: "Legs Opening", keys: ["legsOpening", "Legs Opening"] },
        {
          label: "Stage Depth/Size",
          keys: [
            "stageDepthSize",
            "Stage Depth/Size",
            "Stage Depth",
            "Stage Size",
          ],
        },
        { label: "Pit lift", keys: ["pitLift", "Pit lift"] },
        {
          label: "Upstage Cross over",
          keys: ["upstageCrossOver", "Upstage Cross over", "Upstage Crossover"],
        },
        { label: "Floor Type", keys: ["floorType", "Floor Type"] },
        { label: "Masking", keys: ["masking", "Masking"] },
        { label: "House Tabs", keys: ["houseTabs", "House Tabs"] },
        {
          label: "Custom Stage Notes",
          keys: ["customStageNotes", "Custom Stage Notes", "Notes"],
        },
      ];
      const stageRows = STAGE_FIELDS.map((f) => ({
        label: f.label,
        value: pickField(s, f.keys, f.fmt) || "—",
      }));
      return (
        <>
          <TwoColumnSpecs rows={stageRows} />
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 8,
              alignItems: "center",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
              />
              Debug dept fetch
            </label>
          </div>
        </>
      );
    }

    const payload = state[showId]?.[active] || { status: "idle" };
    if (payload.status === "loading")
      return <div className="muted">Loading {active}…</div>;
    if (payload.status === "error")
      return (
        <div
          style={{
            color: "#ffbcbc",
            background: "rgba(160,0,0,0.15)",
            border: "1px solid #a00",
            padding: 10,
            borderRadius: 8,
          }}
        >
          {payload.error || `Could not load {active}.`}
          {debugMode && (
            <DebugBlock state={state} showId={showId} dept={active} />
          )}
        </div>
      );
    if (payload.status !== "ready" || !payload.data)
      return <div className="muted">Select {active} to view details.</div>;

    const entries = Object.entries(payload.data).filter(
      ([k, v]) =>
        v != null && String(v).trim() !== "" && !VIDEO_HIDE_FIELDS.has(k)
    );
    if (!entries.length)
      return (
        <div>
          <div className="muted">No fields to display.</div>
          {debugMode && (
            <DebugBlock state={state} showId={showId} dept={active} />
          )}
        </div>
      );

    const order =
      active === "Lighting"
        ? LX_DISPLAY_ORDER
        : active === "Audio"
        ? AUDIO_DISPLAY_ORDER
        : VIDEO_DISPLAY_ORDER;

    const orderMap = new Map(order.map((h, i) => [h, i]));
    const sorted = entries.sort(([a], [b]) => {
      const ia = orderMap.has(a) ? orderMap.get(a) : Infinity;
      const ib = orderMap.has(b) ? orderMap.get(b) : Infinity;
      return ia !== ib ? ia - ib : a.localeCompare(b);
    });

    const rows = sorted.map(([label, value]) => ({
      label,
      value: String(value),
    }));

    return (
      <>
        <TwoColumnSpecs rows={rows} />
        {debugMode && (
          <DebugBlock state={state} showId={showId} dept={active} />
        )}
      </>
    );
  }

  /* =========================================================
     DETAIL VIEW
     ========================================================= */
  if (selectedShow) {
    const s = selectedShow;
    const cancelled = isCancelledShow(s);

    return (
      <div className="page">
        <style>{`@media (max-width: 640px){ .page { padding: 8px !important; } }`}</style>

        <h1 style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {cancelled ? (
            <s>{pickField(s, ["showName", "Show Name"]) || "Untitled show"}</s>
          ) : (
            pickField(s, ["showName", "Show Name"]) || "Untitled show"
          )}
          {cancelled && (
            <span
              style={{
                background: "rgba(180,0,0,0.14)",
                border: "1px solid #a00",
                color: "#ffbcbc",
                borderRadius: "9999px",
                padding: "2px 10px",
                fontSize: "0.75rem",
              }}
            >
              Cancelled
            </span>
          )}
        </h1>

        {/* Tabs */}
        <div
          className="dept-buttons"
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}
        >
          {["Stage", "Lighting", "Audio", "Video"].map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setActiveDept(dept)}
              style={{
                ...buttonStyle,
                minWidth: 120,
                textAlign: "center",
                background: activeDept === dept ? "#333" : "#1d1d1f",
              }}
            >
              {dept}
            </button>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
            />
            Debug dept fetch
          </label>
        </div>

        {/* Panel */}
        <div
          className="detail-card"
          style={{
            background: "#1d1d1f",
            border: "1px solid #333",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
            display: "grid",
            gap: "12px",
          }}
        >
          {renderDeptPanel(s, activeDept, deptState)}
        </div>

        <button
          style={{ ...buttonStyle, marginTop: "14px", textAlign: "center" }}
          onClick={() => {
            setSelectedShow(null);
            setActiveDept("Stage");
          }}
        >
          ← Back to list
        </button>
      </div>
    );
  }

  /* =========================================================
     LIST VIEW
     ========================================================= */
  return (
    <div className="page">
      <h1>Show Specs</h1>

      <div
        className="filter-bar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search shows..."
          style={{ ...buttonStyle, width: "180px" }}
        />

        <select
          value={filterVenue}
          onChange={(e) => setFilterVenue(e.target.value)}
          style={{ ...buttonStyle }}
        >
          <option value="">All Venues</option>
          {venues.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <MultiSelectDropdown
          label="Types"
          options={eventTypes}
          selected={filterTypes}
          onChange={setFilterTypes}
        />

        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{ ...buttonStyle }}
        >
          <option value="">All Months</option>
          {months.map((m) => {
            const [y, mo] = m.split("-");
            const label = new Date(y, mo - 1).toLocaleDateString([], {
              month: "short",
              year: "numeric",
            });
            return (
              <option key={m} value={m}>
                {label}
              </option>
            );
          })}
        </select>

        <button
          onClick={() => setFutureOnly((v) => !v)}
          style={{
            ...buttonStyle,
            background: futureOnly ? "#333" : "#1d1d1f",
            textAlign: "center",
            minWidth: "130px",
          }}
        >
          {futureOnly ? "✓ " : ""}Future only
        </button>

        <button
          onClick={() => setHideUndated((v) => !v)}
          style={{
            ...buttonStyle,
            background: hideUndated ? "#333" : "#1d1d1f",
            textAlign: "center",
            minWidth: "150px",
          }}
        >
          {hideUndated ? "✓ " : ""}Hide undated
        </button>

        <button
          onClick={() => setHideCancelled((v) => !v)}
          style={{
            ...buttonStyle,
            background: hideCancelled ? "#333" : "#1d1d1f",
            textAlign: "center",
            minWidth: "150px",
          }}
        >
          {hideCancelled ? "✓ " : ""}Hide cancelled
        </button>
      </div>

      {loading && <div className="center">Loading shows…</div>}
      {err && <div className="center error">{err}</div>}

      {!loading && !err && (
        <div style={{ marginBottom: "8px", fontSize: "0.85rem" }}>
          Loaded <strong>{shows.length}</strong> show(s)
        </div>
      )}

      {!loading && !err && (
        <div className="grid show-grid">
          {filtered.length ? (
            filtered.map((s, idx) => {
              const cancelled = isCancelledShow(s);
              const producer = getAssignedProducer(s);

              return (
                <div
                  key={s.id || s.showName || s["Show Name"] || idx}
                  className="card clickable"
                  onClick={() => {
                    setSelectedShow(s);
                    setActiveDept("Stage");
                  }}
                  style={{
                    position: "relative",
                    border: cancelled ? "1px solid #a00" : "1px solid #333",
                    background: cancelled
                      ? "rgba(180,0,0,0.08)"
                      : "rgba(29,29,31,0.35)",
                    color: cancelled ? "#ffdddd" : "inherit",
                    overflow: "hidden",
                  }}
                >
                  {cancelled && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        background: "rgba(160,0,0,0.85)",
                        color: "#ffecec",
                        fontSize: "0.65rem",
                        padding: "2px 8px 3px",
                        borderBottomLeftRadius: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Cancelled
                    </div>
                  )}
                  <div
                    className="card-title"
                    style={{ display: "flex", gap: 6 }}
                  >
                    {cancelled ? (
                      <s>{s.showName || s["Show Name"] || "Untitled show"}</s>
                    ) : (
                      s.showName || s["Show Name"] || "Untitled show"
                    )}
                  </div>

                  {/* Subline now appends producer if available */}
                  <div className="card-sub">
                    {formatDateLabel(s.dates)} • {s.venue || "Venue TBC"} •{" "}
                    {s.eventType || "Type TBC"}
                    {producer ? ` • ${producer}` : ""}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="muted">No shows match your filters.</div>
          )}
        </div>
      )}
    </div>
  );
}

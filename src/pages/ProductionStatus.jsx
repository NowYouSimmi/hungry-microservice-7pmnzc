// src/pages/ProductionStatus.jsx
import React, { useEffect, useMemo, useState } from "react";

/** Default endpoint (Stage) – can be overridden by props for Audio */
const DEFAULT_DATA_URL =
  "https://script.google.com/macros/s/AKfycbxb2yNU8itdZUICoROgkaaAC_kY-N9rv6IuJjsdMrOS-9jP5l_NTUxpWIiV5tp_9ZyS/exec?mode=normalized&format=json&sheet=Events%20Checklist";

/* ================= Helpers ================= */

const norm = (s) =>
  String(s ?? "")
    .replace(/\u00A0/g, " ")
    .trim();
const lower = (s) => norm(s).toLowerCase();

/** CSV parser */
function parseCSV(text) {
  const rows = [];
  let row = [],
    cell = "",
    inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i],
      next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** Normalize Stage + Audio sheets into long rows */
function normalizeFromMatrix(matrix) {
  if (!matrix || !matrix.length) return [];

  const canon = (s) =>
    String(s ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[–—-]/g, "-")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  // 1) find header row heuristically
  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(matrix.length, 6); i++) {
    const row = (matrix[i] || []).map(norm);
    const hasTask = row.some((h) => canon(h) === "task");
    const hasOwner = row.some((h) => canon(h) === "owner");
    const hasStage =
      row.some((h) => canon(h) === "stage") ||
      row.some((h) => canon(h) === "audio stages");
    if (hasTask && (hasOwner || hasStage)) {
      headerRowIdx = i;
      break;
    }
  }
  if (headerRowIdx < 0) headerRowIdx = 0;
  const header = (matrix[headerRowIdx] || []).map(norm);

  // 2) compute indices
  const taskIdx = header.findIndex((h) => canon(h) === "task");
  const ownerIdx = header.findIndex((h) => canon(h) === "owner");
  const stageIdx = header.findIndex(
    (h) => canon(h) === "stage" || canon(h) === "audio stages"
  );
  const notesIdx = header.findIndex((h) => canon(h) === "notes");
  const rolesIdx = header.findIndex(
    (h) =>
      canon(h) === "roles & resposiblity" ||
      canon(h) === "roles & responsibility" ||
      canon(h) === "roles responsibility" ||
      canon(h) === "roles"
  );

  // 3) determine show columns (start/end)
  const metaCols = [taskIdx, ownerIdx, stageIdx, rolesIdx].filter(
    (i) => i >= 0
  );
  let startCol = metaCols.length ? Math.max(...metaCols) + 1 : 1;
  const endCol = notesIdx >= 0 ? notesIdx - 1 : header.length - 1;

  // 4) tolerant SHOW LEAD detection (label can be anywhere in the row above header)
  let leadRow = null;
  let leadLabelCol = -1;
  let namesStartCol = -1;

  if (headerRowIdx > 0) {
    const r = (matrix[headerRowIdx - 1] || []).map(norm);

    // find label anywhere
    for (let i = 0; i < r.length; i++) {
      const key = canon(r[i]).replace(/\s+/g, "");
      if (key === "showlead" || key === "lead") {
        leadLabelCol = i;
        break;
      }
    }

    // accept as lead row if we found a label OR there are any non-empty cells above show range
    if (leadLabelCol >= 0 || r.slice(startCol).some((v) => norm(v))) {
      leadRow = r;

      // default: align names to show columns
      namesStartCol = startCol;

      // if label exists, make sure names begin after it (if label sits on startCol)
      if (leadLabelCol >= 0) {
        if (leadLabelCol <= startCol) {
          namesStartCol = Math.max(startCol, leadLabelCol + 1);
        } else {
          const startCellKey = canon(r[startCol] || "").replace(/\s+/g, "");
          namesStartCol =
            startCellKey === "showlead" || startCellKey === "lead"
              ? startCol + 1
              : startCol;
        }
      }
    }
  }

  // 5) build per-show lead map with smart alignment
  const showLeadByCol = new Map();
  if (leadRow) {
    for (let c = startCol; c <= endCol; c++) {
      let val = "";

      // prefer direct cell above the show column (and not the label)
      const cellKey = canon(leadRow[c] || "").replace(/\s+/g, "");
      if (leadRow[c] && cellKey !== "showlead" && cellKey !== "lead") {
        val = norm(leadRow[c]);
      } else {
        // fallback: align from namesStartCol
        const offset = c - startCol;
        const idx = namesStartCol + offset;
        if (idx >= 0 && idx < leadRow.length) {
          const cell = norm(leadRow[idx]);
          const k = canon(cell).replace(/\s+/g, "");
          if (cell && k !== "showlead" && k !== "lead") val = cell;
        }
      }

      if (val) showLeadByCol.set(c, val);
    }
  }

  // 6) emit rows
  const out = [];
  for (let r = headerRowIdx + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const task = norm(row[taskIdx]);
    const stage = stageIdx >= 0 ? norm(row[stageIdx]) : "";
    const rowOwner = ownerIdx >= 0 ? norm(row[ownerIdx]) : "";
    const baseNote = notesIdx >= 0 ? norm(row[notesIdx]) : "";
    const rolesText = rolesIdx >= 0 ? norm(row[rolesIdx]) : "";

    // skip empty rows
    let hasAnyStatus = false;
    for (let c = startCol; c <= endCol; c++) {
      if (norm(row[c])) {
        hasAnyStatus = true;
        break;
      }
    }
    if (!task && !hasAnyStatus) continue;

    for (let c = startCol; c <= endCol; c++) {
      const showTitle = norm(header[c]) || `Show ${c - startCol + 1}`;
      const status = norm(row[c]);
      const showLead = showLeadByCol.get(c) || "";

      let owner = rowOwner || showLead;

      let note = baseNote;
      if (rolesText) note = note ? `${rolesText} | ${note}` : rolesText;

      out.push({
        task,
        stage,
        owner,
        show: showTitle,
        status,
        note,
        lead: showLead,
      });
    }
  }

  return out;
}

/** Status colors */
function statusClass(v) {
  const s = lower(v);
  if (!s) return "none";
  if (s.includes("cancel")) return "red";
  if (s.includes("done") || s.includes("complete") || s === "✓" || s === "yes")
    return "green";
  if (s.includes("progress") || s.includes("wip") || s.includes("pending"))
    return "amber";
  if (s.includes("n/a") || s === "na" || s.includes("not applicable"))
    return "muted";
  if (s.includes("not started") || s === "no") return "none";
  return "soft";
}
function shadeFor(k) {
  switch (k) {
    case "green":
      return { background: "rgba(34,197,94,.22)" };
    case "amber":
      return { background: "rgba(245,158,11,.22)" };
    case "red":
      return { background: "rgba(239,68,68,.22)" };
    case "muted":
      return { background: "rgba(148,163,184,.18)" };
    case "soft":
      return { background: "rgba(99,102,241,.16)" };
    default:
      return null;
  }
}

// Color helper for show-lead names
function colorForPerson(name) {
  const key = String(name || "")
    .trim()
    .toLowerCase();

  // Tailwind-ish RGBs with subtle alpha tints
  const mk = (rgb) => ({
    color: `rgb(${rgb})`,
    border: `1px solid rgba(${rgb}, .55)`,
    background: `rgba(${rgb}, .16)`,
  });

  switch (key) {
    case "philip":
      return mk("234, 179, 8"); // yellow-500
    case "estelle":
      return mk("167, 139, 250"); // purple-400/500
    case "subin":
      return mk("59, 130, 246"); // blue-500
    case "roger":
      return mk("245, 158, 11"); // orange/amber-500
    default:
      return {}; // neutral (uses base style)
  }
}

/* ================= Component ================= */

export default function ProductionStatus({
  dataUrl = DEFAULT_DATA_URL,
  title = "Production Status",
  hideOwner = false, // 👈 NEW: hide Owner column (use true for Audio)
  onBack = null, // 👈 NEW: show a Back button if provided
}) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    fetch(dataUrl, { cache: "no-store" })
      .then(async (res) => {
        const contentType = (
          res.headers.get("content-type") || ""
        ).toLowerCase();
        const txt = await res.text();
        if (!res.ok)
          throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);

        if (contentType.includes("application/json")) {
          try {
            const obj = JSON.parse(txt);
            if (alive && obj && Array.isArray(obj.rows)) {
              setRows(obj.rows);
              setLoading(false);
              return;
            }
          } catch {}
        }

        if (txt.startsWith("error,")) {
          const msg = txt.split(",").slice(1).join(",").replace(/^"|"$/g, "");
          throw new Error(msg);
        }

        if (
          contentType.includes("text/csv") ||
          txt.trim().startsWith("Task,")
        ) {
          const matrix = parseCSV(txt);
          if (!matrix.length) throw new Error("Empty CSV");
          const normalized = normalizeFromMatrix(matrix);
          if (alive) setRows(normalized);
          setLoading(false);
          return;
        }

        throw new Error("Unknown response type");
      })
      .catch((e) => {
        if (alive) {
          setErr(e.message);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [dataUrl]);

  // group by show
  const byShow = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const key = r.show || "Untitled Show";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return map;
  }, [rows]);

  // cards
  const cards = useMemo(() => {
    const arr = [];
    byShow.forEach((items, show) => {
      const total = items.length;
      const done = items.filter(
        (x) => statusClass(x.status) === "green"
      ).length;
      const progress = items.filter(
        (x) => statusClass(x.status) === "amber"
      ).length;
      const cancelled = items.filter(
        (x) => statusClass(x.status) === "red"
      ).length;
      const lead = (items.find((x) => (x.lead || "").trim()) || {}).lead || "";
      arr.push({ show, total, done, progress, cancelled, lead });
    });
    return arr.sort(
      (a, b) => b.done / Math.max(1, b.total) - a.done / Math.max(1, a.total)
    );
  }, [byShow]);

  const filteredCards = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.show.toLowerCase().includes(q) ||
        (byShow.get(c.show) || []).some(
          (r) =>
            (r.status || "").toLowerCase().includes(q) ||
            (r.task || "").toLowerCase().includes(q)
        )
    );
  }, [cards, query, byShow]);

  return (
    <div style={wrapStyle}>
      <div style={topBarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Top-level back button to return to Stage/Audio hub */}
          {onBack && !selectedShow && (
            <button className="btn" onClick={onBack}>
              ← Back
            </button>
          )}
          <h1 style={{ margin: 0 }}>{selectedShow ? selectedShow : title}</h1>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {!selectedShow && (
            <>
              <input
                placeholder="Search shows, tasks, or status..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={searchInputStyle}
              />
              <a
                href={dataUrl}
                target="_blank"
                rel="noreferrer"
                className="btn dark"
              >
                Open data
              </a>
            </>
          )}
          {selectedShow && (
            <>
              <label
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  opacity: 0.9,
                }}
              >
                <input
                  type="checkbox"
                  checked={showNotes}
                  onChange={() => setShowNotes((v) => !v)}
                />
                Show Notes
              </label>
              {/* In-detail back to the show tiles */}
              <button className="btn" onClick={() => setSelectedShow(null)}>
                ← Back to Shows
              </button>
            </>
          )}
        </div>
      </div>

      {loading && <div style={hintStyle}>Loading...</div>}
      {err && <div style={errorStyle}>{err}</div>}

      {!loading && !err && !selectedShow && (
        <div style={cardsGrid}>
          {filteredCards.map((c, i) => {
            const pct = Math.round((c.done / Math.max(1, c.total)) * 100);
            return (
              <div
                key={i}
                style={cardPanel}
                onClick={() => setSelectedShow(c.show)}
              >
                <h2 style={{ margin: "0 0 4px 0", fontSize: "1.05rem" }}>
                  {c.show}
                </h2>

                {/* inline show lead */}
                {!!c.lead && (
                  <div style={leadRowInline}>
                    <span style={leadLabelPill}>Lead</span>
                    <span
                      style={{ ...leadNamePill, ...colorForPerson(c.lead) }}
                    >
                      {c.lead}
                    </span>
                  </div>
                )}

                <div style={countsRow}>
                  <span>✔ {c.done}</span>
                  <span>• {c.progress}</span>
                  <span>✖ {c.cancelled}</span>
                  <span style={{ opacity: 0.7 }}>/ {c.total}</span>
                </div>
                <div style={barWrap}>
                  <div style={barTrack}>
                    <div style={{ ...barFill, width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
          {!filteredCards.length && (
            <div style={hintStyle}>No shows match "{query}".</div>
          )}
        </div>
      )}

      {!loading && !err && selectedShow && (
        <ShowDetail
          rows={byShow.get(selectedShow) || []}
          showNotes={showNotes}
          hideOwner={hideOwner}
          onClose={() => setSelectedShow(null)}
        />
      )}
    </div>
  );
}

/* ---------- Detail Table ---------- */
function ShowDetail({ rows, showNotes, hideOwner, onClose }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    if (!ql) return rows;
    return rows.filter(
      (r) =>
        (r.task || "").toLowerCase().includes(ql) ||
        (r.stage || "").toLowerCase().includes(ql) ||
        (r.owner || "").toLowerCase().includes(ql) ||
        (r.status || "").toLowerCase().includes(ql) ||
        (r.note || "").toLowerCase().includes(ql)
    );
  }, [rows, q]);

  const hasStage = filtered.some((r) => norm(r.stage).length > 0);
  // Respect hideOwner prop: only show Owner if NOT hidden and there is any content
  const hasOwner = !hideOwner && filtered.some((r) => norm(r.owner).length > 0);

  return (
    <div style={detailWrap}>
      <div style={detailTop}>
        <input
          placeholder="Filter tasks/stage/owner/status/notes..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={searchInputStyle}
        />
      </div>

      <div style={cardStyle}>
        <div style={scrollWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Task</th>
                {hasStage && <th style={thStyle}>Stage</th>}
                {hasOwner && <th style={thStyle}>Owner</th>}
                <th style={thStyle}>Status</th>
                {showNotes && <th style={thStyle}>Notes</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const k = statusClass(r.status);
                return (
                  <tr key={i} style={i % 2 ? rowAlt : undefined}>
                    <td style={tdStyle}>{r.task}</td>
                    {hasStage && <td style={tdStyle}>{r.stage}</td>}
                    {hasOwner && <td style={tdStyle}>{r.owner}</td>}
                    <td style={{ ...tdStyle, ...(shadeFor(k) || {}) }}>
                      {r.status}
                    </td>
                    {showNotes && <td style={tdStyle}>{r.note}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button className="btn" onClick={onClose}>
          ← Back to Shows
        </button>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
const wrapStyle = { padding: "16px 18px 24px" };
const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};
const searchInputStyle = {
  background: "rgba(15,23,42,0.35)",
  border: "1px solid rgba(148,163,184,0.35)",
  borderRadius: 10,
  padding: "8px 10px",
  color: "white",
  minWidth: 230,
};
const hintStyle = { opacity: 0.7, padding: "10px 2px" };
const errorStyle = {
  color: "#fecaca",
  background: "rgba(239,68,68,0.08)",
  border: "1px solid rgba(239,68,68,0.35)",
  borderRadius: 12,
  padding: "10px 12px",
  marginTop: 12,
  whiteSpace: "pre-wrap",
  lineHeight: 1.25,
};
const cardsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: 12,
};
const cardPanel = {
  background: "rgba(15,23,42,0.55)",
  border: "1px solid rgba(148,163,184,0.18)",
  borderRadius: 14,
  padding: 12,
  cursor: "pointer",
  transition: "transform .08s ease",
  position: "relative",
};
const countsRow = { display: "flex", gap: 12, fontSize: ".9rem", opacity: 0.9 };
const barWrap = { marginTop: 6 };
const barTrack = {
  height: 8,
  background: "rgba(148,163,184,.25)",
  borderRadius: 999,
  overflow: "hidden",
};
const barFill = {
  height: 8,
  background: "rgba(34,197,94,.85)",
  borderRadius: 999,
};
const detailWrap = { display: "grid", gap: 10 };
const detailTop = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 6,
};
const cardStyle = {
  background: "rgba(15,23,42,0.5)",
  border: "1px solid rgba(148,163,184,0.18)",
  borderRadius: 14,
  boxShadow: "0 12px 45px rgba(0,0,0,0.20)",
};
const scrollWrapStyle = {
  overflow: "auto",
  maxHeight: "calc(100vh - 260px)",
  borderRadius: 14,
};
const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  fontSize: "0.94rem",
  color: "rgba(229,231,235,0.95)",
};
const thStyle = {
  position: "sticky",
  top: 0,
  background: "rgba(31,41,55,0.95)",
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid rgba(75,85,99,0.6)",
  fontWeight: 600,
  zIndex: 2,
  whiteSpace: "nowrap",
};
const tdStyle = {
  padding: "8px 12px",
  borderBottom: "1px solid rgba(75,85,99,0.25)",
  verticalAlign: "top",
  maxWidth: 420,
  overflow: "hidden",
  textOverflow: "ellipsis",
  backgroundClip: "padding-box",
};
const rowAlt = { background: "rgba(31,41,55,0.35)" };

// Inline "Lead" row under each show title
const leadRowInline = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "4px 0 8px 0",
};

// Always-green "Lead" pill
const leadLabelPill = {
  fontSize: ".62rem",
  textTransform: "uppercase",
  letterSpacing: ".06em",
  padding: "2px 6px",
  borderRadius: 999,
  color: "rgb(34, 197, 94)", // green-500
  border: "1px solid rgba(34, 197, 94, .55)",
  background: "rgba(34, 197, 94, .14)",
};

// Name pill (gets colored via colorForPerson override)
const leadNamePill = {
  fontSize: ".86rem",
  fontWeight: 600,
  lineHeight: 1.15,
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.35)", // neutral fallback
  background: "rgba(31,41,55,0.7)", // neutral fallback
};

// src/pages/POs.jsx
import React, { useEffect, useMemo, useState } from "react";

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyM9W1Hh6wfs527jAGnVFI47SrSGRNeyZp86QBcoPjPJhYElAXYO9eikykDKhESE7Wp/exec";

const VISIBLE_KEYS = ["COMPANY", "PO #", "REQ ID", "Date PO Raised"];

export default function POs({ setPage }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("Date PO Raised");
  const [sortDir, setSortDir] = useState("desc");

  const [qDebounced, setQDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(ENDPOINT);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Failed");
        setRows(data.rows);
      } catch (e) {
        setError(String(e.message));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visible = useMemo(() => {
    const filtered = qDebounced
      ? rows.filter((r) => {
          const hay = Object.values(r)
            .map((v) => (v == null ? "" : String(v)))
            .join(" • ")
            .toLowerCase();
          return hay.includes(qDebounced);
        })
      : rows;
    const sorted = [...filtered].sort((a, b) => {
      const av = getComparable(a, sortKey);
      const bv = getComparable(b, sortKey);
      if (av === bv) return 0;
      if (sortDir === "asc") return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
    return sorted;
  }, [rows, qDebounced, sortKey, sortDir]);

  return (
    <div className="page" style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button className="btn" onClick={() => setPage("home")}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>🧾 Purchase Orders</h2>
      </div>

      {/* Dark-themed controls */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: 12,
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search company, PO #, req id, notes…"
          style={{
            flex: "1 1 220px",
            background: "rgba(15,23,42,0.6)",
            border: "1px solid rgba(148,163,184,0.25)",
            color: "#e2e8f0",
            padding: "8px 10px",
            borderRadius: 8,
            minWidth: 220,
          }}
        />

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          style={selectDark}
        >
          <option value="Date PO Raised">Date PO Raised</option>
          <option value="COMPANY">COMPANY</option>
        </select>

        <select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value)}
          style={selectDark}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {loading && <span className="muted">Loading…</span>}
      </div>

      {error && (
        <div
          style={{
            color: "#f66",
            marginTop: 12,
            border: "1px solid #f66",
            padding: 8,
            borderRadius: 8,
          }}
        >
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {visible.map((r, i) => (
            <POCard key={i} r={r} />
          ))}
          {visible.length === 0 && (
            <div
              style={{
                padding: 16,
                border: "1px dashed #333",
                borderRadius: 12,
                textAlign: "center",
              }}
            >
              No results.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const selectDark = {
  background: "rgba(15,23,42,0.6)",
  border: "1px solid rgba(148,163,184,0.25)",
  color: "#e2e8f0",
  borderRadius: 8,
  padding: "8px 10px",
  appearance: "none",
};

function POCard({ r }) {
  const [open, setOpen] = useState(false);
  const company = safeStr(r["COMPANY"], "—");
  const po = safeStr(r["PO #"], "—");
  const req = safeStr(r["REQ ID"], "—");
  const date = formatDate(r["Date PO Raised"]);
  const rest = Object.entries(r).filter(
    ([k]) => !["COMPANY", "PO #", "REQ ID", "Date PO Raised"].includes(k)
  );

  return (
    <div
      style={{
        border: "1px solid #262626",
        borderRadius: 12,
        padding: 12,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>{company}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>PO: {po}</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>REQ ID: {req}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{date}</div>
        </div>
        {r["PO Link G Drive"] && (
          <a
            href={
              String(r["PO Link G Drive"]).startsWith("http")
                ? r["PO Link G Drive"]
                : `https://drive.google.com/open?id=${r["PO Link G Drive"]}`
            }
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{
              whiteSpace: "nowrap",
              height: 32,
              alignSelf: "start",
            }}
          >
            Open
          </a>
        )}
      </div>

      <button
        className="btn"
        onClick={() => setOpen(!open)}
        style={{
          marginTop: 10,
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid #2a2a2a",
        }}
      >
        {open ? "Hide details" : "More details"}
      </button>

      {open && (
        <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.4 }}>
          {rest.map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "grid",
                gridTemplateColumns: "130px 1fr",
                gap: 8,
                padding: "3px 0",
              }}
            >
              <div style={{ opacity: 0.6 }}>{k}</div>
              <div>{renderCell(k, v)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Helpers ---------- */
function renderCell(h, v) {
  if (h === "PO Link G Drive" && v) {
    const href = String(v).startsWith("http")
      ? v
      : `https://drive.google.com/open?id=${v}`;
    return (
      <a href={href} target="_blank" rel="noreferrer" className="link">
        Open
      </a>
    );
  }
  return String(v || "—");
}

function getComparable(row, key) {
  const v = row?.[key];
  if (key === "Date PO Raised") {
    const d = new Date(v);
    if (!isNaN(d)) return d.getTime();
    const n = Number(v);
    if (!isNaN(n)) return n;
  }
  return String(v || "").toLowerCase();
}

function safeStr(v, f = "") {
  return v == null || v === "" ? f : String(v);
}

function formatDate(v) {
  try {
    if (!v) return "";
    const d = new Date(v);
    if (!isNaN(d)) return d.toLocaleDateString();
    const n = Number(v);
    if (!isNaN(n)) {
      const base = new Date(Date.UTC(1899, 11, 30));
      return new Date(base.getTime() + n * 86400000).toLocaleDateString();
    }
  } catch {}
  return v;
}

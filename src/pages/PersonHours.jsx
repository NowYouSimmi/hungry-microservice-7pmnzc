// src/pages/PersonHours.jsx
import React, { useEffect, useMemo, useState } from "react";

const HOURS_URLS = {
  josie:
    "https://script.google.com/a/macros/nyu.edu/s/AKfycbyLrm0teiyErCveQrFYaTT_O8ACgiZwnhm2-MZs7b0KEQMAXy8_g-c0Fzy4sWUssOH_tA/exec",
  gareth:
    "https://script.google.com/macros/s/AKfycbwybkPiO3FJxOm_HnB74ittjWrEcLY7SU0037l9GyDlrOxwH1XZl7PqvMQPJHhU_NtqQw/exec",
};

async function fetchPersonHours(person, params = {}) {
  const base = HOURS_URLS[person];
  if (!base) throw new Error(`No API URL configured for ${person}`);
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v != null && usp.append(k, v));
  const url = `${base}${usp.toString() ? "?" + usp.toString() : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Hours API error ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

export default function PersonHours({ person, setPage }) {
  const name = person.charAt(0).toUpperCase() + person.slice(1);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const range = useMemo(() => {
    const yyyy = month.getFullYear();
    const mm = String(month.getMonth() + 1).padStart(2, "0");
    const last = new Date(yyyy, month.getMonth() + 1, 0).getDate();
    return {
      from: `${yyyy}-${mm}-01`,
      to: `${yyyy}-${mm}-${String(last).padStart(2, "0")}`,
      label: month.toLocaleString("en-US", { month: "long", year: "numeric" }),
    };
  }, [month]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await fetchPersonHours(person, {
          from: range.from,
          to: range.to,
          tz: "Asia/Dubai",
          fields:
            "Date,Events,Start Time,End Time,Total Hours,Net Hours,Status,Last Update",
          limit: 500,
        });
        data.sort((a, b) => (a["Date"] || "").localeCompare(b["Date"] || ""));
        setRows(data);
      } catch (e) {
        setErr(String(e.message || e));
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [person, range.from, range.to]);

  const isOff = (s) => /off|holiday/i.test(s || "");
  const isWorked = (s) => /work|worked/i.test(s || "");

  const totals = useMemo(() => {
    const toNum = (v) =>
      v == null || v === "" ? 0 : Number(String(v).replace(/[, ]+/g, "")) || 0;
    const totalHours = rows.reduce(
      (sum, r) => sum + toNum(r["Total Hours"]),
      0
    );
    const daysOff = rows.reduce((c, r) => c + (isOff(r["Status"]) ? 1 : 0), 0);
    const daysWorked = rows.reduce(
      (c, r) => c + (isWorked(r["Status"]) ? 1 : 0),
      0
    );
    const lastUpdate = rows
      .map((r) => r["Last Update"])
      .filter(Boolean)
      .sort()
      .pop();
    return { totalHours, daysOff, daysWorked, lastUpdate };
  }, [rows]);

  const prevMonth = () =>
    setMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const downloadCSV = () => {
    const headers = [
      "Date",
      "Events",
      "Start Time",
      "End Time",
      "Total Hours",
      "Net Hours",
      "Status",
    ];
    const esc = (v) =>
      v == null
        ? ""
        : String(v).includes(",") || String(v).includes('"')
        ? `"${String(v).replace(/"/g, '""')}"`
        : String(v);
    const lines = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${person}-${range.from}_to_${range.to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const pill = {
    appearance: "none",
    WebkitAppearance: "none",
    background: "rgba(23,23,23,0.7)",
    border: "1px solid rgba(120,120,120,0.6)",
    color: "rgba(229,231,235,0.9)",
    borderRadius: "9999px",
    padding: "8px 14px",
    lineHeight: 1,
    font: "inherit",
    cursor: "pointer",
    boxShadow: "0 1px 6px rgba(0,0,0,0.25)",
  };
  const pillLabel = {
    ...pill,
    fontWeight: 600,
    fontSize: "1.125rem",
    padding: "8px 16px",
    color: "white",
    background: "rgba(12,12,12,0.7)",
  };
  const toolbar = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header / Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold">{name}’s Hours</h1>

          <div className="hours-toolbar" style={toolbar}>
            <button style={pill} title="Previous month" onClick={prevMonth}>
              ◀
            </button>
            <span style={pillLabel}>{range.label}</span>
            <button style={pill} title="Next month" onClick={nextMonth}>
              ▶
            </button>
            <button style={pill} title="Download CSV" onClick={downloadCSV}>
              ⬇ CSV
            </button>
            <button style={pill} onClick={() => setPage("hours")}>
              ← Back
            </button>
          </div>
        </div>

        {/* Stats Section - ALL IN ONE LINE */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "64px",
            textAlign: "center",
            marginBottom: "40px",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Days Off", value: totals.daysOff },
            { label: "Days Worked", value: totals.daysWorked },
            { label: "Total Hours", value: totals.totalHours },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#9CA3AF",
                  marginBottom: 4,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {fmtNum(item.value)}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading && <p className="text-neutral-300">Loading…</p>}
        {err && <p className="text-red-400">{err}</p>}

        {!loading && !err && (
          <>
            <div
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 overflow-auto"
              style={{ marginTop: "40px" }}
            >
              <table className="w-full text-left text-sm">
                <thead className="text-neutral-300">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Events</th>
                    <th className="px-3 py-2">Start</th>
                    <th className="px-3 py-2">End</th>
                    <th className="px-6 py-2" style={{ minWidth: 130 }}>
                      Total
                    </th>
                    <th className="px-3 py-2">Net</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-200">
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t border-neutral-800">
                      <td className="px-3 py-2">{r["Date"] || ""}</td>
                      <td className="px-3 py-2">{r["Events"] || ""}</td>
                      <td className="px-3 py-2">{r["Start Time"] || ""}</td>
                      <td className="px-3 py-2">{r["End Time"] || ""}</td>
                      <td className="px-6 py-2" style={{ minWidth: 130 }}>
                        {r["Total Hours"] ?? ""}
                      </td>
                      <td className="px-3 py-2">{r["Net Hours"] ?? ""}</td>
                      <td className="px-3 py-2">{r["Status"] || ""}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td className="px-2 py-4 text-neutral-400" colSpan={7}>
                        No entries found for {range.label}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totals.lastUpdate && (
              <div
                className="text-center"
                style={{ marginTop: 24, color: "#9CA3AF", fontSize: 14 }}
              >
                Last updated:{" "}
                <span style={{ color: "#E5E7EB", fontWeight: 500 }}>
                  {totals.lastUpdate}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function fmtNum(n) {
  return (Number(n) || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

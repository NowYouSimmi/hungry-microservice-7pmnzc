// src/pages/Schedule.jsx
import React, { useEffect, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzttvpDHkyc72Xo1S4cELZlfKSkK0Oo_Km-MFeHtYzlZTuCiWU93UO7vwsM_jsfhkL40w/exec";

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [showTitle, setShowTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPast, setShowPast] = useState(false);

  // detect real day headers like "Wednesday 12th November"
  function parseDateHeader(text) {
    if (!text) return null;
    const m = text.match(
      /([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)/
    );
    if (!m) return null;
    const dayNum = m[2];
    const month = m[3];
    const year = new Date().getFullYear();
    const d = new Date(`${dayNum} ${month} ${year}`);
    return isNaN(d.getTime()) ? null : d;
  }

  // top-level "days" that are actually meal labels
  function isSectionLabel(str = "") {
    const upper = str.toUpperCase();
    return (
      upper.startsWith("LUNCH") ||
      upper.startsWith("DINNER") ||
      upper.startsWith("BREAK")
    );
  }

  function toNiceTime(h24, mins) {
    const suffix = h24 >= 12 ? "pm" : "am";
    const h12 = h24 % 12 || 12;
    const mm = mins ? `:${String(mins).padStart(2, "0")}` : "";
    return `${h12}${mm}${suffix}`;
  }

  function formatTime(raw) {
    if (raw == null || raw === "") return "";
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed.length > 0) return trimmed;
      return "";
    }
    if (raw instanceof Date) {
      const hrs = raw.getHours();
      const mins = raw.getMinutes();
      return toNiceTime(hrs, mins);
    }
    const d2 = new Date(raw);
    if (!isNaN(d2.getTime())) {
      const hrs = d2.getUTCHours();
      const mins = d2.getUTCMinutes();
      return toNiceTime(hrs, mins);
    }
    return "";
  }

  async function loadSchedule(showPastDays) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}?action=schedule&cb=${Date.now()}`, {
        cache: "no-store",
      });
      const json = await res.json();

      const incomingSchedule = Array.isArray(json.schedule)
        ? json.schedule
        : [];

      setShowTitle(json.show || json.title || "");

      // hide past days (based on the text date)
      let rows = incomingSchedule;
      if (!showPastDays) {
        const today = new Date();
        const todayOnly = new Date(today.toDateString());
        rows = rows.filter((day) => {
          const d = parseDateHeader(day.date);
          return d ? d >= todayOnly : true;
        });
      }

      // if a top-level entry is actually "DINNER..." or "LUNCH...", attach to previous day
      const cleaned = [];
      rows.forEach((dayObj) => {
        if (isSectionLabel(dayObj.date)) {
          const last = cleaned[cleaned.length - 1];
          if (last) {
            last.items = last.items || [];
            last.items.push({
              time: "",
              dept: "",
              activity: dayObj.date,
              staff: "",
              notes: "",
              companyOnStage: false,
            });
          }
        } else {
          cleaned.push(dayObj);
        }
      });

      setSchedule(cleaned);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchedule(showPast);
  }, [showPast]);

  return (
    <div className="page">
      {/* header */}
      <div className="schedule-header">
        <div>
          <h1>Schedule</h1>
          {showTitle && <p className="schedule-show">{showTitle}</p>}
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
          />
          Show past days
        </label>
      </div>

      {loading && <div className="center">Loading schedule…</div>}
      {error && <div className="error center">{error}</div>}
      {!loading && !error && schedule.length === 0 && (
        <div className="muted">No schedule data found.</div>
      )}

      {!loading &&
        !error &&
        schedule.map((day, idx) => {
          const items = Array.isArray(day.items) ? day.items : [];
          return (
            <section key={idx} className="schedule-day-block">
              {/* day header */}
              <header className="schedule-day-header">
                <div>
                  <h2 className="schedule-date">{day.date}</h2>
                  <p className="schedule-subtle">
                    {items.length
                      ? `${items.length} item${items.length > 1 ? "s" : ""}`
                      : "No activities"}
                  </p>
                </div>
              </header>

              <div className="schedule-items">
                {items.length ? (
                  items.map((item, i) => {
                    // raw values
                    const rawTime = (item.time || "").toString();
                    const rawDept = (
                      item.dept ||
                      item.department ||
                      item.team ||
                      ""
                    ).toString();
                    const rawActivity = (
                      item.activity ||
                      item.task ||
                      "—"
                    ).toString();

                    const displayTime = rawTime ? formatTime(rawTime) : "";

                    // lowercased for detection
                    const timeLower = rawTime.toLowerCase();
                    const deptLower = rawDept.toLowerCase();
                    const actLower = rawActivity.toLowerCase();

                    // ✅ NEW RULE:
                    // if ANY of time / dept / activity contains lunch/dinner/break → it's a break
                    const isMeal =
                      timeLower.includes("lunch") ||
                      timeLower.includes("dinner") ||
                      timeLower.includes("break") ||
                      deptLower.includes("lunch") ||
                      deptLower.includes("dinner") ||
                      deptLower.includes("break") ||
                      actLower.includes("lunch") ||
                      actLower.includes("dinner") ||
                      actLower.includes("break");

                    const companyOnStage =
                      item.companyOnStage === true ||
                      item.companyOnStage === "TRUE";

                    // colouring for non-meal items
                    let bgStyle = {};
                    if (!isMeal) {
                      if (actLower.includes("toolbox")) {
                        bgStyle = {
                          background: "rgba(248, 250, 252, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                        };
                      } else if (actLower.includes("dark time")) {
                        bgStyle = {
                          background: "rgba(255, 214, 100, 0.12)",
                          border: "1px solid rgba(255, 214, 100, 0.3)",
                        };
                      } else if (actLower.includes("quiet time")) {
                        bgStyle = {
                          background: "rgba(255, 100, 120, 0.12)",
                          border: "1px solid rgba(255, 100, 120, 0.25)",
                        };
                      }
                    }

                    return (
                      <article
                        key={i}
                        className={`schedule-item-card${
                          isMeal ? " meal-break" : ""
                        }`}
                        style={bgStyle}
                      >
                        {/* time */}
                        <div
                          className="schedule-time-cell"
                          style={{ width: "80px", flexShrink: 0 }}
                        >
                          {displayTime ? (
                            <div className="schedule-time-pill">
                              <span>{displayTime}</span>
                            </div>
                          ) : null}
                        </div>

                        {/* body */}
                        <div className="schedule-item-body">
                          <div className="schedule-item-top">
                            {rawDept ? (
                              <span className="schedule-dept-pill">
                                {rawDept}
                              </span>
                            ) : (
                              <span />
                            )}
                            {/* don't show badge on meal rows */}
                            {companyOnStage && !isMeal && (
                              <span className="schedule-badge">
                                Company on stage
                              </span>
                            )}
                          </div>

                          <h3 className="schedule-activity">{rawActivity}</h3>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="muted">
                    No activities listed for this day.
                  </div>
                )}
              </div>
            </section>
          );
        })}
    </div>
  );
}

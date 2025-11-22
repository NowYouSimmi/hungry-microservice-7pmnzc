// src/pages/SpacesUsage.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./spaces-usage.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SPACES = [
  { key: "redTheatre", label: "Red Theatre" },
  { key: "blackBox", label: "Black Box" },
  { key: "blueHall", label: "Blue Hall" },
  { key: "lobby", label: "Lobby" },
  { key: "marketplace", label: "Marketplace" },
  { key: "eastPlaza", label: "East Plaza" },
  { key: "externalLocation", label: "External Location" },
  { key: "office", label: "Office" },
  { key: "other", label: "Other" },
];

// ----- Day range: keep these in sync with the scale -----
const DAY_START_HOUR = 8; // 08:00
const DAY_END_HOUR = 24; // 24:00 (midnight)

// Derived minute values
const DAY_START_MINUTES = DAY_START_HOUR * 60;
const DAY_END_MINUTES = DAY_END_HOUR * 60;
const DAY_TOTAL_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES;

/* ---------- Date helpers ---------- */

function parseISODate(dateStr) {
  const [y, m, d] = (dateStr || "").split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatISODate(date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Pretty date for display: "17 Nov 2025"
function formatPrettyDate(iso) {
  const d = parseISODate(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Week range (Mon–Sun) around selected date
function getWeekRange(selectedDateStr) {
  const base = parseISODate(selectedDateStr);
  if (!base) return { startStr: "", endStr: "", label: "" };

  const day = base.getDay(); // 0=Sun,1=Mon,...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startStr = formatISODate(monday);
  const endStr = formatISODate(sunday);
  return {
    startStr,
    endStr,
    label: `Week: ${formatPrettyDate(startStr)} → ${formatPrettyDate(endStr)}`,
  };
}

// Month range for selected date
function getMonthRange(selectedDateStr) {
  const base = parseISODate(selectedDateStr);
  if (!base) return { startStr: "", endStr: "", label: "" };

  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const last = new Date(base.getFullYear(), base.getMonth() + 1, 0);

  const startStr = formatISODate(first);
  const endStr = formatISODate(last);
  const monthName = first.toLocaleString("en", { month: "long" });

  return {
    startStr,
    endStr,
    label: `Month: ${monthName} ${first.getFullYear()} (${formatPrettyDate(
      startStr
    )} → ${formatPrettyDate(endStr)})`,
  };
}

// Academic year: 14 Aug YYYY → 14 Aug YYYY+1
function getAcademicYearRange(selectedDateStr) {
  const base = parseISODate(selectedDateStr);
  if (!base) return { startStr: "", endStr: "", label: "" };

  const year = base.getFullYear();
  const aug14ThisYear = new Date(year, 7, 14); // 7 = August

  let start;
  if (base >= aug14ThisYear) {
    start = aug14ThisYear;
  } else {
    start = new Date(year - 1, 7, 14);
  }

  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);

  const startStr = formatISODate(start);
  const endStr = formatISODate(end);
  return {
    startStr,
    endStr,
    label: `Academic year: ${formatPrettyDate(startStr)} → ${formatPrettyDate(
      endStr
    )}`,
  };
}

function computeDateRange(selectedDateStr, mode) {
  if (mode === "week") return getWeekRange(selectedDateStr);
  if (mode === "month") return getMonthRange(selectedDateStr);
  if (mode === "year") return getAcademicYearRange(selectedDateStr);
  return getWeekRange(selectedDateStr);
}

/* ---------- Time + event helpers ---------- */

// 24h "HH:MM" → minutes
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

// "10am", "7:30pm" → minutes
function parseAmPmTimeToMinutes(label) {
  if (!label) return null;

  const match = label.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!match) return null;

  let [, hStr, mStr, ampm] = match;
  let hours = parseInt(hStr, 10);
  const minutes = mStr ? parseInt(mStr, 10) : 0;

  ampm = ampm.toLowerCase();

  if (ampm === "am") {
    if (hours === 12) hours = 0; // 12am → 0
  } else {
    if (hours !== 12) hours += 12; // 1pm → 13, 12pm → 12
  }

  return hours * 60 + minutes;
}

// Parse "Title, 10am-10pm" (or "Title, All day") into events
function parseCellToEvents(dateStr, spaceKey, cellValue) {
  if (!cellValue || !cellValue.trim()) return [];

  const parts = cellValue
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);

  const events = [];

  for (const part of parts) {
    let titleStr = part;
    let timePart = null;

    // Split at last comma: "Title, 10am-10pm"
    const lastCommaIdx = part.lastIndexOf(",");
    if (lastCommaIdx !== -1) {
      titleStr = part.slice(0, lastCommaIdx).trim();
      timePart = part.slice(lastCommaIdx + 1).trim();
    }

    let startMinutes = DAY_START_MINUTES;
    let endMinutes = DAY_END_MINUTES;

    if (timePart) {
      if (/all\s*day/i.test(timePart)) {
        // All day → full bar (8:00–24:00)
        startMinutes = DAY_START_MINUTES;
        endMinutes = DAY_END_MINUTES;
      } else {
        // "10am-10pm" or "10:30am – 1pm"
        const rangeMatch = timePart.match(/^(.+?)[-–](.+)$/);
        if (rangeMatch) {
          const startLabel = rangeMatch[1].trim();
          const endLabel = rangeMatch[2].trim();

          const parsedStart = parseAmPmTimeToMinutes(startLabel);
          const parsedEnd = parseAmPmTimeToMinutes(endLabel);

          if (parsedStart != null && parsedEnd != null) {
            startMinutes = parsedStart;
            endMinutes = parsedEnd;
          }
        } else {
          // Single time "10am" → assume 2-hour block
          const single = parseAmPmTimeToMinutes(timePart);
          if (single != null) {
            startMinutes = single;
            endMinutes = Math.min(single + 120, DAY_END_MINUTES);
          }
        }
      }
    }

    // Clamp to chart range just in case
    startMinutes = Math.max(startMinutes, DAY_START_MINUTES);
    endMinutes = Math.min(endMinutes, DAY_END_MINUTES);

    events.push({
      id: `${dateStr}-${spaceKey}-${titleStr}-${startMinutes}-${endMinutes}`.replace(
        /\s+/g,
        "_"
      ),
      date: dateStr,
      spaceKey,
      title: titleStr || "Untitled",
      startMinutes,
      endMinutes,
    });
  }

  return events;
}

function buildEventsFromRows(rows) {
  const events = [];
  rows.forEach((row) => {
    const dateStr = row.date;
    SPACES.forEach((space) => {
      const rawValue =
        row[space.key] ??
        row[space.key.toLowerCase()] ??
        row[space.label] ??
        row[space.label.replace(/\s+/g, "")];

      if (rawValue) {
        events.push(...parseCellToEvents(dateStr, space.key, rawValue));
      }
    });
  });
  return events;
}

function getEventsForSpaceAndDate(events, spaceKey, dateStr) {
  return events.filter((ev) => ev.spaceKey === spaceKey && ev.date === dateStr);
}

function findFreeGaps(eventsForDay, minDurationMinutes) {
  const sorted = [...eventsForDay].sort(
    (a, b) => a.startMinutes - b.startMinutes
  );

  const gaps = [];
  let cursor = DAY_START_MINUTES;

  for (const ev of sorted) {
    if (ev.startMinutes > cursor) {
      const gapStart = cursor;
      const gapEnd = ev.startMinutes;
      const gapDuration = gapEnd - gapStart;
      if (gapDuration >= minDurationMinutes) {
        gaps.push({ startMinutes: gapStart, endMinutes: gapEnd });
      }
    }
    cursor = Math.max(cursor, ev.endMinutes);
  }

  if (cursor < DAY_END_MINUTES) {
    const gapDuration = DAY_END_MINUTES - cursor;
    if (gapDuration >= minDurationMinutes) {
      gaps.push({ startMinutes: cursor, endMinutes: DAY_END_MINUTES });
    }
  }

  return gaps;
}

function minutesToTimeLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hStr = h.toString().padStart(2, "0");
  const mStr = m.toString().padStart(2, "0");
  return `${hStr}:${mStr}`;
}

/* ---------- Small helpers ---------- */

function checkIsSpaceBusyNow(eventsForToday) {
  if (!eventsForToday || eventsForToday.length === 0) return false;
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return eventsForToday.some(
    (ev) => minutesNow >= ev.startMinutes && minutesNow < ev.endMinutes
  );
}

function getNextEventToday(eventsForToday) {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const futureEvents = eventsForToday
    .filter((ev) => ev.startMinutes >= minutesNow)
    .sort((a, b) => a.startMinutes - b.startMinutes);
  return futureEvents[0] || null;
}

function isToday(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

/* ---------- UI Components ---------- */

function SpaceButtonGrid({ events, selectedSpaceKey, onSelectSpace }) {
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  return (
    <div className="space-button-grid">
      {SPACES.map((space) => {
        const todayEvents = getEventsForSpaceAndDate(
          events,
          space.key,
          todayStr
        );
        const isBusyNow = checkIsSpaceBusyNow(todayEvents);
        const nextEvent = getNextEventToday(todayEvents);

        return (
          <button
            key={space.key}
            className={`space-button ${
              selectedSpaceKey === space.key ? "selected" : ""
            }`}
            onClick={() => onSelectSpace(space.key)}
          >
            <div className="space-button-header">{space.label}</div>
            <div className={`space-status-pill ${isBusyNow ? "busy" : "free"}`}>
              {isBusyNow ? "In use now" : "Free now"}
            </div>
            <div className="space-button-sub">
              {nextEvent
                ? `Next: ${minutesToTimeLabel(
                    nextEvent.startMinutes
                  )} – ${minutesToTimeLabel(nextEvent.endMinutes)} ${
                    nextEvent.title
                  }`
                : "No more events today"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SpaceDayTimeline({ events, dateStr }) {
  const eventsForDay = [...events].sort(
    (a, b) => a.startMinutes - b.startMinutes
  );

  return (
    <div className="timeline-wrapper">
      {/* Time scale */}
      <div className="timeline-scale">
        {Array.from({
          length: (DAY_END_HOUR - DAY_START_HOUR) / 2, // 2-hour blocks
        }).map((_, idx) => {
          const blockStart = DAY_START_HOUR + idx * 2; // 8,10,12,...
          const blockEnd = blockStart + 2; // 10,12,14,...
          const label = `${blockStart.toString().padStart(2, "0")}–${blockEnd
            .toString()
            .padStart(2, "0")}`;

          return (
            <div key={blockStart} className="timeline-scale-mark">
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Bar with events */}
      <div className="timeline-bar" style={{ position: "relative" }}>
        {eventsForDay.map((ev) => {
          const clampedStart = Math.max(ev.startMinutes, DAY_START_MINUTES);
          const clampedEnd = Math.min(ev.endMinutes, DAY_END_MINUTES);
          const offset =
            ((clampedStart - DAY_START_MINUTES) / DAY_TOTAL_MINUTES) * 100;
          const width = ((clampedEnd - clampedStart) / DAY_TOTAL_MINUTES) * 100;

          return (
            <div
              key={ev.id}
              className="timeline-event"
              style={{ left: `${offset}%`, width: `${width}%` }}
              title={`${minutesToTimeLabel(
                ev.startMinutes
              )} – ${minutesToTimeLabel(ev.endMinutes)} ${ev.title}`}
            >
              <div className="timeline-event-label">
                {minutesToTimeLabel(ev.startMinutes)}–
                {minutesToTimeLabel(ev.endMinutes)} {ev.title}
              </div>
            </div>
          );
        })}

        {isToday(dateStr) && <NowMarker />}
      </div>
    </div>
  );
}

function NowMarker() {
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const clamped = Math.min(
    Math.max(minutesNow, DAY_START_MINUTES),
    DAY_END_MINUTES
  );
  const offset = ((clamped - DAY_START_MINUTES) / DAY_TOTAL_MINUTES) * 100;

  return (
    <div
      className="timeline-now-marker"
      style={{ left: `${offset}%`, position: "absolute" }}
    />
  );
}

function FreeSlotsList({ events, minDurationMinutes }) {
  const gaps = useMemo(
    () => findFreeGaps(events, minDurationMinutes),
    [events, minDurationMinutes]
  );

  if (gaps.length === 0) {
    return (
      <div className="free-slots-empty">No free slots of that length.</div>
    );
  }

  return (
    <ul className="free-slots-list">
      {gaps.map((gap, idx) => (
        <li key={idx}>
          Free {minutesToTimeLabel(gap.startMinutes)} –{" "}
          {minutesToTimeLabel(gap.endMinutes)}
        </li>
      ))}
    </ul>
  );
}

// All Spaces table, filtered by a computed date range
// One row per DATE, even if multiple gsheet rows exist for that date.
function AllSpacesView({ rows, events, range }) {
  if (!range || !range.startStr || !range.endStr) {
    return (
      <div className="all-spaces-view">
        <div className="range-label">No date range selected.</div>
      </div>
    );
  }

  const { startStr, endStr, label } = range;

  const filteredRows = rows
    .filter((row) => row.date && row.date >= startStr && row.date <= endStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filteredRows.length === 0) {
    return (
      <div className="all-spaces-view">
        <div className="range-label">{label}</div>
        <div className="free-slots-empty">
          No dates in this range in the sheet.
        </div>
      </div>
    );
  }

  // Unique dates only → one table row per date
  const uniqueDates = Array.from(
    new Set(filteredRows.map((row) => row.date).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="all-spaces-view">
      <div className="range-label">{label}</div>
      <div className="all-spaces-table-wrapper">
        <table className="all-spaces-table">
          <thead>
            <tr className="spaces-row">
              <th className="spaces-cell spaces-header">Date</th>
              {SPACES.map((space) => (
                <th key={space.key} className="spaces-cell spaces-header">
                  {space.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uniqueDates.map((dateStr) => (
              <tr key={dateStr} className="spaces-row">
                {/* Date column */}
                <td className="spaces-cell spaces-date-cell">
                  {formatPrettyDate(dateStr)}
                </td>

                {SPACES.map((space) => {
                  // This collects ALL events for that date+space,
                  // regardless of which raw row they came from.
                  const eventsForCell = getEventsForSpaceAndDate(
                    events,
                    space.key,
                    dateStr
                  );
                  const inUse = eventsForCell.length > 0;

                  return (
                    <td
                      key={space.key}
                      className={`spaces-cell ${
                        inUse ? "spaces-busy" : "spaces-free"
                      }`}
                    >
                      {inUse ? (
                        <ul className="cell-events-list">
                          {eventsForCell.map((ev) => (
                            <li key={ev.id}>
                              {minutesToTimeLabel(ev.startMinutes)}–
                              {minutesToTimeLabel(ev.endMinutes)} {ev.title}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="cell-free-label">Free</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- MAIN PAGE ---------- */

export default function SpacesUsage() {
  const [rawRows, setRawRows] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("bySpace"); // "bySpace" | "allSpaces"
  const [selectedSpaceKey, setSelectedSpaceKey] = useState(SPACES[0].key);
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [rangeMode, setRangeMode] = useState("week"); // week | month | year
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbzBg2omZY6tG39rQ3SbUippuQXITZHIZ-jy9WqpvcGxn_lu8w0-SaccBWgccd_dQAK5Lg/exec?action=spacesUsage"
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        const rows = Array.isArray(data.rows) ? data.rows : data;

        setRawRows(rows);
        setEvents(buildEventsFromRows(rows));
      } catch (err) {
        console.error(err);
        setError("Failed to load spaces usage data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const selectedSpace = SPACES.find((s) => s.key === selectedSpaceKey);
  const eventsForSelected = getEventsForSpaceAndDate(
    events,
    selectedSpaceKey,
    selectedDateStr
  );

  const range = useMemo(
    () => computeDateRange(selectedDateStr, rangeMode),
    [selectedDateStr, rangeMode]
  );

  return (
    <div className="spaces-usage-page">
      <h1>Spaces Usage</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "bySpace" ? "tab active" : "tab"}
          onClick={() => setActiveTab("bySpace")}
        >
          By Space
        </button>
        <button
          className={activeTab === "allSpaces" ? "tab active" : "tab"}
          onClick={() => setActiveTab("allSpaces")}
        >
          All Spaces
        </button>
      </div>

      {loading && <div className="loading">Loading…</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <>
          {activeTab === "bySpace" && (
            <div className="by-space-view">
              <SpaceButtonGrid
                events={events}
                selectedSpaceKey={selectedSpaceKey}
                onSelectSpace={setSelectedSpaceKey}
              />

              <div className="space-detail-panel">
                <div className="space-detail-header">
                  <h2>{selectedSpace?.label}</h2>
                  <label>
                    Date:{" "}
                    <DatePicker
                      selected={parseISODate(selectedDateStr)}
                      onChange={(date) => {
                        if (date) {
                          setSelectedDateStr(formatISODate(date)); // keep ISO for logic
                        }
                      }}
                      dateFormat="dd-MM-yy"
                      showPopperArrow={false}
                    />
                  </label>
                </div>

                <SpaceDayTimeline
                  events={eventsForSelected}
                  dateStr={selectedDateStr}
                />

                <div className="free-slots-section">
                  <h3>Free 2-hour slots (this date)</h3>
                  <FreeSlotsList
                    events={eventsForSelected}
                    minDurationMinutes={120}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "allSpaces" && (
            <>
              <div className="all-spaces-controls">
                <div className="all-spaces-controls-row">
                  <label>
                    Date:{" "}
                    <DatePicker
                      selected={parseISODate(selectedDateStr)}
                      onChange={(date) => {
                        if (date) {
                          setSelectedDateStr(formatISODate(date));
                        }
                      }}
                      dateFormat="dd-MM-yy"
                      showPopperArrow={false}
                    />
                  </label>

                  <label>
                    View:{" "}
                    <select
                      value={rangeMode}
                      onChange={(e) => setRangeMode(e.target.value)}
                    >
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="year">Academic year</option>
                    </select>
                  </label>
                </div>
              </div>

              <AllSpacesView rows={rawRows} events={events} range={range} />
            </>
          )}
        </>
      )}
    </div>
  );
}

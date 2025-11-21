// src/pages/InventoryCore.jsx
import React, { useEffect, useMemo, useState } from "react";

// special token for full-inventory mode
const ALL = "__ALL__";

// mobile-first styles injected by component
const MOBILE_STYLES = `
/* Remove any horizontal scroll on our grouped areas */
.inv-table-scroll { overflow-x: hidden !important; }

/* Accordion shell */
.inv-accordion { border-bottom: 1px solid rgba(148, 163, 184, 0.2); }
.inv-accordion-summary {
  list-style: none; cursor: pointer; padding: 10px 12px;
  background: rgba(15, 23, 42, 0.35);
}
.inv-accordion-summary::-webkit-details-marker { display: none; }
.inv-acc-title {
  display: flex; align-items: center; gap: 12px;
  justify-content: space-between; flex-wrap: wrap;
}
.inv-acc-name { font-weight: 700; font-size: 1rem; flex: 1 1 auto; }
.inv-acc-meta { display: flex; flex-direction: column; align-items: flex-end; min-width: 60px; }
.inv-acc-meta-label { font-size: 0.65rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.02em; }
.inv-acc-meta-value { font-weight: 700; font-size: 0.95rem; color: #9ecfff; }

/* Body */
.inv-accordion-body { padding: 8px 12px 12px; display: grid; gap: 10px; }

/* Variant rows (each type/location) */
.inv-variant-row {
  display: grid; gap: 10px; grid-template-columns: 1fr;
  background: rgba(15, 23, 42, 0.25);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px; padding: 10px;
}
.inv-variant-main { display: grid; gap: 4px; }
.inv-variant-line { font-size: 0.9rem; }
.inv-variant-label { opacity: 0.7; }
.inv-variant-value { font-weight: 600; }

/* Numbers + action */
.inv-variant-stats { display: flex; gap: 14px; }
.stat { min-width: 64px; }
.stat-label { font-size: 0.7rem; opacity: 0.6; text-transform: uppercase; }
.stat-value { font-weight: 700; font-size: 0.95rem; }

/* Button area */
.inv-variant-actions { display: flex; justify-content: flex-start; }

/* Wider screens: lay out as 3 columns */
@media (min-width: 680px) {
  .inv-variant-row { grid-template-columns: 1.2fr auto auto; align-items: center; }
  .inv-variant-actions { justify-content: flex-end; }
}

/* Make "Currently in use" table mobile-friendly (stacked) */
@media (max-width: 768px) {
  .inuse-table { width: 100%; min-width: unset; border-collapse: collapse; }
  .inuse-table thead { display: none; }
  .inuse-table tbody tr {
    display: flex; flex-direction: column;
    background: rgba(15,23,42,0.3);
    margin-bottom: 10px; border-radius: 10px; padding: 10px;
  }
  .inuse-table td { display: flex; justify-content: space-between; border: none; padding: 6px 0; }
  .inuse-table td::before { content: attr(data-label); font-weight: 600; opacity: 0.7; }
  .inv-scroll-hint { display: none; }
}
`;

function norm(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export default function InventoryCore({
  title = "Inventory",
  apiUrl,
  showsUrl,
  currentUser,
}) {
  const [inventory, setInventory] = useState([]);
  const [inUse, setInUse] = useState([]);
  const [shows, setShows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [activeCategory, setActiveCategory] = useState(null); // null | category name | ALL
  const [modalItem, setModalItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const [inUseOpen, setInUseOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "item", dir: "asc" });

  // build in-use lookup: normalized key → qty
  const inUseMap = useMemo(() => {
    const m = {};
    (inUse || []).forEach((r) => {
      const key = [norm(r.category), norm(r.item), norm(r.type)].join("||");
      m[key] = (m[key] || 0) + Number(r.qty || 0);
    });
    return m;
  }, [inUse]);

  // compute rows with out/available derived from live inUse only
  function computeRows(items, inUseMap) {
    return (items || []).map((it) => {
      const key = [norm(it.category), norm(it.item), norm(it.type)].join("||");

      const total = Number(it.totalQty ?? it.total ?? 0);
      const outRaw = Number(inUseMap[key] || 0);
      const out = Math.max(0, Math.min(total, outRaw));

      // 👇 Only derived from total & log; ignore any sheet 'available'
      const available = total > 0 ? Math.max(0, total - out) : 0;

      return { ...it, _total: total, _out: out, _available: available };
    });
  }

  function groupByItem(rows) {
    const groups = rows.reduce((acc, r) => {
      const k = (r.item || r.name || "Unknown").trim().toLowerCase();
      if (!acc[k]) {
        acc[k] = {
          itemName: r.item || r.name || "Unknown",
          rows: [],
          sumTotal: 0,
          sumOut: 0,
          sumAvailable: 0,
        };
      }
      acc[k].rows.push(r);
      acc[k].sumTotal += r._total || 0;
      acc[k].sumOut += Math.min(r._out || 0, r._total || 0);
      acc[k].sumAvailable += r._available || 0;
      return acc;
    }, {});
    return Object.values(groups).sort((a, b) =>
      a.itemName.localeCompare(b.itemName)
    );
  }

  // ----------------------------------------------------
  // load all (Stage-style + fallback for older endpoints)
  // ----------------------------------------------------
  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${apiUrl}?action=all&cb=${Date.now()}`, {
        cache: "no-store",
      });
      const json = await res.json();

      // 🔹 Case 1: Endpoint returns a bare array → treat as full inventory, no in-use data
      if (Array.isArray(json)) {
        setInventory(json);
        setInUse([]);
        setLoading(false);
        return;
      }

      // 🔹 Case 2: Script doesn't support action=all → fall back to getInventory/getCheckedOut
      if (json.ok === false && /Unknown action/i.test(json.error || "")) {
        const [invRes, inuseRes] = await Promise.all([
          fetch(`${apiUrl}?action=getInventory&cb=${Date.now()}`, {
            cache: "no-store",
          }),
          fetch(`${apiUrl}?action=getCheckedOut&cb=${Date.now()}`, {
            cache: "no-store",
          }),
        ]);

        const invJson = await invRes.json();
        const inuseJson = await inuseRes.json();
        if (!invJson.ok) throw new Error(invJson.error || "Failed inventory");
        if (!inuseJson.ok) throw new Error(inuseJson.error || "Failed in use");

        setInventory(invJson.data || []);
        setInUse(inuseJson.data || []);
        setLoading(false);
        return;
      }

      // 🔹 Case 3: Stage-style object: { ok, inventory, inuse } or similar
      const inv =
        json.inventory ||
        (Array.isArray(json.data) ? json.data : json.data?.inventory) ||
        [];
      const inuse = json.inuse || json.data?.inuse || [];

      setInventory(inv || []);
      setInUse(inuse || []);
    } catch (e) {
      console.error(e);
      setErr(String(e.message || e));
      setInventory([]);
      setInUse([]);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------
  // load shows (for dropdown)
  // ----------------------------------------------------
  async function loadShows() {
    if (!showsUrl) {
      setShows([]);
      return;
    }

    try {
      const res = await fetch(`${showsUrl}?cb=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      let arr = [];
      if (Array.isArray(data.shows)) arr = data.shows;
      else if (Array.isArray(data.data)) arr = data.data;
      else if (Array.isArray(data.items)) arr = data.items;
      else if (Array.isArray(data.result)) arr = data.result;
      else if (Array.isArray(data)) arr = data;

      const normShow = (arr || []).map((s, i) => {
        if (Array.isArray(s)) {
          return {
            id: `SHOW-${i + 1}`,
            title: s[1] || `Show ${i + 1}`,
            venue: s[2] || "",
            dates: s[0] || "",
          };
        }
        return {
          id: s.id || `SHOW-${i + 1}`,
          title:
            s.showName ||
            s["Show Name"] ||
            s.Title ||
            s.Event ||
            s.name ||
            `Show ${i + 1}`,
          venue: s.venue || s.Venue || "",
          dates: s.dates || s.Dates || "",
        };
      });

      setShows(normShow);
    } catch (e) {
      console.warn("loadShows failed:", e.message);
      setShows([]);
    }
  }

  useEffect(() => {
    if (!apiUrl) {
      setErr("No apiUrl provided to InventoryCore");
      setLoading(false);
      return;
    }
    loadAll();
    loadShows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]);

  // ----------------------------------------------------
  // categories
  // ----------------------------------------------------
  const categories = useMemo(() => {
    const byCat = {};
    (inventory || []).forEach((row) => {
      const cat =
        row.category && row.category.trim()
          ? row.category.trim()
          : "Uncategorized";
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(row);
    });

    const list = Object.entries(byCat).map(([name, items]) => {
      const rows = computeRows(items, inUseMap);
      const totalItems = items.length;
      const totalAvailable = rows.reduce((a, r) => a + (r._available || 0), 0);
      return { name, totalItems, totalAvailable };
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, inUseMap]);

  // items for selected category (or ALL)
  const currentItems = useMemo(() => {
    if (!activeCategory) return [];
    if (activeCategory === ALL) return inventory || [];
    return (inventory || []).filter((row) => {
      const cat =
        row.category && row.category.trim()
          ? row.category.trim()
          : "Uncategorized";
      return cat === activeCategory;
    });
  }, [inventory, activeCategory]);

  // distinct locations for current context (category or ALL)
  const currentLocations = useMemo(() => {
    const s = new Set();
    const src =
      activeCategory === ALL || activeCategory ? currentItems : inventory;
    (src || []).forEach((it) => {
      const loc = (it.location || "").trim();
      if (loc) s.add(loc);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [currentItems, inventory, activeCategory]);

  // apply location filter
  const filteredItems = useMemo(() => {
    const src = currentItems || [];
    if (!locationFilter) return src;
    return src.filter((it) => (it.location || "").trim() === locationFilter);
  }, [currentItems, locationFilter]);

  // group in-use by category
  const inUseByCategory = useMemo(() => {
    const map = {};
    (inUse || []).forEach((r) => {
      const cat = (r.category || "Uncategorized").trim();
      if (!map[cat]) map[cat] = [];
      map[cat].push(r);
    });

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, rows]) => ({
        name,
        rows,
        totalCheckedOut: rows.reduce((a, r) => a + Number(r.qty || 0), 0),
      }));
  }, [inUse]);

  // ----------------------------------------------------
  // checkout submit
  // ----------------------------------------------------
  async function handleCheckoutSubmit(formData) {
    setSaving(true);
    try {
      const qs = new URLSearchParams({
        action: "checkout",
        item: formData.item || "",
        category: formData.category || "",
        type: formData.type || "",
        qty: String(formData.qty || 0),
        eventTitle: formData.eventTitle || "",
        event: formData.eventTitle || "",
        location: formData.location || "",
        name: formData.name || "",
        cb: String(Date.now()),
      }).toString();

      const res = await fetch(`${apiUrl}?${qs}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Checkout failed");

      const inv = json.inventory || (json.data && json.data.inventory) || [];
      const inuse = json.inuse || (json.data && json.data.inuse) || [];

      setInventory(inv);
      setInUse(inuse);
      setModalItem(null);
    } catch (e) {
      alert("Checkout failed: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  // ----------------------------------------------------
  // return / checkin
  // ----------------------------------------------------
  async function handleReturn(checkoutId, qty) {
    try {
      const qs = new URLSearchParams({
        action: "checkin",
        id: checkoutId,
        qty: String(qty || 0),
        cb: String(Date.now()),
      }).toString();

      const res = await fetch(`${apiUrl}?${qs}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Checkin failed");

      const inv = json.inventory || (json.data && json.data.inventory) || [];
      const inuse = json.inuse || (json.data && json.data.inuse) || [];

      setInventory(inv);
      setInUse(inuse);
    } catch (e) {
      alert("Return failed: " + e.message);
    }
  }

  return (
    <div className="page inventory">
      {/* Inject mobile-first styles */}
      <style>{MOBILE_STYLES}</style>

      {/* header */}
      <div
        className="flex items-center justify-between gap-4"
        style={{ marginBottom: "0.75rem" }}
      >
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm" style={{ color: "rgba(226,232,240,.45)" }}>
            {activeCategory
              ? activeCategory === ALL
                ? "All categories, grouped by category → item."
                : "Items in this category."
              : "Select a category, view full inventory, or see currently-out items below."}
          </p>
        </div>
        {activeCategory && (
          <button
            onClick={() => {
              setActiveCategory(null);
              setLocationFilter("");
            }}
            className="btn dark"
          >
            ← All categories
          </button>
        )}
      </div>

      {err && <p className="error">{err}</p>}
      {loading && <p className="muted">Loading…</p>}

      {/* IN USE (accordion) */}
      <div className="card" style={{ marginBottom: "1rem", padding: 0 }}>
        <details
          className="inv-accordion"
          open={inUseOpen}
          onToggle={(e) => setInUseOpen(e.currentTarget.open)}
        >
          <summary className="inv-accordion-summary">
            <div className="inv-acc-title">
              <div className="inv-acc-name">Currently in use</div>
              <div className="inv-acc-meta">
                <div className="inv-acc-meta-label">Records</div>
                <div className="inv-acc-meta-value">{inUse.length}</div>
              </div>
            </div>
          </summary>

          <div className="inv-accordion-body">
            {inUse.length === 0 ? (
              <p className="muted" style={{ marginTop: ".25rem" }}>
                Nothing is currently checked out.
              </p>
            ) : (
              <>
                {inUseByCategory.map((cat, ci) => (
                  <details key={ci} className="inv-accordion">
                    <summary className="inv-accordion-summary">
                      <div className="inv-acc-title">
                        <div className="inv-acc-name">{cat.name}</div>
                        <div className="inv-acc-meta">
                          <div className="inv-acc-meta-label">Records</div>
                          <div className="inv-acc-meta-value">
                            {cat.rows.length}
                          </div>
                        </div>
                        <div className="inv-acc-meta">
                          <div className="inv-acc-meta-label">Qty out</div>
                          <div className="inv-acc-meta-value">
                            {cat.totalCheckedOut}
                          </div>
                        </div>
                      </div>
                    </summary>

                    <div className="inv-accordion-body">
                      <div className="inv-table-scroll">
                        <table
                          className="w-full text-left inuse-table"
                          style={{ marginTop: ".25rem", minWidth: "0" }}
                        >
                          <thead>
                            <tr>
                              <th className="p-1">Item</th>
                              <th className="p-1">Type</th>
                              <th className="p-1">Qty</th>
                              <th className="p-1">Event</th>
                              <th className="p-1">Location</th>
                              <th className="p-1"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.rows.map((r, i) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="p-1" data-label="Item">
                                  {r.item || r.name}
                                </td>
                                <td className="p-1" data-label="Type">
                                  {r.type || "—"}
                                </td>
                                <td
                                  className="p-1"
                                  data-label="Qty"
                                  style={{ color: "#fca5a5" }}
                                >
                                  {r.qty}
                                </td>
                                <td className="p-1" data-label="Event">
                                  {r.eventTitle || r.show}
                                </td>
                                <td className="p-1" data-label="Location">
                                  {r.location}
                                </td>
                                <td className="p-1" data-label="Actions">
                                  <button
                                    onClick={() =>
                                      handleReturn(r.checkoutId, r.qty)
                                    }
                                    className="btn ghost"
                                    style={{
                                      fontSize: "0.7rem",
                                      padding: "3px 9px",
                                    }}
                                  >
                                    Return
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </details>
                ))}
              </>
            )}
          </div>
        </details>
      </div>

      {/* CATEGORY LIST + Full inventory button */}
      {!loading && !activeCategory && (
        <>
          <div
            className="home-actions"
            style={{
              display: "grid",
              gap: "14px",
              maxWidth: "280px",
              margin: "0 auto",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.name}
                className="btn"
                onClick={() => {
                  setActiveCategory(cat.name);
                  setLocationFilter("");
                  setSortConfig({ key: "item", dir: "asc" });
                }}
                style={{ justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{cat.name}</div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.65 }}>
                    {cat.totalItems} item{cat.totalItems === 1 ? "" : "s"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      opacity: 0.6,
                    }}
                  >
                    Available
                  </div>
                  <div style={{ color: "#9ecfff", fontWeight: 600 }}>
                    {cat.totalAvailable}
                  </div>
                </div>
              </button>
            ))}
            {!categories.length && (
              <div className="muted">No categories found.</div>
            )}
          </div>

          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <button
              className="btn primary"
              onClick={() => {
                setActiveCategory(ALL);
                setLocationFilter("");
                setSortConfig({ key: "item", dir: "asc" });
              }}
            >
              View full inventory
            </button>
          </div>
        </>
      )}

      {/* ITEMS FOR SELECTED CATEGORY */}
      {!loading && activeCategory && activeCategory !== ALL && (
        <div className="space-y-2" style={{ marginTop: "1.25rem" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {activeCategory}
              <span
                style={{ color: "rgba(226,232,240,.4)", fontSize: "0.8rem" }}
              >
                ({filteredItems.length} item
                {filteredItems.length === 1 ? "" : "s"})
              </span>
            </h2>

            {currentLocations.length > 0 && (
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={{
                  background: "rgba(15,23,42,0.45)",
                  border: "1px solid rgba(148, 163, 184, 0.4)",
                  borderRadius: "10px",
                  padding: "6px 10px",
                  color: "white",
                  fontSize: "0.8rem",
                }}
              >
                <option value="">All locations</option>
                {currentLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="grouped-list">
              {(() => {
                const rows = computeRows(filteredItems, inUseMap);
                const itemGroups = groupByItem(rows);

                if (!itemGroups.length) {
                  return (
                    <div className="p-3">
                      <span className="muted">No items match this filter.</span>
                    </div>
                  );
                }

                return itemGroups.map((g, i) => (
                  <details key={i} className="inv-accordion">
                    <summary className="inv-accordion-summary">
                      <div className="inv-acc-title">
                        <div className="inv-acc-name">{g.itemName}</div>
                        <div className="inv-acc-meta">
                          <div className="inv-acc-meta-label">Total</div>
                          <div className="inv-acc-meta-value">{g.sumTotal}</div>
                        </div>
                        <div className="inv-acc-meta">
                          <div className="inv-acc-meta-label">Out</div>
                          <div className="inv-acc-meta-value">{g.sumOut}</div>
                        </div>
                        <div className="inv-acc-meta">
                          <div className="inv-acc-meta-label">Avail</div>
                          <div
                            className="inv-acc-meta-value"
                            style={{
                              color:
                                g.sumAvailable === 0 ? "#fca5a5" : "inherit",
                            }}
                          >
                            {g.sumAvailable}
                          </div>
                        </div>
                      </div>
                    </summary>

                    <div className="inv-accordion-body">
                      {g.rows
                        .sort((a, b) => {
                          const at = (a.type || "").toLowerCase();
                          const bt = (b.type || "").toLowerCase();
                          if (at !== bt) return at < bt ? -1 : 1;
                          const al = (a.location || "").toLowerCase();
                          const bl = (b.location || "").toLowerCase();
                          if (al !== bl) return al < bl ? -1 : 1;
                          return 0;
                        })
                        .map((it, idx) => (
                          <div key={idx} className="inv-variant-row">
                            <div className="inv-variant-main">
                              <div className="inv-variant-line">
                                <span className="inv-variant-label">Type:</span>{" "}
                                <span className="inv-variant-value">
                                  {it.type || "—"}
                                </span>
                              </div>
                              <div className="inv-variant-line">
                                <span className="inv-variant-label">
                                  Location:
                                </span>{" "}
                                <span className="inv-variant-value">
                                  {it.location || "—"}
                                </span>
                              </div>
                            </div>

                            <div className="inv-variant-stats">
                              <div className="stat">
                                <div className="stat-label">Total</div>
                                <div className="stat-value">{it._total}</div>
                              </div>
                              <div className="stat">
                                <div className="stat-label">Out</div>
                                <div className="stat-value">
                                  {Math.min(it._out, it._total)}
                                </div>
                              </div>
                              <div className="stat">
                                <div className="stat-label">Avail</div>
                                <div
                                  className="stat-value"
                                  style={{
                                    color:
                                      it._available === 0
                                        ? "#fca5a5"
                                        : "rgba(226,232,240,.95)",
                                  }}
                                >
                                  {it._available}
                                </div>
                              </div>
                            </div>

                            <div className="inv-variant-actions">
                              <button
                                disabled={it._available === 0}
                                onClick={() =>
                                  setModalItem({
                                    ...it,
                                    available: it._available,
                                    totalQty: it._total,
                                  })
                                }
                                className={
                                  it._available === 0
                                    ? "btn ghost"
                                    : "btn primary"
                                }
                                style={{
                                  fontSize: "0.8rem",
                                  padding: "6px 12px",
                                }}
                              >
                                Check out
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </details>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* FULL INVENTORY (ALL categories → category accordion → item accordion) */}
      {!loading && activeCategory === ALL && (
        <div className="space-y-2" style={{ marginTop: "1.25rem" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Full inventory</h2>
            {currentLocations.length > 0 && (
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={{
                  background: "rgba(15,23,42,0.45)",
                  border: "1px solid rgba(148, 163, 184, 0.4)",
                  borderRadius: "10px",
                  padding: "6px 10px",
                  color: "white",
                  fontSize: "0.8rem",
                }}
              >
                <option value="">All locations</option>
                {currentLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="card" style={{ padding: 0 }}>
            {categories.map((cat, ci) => {
              const catItems = (inventory || []).filter((row) => {
                const c =
                  row.category && row.category.trim()
                    ? row.category.trim()
                    : "Uncategorized";
                if (c !== cat.name) return false;
                if (!locationFilter) return true;
                return (row.location || "").trim() === locationFilter;
              });

              const rows = computeRows(catItems, inUseMap);
              if (!rows.length) return null;

              const itemGroups = groupByItem(rows);
              const sumTotal = rows.reduce((a, r) => a + (r._total || 0), 0);
              const sumOut = rows.reduce(
                (a, r) => a + Math.min(r._out || 0, r._total || 0),
                0
              );
              const sumAvail = rows.reduce(
                (a, r) => a + (r._available || 0),
                0
              );

              return (
                <details key={ci} className="inv-accordion">
                  <summary className="inv-accordion-summary">
                    <div className="inv-acc-title">
                      <div className="inv-acc-name">{cat.name}</div>
                      <div className="inv-acc-meta">
                        <div className="inv-acc-meta-label">Total</div>
                        <div className="inv-acc-meta-value">{sumTotal}</div>
                      </div>
                      <div className="inv-acc-meta">
                        <div className="inv-acc-meta-label">Out</div>
                        <div className="inv-acc-meta-value">{sumOut}</div>
                      </div>
                      <div className="inv-acc-meta">
                        <div className="inv-acc-meta-label">Avail</div>
                        <div
                          className="inv-acc-meta-value"
                          style={{
                            color: sumAvail === 0 ? "#fca5a5" : "inherit",
                          }}
                        >
                          {sumAvail}
                        </div>
                      </div>
                    </div>
                  </summary>

                  <div className="inv-accordion-body">
                    {itemGroups.map((g, gi) => (
                      <details key={gi} className="inv-accordion">
                        <summary className="inv-accordion-summary">
                          <div className="inv-acc-title">
                            <div className="inv-acc-name">{g.itemName}</div>
                            <div className="inv-acc-meta">
                              <div className="inv-acc-meta-label">Total</div>
                              <div className="inv-acc-meta-value">
                                {g.sumTotal}
                              </div>
                            </div>
                            <div className="inv-acc-meta">
                              <div className="inv-acc-meta-label">Out</div>
                              <div className="inv-acc-meta-value">
                                {g.sumOut}
                              </div>
                            </div>
                            <div className="inv-acc-meta">
                              <div className="inv-acc-meta-label">Avail</div>
                              <div
                                className="inv-acc-meta-value"
                                style={{
                                  color:
                                    g.sumAvailable === 0
                                      ? "#fca5a5"
                                      : "inherit",
                                }}
                              >
                                {g.sumAvailable}
                              </div>
                            </div>
                          </div>
                        </summary>

                        <div className="inv-accordion-body">
                          {g.rows
                            .sort((a, b) => {
                              const at = (a.type || "").toLowerCase();
                              const bt = (b.type || "").toLowerCase();
                              if (at !== bt) return at < bt ? -1 : 1;
                              const al = (a.location || "").toLowerCase();
                              const bl = (b.location || "").toLowerCase();
                              if (al !== bl) return al < bl ? -1 : 1;
                              return 0;
                            })
                            .map((it, idx) => (
                              <div key={idx} className="inv-variant-row">
                                <div className="inv-variant-main">
                                  <div className="inv-variant-line">
                                    <span className="inv-variant-label">
                                      Type:
                                    </span>{" "}
                                    <span className="inv-variant-value">
                                      {it.type || "—"}
                                    </span>
                                  </div>
                                  <div className="inv-variant-line">
                                    <span className="inv-variant-label">
                                      Location:
                                    </span>{" "}
                                    <span className="inv-variant-value">
                                      {it.location || "—"}
                                    </span>
                                  </div>
                                </div>

                                <div className="inv-variant-stats">
                                  <div className="stat">
                                    <div className="stat-label">Total</div>
                                    <div className="stat-value">
                                      {it._total}
                                    </div>
                                  </div>
                                  <div className="stat">
                                    <div className="stat-label">Out</div>
                                    <div className="stat-value">
                                      {Math.min(it._out, it._total)}
                                    </div>
                                  </div>
                                  <div className="stat">
                                    <div className="stat-label">Avail</div>
                                    <div
                                      className="stat-value"
                                      style={{
                                        color:
                                          it._available === 0
                                            ? "#fca5a5"
                                            : "rgba(226,232,240,.95)",
                                      }}
                                    >
                                      {it._available}
                                    </div>
                                  </div>
                                </div>

                                <div className="inv-variant-actions">
                                  <button
                                    disabled={it._available === 0}
                                    onClick={() =>
                                      setModalItem({
                                        ...it,
                                        available: it._available,
                                        totalQty: it._total,
                                      })
                                    }
                                    className={
                                      it._available === 0
                                        ? "btn ghost"
                                        : "btn primary"
                                    }
                                    style={{
                                      fontSize: "0.8rem",
                                      padding: "6px 12px",
                                    }}
                                  >
                                    Check out
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {modalItem && (
        <CheckoutModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onSubmit={handleCheckoutSubmit}
          saving={saving}
          shows={shows}
          currentUser={currentUser} // 👈 hand it into the modal
        />
      )}
    </div>
  );
}

/* =========================================================
   Checkout modal
   ========================================================= */
function CheckoutModal({
  item,
  onClose,
  onSubmit,
  saving,
  shows = [],
  currentUser, // 👈 NEW prop
}) {
  const [qty, setQty] = useState(1);
  const [eventTitle, setEventTitle] = useState("");
  const [location, setLocation] = useState(item.location || "");

  // 👇 derive a sensible default name from the logged-in user
  const defaultName =
    (currentUser &&
      (currentUser.name ||
        currentUser.displayName ||
        currentUser.netId ||
        currentUser.id ||
        currentUser.email)) ||
    "";

  const [name, setName] = useState(defaultName); // 👈 now auto-filled

  const max = item.available ?? item._available ?? 0;

  function handleShowPick(e) {
    const val = e.target.value;
    if (!val) return;
    const chosen = shows.find((s) => String(s.id) === String(val));
    if (!chosen) return;
    if (!eventTitle) setEventTitle(chosen.title || "");
    if (!location) setLocation(chosen.venue || "");
  }

  function submit() {
    if (qty < 1) return;
    onSubmit({
      category: item.category,
      item: item.item || item.name,
      type: item.type,
      qty: Number(qty),
      eventTitle,
      location,
      name, // ✅ now comes from login by default
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div className="modal-title">
            Check out: {item.item || item.name}
            {item.type ? ` (${item.type})` : ""}
          </div>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="muted" style={{ marginBottom: "0.5rem" }}>
            Available: {max} / Total: {item.totalQty ?? item._total ?? "?"}
          </p>

          <div className="field">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              max={max || undefined}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Assign to show (optional)</label>
            <select
              defaultValue=""
              onChange={handleShowPick}
              style={{
                background: "rgba(15,23,42,0.45)",
                border: "1px solid rgba(148, 163, 184, 0.4)",
                borderRadius: "10px",
                padding: "8px 10px",
                color: "white",
                fontSize: "0.85rem",
              }}
            >
              <option value="">— Select show —</option>
              {shows.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} {s.venue ? `(${s.venue})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Event Title</label>
            <input
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Tech run, Opening, ..."
            />
          </div>

          <div className="field">
            <label>Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Red Theatre / Black Box / Offsite"
            />
          </div>

          <div className="field">
            <label>Name (responsible)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Person taking it"
              // If you want this LOCKED to the login, use:
              // readOnly
            />
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn ghost">
            Cancel
          </button>
          <button onClick={submit} disabled={saving} className="btn primary">
            {saving ? "Saving…" : "Check out"}
          </button>
        </div>
      </div>
    </div>
  );
}

// src/pages/RiggingCalc.jsx
import React, { useState, useMemo, useEffect } from "react";

export default function RiggingCalc() {
  // core inputs
  const [trussLength, setTrussLength] = useState(8); // m
  const [hoistWLL, setHoistWLL] = useState(500); // kg
  const [numPoints, setNumPoints] = useState(2);

  // load mode
  const [loadType, setLoadType] = useState("udl"); // "udl" | "point"

  // UDL input
  const [totalLoad, setTotalLoad] = useState(500); // kg

  // Point load input
  const [pointLoad, setPointLoad] = useState(300); // kg
  const [pointPos, setPointPos] = useState(4); // m from left

  // dynamic option
  const [includeDynamic, setIncludeDynamic] = useState(false);
  const DYNAMIC_FACTOR = 1.2; // +20%

  // Prolyte H30V (approx) for comparison
  const h30vTable = [
    { span: 2, udl: 1700, point: 850 },
    { span: 4, udl: 730, point: 900 },
    { span: 6, udl: 400, point: 850 },
    { span: 8, udl: 250, point: 800 },
    { span: 10, udl: 170, point: 700 },
    { span: 12, udl: 125, point: 600 },
    { span: 14, udl: 95, point: 500 },
    { span: 16, udl: 70, point: 400 },
  ];

  // choose closest table span to actual truss length
  const trussSpec = useMemo(() => {
    let closest = h30vTable[0];
    let bestDiff = Math.abs(h30vTable[0].span - trussLength);
    for (const row of h30vTable) {
      const diff = Math.abs(row.span - trussLength);
      if (diff < bestDiff) {
        bestDiff = diff;
        closest = row;
      }
    }
    return closest;
  }, [trussLength]);

  // default hoist positions: evenly spaced
  const makeDefaultPositions = (count, length) => {
    return Array.from({ length: count }, (_, idx) => {
      if (count === 1) return length / 2;
      return (idx / (count - 1)) * length;
    });
  };

  const [positions, setPositions] = useState(() =>
    makeDefaultPositions(2, trussLength)
  );

  // keep positions in sync
  useEffect(() => {
    setPositions((prev) => {
      const fresh = makeDefaultPositions(numPoints, trussLength);
      return fresh.map((p, i) => (prev[i] !== undefined ? prev[i] : p));
    });
  }, [numPoints, trussLength]);

  const handlePosChange = (idx, value) => {
    const num = Number(value);
    const clamped = Math.max(0, Math.min(num, trussLength));
    setPositions((prev) => {
      const next = [...prev];
      next[idx] = clamped;
      return next;
    });
  };

  // ===== main calc =====
  const {
    orderedPositions,
    loadsPerPoint,
    maxPointLoad,
    udlApplied,
    withinTrussUDL,
    withinHoist,
    withinPointLimit,
  } = useMemo(() => {
    const length = trussLength > 0 ? trussLength : 0.0001;
    const hoists = [...positions].slice(0, numPoints).sort((a, b) => a - b);

    let loads = new Array(hoists.length).fill(0);
    let udlForTable = 0;
    let withinUDL = true;

    if (loadType === "udl") {
      // UDL -> tributary method
      const udl = totalLoad / length;
      const tribs = hoists.map((x, i) => {
        if (hoists.length === 1) return length;
        if (i === 0) {
          const mid = (x + hoists[1]) / 2;
          return mid - 0;
        }
        if (i === hoists.length - 1) {
          const prev = hoists[hoists.length - 2];
          const mid = (x + prev) / 2;
          return length - mid;
        }
        const prev = hoists[i - 1];
        const next = hoists[i + 1];
        return (next - prev) / 2;
      });
      loads = tribs.map((t) => t * udl);

      // compare to closest table
      udlForTable = totalLoad / trussSpec.span;
      withinUDL = udlForTable <= trussSpec.udl;
    } else {
      // POINT LOAD
      const p = Math.max(0, Math.min(pointPos, length));

      if (hoists.length === 1) {
        loads[0] = pointLoad;
      } else {
        let idxRight = hoists.findIndex((h) => h >= p);
        if (idxRight === -1) {
          loads[hoists.length - 1] = pointLoad;
        } else if (idxRight === 0) {
          loads[0] = pointLoad;
        } else {
          const idxLeft = idxRight - 1;
          const xL = hoists[idxLeft];
          const xR = hoists[idxRight];
          const spanSeg = xR - xL;

          if (spanSeg === 0) {
            loads[idxLeft] += pointLoad / 2;
            loads[idxRight] += pointLoad / 2;
          } else {
            const distL = p - xL;
            const distR = xR - p;
            const loadLeft = (distR / spanSeg) * pointLoad;
            const loadRight = (distL / spanSeg) * pointLoad;
            loads[idxLeft] += loadLeft;
            loads[idxRight] += loadRight;
          }
        }
      }

      udlForTable = 0;
      withinUDL = true;
    }

    const maxLoad = loads.length ? Math.max(...loads) : 0;
    const withinHoistWLL = maxLoad <= hoistWLL;
    const withinPoint = maxLoad <= trussSpec.point;

    return {
      orderedPositions: hoists,
      loadsPerPoint: loads,
      maxPointLoad: maxLoad,
      udlApplied: udlForTable,
      withinTrussUDL: withinUDL,
      withinHoist: withinHoistWLL,
      withinPointLimit: withinPoint,
    };
  }, [
    loadType,
    trussLength,
    positions,
    numPoints,
    totalLoad,
    pointLoad,
    pointPos,
    trussSpec,
    hoistWLL,
  ]);

  // deflection
  const allowableDeflectionMm = (trussSpec.span * 1000) / 100;
  const loadRatio =
    loadType === "udl" && trussSpec.udl > 0 ? udlApplied / trussSpec.udl : 0;
  const estimatedDeflectionMm =
    loadType === "udl"
      ? Math.min(allowableDeflectionMm * loadRatio, allowableDeflectionMm * 1.5)
      : 0;
  const withinDeflection =
    loadType === "udl" ? estimatedDeflectionMm <= allowableDeflectionMm : true;

  // ===== apply dynamic factor here =====
  const effectiveLoadsPerPoint = includeDynamic
    ? loadsPerPoint.map((l) => l * DYNAMIC_FACTOR)
    : loadsPerPoint;
  const effectiveMaxPointLoad = includeDynamic
    ? maxPointLoad * DYNAMIC_FACTOR
    : maxPointLoad;

  const effectiveTotalLoad =
    loadType === "udl"
      ? includeDynamic
        ? totalLoad * DYNAMIC_FACTOR
        : totalLoad
      : includeDynamic
      ? pointLoad * DYNAMIC_FACTOR
      : pointLoad;

  const effectiveWithinHoist = effectiveMaxPointLoad <= hoistWLL;
  const effectiveWithinPointLimit = effectiveMaxPointLoad <= trussSpec.point;

  return (
    <div className="page">
      <h1>🧮 Rigging &amp; Truss Load Calculator</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Choose UDL or a single point load. Then place the hoists and see the
        reaction on each. Indicative only — check current Prolyte tables &amp;
        get engineering sign-off. Dynamic factor here is 1.2 (adds 20%) for
        moved trusses.
      </p>

      {/* Inputs */}
      <div className="grid" style={{ maxWidth: 820, margin: "0 auto 1rem" }}>
        <label className="field">
          <span>Truss length (m)</span>
          <input
            type="number"
            min="1"
            max="16"
            step="0.1"
            value={trussLength}
            onChange={(e) => setTrussLength(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>Load type</span>
          <select
            value={loadType}
            onChange={(e) => setLoadType(e.target.value)}
          >
            <option value="udl">Uniformly distributed</option>
            <option value="point">Point load</option>
          </select>
        </label>

        {loadType === "udl" ? (
          <label className="field">
            <span>Total suspended load (kg)</span>
            <input
              type="number"
              min="0"
              value={totalLoad}
              onChange={(e) => setTotalLoad(Number(e.target.value))}
            />
          </label>
        ) : (
          <>
            <label className="field">
              <span>Point load (kg)</span>
              <input
                type="number"
                min="0"
                value={pointLoad}
                onChange={(e) => setPointLoad(Number(e.target.value))}
              />
            </label>
            <label className="field">
              <span>Point load position (m)</span>
              <input
                type="number"
                min="0"
                max={trussLength}
                step="0.1"
                value={pointPos}
                onChange={(e) => setPointPos(Number(e.target.value))}
              />
            </label>
          </>
        )}

        <label className="field">
          <span>Hoist / point WLL (kg)</span>
          <input
            type="number"
            min="50"
            value={hoistWLL}
            onChange={(e) => setHoistWLL(Number(e.target.value))}
          />
        </label>

        <label className="field">
          <span>Number of hoists</span>
          <select
            value={numPoints}
            onChange={(e) => setNumPoints(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        {/* dynamic toggle */}
        <label
          className="field"
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            type="checkbox"
            checked={includeDynamic}
            onChange={(e) => setIncludeDynamic(e.target.checked)}
          />
          <span>Include dynamic force (adds 20%)</span>
        </label>

        {/* hoist locations */}
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <span style={{ display: "block", marginBottom: 6 }}>
            Hoist locations (m from left end)
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8,
            }}
          >
            {positions.slice(0, numPoints).map((p, idx) => (
              <label key={idx} className="field" style={{ marginBottom: 0 }}>
                <span style={{ fontSize: 12 }}>Hoist {idx + 1}</span>
                <input
                  type="number"
                  min="0"
                  max={trussLength}
                  step="0.1"
                  value={p}
                  onChange={(e) => handlePosChange(idx, e.target.value)}
                />
              </label>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 6, fontSize: "0.7rem" }}>
            Example: 8 m truss, two motors 0.5 m inboard → set to 0.5 and 7.5.
          </p>
        </div>
      </div>

      {/* Diagram */}
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto 20px",
          background: "#111",
          border: "1px solid #333",
          borderRadius: 12,
          padding: "16px 14px 26px",
        }}
      >
        <div
          style={{
            height: 10,
            background: "linear-gradient(90deg, #666, #999)",
            borderRadius: 999,
            position: "relative",
            marginBottom: 28,
          }}
        >
          {orderedPositions.map((x, idx) => {
            const pct = trussLength > 0 ? (x / trussLength) * 100 : 0;
            const load = effectiveLoadsPerPoint[idx];
            const overHoist = load > hoistWLL;
            const overTruss = load > trussSpec.point;
            const bad = overHoist || overTruss;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  top: "10px",
                  transform: "translateX(-50%)",
                  textAlign: "center",
                  color: bad ? "#ff9b9b" : "#d0f5b1",
                  fontSize: 12,
                }}
              >
                ▼
                <div style={{ fontSize: 11 }}>
                  {load.toFixed(1)} kg
                  {overHoist ? " (>WLL)" : ""}
                  {overTruss ? " (truss!)" : ""}
                  {includeDynamic ? " inc. dyn" : ""}
                </div>
              </div>
            );
          })}

          {loadType === "point" && (
            <div
              style={{
                position: "absolute",
                left: `${
                  (Math.max(0, Math.min(pointPos, trussLength)) / trussLength) *
                  100
                }%`,
                top: -16,
                transform: "translateX(-50%)",
                color: "#ffd27a",
                fontSize: 11,
                whiteSpace: "nowrap",
              }}
            >
              ●{" "}
              {includeDynamic
                ? (pointLoad * DYNAMIC_FACTOR).toFixed(1)
                : pointLoad.toFixed(1)}{" "}
              kg
            </div>
          )}
        </div>
        <p className="muted" style={{ fontSize: "0.75rem" }}>
          Diagram: bar = truss length. ▼ = hoists. In point mode, ● = point
          load. {includeDynamic ? "Loads shown include +20% dynamic." : ""}
        </p>
      </div>

      {/* Results */}
      <div
        className="card"
        style={{
          maxWidth: 820,
          margin: "0 auto",
          background: "#151515",
          border: "1px solid #2b2b2b",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Results</h2>
        <p>
          <strong>Closest Prolyte table used:</strong> H30V, {trussSpec.span} m
          • Max UDL: {trussSpec.udl} kg/m • Max point: {trussSpec.point} kg
        </p>

        {loadType === "udl" ? (
          <p>
            <strong>Applied UDL:</strong>{" "}
            {(udlApplied * (includeDynamic ? DYNAMIC_FACTOR : 1)).toFixed(1)}{" "}
            kg/m → {withinTrussUDL ? "✅ within table" : "⚠️ exceeds table"}
            {includeDynamic && " (inc. +20% dynamic)"}
          </p>
        ) : (
          <p>
            <strong>Point load check:</strong>{" "}
            {(pointLoad * (includeDynamic ? DYNAMIC_FACTOR : 1)).toFixed(1)} kg
            {" vs "} truss point {trussSpec.point} kg →{" "}
            {effectiveMaxPointLoad <= trussSpec.point
              ? "✅ OK"
              : "⚠️ over table point"}
          </p>
        )}

        <p>
          <strong>Heaviest hoist load:</strong>{" "}
          {effectiveMaxPointLoad.toFixed(1)} kg → Hoist:{" "}
          {effectiveWithinHoist ? "✅ OK" : "❌ over WLL"} • Truss point:{" "}
          {effectiveWithinPointLimit ? "✅ OK" : "❌ over point limit"}
          {includeDynamic && " (inc. +20% dynamic)"}
        </p>

        {loadType === "udl" ? (
          <p>
            <strong>Deflection (approx):</strong>{" "}
            {estimatedDeflectionMm.toFixed(0)} mm (allowable{" "}
            {allowableDeflectionMm.toFixed(0)} mm) →{" "}
            {withinDeflection ? "✅ OK" : "⚠️ high"}
          </p>
        ) : (
          <p className="muted">
            Deflection: not estimated in point-load mode (local effects).
          </p>
        )}

        {includeDynamic && (
          <p className="muted" style={{ marginTop: 10 }}>
            Dynamic factor 1.2 was applied to the calculated reactions because
            the truss is assumed to be moved. For stricter venues or
            unsynchronised motors, you may need to use 1.3–1.6 instead.
          </p>
        )}

        <p className="muted" style={{ marginTop: 14 }}>
          Notes:
          <br />• UDL mode → tributary method (good for “bunch of lights along
          the pipe”).
          <br />• Point mode → split to nearest hoists by distance (good for “PA
          at 5.4 m”).
          <br />• Always compare with latest Prolyte tables and venue rigging
          data.
        </p>
      </div>
    </div>
  );
}

// src/components/InUseModal.jsx
import React, { useMemo } from "react";

export default function InUseModal({ item, tx, onClose }) {
  const groups = useMemo(() => {
    const map = new Map();
    (tx || []).forEach((t) => {
      if (t.id !== item.id) return;
      const action = String(t.action || "").toLowerCase();
      const k = `${t.eventTitle || "-"}|||${t.location || "-"}`;
      const prev = map.get(k) || {
        eventTitle: t.eventTitle || "-",
        location: t.location || "-",
        qty: 0,
      };
      const mult = action === "checkout" ? 1 : action === "checkin" ? -1 : 0;
      prev.qty += mult * Number(t.qty || 0);
      map.set(k, prev);
    });
    return Array.from(map.values())
      .filter((g) => g.qty > 0)
      .sort((a, b) => b.qty - a.qty);
  }, [item, tx]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">In use — {item.name}</div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {!groups.length ? (
            <div className="muted">No current checkouts.</div>
          ) : (
            <div className="use-list">
              {groups.map((g, i) => (
                <div key={i} className="use-row">
                  <div>
                    <div className="use-event">{g.eventTitle}</div>
                    <div className="use-loc">{g.location}</div>
                  </div>
                  <div className="use-qty">Out: {g.qty}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

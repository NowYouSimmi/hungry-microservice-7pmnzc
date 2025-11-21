// src/components/TxModal.jsx
import React, { useState, useEffect } from "react";

export default function TxModal({
  item,
  mode,
  availability,
  onClose,
  onSubmit,
}) {
  const [qty, setQty] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [location, setLocation] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setQty("");
    setEventTitle("");
    setLocation("");
    setErr("");
    setBusy(false);
  }, [item, mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setBusy(true);
      setErr("");
      await onSubmit({ item, mode, qty, eventTitle, location });
    } catch (e2) {
      setErr(String(e2.message || e2));
    } finally {
      setBusy(false);
    }
  }

  const av = availability || {
    available: item.quantity || 0,
    inUse: 0,
    total: item.quantity || 0,
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {mode === "checkout" ? "Check out" : "Check in"}
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="field">
            <label>Item</label>
            <div className="readonly">
              {item.name}{" "}
              <span className="muted">({item.category || "No category"})</span>
            </div>
          </div>

          <div className="field">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="1"
            />
            <div className="muted">
              Avail: {av.available} | In use: {av.inUse} | Total: {av.total}
            </div>
          </div>

          {mode === "checkout" && (
            <>
              <div className="field">
                <label>Event title (required)</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Chicago tech run"
                />
              </div>
              <div className="field">
                <label>Location (required)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Red Theatre"
                />
              </div>
            </>
          )}

          {err && <div className="error">{err}</div>}

          <div className="modal-actions">
            <button className="btn primary" disabled={busy} type="submit">
              {busy ? "Saving…" : "Confirm"}
            </button>
            <button className="btn" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

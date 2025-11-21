// InvInUse.jsx
import React, { useEffect, useState } from "react";

const BASE_URL =
  "https://script.google.com/macros/s/AKfycbzqqTCK0qPzvNSrWejALhljNNBgQ-_WlD4zAAaXQbcwMJG84y_tgzHmAMHuWK_Qteic/exec";

export default function InvInUse() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returning, setReturning] = useState(null);
  const [returnQty, setReturnQty] = useState(1);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}?action=getCheckedOut`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to load checkouts");
      setRows(data.data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submitReturn() {
    if (!returning) return;
    try {
      setSaving(true);
      const res = await fetch(`${BASE_URL}?action=checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutId: returning.checkoutId,
          qty: Number(returnQty),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Check-in failed");
      setReturning(null);
      setReturnQty(1);
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">In Use / Checked Out</h1>
        <button onClick={load} className="px-3 py-1 bg-gray-200 rounded">
          Refresh
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && rows.length === 0 && <p>Nothing is checked out 👌</p>}

      {!loading && rows.length > 0 && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Category</th>
                <th className="p-2">Item</th>
                <th className="p-2">Type</th>
                <th className="p-2">Qty OUT</th>
                <th className="p-2">Show</th>
                <th className="p-2">Event</th>
                <th className="p-2">Location</th>
                <th className="p-2">Name</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-2">{r.category}</td>
                  <td className="p-2">{r.item}</td>
                  <td className="p-2">{r.type}</td>
                  <td className="p-2">{r.qty}</td>
                  <td className="p-2">{r.show}</td>
                  <td className="p-2">{r.eventTitle}</td>
                  <td className="p-2">{r.location}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">
                    <button
                      onClick={() => {
                        setReturning(r);
                        setReturnQty(r.qty);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Check in
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {returning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">
              Check in: {returning.item} ({returning.type})
            </h2>
            <p className="text-sm text-gray-600">
              Currently out on: {returning.show || returning.eventTitle || "—"}
            </p>
            <label className="block text-sm">
              Quantity to return
              <input
                type="number"
                min="1"
                max={returning.qty}
                value={returnQty}
                onChange={(e) => setReturnQty(e.target.value)}
                className="mt-1 border rounded w-full p-2"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReturning(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitReturn}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                {saving ? "Saving..." : "Check in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

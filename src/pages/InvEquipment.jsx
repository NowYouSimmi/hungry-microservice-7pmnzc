// InvEquipment.jsx
import React, { useEffect, useState } from "react";

const BASE_URL =
  "https://script.google.com/macros/s/AKfycbzqqTCK0qPzvNSrWejALhljNNBgQ-_WlD4zAAaXQbcwMJG84y_tgzHmAMHuWK_Qteic/exec";

export default function InvEquipment() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}?action=getInventory`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to load inventory");
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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory Equipment (flat)</h1>
        <button onClick={load} className="px-3 py-1 bg-gray-200 rounded">
          Refresh
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && rows.length === 0 && <p>No data.</p>}

      {!loading && rows.length > 0 && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Category</th>
                <th className="p-2">Item</th>
                <th className="p-2">Type</th>
                <th className="p-2">Total</th>
                <th className="p-2">Out</th>
                <th className="p-2">Available</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-2">{r.category}</td>
                  <td className="p-2">{r.item}</td>
                  <td className="p-2">{r.type}</td>
                  <td className="p-2">{r.totalQty}</td>
                  <td className="p-2">{r.checkedOut}</td>
                  <td
                    className={`p-2 ${r.available === 0 ? "text-red-600" : ""}`}
                  >
                    {r.available}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

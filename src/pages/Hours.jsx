import React from "react";

export default function Hours({ setPage }) {
  const Btn = ({ label, target }) => (
    <button
      onClick={() => setPage(target)}
      className="btn dark"
      style={{ width: "260px" }}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-3xl font-bold mb-8">Hours</h1>
        <div style={{ display: "grid", gap: 14, justifyContent: "center" }}>
          <Btn label="Josie" target="hours-josie" />
          <Btn label="Gareth" target="hours-gareth" />
        </div>
      </div>
    </div>
  );
}

// src/pages/AudioStatus.jsx
import React from "react";
import ProductionStatus from "./ProductionStatus";
import { urlForSheet } from "../lib/sheetsUrl";

export default function AudioStatus() {
  return (
    <ProductionStatus
      title="Audio — Production Status"
      dataUrl={urlForSheet("Checklist- Audio")}
    />
  );
}

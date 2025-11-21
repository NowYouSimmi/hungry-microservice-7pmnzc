// src/pages/StageStatus.jsx
import React from "react";
import ProductionStatus from "./ProductionStatus";
import { urlForSheet } from "../lib/sheetsUrl";

export default function StageStatus() {
  return (
    <ProductionStatus
      title="Stage — Production Status"
      dataUrl={urlForSheet("Events Checklist")}
    />
  );
}

// src/pages/Inventory.jsx  (Stage)
import React from "react";
import InventoryCore from "./InventoryCore";

const STAGE_API_URL =
  "https://script.google.com/macros/s/AKfycbzqqTCK0qPzvNSrWejALhljNNBgQ-_WlD4zAAaXQbcwMJG84y_tgzHmAMHuWK_Qteic/exec";

const SHOWS_URL =
  "https://script.google.com/macros/s/AKfycbw-LKx4-dCTaoSIaW0U8vbP2R8m8QCEgZpvvGS1JgVLUHWvwRzKJj-c7s6hCRd_NpA/exec";

export default function Inventory({ currentUser }) {
  return (
    <InventoryCore
      title="Stage Inventory"
      apiUrl={STAGE_API_URL}
      showsUrl={SHOWS_URL}
      currentUser={currentUser} // 👈 pass logged-in user down
    />
  );
}

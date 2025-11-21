// src/pages/VideoInventory.jsx
import React from "react";
import InventoryCore from "./InventoryCore";

const VIDEO_API_URL =
  "https://script.google.com/macros/s/AKfycbzLwUCXSxUzfYeLmvvAs9XNj-Y1KBK81saIyhbApgZDjzfOwIMa4cd4GTP4uCfPSrqKOg/exec"; // ← your new URL

const SHOWS_URL =
  "https://script.google.com/macros/s/AKfycbw-LKx4-dCTaoSIaW0U8vbP2R8m8QCEgZpvvGS1JgVLUHWvwRzKJj-c7s6hCRd_NpA/exec";

export default function VideoInventory() {
  return (
    <InventoryCore
      title="Video Inventory"
      apiUrl={VIDEO_API_URL}
      showsUrl={SHOWS_URL}
    />
  );
}

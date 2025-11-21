// src/pages/AudioInventory.jsx
import React from "react";
import InventoryCore from "./InventoryCore";

const AUDIO_API_URL =
  "https://script.google.com/macros/s/AKfycbzuQlIA0UoJv1OzD5qdPpOndcGmHCrF3CgFxR5Z6Hpzn5w4lmgyHIZBdC-kGOq6-K1OpQ/exec";

const SHOWS_URL =
  "https://script.google.com/macros/s/AKfycbw-LKx4-dCTaoSIaW0U8vbP2R8m8QCEgZpvvGS1JgVLUHWvwRzKJj-c7s6hCRd_NpA/exec";

export default function AudioInventory() {
  return (
    <InventoryCore
      title="Audio Inventory"
      apiUrl={AUDIO_API_URL}
      showsUrl={SHOWS_URL}
    />
  );
}

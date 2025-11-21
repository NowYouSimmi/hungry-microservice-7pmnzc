// src/lib/sheetsUrl.js
const BASE =
  "https://script.google.com/macros/s/AKfycbxb2yNU8itdZUICoROgkaaAC_kY-N9rv6IuJjsdMrOS-9jP5l_NTUxpWIiV5tp_9ZyS/exec";

export function urlForSheet(sheetName) {
  const params = new URLSearchParams({
    mode: "normalized",
    format: "json",
    sheet: sheetName,
  });
  return `${BASE}?${params.toString()}`;
}

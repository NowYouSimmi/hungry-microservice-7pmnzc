// src/lib/hoursApi.js
export const HOURS_URLS = {
  josie:
    "https://script.google.com/a/macros/nyu.edu/s/AKfycbyLrm0teiyErCveQrFYaTT_O8ACgiZwnhm2-MZs7b0KEQMAXy8_g-c0Fzy4sWUssOH_tA/exec",
  gareth: "", // paste Gareth’s endpoint when ready
};

export async function fetchPersonHours(person, params = {}) {
  const base = HOURS_URLS[person];
  if (!base) throw new Error(`No API URL configured for ${person}`);
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v != null && usp.append(k, v));
  const url = `${base}${usp.toString() ? "?" + usp.toString() : ""}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Hours API error: ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

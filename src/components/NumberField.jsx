import { useState } from "react";

// Lets the user type freely (including clearing the field). Commits to the store
// only when the value is a valid number within [min, max]. Shows a short message
// when out of range; out-of-range / empty values are never saved.
export function NumberField({ label, value, min, max, unit = "", onCommit, full, placeholder }) {
  const [draft, setDraft] = useState(value === "" || value == null ? "" : String(value));
  const [msg, setMsg] = useState("");

  function handle(e) {
    const raw = e.target.value;
    setDraft(raw);
    if (raw === "") { setMsg("Enter a value to save it."); return; }
    const n = parseFloat(raw);
    if (isNaN(n)) { setMsg(""); return; }
    if (n < min || n > max) {
      setMsg(`Keep between ${min} and ${max}${unit} — out-of-range values aren't saved.`);
      return;
    }
    setMsg("");
    onCommit(n);
  }

  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      {label && <label className="field-label">{label}</label>}
      <input className="input" type="number" inputMode="decimal" value={draft} placeholder={placeholder} onChange={handle} />
      {msg && <div style={{ fontSize: 11, color: "var(--coral)", marginTop: 5, lineHeight: 1.35 }}>{msg}</div>}
    </div>
  );
}

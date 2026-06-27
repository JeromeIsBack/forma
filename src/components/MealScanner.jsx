import { useState, useRef } from "react";
import { Icon } from "./ui.jsx";
import { parseScan, SOURCE_TYPES } from "../lib/store.js";

// On-device OCR via Tesseract.js, loaded from CDN the first time it's needed.
function loadTesseract() {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) return resolve(window.Tesseract);
    const sc = document.createElement("script");
    sc.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    sc.onload = () => (window.Tesseract ? resolve(window.Tesseract) : reject(new Error("no global")));
    sc.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(sc);
  });
}

export function MealScanner({ state, onClose, celebrate, onLogSource, onLogGrams, onCreateSource }) {
  const [tab, setTab] = useState("photo"); // "photo" | "paste"
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState(0);
  const [err, setErr] = useState("");
  const [paste, setPaste] = useState("");
  const [result, setResult] = useState(null); // { matches, grams, raw }
  const [showRaw, setShowRaw] = useState(false);
  const [done, setDone] = useState({}); // marks chips already added this session
  const [creating, setCreating] = useState(null); // { avg } when saving a detected amount as a source
  const [cName, setCName] = useState("");
  const [cType, setCType] = useState("Other");
  const fileRef = useRef(null);

  function analyse(text) {
    const r = parseScan(text, state.sources);
    setResult(r);
    if (!r.matches.length && !r.grams.length) setErr("No protein sources or amounts spotted. Try a clearer, flatter photo — or paste the text.");
    else setErr("");
  }

  async function onFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true); setErr(""); setProg(0); setResult(null);
    try {
      const T = await loadTesseract();
      const { data } = await T.recognize(file, "eng", {
        logger: (mm) => { if (mm.status === "recognizing text") setProg(Math.round(mm.progress * 100)); },
      });
      analyse(data.text || "");
    } catch {
      setErr("Couldn't run the scan. Check your connection (the engine downloads once), or use Paste text below.");
    }
    setBusy(false);
  }

  function logSource(s) { onLogSource(s.id); setDone((d) => ({ ...d, [s.id]: true })); celebrate("win", `${s.name} added`); }
  function logGrams(g) { onLogGrams(g); setDone((d) => ({ ...d, ["g" + g]: true })); celebrate("win", `${g}g logged`); }
  function startCreate(g) { setCreating({ avg: g }); setCName(""); setCType("Other"); }
  function saveCreate() {
    const nm = cName.trim();
    if (!nm) return;
    const id = onCreateSource(nm, creating.avg, cType);
    if (id) onLogSource(id);
    celebrate("win", `${nm} saved & added`);
    setDone((d) => ({ ...d, ["g" + creating.avg]: true }));
    setCreating(null);
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 85, background: "rgba(10,8,16,0.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", background: "var(--cloud)", borderRadius: "20px 20px 0 0", padding: "18px 16px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="camera" size={18} style={{ color: "var(--violet)" }} />
            </div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 16 }}>Scan a label</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, color: "var(--text-3)" }}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ display: "flex", gap: 6, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, padding: 4, marginBottom: 14 }}>
          {[["photo", "Camera"], ["paste", "Paste text"]].map(([id, label]) => (
            <button key={id} onClick={() => { setTab(id); setErr(""); }}
              style={{ flex: 1, padding: "9px 0", borderRadius: 9, fontSize: 13, fontWeight: 600, border: "none",
                background: tab === id ? "var(--violet)" : "transparent", color: tab === id ? "#fff" : "var(--text-2)" }}>
              {label}
            </button>
          ))}
        </div>

        {tab === "photo" && !busy && (
          <div>
            <button onClick={() => fileRef.current && fileRef.current.click()} className="cta" style={{ width: "100%", boxShadow: "none" }}>
              <Icon name="camera" size={16} style={{ verticalAlign: -3, marginRight: 7 }} /> Take or choose a photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: "none" }} />
            <div style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.5, marginTop: 10 }}>
              Point at the ingredients or nutrition panel. Scanning runs on your device — the first scan downloads the text engine, so give it a few seconds. Flat, well-lit labels read best.
            </div>
          </div>
        )}

        {tab === "paste" && !busy && (
          <div>
            <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={5}
              placeholder="Paste an ingredient or nutrition list…"
              className="input" style={{ width: "100%", resize: "vertical", lineHeight: 1.5 }} />
            <button onClick={() => analyse(paste)} className="cta" style={{ width: "100%", boxShadow: "none", marginTop: 10 }} disabled={!paste.trim()}>
              Find protein sources
            </button>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.5, marginTop: 10 }}>
              Tip: on iPhone, long-press the text in a photo, Copy, then paste here — it's more accurate than the camera scan.
            </div>
          </div>
        )}

        {busy && (
          <div style={{ textAlign: "center", padding: "26px 0" }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 15 }}>Reading the label…</div>
            <div style={{ height: 8, background: "var(--paper)", borderRadius: 99, overflow: "hidden", margin: "14px 30px 0", border: "1px solid var(--line)" }}>
              <div style={{ height: "100%", width: `${Math.max(8, prog)}%`, background: "var(--violet)", transition: "width 0.25s" }} />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 9 }}>Stays on your device · first run downloads the engine</div>
          </div>
        )}

        {err && !busy && (
          <div style={{ fontSize: 12.5, color: "var(--coral)", marginTop: 13, lineHeight: 1.5 }}>{err}</div>
        )}

        {result && !busy && (
          <div style={{ marginTop: 16 }}>
            {result.matches.length > 0 && (
              <>
                <div className="field-label" style={{ marginBottom: 9 }}>In your sources</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {result.matches.map((s) => (
                    <div key={s.id} className="card" style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 14 }}>{s.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-2)" }}>{s.avg}g · per {s.unit}</div>
                      </div>
                      <button onClick={() => logSource(s)} disabled={done[s.id]}
                        style={{ padding: "8px 15px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none",
                          background: done[s.id] ? "var(--lime)" : "var(--violet)", color: done[s.id] ? "#2c3a00" : "#fff" }}>
                        {done[s.id] ? "Added ✓" : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {result.grams.length > 0 && (
              <>
                <div className="field-label" style={{ marginBottom: 9 }}>Protein detected on the label</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {result.grams.map((g) => (
                    <div key={g} className="card" style={{ padding: "11px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div className="num" style={{ fontSize: 18, color: "var(--violet)", minWidth: 44 }}>{g}g</div>
                        <div style={{ flex: 1, display: "flex", gap: 7, justifyContent: "flex-end" }}>
                          <button onClick={() => logGrams(g)} disabled={done["g" + g]}
                            style={{ padding: "8px 13px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: "none",
                              background: done["g" + g] ? "var(--lime)" : "var(--violet)", color: done["g" + g] ? "#2c3a00" : "#fff" }}>
                            {done["g" + g] ? "Logged ✓" : "Log one-off"}
                          </button>
                          {!done["g" + g] && (
                            <button onClick={() => startCreate(g)}
                              style={{ padding: "8px 13px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: "1px solid var(--line-2)", background: "var(--paper)", color: "var(--text)" }}>
                              Save as source
                            </button>
                          )}
                        </div>
                      </div>
                      {creating && creating.avg === g && (
                        <div style={{ marginTop: 11, paddingTop: 11, borderTop: "1px solid var(--line)" }}>
                          <input className="input" autoFocus placeholder="Name (e.g. Skyr, brand X bar)" value={cName} onChange={(e) => setCName(e.target.value)} style={{ marginBottom: 8 }} />
                          <div style={{ display: "flex", gap: 8 }}>
                            <select className="input" value={cType} onChange={(e) => setCType(e.target.value)} style={{ flex: 1 }}>
                              {SOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button onClick={saveCreate} className="cta lime" style={{ boxShadow: "none", padding: "0 16px" }} disabled={!cName.trim()}>Save & add</button>
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 7 }}>Saved as {g}g per serving — tweak later in your source list.</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {(result.matches.length > 0 || result.grams.length > 0) && (
              <div style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 12 }}>
                Missing something the label has? Close this and use the search to add or create it.
              </div>
            )}

            {result.raw && (
              <div>
                <button onClick={() => setShowRaw((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "var(--text-3)" }}>
                  {showRaw ? "Hide" : "Show"} what the scan read
                  <Icon name={showRaw ? "chevron-up" : "chevron-down"} size={13} />
                </button>
                {showRaw && (
                  <div style={{ marginTop: 8, padding: 11, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 11.5, color: "var(--text-2)", whiteSpace: "pre-wrap", lineHeight: 1.45, maxHeight: 160, overflowY: "auto" }}>
                    {result.raw}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

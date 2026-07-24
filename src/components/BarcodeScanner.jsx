import { useState, useRef, useEffect } from "react";
import { Icon } from "./ui.jsx";
import { lookupBarcode, scoreForGoal, portionProtein, servingGrams } from "../lib/foodfacts.js";
import { allTypes } from "../lib/store.js";

// html5-qrcode loaded from CDN at runtime (no bundling, same pattern as the label scanner).
function loadScannerLib() {
  return new Promise((resolve, reject) => {
    if (window.Html5Qrcode) return resolve(window.Html5Qrcode);
    const sc = document.createElement("script");
    sc.src = "https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js";
    sc.onload = () => (window.Html5Qrcode ? resolve(window.Html5Qrcode) : reject(new Error("no global")));
    sc.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(sc);
  });
}

const GRADE_COLOR = { A: "#2FBF71", B: "#8FCB2F", C: "#F4B400", D: "#F4772F", E: "#E0503A" };

export function BarcodeScanner({ state, onClose, celebrate, onLogGrams, onCreateSource }) {
  const [tab, setTab] = useState("camera"); // camera | manual
  const [phase, setPhase] = useState("capture"); // capture | loading | result
  const [manual, setManual] = useState("");
  const [err, setErr] = useState("");
  const [product, setProduct] = useState(null);
  const [notFoundCode, setNotFoundCode] = useState("");
  const scanRef = useRef(null);
  const startedRef = useRef(false);

  const score = product ? scoreForGoal(product, state.profile) : null;
  const svGrams = product ? servingGrams(product) : null;

  // portion inputs
  const [grams, setGrams] = useState("");
  const [saveSource, setSaveSource] = useState(false);
  const [srcType, setSrcType] = useState("Snack");

  async function runLookup(code) {
    setPhase("loading"); setErr("");
    const r = await lookupBarcode(code);
    if (r.ok) {
      setProduct(r.product);
      setGrams(String(servingGrams(r.product) || 100));
      setPhase("result");
    } else if (r.reason === "notfound") {
      setNotFoundCode(r.code || code); setErr("notfound"); setPhase("capture");
    } else if (r.reason === "nonutrition") {
      setErr("nonutrition"); setPhase("capture");
    } else if (r.reason === "invalid") {
      setErr("invalid"); setPhase("capture");
    } else {
      setErr("network"); setPhase("capture");
    }
  }

  // camera lifecycle
  useEffect(() => {
    if (tab !== "camera" || phase !== "capture") return;
    let cancelled = false;
    (async () => {
      try {
        const Html5Qrcode = await loadScannerLib();
        if (cancelled) return;
        const el = document.getElementById("bc-reader");
        if (!el) return;
        const inst = new Html5Qrcode("bc-reader", { verbose: false });
        scanRef.current = inst;
        startedRef.current = true;
        await inst.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 140 } },
          (decoded) => { stopCamera(); runLookup(decoded); },
          () => {}
        );
      } catch {
        if (!cancelled) setErr("camera");
      }
    })();
    return () => { cancelled = true; stopCamera(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, phase]);

  function stopCamera() {
    const inst = scanRef.current;
    if (inst && startedRef.current) {
      startedRef.current = false;
      inst.stop().then(() => inst.clear()).catch(() => {});
      scanRef.current = null;
    }
  }

  function close() { stopCamera(); onClose(); }

  function logIt() {
    const g = parseInt(grams, 10);
    if (!g || g <= 0) return;
    const protein = portionProtein(product, g);
    if (saveSource) {
      const per100 = product.per100.protein || 0;
      const perServing = Math.round((per100 * g) / 100) || Math.round(per100);
      const name = product.brand ? `${product.name} (${product.brand})` : product.name;
      const id = onCreateSource(name.slice(0, 40), perServing || 1, srcType);
      // logging the created source is handled by caller returning id; also add the exact grams eaten now
      onLogGrams(protein);
      celebrate("win", `${protein}g logged · source saved`);
    } else {
      onLogGrams(protein);
      celebrate("win", `${protein}g protein logged`);
    }
    close();
  }

  function resetToCapture() { setProduct(null); setErr(""); setPhase("capture"); }

  const TYPES = allTypes(state);

  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 85, background: "rgba(10,8,16,0.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", background: "var(--cloud)", borderRadius: "20px 20px 0 0", padding: "18px 16px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--violet-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="barcode" size={18} style={{ color: "var(--violet)" }} />
            </div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 16 }}>Scan a barcode</div>
          </div>
          <button onClick={close} aria-label="Close" style={{ width: 30, height: 30, color: "var(--text-3)" }}><Icon name="x" size={20} /></button>
        </div>

        {phase !== "result" && (
          <div style={{ display: "flex", gap: 6, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, padding: 4, marginBottom: 14 }}>
            {[["camera", "Camera"], ["manual", "Type it in"]].map(([id, label]) => (
              <button key={id} onClick={() => { stopCamera(); setTab(id); setErr(""); }}
                style={{ flex: 1, padding: "9px 0", borderRadius: 9, fontSize: 13, fontWeight: 600, border: "none",
                  background: tab === id ? "var(--violet)" : "transparent", color: tab === id ? "#fff" : "var(--text-2)" }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* CAMERA */}
        {phase === "capture" && tab === "camera" && (
          <div>
            <div id="bc-reader" style={{ width: "100%", borderRadius: 14, overflow: "hidden", background: "#000", minHeight: 180 }} />
            {err === "camera"
              ? <div style={{ fontSize: 12.5, color: "var(--coral)", marginTop: 12, lineHeight: 1.5 }}>Couldn't open the camera. Check the permission, or use “Type it in”.</div>
              : <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 10, lineHeight: 1.5 }}>Hold the barcode inside the frame. Good light and a flat angle read fastest. Trouble? Type the digits under the barcode instead.</div>}
          </div>
        )}

        {/* MANUAL */}
        {phase === "capture" && tab === "manual" && (
          <div>
            <input className="input" inputMode="numeric" placeholder="Barcode digits (e.g. 3017624010701)"
              value={manual} onChange={(e) => setManual(e.target.value.replace(/\D/g, ""))} style={{ fontSize: 15, letterSpacing: "0.04em" }} />
            <button onClick={() => runLookup(manual)} className="cta" disabled={manual.length < 6} style={{ width: "100%", boxShadow: "none", marginTop: 10 }}>Look up product</button>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 10 }}>The number printed beneath the barcode. Always works — no camera needed.</div>
          </div>
        )}

        {/* messages */}
        {phase === "capture" && err && err !== "camera" && (
          <div style={{ marginTop: 13, fontSize: 12.5, color: err === "notfound" ? "var(--text)" : "var(--coral)", lineHeight: 1.5 }}>
            {err === "notfound" && <>Barcode <b>{notFoundCode}</b> isn't in the Open Food Facts database yet. You can log it as a one-off with the label scanner, or add it to OFF later.</>}
            {err === "nonutrition" && <>Found the product, but it has no nutrition data in the database yet.</>}
            {err === "invalid" && <>That doesn't look like a valid barcode.</>}
            {err === "network" && <>Couldn't reach Open Food Facts. Check your connection and try again.</>}
          </div>
        )}

        {phase === "loading" && (
          <div style={{ textAlign: "center", padding: "34px 0" }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 15 }}>Looking it up…</div>
            <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 8 }}>Open Food Facts</div>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && product && score && (
          <div>
            <div style={{ display: "flex", gap: 13, marginBottom: 16 }}>
              {product.image
                ? <img src={product.image} alt="" style={{ width: 58, height: 58, borderRadius: 12, objectFit: "cover", flexShrink: 0, background: "var(--paper)" }} />
                : <div style={{ width: 58, height: 58, borderRadius: 12, flexShrink: 0, background: "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="package" size={22} style={{ color: "var(--text-3)" }} /></div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>{product.name}</div>
                {product.brand && <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{product.brand}</div>}
                <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 3 }}>
                  {product.per100.protein != null ? `${Math.round(product.per100.protein)}g protein` : "—"}{product.per100.kcal != null ? ` · ${Math.round(product.per100.kcal)} kcal` : ""} / 100g
                </div>
              </div>
            </div>

            {/* Scorecard */}
            <div className="card" style={{ padding: 15, marginBottom: 16, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 58, height: 58, borderRadius: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(145deg, ${GRADE_COLOR[score.grade]}, ${GRADE_COLOR[score.grade]}bb)`,
                boxShadow: `0 6px 18px ${GRADE_COLOR[score.grade]}55`, color: "#fff", fontFamily: "var(--display)", fontWeight: 800, fontSize: 28 }}>
                {score.grade}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 14.5 }}>{score.verdict}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 1 }}>for your {score.goal} goal{score.density != null ? ` · ${score.density}g protein / 100 kcal` : ""}</div>
                {score.reasons.length > 0 && (
                  <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 3 }}>
                    {score.reasons.map((r, i) => (
                      <div key={i} style={{ fontSize: 11.5, color: "var(--text-2)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                        <span style={{ color: "var(--violet)" }}>·</span>{r}
                      </div>
                    ))}
                  </div>
                )}
                {(score.nutriscore || score.nova) && (
                  <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 7 }}>
                    Reference:{score.nutriscore ? ` Nutri-Score ${score.nutriscore.toUpperCase()}` : ""}{score.nova ? ` · NOVA ${score.nova}` : ""}
                  </div>
                )}
              </div>
            </div>

            {/* Portion */}
            <div className="field-label" style={{ marginBottom: 9 }}>Had some? Log a portion</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <input className="input" inputMode="numeric" value={grams} onChange={(e) => setGrams(e.target.value.replace(/\D/g, ""))} style={{ width: 92, textAlign: "center", fontSize: 16 }} />
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>grams</span>
              <div style={{ flex: 1, textAlign: "right", fontFamily: "var(--display)", fontWeight: 600, fontSize: 15, color: "var(--violet)" }}>
                = {portionProtein(product, parseInt(grams, 10) || 0)}g protein
              </div>
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
              {svGrams && <Chip label={`1 serving (${svGrams}g)`} onClick={() => setGrams(String(svGrams))} />}
              {[50, 100, 150, 200].map((g) => <Chip key={g} label={`${g}g`} onClick={() => setGrams(String(g))} />)}
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={saveSource} onChange={(e) => setSaveSource(e.target.checked)} style={{ width: 17, height: 17, accentColor: "var(--violet)" }} />
              <span style={{ fontSize: 13, color: "var(--text)" }}>Also save as a reusable source</span>
            </label>
            {saveSource && (
              <div style={{ marginBottom: 14 }}>
                <select className="input" value={srcType} onChange={(e) => setSrcType(e.target.value)}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}

            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={resetToCapture} style={{ padding: "0 16px", height: 48, borderRadius: "var(--r-md)", border: "1px solid var(--line-2)", background: "var(--paper)", color: "var(--text)", fontWeight: 600, fontSize: 13 }}>Scan another</button>
              <button onClick={logIt} className="cta" disabled={!parseInt(grams, 10)} style={{ flex: 1, boxShadow: "none" }}>
                Log {portionProtein(product, parseInt(grams, 10) || 0)}g
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "7px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "var(--paper)", border: "1px solid var(--line)", color: "var(--text-2)" }}>{label}</button>
  );
}

import { useState, useEffect, useCallback } from "react";

// ─── API helper ──────────────────────────────────────────────────
function api(baseUrl, token) {
  const headers = (extra = {}) => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  });

  return {
    post: (path, body) =>
      fetch(`${baseUrl}/api/dbadmin${path}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
      }).then((r) => r.json()),

    get: (path) =>
      fetch(`${baseUrl}/api/dbadmin${path}`, { headers: headers() }).then(
        (r) => r.json()
      ),

    patch: (path, body) =>
      fetch(`${baseUrl}/api/dbadmin${path}`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify(body),
      }).then((r) => r.json()),

    del: (path) =>
      fetch(`${baseUrl}/api/dbadmin${path}`, {
        method: "DELETE",
        headers: headers(),
      }).then((r) => r.json()),
  };
}

// ─── Ikonkalar ───────────────────────────────────────────────────
const COL_ICONS = {
  users: "👤", drivers: "🚚", farms: "🏡", orders: "📦",
  fish_products: "🐟", chat_messages: "💬", chat_rooms: "🗂️",
  gps_tracks: "📍", audit_logs: "📋", telegram_links: "✈️",
  otp_tokens: "🔑", settings: "⚙️",
};

const COL_COLORS = {
  users: "#3b82f6", drivers: "#06b6d4", farms: "#10b981",
  orders: "#f59e0b", fish_products: "#8b5cf6", chat_messages: "#ec4899",
  chat_rooms: "#f97316", gps_tracks: "#14b8a6", audit_logs: "#6366f1",
  telegram_links: "#0ea5e9", otp_tokens: "#ef4444", settings: "#64748b",
};

// ─── JSON tahrirlash ─────────────────────────────────────────────
function JsonEditor({ value, onChange }) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [err, setErr] = useState("");

  const handle = (v) => {
    setText(v);
    try {
      onChange(JSON.parse(v));
      setErr("");
    } catch {
      setErr("JSON noto'g'ri formatda");
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => handle(e.target.value)}
        style={{
          width: "100%", minHeight: 260, fontFamily: "monospace", fontSize: 12,
          background: "#0f172a", color: "#e2e8f0", border: `1px solid ${err ? "#ef4444" : "#334155"}`,
          borderRadius: 10, padding: 12, resize: "vertical", outline: "none",
        }}
      />
      {err && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4 }}>{err}</p>}
    </div>
  );
}

// ─── Qiymatni chiroyli ko'rsatish ────────────────────────────────
function Val({ v, depth = 0 }) {
  if (v === null || v === undefined)
    return <span style={{ color: "#64748b" }}>—</span>;
  if (typeof v === "boolean")
    return <span style={{ color: v ? "#10b981" : "#ef4444" }}>{v ? "✓" : "✗"}</span>;
  if (typeof v === "number")
    return <span style={{ color: "#f59e0b" }}>{v.toLocaleString()}</span>;
  if (typeof v === "string") {
    if (v.match(/^\d{4}-\d{2}-\d{2}T/))
      return <span style={{ color: "#94a3b8", fontSize: 11 }}>{new Date(v).toLocaleString("uz")}</span>;
    if (v.length > 60)
      return <span style={{ color: "#e2e8f0" }}>{v.slice(0, 60)}…</span>;
    return <span style={{ color: "#e2e8f0" }}>{v}</span>;
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return <span style={{ color: "#64748b" }}>[]</span>;
    return (
      <span style={{ color: "#94a3b8" }}>
        [{v.length} ta]
      </span>
    );
  }
  if (typeof v === "object") {
    const keys = Object.keys(v);
    if (depth > 0) return <span style={{ color: "#94a3b8" }}>{`{${keys.length} maydon}`}</span>;
    return (
      <div style={{ paddingLeft: 8, borderLeft: "2px solid #1e293b" }}>
        {keys.slice(0, 4).map((k) => (
          <div key={k} style={{ fontSize: 11, color: "#64748b" }}>
            <span style={{ color: "#7dd3fc" }}>{k}</span>:{" "}
            <Val v={v[k]} depth={depth + 1} />
          </div>
        ))}
        {keys.length > 4 && <span style={{ color: "#475569", fontSize: 10 }}>+{keys.length - 4} ta…</span>}
      </div>
    );
  }
  return <span>{String(v)}</span>;
}

// ─── Modal ───────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#1e293b", borderRadius: 16, width: "100%", maxWidth: 640,
        maxHeight: "90vh", overflow: "auto", border: "1px solid #334155",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid #334155",
          position: "sticky", top: 0, background: "#1e293b",
        }}>
          <h3 style={{ margin: 0, fontWeight: 800, color: "#f1f5f9" }}>{title}</h3>
          <button onClick={onClose} style={{
            background: "#334155", border: "none", color: "#94a3b8",
            width: 32, height: 32, borderRadius: 8, cursor: "pointer",
            fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Asosiy komponent ────────────────────────────────────────────
export default function DBAdminPanel() {
  const [baseUrl, setBaseUrl] = useState("https://baliq-savdosi.up.railway.app");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [collections, setCollections] = useState([]);
  const [activeCol, setActiveCol] = useState(null);
  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [editDoc, setEditDoc] = useState(null);
  const [editData, setEditData] = useState({});
  const [viewDoc, setViewDoc] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [queryCol, setQueryCol] = useState("users");
  const [queryFilter, setQueryFilter] = useState("{}");
  const [queryResult, setQueryResult] = useState(null);
  const [queryTab, setQueryTab] = useState(false);

  const PAGE_SIZE = 15;

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Login ────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginErr("");
    try {
      const client = api(baseUrl, "");
      const res = await client.post("/login", { password });
      if (res.token) {
        setToken(res.token);
      } else {
        setLoginErr(res.detail || "Parol noto'g'ri");
      }
    } catch {
      setLoginErr("Server bilan bog'lanib bo'lmadi. URL ni tekshiring.");
    }
    setLoginLoading(false);
  };

  // ─── Collections yuklash ─────────────────────────────────────
  const loadCollections = useCallback(async () => {
    if (!token) return;
    const client = api(baseUrl, token);
    const res = await client.get("/collections");
    if (Array.isArray(res)) setCollections(res);
  }, [token, baseUrl]);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  // ─── Documentlar yuklash ──────────────────────────────────────
  const loadDocs = useCallback(async () => {
    if (!activeCol || !token) return;
    setLoading(true);
    const client = api(baseUrl, token);
    const skip = (page - 1) * PAGE_SIZE;
    const q = search ? `&search=${encodeURIComponent(search)}` : "";
    const res = await client.get(`/collections/${activeCol}?skip=${skip}&limit=${PAGE_SIZE}${q}`);
    if (res.data) {
      setDocs(res.data);
      setTotal(res.total);
    }
    setLoading(false);
  }, [activeCol, page, search, token, baseUrl]);

  useEffect(() => { loadDocs(); }, [loadDocs]);
  useEffect(() => { setPage(1); }, [activeCol, search]);

  // ─── Saqlash ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editDoc) return;
    setSaving(true);
    const client = api(baseUrl, token);
    const res = await client.patch(
      `/collections/${activeCol}/${editDoc.id}`,
      { data: editData }
    );
    setSaving(false);
    if (res.message) {
      showToast("✅ Yangilandi");
      setEditDoc(null);
      loadDocs();
      loadCollections();
    } else {
      showToast("❌ " + (res.detail || "Xato"), false);
    }
  };

  // ─── O'chirish ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const client = api(baseUrl, token);
    const res = await client.del(`/collections/${activeCol}/${deleteConfirm.id}`);
    setDeleteConfirm(null);
    if (res.message) {
      showToast("🗑️ O'chirildi");
      loadDocs();
      loadCollections();
    } else {
      showToast("❌ " + (res.detail || "Xato"), false);
    }
  };

  // ─── Raw query ────────────────────────────────────────────────
  const handleQuery = async () => {
    try {
      const filter = JSON.parse(queryFilter);
      const client = api(baseUrl, token);
      const res = await client.post("/query", { collection: queryCol, filter, limit: 50 });
      setQueryResult(res);
    } catch {
      setQueryResult({ error: "Filter JSON noto'g'ri" });
    }
  };

  // ─── Keys ─────────────────────────────────────────────────────
  const getColumns = (docList) => {
    if (!docList.length) return [];
    const priorityCols = ["id", "firstName", "lastName", "phone", "name", "status", "role", "email", "created_at"];
    const allKeys = [...new Set(docList.flatMap(Object.keys))];
    const sorted = [
      ...priorityCols.filter((k) => allKeys.includes(k)),
      ...allKeys.filter((k) => !priorityCols.includes(k)),
    ];
    return sorted.slice(0, 7);
  };

  // ─── Login sahifasi ──────────────────────────────────────────
  if (!token) {
    return (
      <div style={{
        minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{
          background: "#1e293b", borderRadius: 20, padding: 36,
          width: "100%", maxWidth: 420, border: "1px solid #334155",
          boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🗄️</div>
            <h1 style={{ margin: 0, color: "#f1f5f9", fontWeight: 900, fontSize: 22 }}>
              Database Admin
            </h1>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
              Baliq Savdosi — MongoDB boshqaruv paneli
            </p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
              BACKEND URL
            </label>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value.replace(/\/$/, ""))}
              placeholder="https://baliq-savdosi.up.railway.app"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                background: "#0f172a", border: "1px solid #334155",
                color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
              DBADMIN_PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Railway da DBADMIN_PASSWORD"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                background: "#0f172a", border: "1px solid #334155",
                color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {loginErr && (
            <div style={{
              background: "#450a0a", border: "1px solid #7f1d1d",
              borderRadius: 10, padding: "10px 14px", color: "#fca5a5",
              fontSize: 13, marginBottom: 16,
            }}>
              ⚠️ {loginErr}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loginLoading || !password}
            style={{
              width: "100%", padding: "12px", borderRadius: 10,
              background: loginLoading ? "#1e3a5f" : "linear-gradient(135deg, #1d4ed8, #7c3aed)",
              border: "none", color: "white", fontWeight: 800, fontSize: 15,
              cursor: loginLoading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
            }}
          >
            {loginLoading ? "Ulanmoqda..." : "Kirish →"}
          </button>

          <p style={{ color: "#475569", fontSize: 11, textAlign: "center", marginTop: 16 }}>
            Railway → Variables → DBADMIN_PASSWORD qo'shing
          </p>
        </div>
      </div>
    );
  }

  // ─── Asosiy panel ────────────────────────────────────────────
  const cols = getColumns(docs);

  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a",
      fontFamily: "'Inter', system-ui, sans-serif", color: "#e2e8f0",
      display: "flex", flexDirection: "column",
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 2000,
          background: toast.ok ? "#14532d" : "#450a0a",
          border: `1px solid ${toast.ok ? "#166534" : "#7f1d1d"}`,
          color: toast.ok ? "#86efac" : "#fca5a5",
          padding: "12px 18px", borderRadius: 12, fontWeight: 700, fontSize: 13,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: "#1e293b", borderBottom: "1px solid #334155",
        padding: "12px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🗄️</span>
          <div>
            <span style={{ fontWeight: 900, fontSize: 16 }}>Database Admin</span>
            <span style={{ color: "#475569", fontSize: 11, display: "block" }}>{baseUrl}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setQueryTab(!queryTab)}
            style={{
              padding: "6px 14px", borderRadius: 8,
              background: queryTab ? "#7c3aed" : "#334155",
              border: "none", color: "white", cursor: "pointer",
              fontWeight: 700, fontSize: 12,
            }}
          >
            🔍 So'rov
          </button>
          <button
            onClick={() => setToken("")}
            style={{
              padding: "6px 14px", borderRadius: 8,
              background: "#334155", border: "none",
              color: "#94a3b8", cursor: "pointer", fontWeight: 700, fontSize: 12,
            }}
          >
            Chiqish
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{
          width: 220, background: "#1e293b", borderRight: "1px solid #334155",
          overflowY: "auto", padding: 12, flexShrink: 0,
        }}>
          <p style={{ color: "#475569", fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
            Collections
          </p>
          {collections.map((c) => (
            <button
              key={c.name}
              onClick={() => { setActiveCol(c.name); setQueryTab(false); setSearch(""); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                background: activeCol === c.name ? `${COL_COLORS[c.name]}22` : "transparent",
                borderLeft: `3px solid ${activeCol === c.name ? COL_COLORS[c.name] : "transparent"}`,
                color: activeCol === c.name ? "#f1f5f9" : "#94a3b8",
                marginBottom: 2, textAlign: "left", transition: "all 0.15s",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600 }}>
                {COL_ICONS[c.name] || "📁"} {c.name}
              </span>
              <span style={{
                background: "#334155", borderRadius: 6, padding: "1px 6px",
                fontSize: 10, fontWeight: 800, color: "#64748b",
              }}>
                {c.count}
              </span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          {/* Raw query tab */}
          {queryTab ? (
            <div style={{ maxWidth: 800 }}>
              <h2 style={{ fontWeight: 900, marginBottom: 16, color: "#f1f5f9" }}>🔍 Raw MongoDB So'rov</h2>
              <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ flex: "0 0 180px" }}>
                  <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>Collection</label>
                  <select
                    value={queryCol}
                    onChange={(e) => setQueryCol(e.target.value)}
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 8,
                      background: "#1e293b", border: "1px solid #334155",
                      color: "#e2e8f0", fontSize: 13,
                    }}
                  >
                    {collections.map((c) => <option key={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ color: "#64748b", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>Filter (JSON)</label>
                  <input
                    value={queryFilter}
                    onChange={(e) => setQueryFilter(e.target.value)}
                    placeholder='{"status": "APPROVED"}'
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 8,
                      background: "#1e293b", border: "1px solid #334155",
                      color: "#e2e8f0", fontSize: 13, fontFamily: "monospace",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    onClick={handleQuery}
                    style={{
                      padding: "8px 18px", borderRadius: 8,
                      background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                      border: "none", color: "white", fontWeight: 800,
                      cursor: "pointer", fontSize: 13,
                    }}
                  >
                    Yuborish
                  </button>
                </div>
              </div>
              {queryResult && (
                <div style={{
                  background: "#1e293b", border: "1px solid #334155", borderRadius: 12,
                  padding: 16,
                }}>
                  {queryResult.error ? (
                    <p style={{ color: "#ef4444" }}>❌ {queryResult.error}</p>
                  ) : (
                    <>
                      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 10 }}>
                        {queryResult.count} ta natija
                      </p>
                      <pre style={{
                        fontFamily: "monospace", fontSize: 11, color: "#94a3b8",
                        overflow: "auto", maxHeight: 400,
                        background: "#0f172a", padding: 12, borderRadius: 8,
                      }}>
                        {JSON.stringify(queryResult.data, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : !activeCol ? (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👈</div>
              <p style={{ color: "#475569", fontSize: 14 }}>Chap paneldan collection tanlang</p>
            </div>
          ) : (
            <>
              {/* Collection header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{COL_ICONS[activeCol] || "📁"}</span>
                  <div>
                    <h2 style={{ margin: 0, fontWeight: 900, fontSize: 18, color: "#f1f5f9" }}>{activeCol}</h2>
                    <p style={{ margin: 0, color: "#475569", fontSize: 12 }}>{total} ta yozuv</p>
                  </div>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Qidirish..."
                  style={{
                    padding: "8px 14px", borderRadius: 10,
                    background: "#1e293b", border: "1px solid #334155",
                    color: "#e2e8f0", fontSize: 13, width: 220, outline: "none",
                  }}
                />
              </div>

              {/* Jadval */}
              {loading ? (
                <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{
                      height: 44, borderRadius: 8, background: "#1e293b",
                      animation: "pulse 1.5s infinite",
                    }} />
                  ))}
                </div>
              ) : docs.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: 40, background: "#1e293b",
                  borderRadius: 12, color: "#475569",
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  Yozuv topilmadi
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr>
                        {cols.map((k) => (
                          <th key={k} style={{
                            padding: "10px 12px", textAlign: "left",
                            color: "#475569", fontWeight: 800, fontSize: 11,
                            textTransform: "uppercase", letterSpacing: "0.05em",
                            borderBottom: "1px solid #334155", whiteSpace: "nowrap",
                          }}>
                            {k}
                          </th>
                        ))}
                        <th style={{
                          padding: "10px 12px", borderBottom: "1px solid #334155",
                          color: "#475569", fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                        }}>Amal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docs.map((doc) => (
                        <tr key={doc.id} style={{ borderBottom: "1px solid #1e293b" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          {cols.map((k) => (
                            <td key={k} style={{ padding: "10px 12px", maxWidth: 180 }}>
                              <Val v={doc[k]} />
                            </td>
                          ))}
                          <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => setViewDoc(doc)}
                                style={{
                                  padding: "4px 10px", borderRadius: 6,
                                  background: "#1e3a5f", border: "none",
                                  color: "#7dd3fc", cursor: "pointer", fontSize: 11, fontWeight: 700,
                                }}
                              >👁 Ko'rish</button>
                              <button
                                onClick={() => { setEditDoc(doc); setEditData({ ...doc }); }}
                                style={{
                                  padding: "4px 10px", borderRadius: 6,
                                  background: "#1a2e1a", border: "none",
                                  color: "#86efac", cursor: "pointer", fontSize: 11, fontWeight: 700,
                                }}
                              >✏️ Tahrir</button>
                              <button
                                onClick={() => setDeleteConfirm(doc)}
                                style={{
                                  padding: "4px 10px", borderRadius: 6,
                                  background: "#2d1515", border: "none",
                                  color: "#fca5a5", cursor: "pointer", fontSize: 11, fontWeight: 700,
                                }}
                              >🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {total > PAGE_SIZE && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none",
                      background: page === 1 ? "#1e293b" : "#334155",
                      color: page === 1 ? "#475569" : "#e2e8f0",
                      cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 700,
                    }}
                  >← Oldingi</button>
                  <span style={{
                    padding: "6px 14px", background: "#1d4ed8", borderRadius: 8,
                    fontWeight: 800, color: "white", fontSize: 13,
                  }}>
                    {page} / {Math.ceil(total / PAGE_SIZE)}
                  </span>
                  <button
                    disabled={page * PAGE_SIZE >= total}
                    onClick={() => setPage((p) => p + 1)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none",
                      background: page * PAGE_SIZE >= total ? "#1e293b" : "#334155",
                      color: page * PAGE_SIZE >= total ? "#475569" : "#e2e8f0",
                      cursor: page * PAGE_SIZE >= total ? "not-allowed" : "pointer", fontWeight: 700,
                    }}
                  >Keyingi →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ko'rish modali */}
      {viewDoc && (
        <Modal title={`👁 Ko'rish — ${activeCol} / ${viewDoc.id?.slice(-8)}`} onClose={() => setViewDoc(null)}>
          <pre style={{
            fontFamily: "monospace", fontSize: 12, color: "#94a3b8",
            background: "#0f172a", padding: 16, borderRadius: 10,
            overflow: "auto", maxHeight: 500, margin: 0,
          }}>
            {JSON.stringify(viewDoc, null, 2)}
          </pre>
        </Modal>
      )}

      {/* Tahrirlash modali */}
      {editDoc && (
        <Modal title={`✏️ Tahrirlash — ${editDoc.id?.slice(-8)}`} onClose={() => setEditDoc(null)}>
          <p style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>
            ⚠️ Faqat kerakli maydonlarni o'zgartiring. id va _id o'zgartirilmaydi.
          </p>
          <JsonEditor value={editData} onChange={setEditData} />
          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
            <button
              onClick={() => setEditDoc(null)}
              style={{
                padding: "8px 18px", borderRadius: 8, background: "#334155",
                border: "none", color: "#94a3b8", cursor: "pointer", fontWeight: 700,
              }}
            >Bekor</button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "8px 18px", borderRadius: 8,
                background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
                border: "none", color: "white", cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 800,
              }}
            >
              {saving ? "Saqlanmoqda..." : "✅ Saqlash"}
            </button>
          </div>
        </Modal>
      )}

      {/* O'chirish tasdiqi */}
      {deleteConfirm && (
        <Modal title="🗑️ O'chirishni tasdiqlang" onClose={() => setDeleteConfirm(null)}>
          <div style={{
            background: "#450a0a", border: "1px solid #7f1d1d",
            borderRadius: 10, padding: 14, marginBottom: 16, color: "#fca5a5", fontSize: 13,
          }}>
            ⚠️ Ushbu yozuv butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi!
          </div>
          <div style={{
            background: "#0f172a", borderRadius: 10, padding: 12,
            fontFamily: "monospace", fontSize: 11, color: "#94a3b8", marginBottom: 16,
          }}>
            ID: {deleteConfirm.id}<br />
            {deleteConfirm.firstName && `Ism: ${deleteConfirm.firstName} ${deleteConfirm.lastName || ""}`}
            {deleteConfirm.phone && `\nTelefon: ${deleteConfirm.phone}`}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setDeleteConfirm(null)}
              style={{
                padding: "8px 18px", borderRadius: 8, background: "#334155",
                border: "none", color: "#94a3b8", cursor: "pointer", fontWeight: 700,
              }}
            >Bekor</button>
            <button
              onClick={handleDelete}
              style={{
                padding: "8px 18px", borderRadius: 8, background: "#dc2626",
                border: "none", color: "white", cursor: "pointer", fontWeight: 800,
              }}
            >🗑️ Ha, o'chirish</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

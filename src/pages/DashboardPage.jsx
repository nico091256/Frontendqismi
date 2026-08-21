import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProblems, getStats } from "../api/problems";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Inbox, CheckCheck, Clock, RefreshCw,
  TrendingUp, AlertTriangle, ArrowRight, User, Hash
} from "lucide-react";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Hozirgina";
  if (m < 60) return m + " daqiqa oldin";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " soat oldin";
  return Math.floor(h / 24) + " kun oldin";
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      borderLeft: "4px solid " + color,
      backdropFilter: "blur(12px)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const res = await getAllProblems();
      setProblems(res.data.problems || []);
      if (showToast) toast.success("Yangilandi!");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("it_auth");
        navigate("/login");
        return;
      }
      toast.error("Yuklab bo`lmadi");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total    = problems.length;
  const newCount = problems.filter(p => p.status === "NEW").length;
  const resolved = problems.filter(p => p.status === "RESOLVED").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = problems.filter(p => new Date(p.createdAt) >= today).length;

  const recent = [...problems].slice(0, 6);

  const auth = (() => { try { return JSON.parse(localStorage.getItem("it_auth")); } catch { return null; } })();

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
              <LayoutDashboard size={22} color="#3b82f6" /> Dashboard
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              Salom, <strong style={{ color: "var(--text-secondary)" }}>{auth?.fullName || "Foydalanuvchi"}</strong> 👋
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => fetchData(true)} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Yangilash
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard icon={Inbox}      label="Jami murojaatlar" value={total}    color="#3b82f6" bg="rgba(59,130,246,0.1)" />
          <StatCard icon={AlertTriangle} label="Yangi / Kutilmoqda" value={newCount} color="#f59e0b" bg="rgba(245,158,11,0.1)" />
          <StatCard icon={CheckCheck} label="Hal qilingan"     value={resolved} color="#10b981" bg="rgba(16,185,129,0.1)" />
          <StatCard icon={TrendingUp} label="Bugun kelgan"     value={todayCount} color="#8b5cf6" bg="rgba(139,92,246,0.1)" />
        </div>

        {/* Recent problems */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>
              So`nggi murojaatlar
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin")} style={{ fontSize: "0.8rem" }}>
              Barchasi <ArrowRight size={13} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Yuklanmoqda...</div>
          ) : recent.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <Inbox size={32} style={{ marginBottom: 8, opacity: 0.4 }} /><br />Hech qanday murojaat yo`q
            </div>
          ) : (
            <div>
              {recent.map(p => (
                <div key={p.id} style={{
                  padding: "14px 24px", borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                  transition: "background 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700, padding: "3px 8px",
                    borderRadius: 6, letterSpacing: "0.03em",
                    background: p.status === "RESOLVED" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                    color: p.status === "RESOLVED" ? "#10b981" : "#f59e0b",
                  }}>
                    {p.status === "RESOLVED" ? "✅ Hal" : "🔔 Yangi"}
                  </span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#6366f1", minWidth: 80 }}>
                    <Hash size={11} style={{ marginRight: 2 }} />{p.ticketNumber}
                  </span>
                  <span style={{ flex: 1, fontSize: "0.87rem", color: "var(--text-secondary)" }}>
                    <User size={12} style={{ marginRight: 4 }} />
                    {p.lastName} {p.firstName} — {p.objectName || p.room || "—"}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    <Clock size={12} style={{ marginRight: 4 }} />{timeAgo(p.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, updateProfile, changePassword } from "../api/problems";
import toast from "react-hot-toast";
import { 
  User, Phone, Shield, Lock, Eye, EyeOff, ArrowLeft, 
  CheckCircle2, Calendar, Send, Info 
} from "lucide-react";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("it_auth")); } catch { return null; }
  });

  const [telegramChatId, setTelegramChatId] = useState(user?.telegramChatId || "");
  const [savingTg, setSavingTg] = useState(false);

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    getMe().then(res => {
      if (res.data?.user) {
        setUser(res.data.user);
        setTelegramChatId(res.data.user.telegramChatId || "");
      }
    }).catch(() => {});
  }, []);

  if (!user) { navigate("/login"); return null; }

  const roleLabel = user.role === "MANAGER" ? "Rahbar (Manager)" : "IT Support xodimi";
  const roleColor = user.role === "MANAGER" ? "#8b5cf6" : "#3b82f6";

  const handleSaveTelegram = async (e) => {
    e.preventDefault();
    setSavingTg(true);
    try {
      const res = await updateProfile({ telegramChatId });
      setUser(res.data.user);
      // update local storage
      const auth = JSON.parse(localStorage.getItem("it_auth") || "{}");
      localStorage.setItem("it_auth", JSON.stringify({ ...auth, telegramChatId: res.data.user.telegramChatId }));
      toast.success("Telegram Chat ID saqlandi! 📲");
    } catch (err) {
      toast.error(err.response?.data?.message || "Saqlashda xatolik");
    } finally {
      setSavingTg(false);
    }
  };

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword) {
      return toast.error("Barcha maydonlarni to'ldiring");
    }
    if (form.newPassword !== form.confirmPassword) {
      return toast.error("Yangi parollar mos kelmaydi");
    }
    if (form.newPassword.length < 4) {
      return toast.error("Yangi parol kamida 4 ta belgi bo'lishi kerak");
    }
    setLoading(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success("Parol muvaffaqiyatli o'zgartirildi! ✅");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const inputRow = (label, name, showState, toggleFn, placeholder) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={showState ? "text" : "password"}
          name={name}
          className="form-input"
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          style={{ paddingRight: 40 }}
        />
        <button type="button" onClick={toggleFn}
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}>
          {showState ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 680 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
          <ArrowLeft size={15} /> Orqaga
        </button>

        {/* Profil kartochkasi */}
        <div style={{
          background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 20,
          padding: 32, marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <div style={{
              width: 70, height: 70, borderRadius: "50%",
              background: "linear-gradient(135deg, " + roleColor + "22, " + roleColor + "44)",
              border: "2px solid " + roleColor + "55",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.8rem",
            }}>
              {user.role === "MANAGER" ? "👔" : "🎧"}
            </div>
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                {user.fullName}
              </h2>
              <span style={{
                fontSize: "0.75rem", fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                background: roleColor + "22", color: roleColor,
              }}>
                <Shield size={12} style={{ marginRight: 4 }} />{roleLabel}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { icon: User,     label: "To'liq ism",  value: user.fullName },
              { icon: Phone,    label: "Telefon",      value: user.phone || "—" },
              { icon: Shield,   label: "Rol",          value: roleLabel },
              { icon: Calendar, label: "Ro'yxatdan o'tgan", value: formatDate(user.createdAt) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                background: "var(--input-bg)", borderRadius: 12, padding: "14px 16px",
                border: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon size={12} /> {label}
                </div>
                <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 📲 Telegram Bildirishnoma Sozlamasi */}
        <div style={{
          background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 20, padding: 32, marginBottom: 20,
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Send size={16} color="#38bdf8" /> Telegram Xabarnoma Sozlamasi
          </h3>
          <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
            Sizga yangi murojaat biriktirilganda yoki topshiriq yuklanganda Telegram orqali xabar olish uchun shaxsiy Chat ID raqamingizni kiriting.
          </p>

          <form onSubmit={handleSaveTelegram}>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Telegram Chat ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="Masalan: 123456789"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
              />
            </div>

            <div style={{
              background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: "0.78rem", color: "var(--text-muted)",
              display: "flex", alignItems: "flex-start", gap: 8
            }}>
              <Info size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                Chat ID raqamingizni bilish uchun Telegramda <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" style={{ color: "#38bdf8", fontWeight: 600 }}>@userinfobot</a> ga kiring va <code>/start</code> bosing. U sizga <code>Id: 123456789</code> raqamingizni ko'rsatadi.
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingTg}>
              <CheckCircle2 size={15} />
              {savingTg ? "Saqlanmoqda..." : "Telegram ID ni saqlash"}
            </button>
          </form>
        </div>

        {/* Parol o'zgartirish */}
        <div style={{
          background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 20, padding: 32,
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={16} color="#f59e0b" /> Parolni o'zgartirish
          </h3>

          <form onSubmit={handleSubmit}>
            {inputRow("Joriy parol *", "currentPassword", showCurrent, () => setShowCurrent(p => !p), "Joriy parolingizni kiriting")}
            {inputRow("Yangi parol *",  "newPassword",     showNew,     () => setShowNew(p => !p),     "Kamida 4 ta belgi")}
            <div className="form-group">
              <label className="form-label">Yangi parolni tasdiqlang *</label>
              <input
                type="password" name="confirmPassword" className="form-input"
                placeholder="Yangi parolni qayta kiriting"
                value={form.confirmPassword} onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
              <CheckCircle2 size={15} />
              {loading ? "Saqlanmoqda..." : "Parolni saqlash"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
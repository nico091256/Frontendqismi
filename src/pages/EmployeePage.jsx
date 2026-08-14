import { useState } from 'react';
import { createProblem } from '../api/problems';
import toast from 'react-hot-toast';
import { Send, RotateCcw, AlertCircle } from 'lucide-react';

export default function EmployeePage() {
  const [form, setForm] = useState({ room: '', computer: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null); // holds the created problem

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { room, computer, description } = form;
    if (!room.trim() || !computer.trim() || !description.trim()) {
      setError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await createProblem({ room: room.trim(), computer: computer.trim(), description: description.trim() });
      setSubmitted(res.data.problem);
      toast.success('Muammo muvaffaqiyatli yuborildi!');
    } catch (err) {
      const msg = err.response?.data?.message || "Server bilan bog'lanishda xatolik.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(null);
    setForm({ room: '', computer: '', description: '' });
    setError('');
  };

  // ── Success screen ──────────────────────────────────
  if (submitted) {
    return (
      <div className="page">
        <div className="container">
          <div className="form-wrapper">
            <div className="card">
              <div className="success-screen">
                <div className="success-icon">✅</div>
                <h2>Muammo qabul qilindi!</h2>
                <p>IT xodimlari tez orada muammoingizni ko'rib chiqishadi.</p>
                <div className="success-ticket">{submitted.ticketNumber}</div>

                <div style={{ width: '100%', marginBottom: 24 }}>
                  <div className="card" style={{ textAlign: 'left', padding: '16px 20px', gap: 0 }}>
                    <div className="problem-meta" style={{ marginBottom: 8 }}>
                      <span className="meta-item">🚪 Xona: <strong>{submitted.room}</strong></span>
                      <span className="meta-item">🖥️ Kompyuter: <strong>{submitted.computer}</strong></span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{submitted.description}</p>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={handleReset}>
                  <RotateCcw size={15} />
                  Yangi muammo yuborish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────
  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">
          <span>⚡</span> IT Qo'llab-quvvatlash Tizimi
        </div>
        <h1>
          Muammoingizni <span>bizga yuboring</span>
        </h1>
        <p>
          Kompyuter yoki tarmoq muammosini quyidagi forma orqali yuboring.
          IT xodimlarimiz tez orada yordam beradi.
        </p>
      </div>

      {/* Form card */}
      <div className="container">
        <div className="form-wrapper">
          <div className="card">
            <h3 style={{ marginBottom: 24, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Muammo ma'lumotlarini kiriting
            </h3>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="room">Xona raqami *</label>
                  <input
                    id="room"
                    name="room"
                    type="text"
                    className="form-input"
                    placeholder="Masalan: 204"
                    value={form.room}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="computer">Kompyuter nomi *</label>
                  <input
                    id="computer"
                    name="computer"
                    type="text"
                    className="form-input"
                    placeholder="Masalan: PC-07"
                    value={form.computer}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Muammo tavsifi *</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  placeholder="Muammoni batafsil tushuntiring: nima bo'ldi, qachon boshlandi, qanday harakatlar qildingiz..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                <Send size={16} />
                {loading ? 'Yuborilmoqda...' : "Muammoni yuborish"}
              </button>
            </form>
          </div>

          {/* Info note */}
          <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            🔒 Ro'yxatdan o'tish shart emas. Muammoingiz maxfiy saqlanadi.
          </div>
        </div>
      </div>
    </div>
  );
}

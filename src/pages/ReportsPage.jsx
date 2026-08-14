import { useState, useEffect, useCallback } from 'react';
import { getStats } from '../api/problems';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  BarChart2, RefreshCw, Download, TrendingUp,
  Award, Monitor, DoorOpen, Clock, CheckCheck, AlertTriangle,
} from 'lucide-react';

// ── Uzbek month names (full) for export
const MONTHS_FULL = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

// ── Colors
const COLORS = { total: '#3b82f6', resolved: '#10b981', new: '#f59e0b' };
const PIE_COLORS = ['#10b981', '#f59e0b'];

// ── Tooltip component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem',
    }}>
      <p style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

// ── CSV export helper
function exportCSV(monthly, year) {
  const header = 'Oy,Jami muammo,Hal qilindi,Kutilmoqda\n';
  const rows = monthly.map((m, i) =>
    `${MONTHS_FULL[i]} ${year},${m.total},${m.resolved},${m.new}`
  ).join('\n');
  const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IT-Hisobot-${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (y, showToast = false) => {
    setLoading(true);
    try {
      const res = await getStats(y);
      setData(res.data);
      if (showToast) toast.success('Yangilandi!');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('it_admin_key');
        toast.error("Sessiya muddati tugadi yoki parol noto'g'ri. Qayta kiring.");
        setTimeout(() => window.location.reload(), 1000);
        return;
      }
      toast.error("Statistikani yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(year); }, [year, fetchStats]);

  // Year options: current year and 3 years back
  const yearOptions = [0, 1, 2, 3].map((i) => currentYear - i);

  // Pie data
  const pieData = data ? [
    { name: 'Hal qilindi', value: data.summary.resolvedYear },
    { name: 'Kutilmoqda', value: data.summary.pendingYear },
  ] : [];

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <BarChart2 size={24} color="var(--accent-light)" />
            <h1>Hisobot & Statistika</h1>
          </div>
          <p className="subtitle">Oylik xizmat ko'rsatish hisoboti va tahlili</p>
        </div>

        {/* Controls bar */}
        <div className="filter-bar" style={{ marginBottom: 32 }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            Yil:
          </label>
          <select
            className="filter-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <div className="filter-spacer" />

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fetchStats(year, true)}
            disabled={loading}
          >
            <RefreshCw size={14} />
            Yangilash
          </button>

          {data && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => exportCSV(data.monthly, year)}
            >
              <Download size={14} />
              CSV yuklab olish
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : !data ? null : (
          <>
            {/* ── Summary cards ── */}
            <div className="stats-bar" style={{ marginBottom: 32 }}>
              <div className="stat-chip">
                <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
                  <TrendingUp size={18} color="var(--accent-light)" />
                </div>
                <div>
                  <div className="stat-value">{data.summary.totalYear}</div>
                  <div className="stat-label">{year} yil jami</div>
                </div>
              </div>

              <div className="stat-chip">
                <div className="stat-icon" style={{ background: 'var(--success-bg)' }}>
                  <CheckCheck size={18} color="var(--success)" />
                </div>
                <div>
                  <div className="stat-value" style={{ color: 'var(--success)' }}>
                    {data.summary.resolvedYear}
                  </div>
                  <div className="stat-label">Hal qilindi</div>
                </div>
              </div>

              <div className="stat-chip">
                <div className="stat-icon" style={{ background: 'var(--warning-bg)' }}>
                  <AlertTriangle size={18} color="var(--warning)" />
                </div>
                <div>
                  <div className="stat-value" style={{ color: 'var(--warning)' }}>
                    {data.summary.pendingYear}
                  </div>
                  <div className="stat-label">Kutilmoqda</div>
                </div>
              </div>

              <div className="stat-chip">
                <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.12)' }}>
                  <Award size={18} color="#a78bfa" />
                </div>
                <div>
                  <div className="stat-value" style={{ color: '#a78bfa' }}>
                    {data.summary.resolutionRate}%
                  </div>
                  <div className="stat-label">Hal qilish darajasi</div>
                </div>
              </div>

              {data.summary.avgResolutionHours !== null && (
                <div className="stat-chip">
                  <div className="stat-icon" style={{ background: 'rgba(236,72,153,0.1)' }}>
                    <Clock size={18} color="#f472b6" />
                  </div>
                  <div>
                    <div className="stat-value" style={{ color: '#f472b6' }}>
                      {data.summary.avgResolutionHours}s
                    </div>
                    <div className="stat-label">O'rtacha vaqt</div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Monthly bar chart ── */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart2 size={18} color="var(--accent-light)" />
                {year} yil — oylik muammolar
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.monthly} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend
                    formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{v}</span>}
                  />
                  <Bar dataKey="total" name="Jami" fill={COLORS.total} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Hal qilindi" fill={COLORS.resolved} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="new" name="Kutilmoqda" fill={COLORS.new} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── Bottom row: Pie + Top rooms + Top computers ── */}
            <div className="reports-grid">

              {/* Pie chart */}
              <div className="card">
                <h3 style={{ marginBottom: 16, fontSize: '0.95rem' }}>Holat taqsimoti</h3>
                {data.summary.totalYear === 0 ? (
                  <div className="empty-state" style={{ padding: '30px 0' }}>
                    <div className="empty-icon" style={{ fontSize: 32 }}>📊</div>
                    <p>Ma'lumot yo'q</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
                      {pieData.map((entry, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i], display: 'inline-block' }} />
                          {entry.name} ({entry.value})
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Top rooms */}
              <div className="card">
                <h3 style={{ marginBottom: 16, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DoorOpen size={16} color="var(--accent-light)" />
                  Ko'p muammo — xonalar
                </h3>
                {data.topRooms.length === 0 ? (
                  <div className="empty-state" style={{ padding: '20px 0' }}>
                    <p>Ma'lumot yo'q</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.topRooms.map((r, i) => (
                      <div key={r.room}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {i === 0 && '🥇'} {i === 1 && '🥈'} {i === 2 && '🥉'}
                            {i > 2 && <span style={{ fontSize: '0.7rem', width: 16, textAlign: 'center' }}>{i + 1}.</span>}
                            Xona {r.room}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r.count}</span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                          <div style={{
                            height: '100%',
                            width: `${(r.count / data.topRooms[0].count) * 100}%`,
                            background: 'linear-gradient(90deg, var(--accent), #6366f1)',
                            borderRadius: 99,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top computers */}
              <div className="card">
                <h3 style={{ marginBottom: 16, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Monitor size={16} color="#a78bfa" />
                  Ko'p muammo — kompyuterlar
                </h3>
                {data.topComputers.length === 0 ? (
                  <div className="empty-state" style={{ padding: '20px 0' }}>
                    <p>Ma'lumot yo'q</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.topComputers.map((c, i) => (
                      <div key={c.computer}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {i === 0 && '🥇'} {i === 1 && '🥈'} {i === 2 && '🥉'}
                            {i > 2 && <span style={{ fontSize: '0.7rem', width: 16, textAlign: 'center' }}>{i + 1}.</span>}
                            {c.computer}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.count}</span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                          <div style={{
                            height: '100%',
                            width: `${(c.count / data.topComputers[0].count) * 100}%`,
                            background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                            borderRadius: 99,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Monthly detail table ── */}
            <div className="card" style={{ marginTop: 24 }}>
              <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                📋 Oylik batafsil jadval — {year}
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Oy', 'Jami', 'Hal qilindi', 'Kutilmoqda', 'Samaradorlik'].map((h) => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthly.map((m, i) => {
                      const rate = m.total > 0 ? Math.round((m.resolved / m.total) * 100) : null;
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {MONTHS_FULL[i]}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--accent-light)', fontWeight: 700 }}>
                            {m.total || '—'}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--success)' }}>
                            {m.resolved || '—'}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--warning)' }}>
                            {m.new || '—'}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {rate !== null ? (
                              <span style={{
                                color: rate === 100 ? 'var(--success)' : rate >= 70 ? 'var(--accent-light)' : 'var(--warning)',
                                fontWeight: 700,
                              }}>
                                {rate}%
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>JAMI</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--accent-light)', fontSize: '1rem' }}>{data.summary.totalYear}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--success)' }}>{data.summary.resolvedYear}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--warning)' }}>{data.summary.pendingYear}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#a78bfa' }}>{data.summary.resolutionRate}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

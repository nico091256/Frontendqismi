import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getInventory, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem, 
  exportInventoryExcel 
} from '../api/problems';
import initialData from '../data/inventoryData.json';
import toast from 'react-hot-toast';
import {
  Laptop, Monitor, Printer, Search, Plus, Download, RefreshCw, 
  Trash2, Edit3, User, Phone, Briefcase, Cpu, HardDrive, 
  SlidersHorizontal, LayoutGrid, Table, Check, X, Shield, 
  Sparkles, Layers, Info, Filter, ArrowUpDown, ChevronRight
} from 'lucide-react';

const DEPARTMENTS = [
  'ALL',
  'Buxgalter',
  'PTO',
  'Finan',
  'HR',
  'Transport',
  'Loyihalash',
  'Snab',
  'Tender',
  'Yurist',
  'Analitik',
  'AXO boshlig\'i',
  'Beton',
  'Styajka',
  'Dokument'
];

function formatPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 9) {
    return `+998 (${clean.slice(0, 2)}) ${clean.slice(2, 5)}-${clean.slice(5, 7)}-${clean.slice(7, 9)}`;
  }
  if (clean.length === 12 && clean.startsWith('998')) {
    const rest = clean.slice(3);
    return `+998 (${rest.slice(0, 2)}) ${rest.slice(2, 5)}-${rest.slice(5, 7)}-${rest.slice(7, 9)}`;
  }
  return phone;
}

export default function InventoryPage() {
  const [items, setItems] = useState(initialData || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [deviceFilter, setDeviceFilter] = useState('ALL'); // ALL | PC | Laptop | DUAL_MONITOR | HAS_PRINTER
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortBy, setSortBy] = useState('AZ'); // 'AZ' | 'ZA' | 'DEPT'

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    position: 'Buxgalter',
    phone: '',
    pcSpecs: '',
    monitor1: '',
    monitor2: '',
    printer: ''
  });

  // Fetch from API (with fallback to local bundle data)
  const loadInventory = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const res = await getInventory({
        search: searchTerm,
        position: selectedDept !== 'ALL' ? selectedDept : undefined,
        deviceType: deviceFilter !== 'ALL' ? deviceFilter : undefined
      });
      if (res.data?.items) {
        setItems(res.data.items);
        if (showToast) toast.success("Inventar ma'lumotlari yangilandi! 🔄");
      }
    } catch {
      // Offline fallback: filter local dataset
      let filtered = [...initialData];
      if (searchTerm) {
        const s = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(it => 
          it.fullName.toLowerCase().includes(s) ||
          it.position.toLowerCase().includes(s) ||
          it.phone.includes(s) ||
          it.pcSpecs.toLowerCase().includes(s) ||
          it.monitor1.toLowerCase().includes(s) ||
          it.monitor2.toLowerCase().includes(s) ||
          it.printer.toLowerCase().includes(s)
        );
      }
      if (selectedDept !== 'ALL') {
        filtered = filtered.filter(it => it.position.toLowerCase().includes(selectedDept.toLowerCase()));
      }
      if (deviceFilter !== 'ALL') {
        if (deviceFilter === 'DUAL_MONITOR') filtered = filtered.filter(it => it.monitorCount >= 2);
        else if (deviceFilter === 'HAS_PRINTER') filtered = filtered.filter(it => it.printer && it.printer.length > 0);
        else filtered = filtered.filter(it => it.deviceType === deviceFilter);
      }
      setItems(filtered);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedDept, deviceFilter]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Alphabetical & Custom Sorting
  const sortedItems = useMemo(() => {
    const list = [...items];
    if (sortBy === 'AZ') {
      list.sort((a, b) => {
        const nameA = `${a.lastName || ''} ${a.firstName || ''}`.trim().toLowerCase();
        const nameB = `${b.lastName || ''} ${b.firstName || ''}`.trim().toLowerCase();
        return nameA.localeCompare(nameB, 'uz', { sensitivity: 'base' });
      });
    } else if (sortBy === 'ZA') {
      list.sort((a, b) => {
        const nameA = `${a.lastName || ''} ${a.firstName || ''}`.trim().toLowerCase();
        const nameB = `${b.lastName || ''} ${b.firstName || ''}`.trim().toLowerCase();
        return nameB.localeCompare(nameA, 'uz', { sensitivity: 'base' });
      });
    } else if (sortBy === 'DEPT') {
      list.sort((a, b) => (a.position || '').localeCompare(b.position || '', 'uz'));
    }
    return list;
  }, [items, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = items.length;
    const pcCount = items.filter(it => it.deviceType === 'PC').length;
    const laptopCount = items.filter(it => it.deviceType === 'Laptop').length;
    const dualMonitors = items.filter(it => it.monitorCount >= 2).length;
    const printers = items.filter(it => it.printer && it.printer.trim().length > 0).length;
    return { total, pcCount, laptopCount, dualMonitors, printers };
  }, [items]);

  // Handle Export
  const handleExport = async () => {
    try {
      toast.loading("Excel tayyorlanmoqda...", { id: 'export' });
      const res = await exportInventoryExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'DI_Inventarizatsiya.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Excel muvaffaqiyatli yuklab olindi! 📥", { id: 'export' });
    } catch {
      // Fallback CSV export
      const header = 'ID,Familiya,Ism,Otasining ismi,Lavozimi,Telefon,PC/Laptop,1-Monitor,2-Monitor,Printer\n';
      const rows = items.map((it, idx) => 
        `"${idx+1}","${it.lastName}","${it.firstName}","${it.middleName}","${it.position}","${it.phone}","${it.pcSpecs}","${it.monitor1}","${it.monitor2}","${it.printer}"`
      ).join('\n');
      const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DI_Inventarizatsiya.csv';
      a.click();
      toast.success("CSV formatida yuklab olindi! 📥", { id: 'export' });
    }
  };

  // Open Modal (New or Edit)
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        lastName: item.lastName || '',
        firstName: item.firstName || '',
        middleName: item.middleName || '',
        position: item.position || '',
        phone: item.phone || '',
        pcSpecs: item.pcSpecs || '',
        monitor1: item.monitor1 || '',
        monitor2: item.monitor2 || '',
        printer: item.printer || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        lastName: '',
        firstName: '',
        middleName: '',
        position: 'Buxgalter',
        phone: '',
        pcSpecs: '',
        monitor1: '',
        monitor2: '',
        printer: ''
      });
    }
    setIsModalOpen(true);
  };

  // Save Modal
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.lastName.trim() || !formData.firstName.trim()) {
      toast.error("Familiya va ism kiritilishi shart!");
      return;
    }

    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, formData);
        setItems(prev => prev.map(it => it.id === editingItem.id ? { ...it, ...formData, fullName: `${formData.lastName} ${formData.firstName} ${formData.middleName}`.trim() } : it));
        toast.success("Ma'lumot yangilandi! ✅");
      } else {
        const res = await createInventoryItem(formData);
        if (res.data?.item) {
          setItems(prev => [res.data.item, ...prev]);
        }
        toast.success("Yangi xodim/jihoz qo'shildi! 🎉");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Saqlashda xatolik yuz berdi");
    }
  };

  // Delete Item
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Haqiqatan ham "${name}" xodimining jihozlarini o'chirmoqchimisiz?`)) return;
    try {
      await deleteInventoryItem(id);
      setItems(prev => prev.filter(it => it.id !== id));
      toast.success("Muvaffaqiyatli o'chirildi!");
    } catch {
      setItems(prev => prev.filter(it => it.id !== id));
      toast.success("Ro'yxatdan o'chirildi!");
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 1200 }}>
        
        {/* ── Page Header ── */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(247, 168, 56, 0.12)', border: '1px solid rgba(247, 168, 56, 0.3)', display: 'grid', placeItems: 'center' }}>
                <Laptop size={22} color="#F7A838" />
              </div>
              <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 800 }}>
                IT Inventarizatsiya & Jihozlar
              </h1>
            </div>
            <p className="subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Tashkilot xodimlariga biriktirilgan kompyuterlar, monitorlar va ofis texnikasi hisobi (202+ ta xodim)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => loadInventory(true)} disabled={loading}>
              <RefreshCw size={15} className={loading ? "spin" : ""} />
              <span>Yangilash</span>
            </button>

            <button className="btn btn-ghost btn-sm" onClick={handleExport} style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}>
              <Download size={15} />
              <span>Excel Export</span>
            </button>

            <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
              <Plus size={16} />
              <span>Yangi Jihoz Qo'shish</span>
            </button>
          </div>
        </div>

        {/* ── Stats Metric Cards ── */}
        <div className="stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>JAMI XODIMLAR</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{stats.total}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(59,130,246,0.1)', display: 'grid', placeItems: 'center' }}>
              <User size={18} color="#3b82f6" />
            </div>
          </div>

          <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #8b5cf6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TIZIM BLOKLARI (PC)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{stats.pcCount}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(139,92,246,0.1)', display: 'grid', placeItems: 'center' }}>
              <Cpu size={18} color="#8b5cf6" />
            </div>
          </div>

          <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #F7A838', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>NOUTBUKLAR</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{stats.laptopCount}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(247,168,56,0.1)', display: 'grid', placeItems: 'center' }}>
              <Laptop size={18} color="#F7A838" />
            </div>
          </div>

          <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>2 TA MONITORLI</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{stats.dualMonitors}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'grid', placeItems: 'center' }}>
              <Monitor size={18} color="#10b981" />
            </div>
          </div>

          <div className="card" style={{ padding: '16px 18px', borderLeft: '4px solid #ec4899', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRINTERLAR</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{stats.printers}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(236,72,153,0.1)', display: 'grid', placeItems: 'center' }}>
              <Printer size={18} color="#ec4899" />
            </div>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="card" style={{ padding: '16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            
            {/* Search row & View switch */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                <Search size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Xodim ismi, lavozim, xarakteristika yoki monitor bo'yicha qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: 42, background: 'var(--bg-input)' }}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setSortBy('AZ')}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: sortBy === 'AZ' ? 'var(--accent)' : 'transparent',
                    color: sortBy === 'AZ' ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                  title="Alifbo bo'yicha (A-Z)"
                >
                  🔤 A-Z
                </button>

                <button
                  onClick={() => setSortBy('ZA')}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: sortBy === 'ZA' ? 'var(--accent)' : 'transparent',
                    color: sortBy === 'ZA' ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                  title="Teskari alifbo (Z-A)"
                >
                  🔤 Z-A
                </button>
              </div>

              {/* View Switcher */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: viewMode === 'grid' ? 'var(--accent)' : 'transparent',
                    color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                  title="Karta ko'rinishi"
                >
                  <LayoutGrid size={15} />
                  <span>Kartalar</span>
                </button>

                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: viewMode === 'table' ? 'var(--accent)' : 'transparent',
                    color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                  title="Jadval ko'rinishi"
                >
                  <Table size={15} />
                  <span>Jadval</span>
                </button>
              </div>
            </div>

            {/* Department / Position Filter Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0, marginRight: 4 }}>
                <Filter size={13} style={{ display: 'inline', marginRight: 3 }} /> Bo'lim:
              </span>
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    border: selectedDept === dept ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: selectedDept === dept ? 'var(--accent-glow)' : 'rgba(255,255,255,0.03)',
                    color: selectedDept === dept ? 'var(--accent-light)' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s'
                  }}
                >
                  {dept === 'ALL' ? 'Barcha bo\'limlar' : dept}
                </button>
              ))}
            </div>

            {/* Device Type Quick Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: 4 }}>
                Qurilma:
              </span>
              {[
                { id: 'ALL', label: 'Barchasi' },
                { id: 'PC', label: '🖥️ PC Blok' },
                { id: 'Laptop', label: '💻 Noutbuk' },
                { id: 'DUAL_MONITOR', label: '🖥️🖥️ 2 ta Monitor' },
                { id: 'HAS_PRINTER', label: '🖨️ Printerli' }
              ].map(dev => (
                <button
                  key={dev.id}
                  onClick={() => setDeviceFilter(dev.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: deviceFilter === dev.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: deviceFilter === dev.id ? 'var(--accent)' : 'transparent',
                    color: deviceFilter === dev.id ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {dev.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* ── Content View: GRID OR TABLE ── */}
        {sortedItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Info size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3>Hech qanday jihoz yoki xodim topilmadi</h3>
            <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── GRID MODE ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {sortedItems.map((item) => (
              <div 
                key={item.id} 
                className="card" 
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                  borderTop: item.deviceType === 'Laptop' ? '3px solid #F7A838' : '3px solid #3b82f6',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Header: Name, Position, ID */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: item.deviceType === 'Laptop' ? 'rgba(247,168,56,0.12)' : 'rgba(59,130,246,0.12)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      {item.deviceType === 'Laptop' ? <Laptop size={18} color="#F7A838" /> : <Cpu size={18} color="#3b82f6" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                        {item.fullName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-secondary)'
                        }}>
                          {item.position}
                        </span>

                        {item.phone && (
                          <a 
                            href={`tel:${item.phone}`} 
                            style={{ 
                              fontSize: '0.78rem', 
                              fontWeight: 600,
                              color: '#38bdf8', 
                              background: 'rgba(56, 189, 248, 0.1)',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                              padding: '2px 8px',
                              borderRadius: 6,
                              textDecoration: 'none', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: 4 
                            }}
                            title="Qo'ng'iroq qilish"
                          >
                            <Phone size={12} /> {formatPhone(item.phone)}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.03)' }}>
                    #{item.id}
                  </span>
                </div>

                {/* PC Specs Box */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    <HardDrive size={13} color="var(--accent-light)" /> Tizim Xarakteristikasi:
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>
                    {item.pcSpecs || 'Kompyuter biriktirilmagan'}
                  </div>
                </div>

                {/* Monitors & Printer Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.monitor1 && (
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'rgba(16,185,129,0.1)',
                      color: '#34d399',
                      border: '1px solid rgba(16,185,129,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Monitor size={12} /> 1: {item.monitor1}
                    </span>
                  )}

                  {item.monitor2 && (
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'rgba(56,189,248,0.1)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56,189,248,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Monitor size={12} /> 2: {item.monitor2}
                    </span>
                  )}

                  {item.printer && (
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'rgba(236,72,153,0.1)',
                      color: '#f472b6',
                      border: '1px solid rgba(236,72,153,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Printer size={12} /> {item.printer}
                    </span>
                  )}
                </div>

                {/* Card Action footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => openModal(item)}
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    title="Tahrirlash"
                  >
                    <Edit3 size={13} /> Tahrir
                  </button>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => handleDelete(item.id, item.fullName)}
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    title="O'chirish"
                  >
                    <Trash2 size={13} /> O'chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── TABLE MODE (100% FIT, ZERO HORIZONTAL SCROLL) ── */
          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left', tableLayout: 'auto' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '2px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px', width: '4%' }}>#</th>
                  <th style={{ padding: '12px 14px', width: '25%' }}>Xodim & Lavozimi</th>
                  <th style={{ padding: '12px 14px', width: '18%' }}>Telefon</th>
                  <th style={{ padding: '12px 14px', width: '30%' }}>Kompyuter Xarakteristikasi</th>
                  <th style={{ padding: '12px 14px', width: '15%' }}>Monitor / Jihozlar</th>
                  <th style={{ padding: '12px 14px', width: '8%', textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item, idx) => (
                  <tr 
                    key={item.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    className="table-row-hover"
                  >
                    {/* Index */}
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', verticalAlign: 'top' }}>
                      {idx + 1}
                    </td>

                    {/* Name + Position */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.deviceType === 'Laptop' ? <Laptop size={14} color="#F7A838" /> : <Cpu size={14} color="#3b82f6" />}
                        <span>{item.fullName}</span>
                      </div>
                      <div style={{ marginTop: 3 }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-secondary)'
                        }}>
                          {item.position}
                        </span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      {item.phone ? (
                        <a 
                          href={`tel:${item.phone}`} 
                          style={{ 
                            fontSize: '0.78rem', 
                            color: '#38bdf8', 
                            textDecoration: 'none', 
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Phone size={11} /> {formatPhone(item.phone)}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Specs */}
                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontSize: '0.8rem', lineHeight: 1.4, verticalAlign: 'top' }}>
                      {item.pcSpecs || <span style={{ color: 'var(--text-muted)' }}>Kompyuter biriktirilmagan</span>}
                    </td>

                    {/* Monitors & Printer */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {item.monitor1 && (
                          <span style={{ fontSize: '0.74rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Monitor size={11} /> {item.monitor1}
                          </span>
                        )}
                        {item.monitor2 && (
                          <span style={{ fontSize: '0.74rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Monitor size={11} /> {item.monitor2}
                          </span>
                        )}
                        {item.printer && (
                          <span style={{ fontSize: '0.74rem', color: '#f472b6', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Printer size={11} /> {item.printer}
                          </span>
                        )}
                        {!item.monitor1 && !item.monitor2 && !item.printer && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px', textAlign: 'right', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        <button 
                          onClick={() => openModal(item)} 
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Tahrirlash"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id, item.fullName)} 
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="O'chirish"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ADD / EDIT MODAL ── */}
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', zIndex: 120, padding: 16, overflowY: 'auto' }}>
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, width: '100%', maxWidth: 580, padding: 24, boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
              
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 18 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Laptop size={20} color="#F7A838" />
                  {editingItem ? "Xodim / Jihozni Tahrirlash" : "Yangi Jihoz Qo'shish"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Familiya *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Karimov" 
                      value={formData.lastName} 
                      onChange={(e) => setFormData(p => ({ ...p, lastName: e.target.value }))}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Ism *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ali" 
                      value={formData.firstName} 
                      onChange={(e) => setFormData(p => ({ ...p, firstName: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Otasining ismi</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Valiyevich" 
                      value={formData.middleName} 
                      onChange={(e) => setFormData(p => ({ ...p, middleName: e.target.value }))} 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Lavozimi / Bo'limi</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Buxgalter / PTO / HR" 
                      value={formData.position} 
                      onChange={(e) => setFormData(p => ({ ...p, position: e.target.value }))} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Telefon raqam</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="+998 90 123 45 67" 
                    value={formData.phone} 
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">PC / Noutbuk Xarakteristikasi</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Intel Core i5-9400, 16GB RAM, 256GB SSD, 1TB HDD..." 
                    value={formData.pcSpecs} 
                    onChange={(e) => setFormData(p => ({ ...p, pcSpecs: e.target.value }))} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">1-Monitor</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Acer 24 / Immer 27" 
                      value={formData.monitor1} 
                      onChange={(e) => setFormData(p => ({ ...p, monitor1: e.target.value }))} 
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">2-Monitor (ixtiyoriy)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Artel 22 / LG 24" 
                      value={formData.monitor2} 
                      onChange={(e) => setFormData(p => ({ ...p, monitor2: e.target.value }))} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Printer / Qo'shimcha Qurilma</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Canon 3010, HP LaserJet..." 
                    value={formData.printer} 
                    onChange={(e) => setFormData(p => ({ ...p, printer: e.target.value }))} 
                  />
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Check size={16} /> Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

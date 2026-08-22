import React, { useState } from 'react';
import { Printer, X, Edit3, FileText } from 'lucide-react';

function formatDateUz(d = new Date()) {
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`;
}

export default function HandoverActModal({ problem, isOpen, onClose }) {
  if (!isOpen || !problem) return null;

  // Current logged in IT admin/support
  const authUser = (() => {
    try {
      const raw = localStorage.getItem('it_auth');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const defaultSenderName = authUser?.fullName || problem.assignedUser?.fullName || 'Najmiddinov Shovkatxo\'ja Nematillo o\'g\'li';
  const defaultSenderPhone = authUser?.phone || problem.assignedUser?.phone || '+998959888034';

  const defaultReceiverName = `${problem.lastName || ''} ${problem.firstName || ''} ${problem.middleName || ''}`.trim() || 'Xodim F.I.Sh';
  const defaultReceiverPhone = problem.phone || '';

  // Extract model and description
  const reqItem = problem.requestedItem || problem.description || 'Jihoz';
  let initialModel = '-';
  if (/lenovo/i.test(reqItem)) initialModel = 'Lenovo';
  else if (/artel/i.test(reqItem)) initialModel = 'Artel';
  else if (/hp/i.test(reqItem)) initialModel = 'HP';
  else if (/canon/i.test(reqItem)) initialModel = 'Canon';
  else if (/epson/i.test(reqItem)) initialModel = 'Epson';
  else if (/asus/i.test(reqItem)) initialModel = 'Asus';
  else if (/acer/i.test(reqItem)) initialModel = 'Acer';
  else if (/immer/i.test(reqItem)) initialModel = 'Immer';
  else if (/samsung/i.test(reqItem)) initialModel = 'Samsung';
  else if (/lg/i.test(reqItem)) initialModel = 'LG';

  const [formData, setFormData] = useState({
    companyName: '“DISCOVER INVEST GLOBAL СП OOO”',
    docTitle: 'ФОРМА ПЕРЕДАЧИ ОРГТЕХНИКИ И ОБОРУДОВАНИЯ',
    equipmentDesc: reqItem,
    daa: '-',
    invNumber: problem.ticketNumber || '-',
    model: initialModel,
    quantity: problem.quantity || 1,
    notes: '-',
    date: formatDateUz(problem.resolvedAt || problem.createdAt || new Date()),
    receiverName: defaultReceiverName,
    receiverPhone: defaultReceiverPhone,
    senderName: defaultSenderName,
    senderPhone: defaultSenderPhone
  });

  const [isEditing, setIsEditing] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(8px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 999,
      padding: 16,
      overflowY: 'auto'
    }}>
      {/* Modal Card */}
      <div style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 16,
        width: '100%',
        maxWidth: 860,
        boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '92vh',
        overflow: 'hidden'
      }}>

        {/* Modal Toolbar (Screen only) */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: '#1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(56,189,248,0.15)', display: 'grid', placeItems: 'center' }}>
              <FileText size={18} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                Topshirish Akti (Shartnoma)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Ticket: {problem.ticketNumber} — {problem.objectName || 'Obyekt'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEditing(!isEditing)}
              style={{ padding: '6px 12px', fontSize: '0.8rem', color: isEditing ? '#34d399' : 'var(--text-secondary)' }}
            >
              <Edit3 size={14} />
              <span>{isEditing ? "Ko'rish" : "Tahrirlash"}</span>
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#2563eb' }}
            >
              <Printer size={15} />
              <span>Chop etish (Print / PDF)</span>
            </button>

            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Edit Drawer (Screen only) */}
        {isEditing && (
          <div className="no-print" style={{
            background: '#0f172a',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            fontSize: '0.82rem'
          }}>
            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Kompaniya nomi:</label>
              <input
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                value={formData.companyName}
                onChange={(e) => setFormData(p => ({ ...p, companyName: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Jihoz tavsifi (Вид):</label>
              <input
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                value={formData.equipmentDesc}
                onChange={(e) => setFormData(p => ({ ...p, equipmentDesc: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Model:</label>
              <input
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                value={formData.model}
                onChange={(e) => setFormData(p => ({ ...p, model: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Inventar raqami:</label>
              <input
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                value={formData.invNumber}
                onChange={(e) => setFormData(p => ({ ...p, invNumber: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Miqdori (Кол-во):</label>
              <input
                type="number"
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                value={formData.quantity}
                onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Sana:</label>
              <input
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                value={formData.date}
                onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Topshiruvchi (ПЕРЕДАЛ):</label>
              <input
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                value={formData.senderName}
                onChange={(e) => setFormData(p => ({ ...p, senderName: e.target.value }))}
              />
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontWeight: 600 }}>Topshiruvchi tel:</label>
              <input
                className="form-input"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                value={formData.senderPhone}
                onChange={(e) => setFormData(p => ({ ...p, senderPhone: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* ── PRINTABLE A4 PAPER PREVIEW ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'grid', placeItems: 'center', background: '#334155' }}>
          
          <div 
            id="printable-act"
            style={{
              background: '#ffffff',
              color: '#000000',
              width: '100%',
              maxWidth: '740px',
              minHeight: '940px',
              padding: '40px 48px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              fontFamily: '"Times New Roman", Times, serif',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: '17pt', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '0.02em', color: '#000' }}>
                  {formData.companyName}
                </h2>
                <h3 style={{ fontSize: '11.5pt', fontWeight: 'bold', margin: 0, letterSpacing: '0.03em', textTransform: 'uppercase', color: '#000' }}>
                  {formData.docTitle}
                </h3>
              </div>

              {/* Main Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1.5px solid #000',
                fontSize: '10.5pt',
                textAlign: 'center',
                color: '#000'
              }}>
                <thead>
                  <tr style={{ height: '38px', fontWeight: 'bold', background: '#fafafa', color: '#000' }}>
                    <th style={{ border: '1.5px solid #000', width: '38%', padding: '6px 8px', color: '#000' }}>Вид оборудования</th>
                    <th style={{ border: '1.5px solid #000', width: '9%', padding: '6px 4px', color: '#000' }}>Даа</th>
                    <th style={{ border: '1.5px solid #000', width: '15%', padding: '6px 4px', fontSize: '9.5pt', lineHeight: 1.1, color: '#000' }}>Инвентарь номер</th>
                    <th style={{ border: '1.5px solid #000', width: '13%', padding: '6px 6px', color: '#000' }}>Модель</th>
                    <th style={{ border: '1.5px solid #000', width: '10%', padding: '6px 4px', color: '#000' }}>Кол-во</th>
                    <th style={{ border: '1.5px solid #000', width: '15%', padding: '6px 6px', color: '#000' }}>Заметки</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Filled Item Row */}
                  <tr style={{ minHeight: '52px' }}>
                    <td style={{ border: '1.5px solid #000', padding: '10px 10px', textAlign: 'left', fontWeight: 'normal', lineHeight: 1.35, color: '#000' }}>
                      {formData.equipmentDesc}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '8px 4px', color: '#000' }}>
                      {formData.daa}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '8px 4px', color: '#000' }}>
                      {formData.invNumber}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '8px 6px', color: '#000' }}>
                      {formData.model}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '8px 4px', fontWeight: 'bold', color: '#000' }}>
                      {formData.quantity}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '8px 6px', color: '#000' }}>
                      {formData.notes}
                    </td>
                  </tr>

                  {/* Empty rows */}
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((rowIdx) => (
                    <tr key={rowIdx} style={{ height: '34px' }}>
                      <td style={{ border: '1.5px solid #000' }}>&nbsp;</td>
                      <td style={{ border: '1.5px solid #000' }}>&nbsp;</td>
                      <td style={{ border: '1.5px solid #000' }}>&nbsp;</td>
                      <td style={{ border: '1.5px solid #000' }}>&nbsp;</td>
                      <td style={{ border: '1.5px solid #000' }}>&nbsp;</td>
                      <td style={{ border: '1.5px solid #000' }}>&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Signatures Box */}
            <div style={{ marginTop: '28px' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1.5px solid #000',
                fontSize: '11pt',
                color: '#000'
              }}>
                <thead>
                  <tr style={{ height: '32px', fontWeight: 'bold', background: '#fafafa', color: '#000' }}>
                    <th colSpan={2} style={{ border: '1.5px solid #000', width: '50%', textAlign: 'center', padding: '6px', color: '#000' }}>
                      ПРИНЯЛ
                    </th>
                    <th colSpan={2} style={{ border: '1.5px solid #000', width: '50%', textAlign: 'center', padding: '6px', color: '#000' }}>
                      ПЕРЕДАЛ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* F.I.O. */}
                  <tr style={{ height: '36px' }}>
                    <td style={{ border: '1.5px solid #000', width: '16%', fontWeight: 'bold', padding: '6px 8px', textAlign: 'center', color: '#000' }}>
                      Ф.И.О.
                    </td>
                    <td style={{ border: '1.5px solid #000', width: '34%', padding: '6px 10px', fontSize: '10.5pt', lineHeight: 1.25, color: '#000' }}>
                      {formData.receiverName}
                    </td>

                    <td style={{ border: '1.5px solid #000', width: '16%', fontWeight: 'bold', padding: '6px 8px', textAlign: 'center', color: '#000' }}>
                      Ф.И.О.
                    </td>
                    <td style={{ border: '1.5px solid #000', width: '34%', padding: '6px 10px', fontSize: '10.5pt', lineHeight: 1.25, color: '#000' }}>
                      {formData.senderName}
                    </td>
                  </tr>

                  {/* Date */}
                  <tr style={{ height: '32px' }}>
                    <td style={{ border: '1.5px solid #000', fontWeight: 'bold', padding: '4px 8px', textAlign: 'center', color: '#000' }}>
                      Дата
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '4px 10px', textAlign: 'center', color: '#000' }}>
                      {formData.date}
                    </td>

                    <td style={{ border: '1.5px solid #000', fontWeight: 'bold', padding: '4px 8px', textAlign: 'center', color: '#000' }}>
                      Дата
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '4px 10px', textAlign: 'center', color: '#000' }}>
                      {formData.date}
                    </td>
                  </tr>

                  {/* Signature */}
                  <tr style={{ height: '36px' }}>
                    <td style={{ border: '1.5px solid #000', fontWeight: 'bold', padding: '4px 8px', textAlign: 'center', color: '#000' }}>
                      Подпись
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '4px 10px', color: '#000' }}>
                      &nbsp;
                    </td>

                    <td style={{ border: '1.5px solid #000', fontWeight: 'bold', padding: '4px 8px', textAlign: 'center', color: '#000' }}>
                      Подпись
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '4px 10px', color: '#000' }}>
                      &nbsp;
                    </td>
                  </tr>

                  {/* Phone */}
                  <tr style={{ height: '32px' }}>
                    <td style={{ border: '1.5px solid #000', fontWeight: 'bold', padding: '4px 8px', textAlign: 'center', color: '#000' }}>
                      Тел №
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '4px 10px', fontWeight: 'bold', textAlign: 'center', color: '#000' }}>
                      {formData.receiverPhone}
                    </td>

                    <td style={{ border: '1.5px solid #000', fontWeight: 'bold', padding: '4px 8px', textAlign: 'center', color: '#000' }}>
                      Тел №
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '4px 10px', fontWeight: 'bold', textAlign: 'center', color: '#000' }}>
                      {formData.senderPhone}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-act, #printable-act * {
            visibility: visible !important;
          }
          #printable-act {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 30px 45px !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 999999 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

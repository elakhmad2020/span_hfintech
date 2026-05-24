import { useState, useRef, useEffect } from 'react';
import { supabase } from './supabase';
import { getProfile, updateProfile, uploadAvatar } from './Auth';
import { generateSpanID, Barcode } from './Shared';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ── HELPER FUNCTIONS ───────────────────────────────────────────────────────────
const fmt = (n) => `N${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

const getTxnStyle = (txn) => {
  const desc = (txn.description || txn.name || '').toLowerCase();
  if (txn.type === 'credit') return { label: 'TOP', bg: '#dcfce7', color: '#166634' };
  if (desc.includes('consult') || desc.includes('doctor')) return { label: 'MED', bg: '#fee2e2', color: '#991b1b' };
  if (desc.includes('lab') || desc.includes('test')) return { label: 'LAB', bg: '#eff6ff', color: '#1d4ed8' };
  if (desc.includes('pharma') || desc.includes('drug') || desc.includes('medic')) return { label: 'PHM', bg: '#f3e8ff', color: '#6b21a8' };
  return { label: 'TXN', bg: '#f4f9fa', color: '#5a7a8a' };
};

const formatTxnDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });
  if (d.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' });
};

const CLAIMS = [
  { id: 'CLM-001', service: 'General Consultation', doctor: 'Dr. Amira Osei', date: 'Feb 20', amount: 'N5,000', status: 'approved' },
  { id: 'CLM-002', service: 'Full Blood Count', doctor: 'Lab Services', date: 'Feb 18', amount: 'N12,000', status: 'pending' },
  { id: 'CLM-003', service: 'Medications', doctor: 'Pharmacy', date: 'Feb 18', amount: 'N3,200', status: 'approved' },
  { id: 'CLM-004', service: 'Cardiology Consult', doctor: 'Dr. Bello', date: 'Jan 30', amount: 'N8,500', status: 'rejected' },
];

// ── DASHBOARD ──────────────────────────────────────────────────────────────────
export function Dashboard({ onNav, userName, userId, onBook }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dependents, setDependents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (userId) fetchAll(); }, [userId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
      setWallet(walletData);
      const { data: txnData } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(4);
      setTransactions(txnData || []);
      const { data: depData } = await supabase.from('dependents').select('id').eq('user_id', userId);
      setDependents(depData || []);
      const { data: apptData } = await supabase.from('appointments').select('*').eq('user_id', userId).eq('status', 'upcoming').order('date', { ascending: true }).limit(2);
      setAppointments(apptData || []);
    } catch (e) { console.error('Dashboard fetch error:', e.message); }
    setLoading(false);
  };

  const todayStr = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const firstName = userName ? userName.split(' ')[0] : '';

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">Hello, {firstName}!</div><div className="page-sub">{todayStr}</div></div>
        <button className="btn btn-primary btn-sm" onClick={onBook || (() => onNav('telemedicine'))}>+ Book Appointment</button>
      </div>
      <div className="dashboard-grid">
        <div>
          <div className="wallet-card" style={{ marginBottom: 20 }}>
            <div className="wallet-label">Health Savings Wallet</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16, marginBottom: 8, position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Montserrat',sans-serif", marginBottom: 4 }}>Available</div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Montserrat',sans-serif" }}>{loading ? '—' : fmt(wallet?.balance || 0)}</div>
                <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2, fontFamily: "'Manrope',sans-serif" }}>45% · health wallet</div>
              </div>
              <div>
                <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Montserrat',sans-serif", marginBottom: 4 }}>Investment</div>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", color: '#c4b5fd' }}>{loading ? '—' : fmt(wallet?.investment_balance || 0)}</div>
                <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2, fontFamily: "'Manrope',sans-serif" }}>45% · Konooz Fund</div>
              </div>
              <div>
                <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Montserrat',sans-serif", marginBottom: 4 }}>Total</div>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", color: '#6ee7b7' }}>{loading ? '—' : fmt((wallet?.balance || 0) + (wallet?.investment_balance || 0))}</div>
                <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2, fontFamily: "'Manrope',sans-serif" }}>Available + Investment</div>
              </div>
            </div>
            <div className="wallet-id">{wallet?.account_number ? `${wallet.account_number} · ${wallet.bank_name || 'Span Bank'}` : 'Setting up your account...'}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <div style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{dependents.length} Dependent{dependents.length !== 1 ? 's' : ''}</div>
              <div style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Active Member</div>
            </div>
            <div className="wallet-actions">
              <button className="wallet-btn wallet-btn-primary" onClick={() => onNav('wallet')}>Fund Wallet</button>
              <button className="wallet-btn wallet-btn-outline" onClick={() => onNav('wallet')}>Transfer</button>
              <button className="wallet-btn wallet-btn-outline" onClick={() => onNav('transactions')}>Statement</button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title">Recent Transactions</div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav('transactions')}>View all</button>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--slate)', fontSize: 13 }}>Loading transactions...</div>
            : transactions.length === 0 ? <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--slate)', fontSize: 13 }}>No transactions yet. Fund your wallet to get started.</div>
            : (
              <div className="txn-list">
                {transactions.map(t => {
                  const style = getTxnStyle(t);
                  return (
                    <div key={t.id} className="txn-item">
                      <div className="txn-icon" style={{ background: style.bg, color: style.color }}>{style.label}</div>
                      <div className="txn-info"><div className="txn-name">{t.description || 'Transaction'}</div><div className="txn-date">{formatTxnDate(t.created_at)}</div></div>
                      <div className={`txn-amount ${t.type}`}>{t.type === 'credit' ? '+' : '-'}N{Number(t.amount).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>Quick Actions</div>
            <div className="quick-actions">
              {[{ label: 'See a Doctor', short: 'DOC', page: 'telemedicine' }, { label: 'Fund Wallet', short: 'PAY', page: 'wallet' }, { label: 'Dependents', short: 'FAM', page: 'dependents' }, { label: 'Documents', short: 'FIL', page: 'documents' }].map(a => (
                <div key={a.label} className="quick-action" onClick={() => onNav(a.page)}>
                  <div className="quick-action-icon">{a.short}</div>
                  <div className="quick-action-label">{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Upcoming Appointments</div>
            {loading ? <div style={{ fontSize: 13, color: 'var(--slate)' }}>Loading...</div>
            : appointments.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--slate)', textAlign: 'center', padding: '16px 0' }}>
                No upcoming appointments.{' '}
                <span style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => onNav('telemedicine')}>Book one now</span>
              </div>
            ) : (
              <div className="schedule-list">
                {appointments.map(a => {
                  const apptTime = a.date ? new Date(a.date).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos' }) : 'N/A';
                  const apptDate = a.date ? new Date(a.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', timeZone: 'Africa/Lagos' }) : '';
                  return (
                    <div key={a.id} className="appt-item" style={{ padding: '10px 12px' }}>
                      <div style={{ minWidth: 56, textAlign: 'center' }}>
                        <div className="appt-time-val" style={{ fontSize: 13 }}>{apptTime}</div>
                        <div className="appt-time-date">{apptDate}</div>
                      </div>
                      <div className="appt-divider" />
                      <div style={{ flex: 1 }}>
                        <div className="appt-title" style={{ fontSize: 12 }}>{a.title || 'Consultation'}</div>
                        <div className="appt-doctor">{a.doctor_name || 'Doctor'}</div>
                      </div>
                      <span className="badge badge-info">{a.type || 'Video'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── WALLET PAGE ────────────────────────────────────────────────────────────────
export function WalletPage({ userId }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFund, setShowFund] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stmtFrom, setStmtFrom] = useState('');
  const [stmtTo, setStmtTo] = useState('');
  const [stmtFormat, setStmtFormat] = useState('PDF');

  useEffect(() => { if (userId) fetchWalletData(); }, [userId]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
      setWallet(walletData);
      const { data: txnData } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setTransactions(txnData || []);
    } catch (e) { console.error('Wallet fetch error:', e.message); }
    setLoading(false);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const getFilteredTxns = () => transactions.filter(t => {
    if (!stmtFrom && !stmtTo) return true;
    const d = new Date(t.created_at);
    if (stmtFrom && d < new Date(stmtFrom)) return false;
    if (stmtTo && d > new Date(stmtTo + 'T23:59:59')) return false;
    return true;
  });

  const downloadPDF = () => {
    const filtered = getFilteredTxns();
    const doc = new jsPDF();
    const teal = [30, 139, 166];
    doc.setFillColor(...teal); doc.rect(0, 0, 210, 38, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('Span Healthcare', 14, 16); doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text('Wallet Statement', 14, 25); doc.setFontSize(9);
    doc.text(`Period: ${stmtFrom || 'All'} to ${stmtTo || 'Now'}`, 14, 33);
    const credits = filtered.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
    const debits = filtered.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0);
    doc.setFillColor(245, 250, 252); doc.rect(14, 44, 182, 22, 'F');
    doc.setTextColor(26, 47, 66); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(`Total Funded: N${credits.toLocaleString()}`, 20, 53);
    doc.text(`Total Spent: N${debits.toLocaleString()}`, 80, 53);
    doc.text(`Net: N${(credits - debits).toLocaleString()}`, 155, 53);
    import('jspdf-autotable').then(({ default: autoTable }) => {
      autoTable(doc, {
        startY: 72,
        head: [['Date', 'Description', 'Type', 'Amount']],
        body: filtered.map(t => [new Date(t.created_at).toLocaleDateString('en-NG'), t.name || t.description || 'Transaction', t.type, `${t.type === 'credit' ? '+' : '-'}N${Number(t.amount).toLocaleString()}`]),
        headStyles: { fillColor: teal, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
      });
      doc.save(`SpanHC_Statement_${stmtFrom || 'all'}_to_${stmtTo || 'now'}.pdf`);
      setShowStatement(false);
    });
  };

  const downloadExcel = () => {
    const filtered = getFilteredTxns();
    const rows = [['Date', 'Description', 'Type', 'Amount'], ...filtered.map(t => [new Date(t.created_at).toLocaleDateString('en-NG'), t.name || t.description || 'Transaction', t.type, `${t.type === 'credit' ? '+' : '-'}${Number(t.amount).toLocaleString()}`])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `SpanHC_Statement.csv`; a.click();
    URL.revokeObjectURL(url); setShowStatement(false);
  };

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">Wallet</div><div className="page-sub">Your health savings account</div></div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowFund(true)}>+ Fund Wallet</button>
      </div>
      <div className="wallet-card" style={{ marginBottom: 24 }}>
        <div className="wallet-label">Available Balance</div>
        <div className="wallet-amount">{loading ? 'Loading...' : fmt(wallet?.balance)}</div>
        <div className="wallet-id">{wallet?.account_number ? `${wallet.account_number} · ${wallet.bank_name || 'Span Bank'}` : 'Setting up your account...'}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <div style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Health Savings</div>
          <div style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Active</div>
        </div>
        <div className="wallet-actions">
          <button className="wallet-btn wallet-btn-primary" onClick={() => setShowFund(true)}>Fund Wallet</button>
          <button className="wallet-btn wallet-btn-outline" onClick={() => setShowStatement(true)}>Statement</button>
        </div>
      </div>

      <div style={{ background: '#e8f6f9', border: '1.5px solid #98B7B9', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#2d8a9e', background: '#b0cccf', padding: '3px 8px', borderRadius: 6, fontFamily: "'Montserrat',sans-serif", flexShrink: 0 }}>INFO</div>
        <div style={{ fontSize: 13, color: '#1a2f42', lineHeight: 1.7 }}>Your health savings wallet is a <strong>dedicated account</strong>. To add funds, click <strong>Fund Wallet</strong> and transfer to the account details shown.</div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 18 }}>Transaction History</div>
        {loading ? <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--slate)', fontSize: 13 }}>Loading transactions...</div>
        : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'var(--primary)', margin: '0 auto 14px', fontFamily: "'Montserrat',sans-serif" }}>EMPTY</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>No transactions yet</div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16, width: 'auto' }} onClick={() => setShowFund(true)}>View Account Details</button>
          </div>
        ) : (
          <div className="txn-list">
            {transactions.map(t => {
              const style = getTxnStyle(t);
              return (
                <div key={t.id} className="txn-item">
                  <div className="txn-icon" style={{ background: style.bg, color: style.color }}>{style.label}</div>
                  <div className="txn-info"><div className="txn-name">{t.name || t.description || 'Transaction'}</div><div className="txn-date">{formatTxnDate(t.created_at)}</div></div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`txn-amount ${t.type}`}>{t.type === 'credit' ? '+' : '-'}N{Number(t.amount).toLocaleString()}</div>
                    <span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: 10, marginTop: 3 }}>{t.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showFund && (
        <div className="modal-overlay" onClick={() => setShowFund(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Fund Your Wallet</div><button className="modal-close" onClick={() => setShowFund(false)}>X</button></div>
            <div className="modal-body">
              <div style={{ background: 'var(--primary-pale)', border: '1.5px solid var(--secondary)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16, fontFamily: "'Montserrat',sans-serif" }}>Your Dedicated Account Details</div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: "'Montserrat',sans-serif" }}>Bank Name</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginTop: 4 }}>{wallet?.bank_name || 'Wema Bank'}</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: "'Montserrat',sans-serif" }}>Account Number</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', letterSpacing: 2, fontFamily: "'Montserrat',sans-serif" }}>{wallet?.account_number || 'Pending setup'}</div>
                    {wallet?.account_number && <button onClick={() => copyToClipboard(wallet.account_number)} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid var(--primary)', background: copied ? 'var(--primary)' : 'white', color: copied ? 'white' : 'var(--primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{copied ? 'Copied!' : 'Copy'}</button>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: "'Montserrat',sans-serif" }}>Account Name</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginTop: 4 }}>{wallet?.account_name || 'Span Healthcare'}</div>
                </div>
              </div>
              <div style={{ background: '#fef9c3', border: '1.5px solid #e8a444', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: '#854d0e', lineHeight: 1.7 }}>
                <strong>How to fund:</strong> Transfer any amount to the account details above. Your wallet will update automatically within minutes.
              </div>
              <button className="btn btn-primary" onClick={() => setShowFund(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {showStatement && (
        <div className="modal-overlay" onClick={() => setShowStatement(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Account Statement</div><button className="modal-close" onClick={() => setShowStatement(false)}>X</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">From Date</label><input className="form-input" type="date" value={stmtFrom} onChange={e => setStmtFrom(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">To Date</label><input className="form-input" type="date" value={stmtTo} onChange={e => setStmtTo(e.target.value)} /></div>
              <div className="form-group">
                <label className="form-label">Format</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {['PDF', 'Excel'].map(f => (
                    <div key={f} onClick={() => setStmtFormat(f)} style={{ border: `1.5px solid ${stmtFormat === f ? 'var(--primary)' : '#dce8eb'}`, background: stmtFormat === f ? 'var(--primary-pale)' : 'white', borderRadius: 10, padding: 14, textAlign: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: stmtFormat === f ? 'var(--primary)' : 'var(--navy)' }}>{f}</div>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => stmtFormat === 'PDF' ? downloadPDF() : downloadExcel()}>Download Statement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TRANSACTIONS PAGE ──────────────────────────────────────────────────────────
export function Transactions({ userId, userName }) {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => { if (userId) fetchTransactions(); }, [userId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setTransactions(data || []); setFiltered(data || []);
    } catch (e) { console.error('Transactions fetch error:', e.message); }
    setLoading(false);
  };

  useEffect(() => {
    let result = [...transactions];
    if (typeFilter !== 'all') result = result.filter(t => t.type === typeFilter);
    if (dateFrom) result = result.filter(t => new Date(t.created_at) >= new Date(dateFrom));
    if (dateTo) result = result.filter(t => new Date(t.created_at) <= new Date(dateTo + 'T23:59:59'));
    setFiltered(result);
  }, [typeFilter, dateFrom, dateTo, transactions]);

  const totalCredits = filtered.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDebits = filtered.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0);
  const hasFilters = dateFrom || dateTo || typeFilter !== 'all';

  const clearFilters = () => { setDateFrom(''); setDateTo(''); setTypeFilter('all'); setShowFilter(false); };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(13, 110, 130); doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.setFont('helvetica', 'bold');
    doc.text('Span Healthcare', 14, 13); doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text('Health Savings Platform', 14, 21);
    doc.setFontSize(10); doc.text('TRANSACTION STATEMENT', 140, 13);
    doc.setFontSize(8); doc.text(`Generated: ${new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}`, 140, 21);
    doc.setTextColor(30, 41, 59); doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Account Name: ${userName || 'Member'}`, 14, 42);
    doc.text(`Period: ${dateFrom || 'All time'} to ${dateTo || 'Today'}`, 14, 50);
    doc.setFillColor(232, 246, 249); doc.roundedRect(14, 57, 182, 24, 3, 3, 'F');
    doc.setFontSize(8); doc.setTextColor(90, 122, 138);
    doc.text('TOTAL FUNDED', 22, 65); doc.text('TOTAL SPENT', 90, 65); doc.text('NET', 160, 65);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.setTextColor(47, 184, 138); doc.text(fmt(totalCredits), 22, 75);
    doc.setTextColor(224, 82, 82); doc.text(fmt(totalDebits), 90, 75);
    const net = totalCredits - totalDebits;
    doc.setTextColor(net >= 0 ? 47 : 224, net >= 0 ? 184 : 82, net >= 0 ? 138 : 82);
    doc.text(fmt(net), 160, 75);
    import('jspdf-autotable').then(({ default: autoTable }) => {
      autoTable(doc, {
        startY: 88,
        head: [['Date', 'Description', 'Type', 'Amount']],
        body: filtered.map(t => [new Date(t.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }), t.description || 'Transaction', t.type === 'credit' ? 'Credit' : 'Debit', `${t.type === 'credit' ? '+' : '-'}${fmt(t.amount)}`]),
        headStyles: { fillColor: [13, 110, 130], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 9 }, alternateRowStyles: { fillColor: [244, 249, 250] },
      });
      doc.save(`SpanHC_Statement_${dateFrom || 'all'}_to_${dateTo || 'today'}.pdf`);
    });
  };

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">Transactions</div><div className="page-sub">Full history of your wallet activity</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" style={{ width: 'auto' }} onClick={() => setShowFilter(!showFilter)}>{hasFilters ? '● Filter Active' : 'Filter'}</button>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={downloadPDF} disabled={filtered.length === 0}>Export PDF</button>
        </div>
      </div>

      {showFilter && (
        <div className="card" style={{ marginBottom: 16, padding: '20px 24px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', marginBottom: 16, fontFamily: "'Montserrat',sans-serif" }}>Filter Transactions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">From Date</label><input className="form-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">To Date</label><input className="form-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Transaction Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'credit', 'debit'].map(t => <button key={t} className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-outline'}`} style={{ width: 'auto' }} onClick={() => setTypeFilter(t)}>{t === 'all' ? 'All' : t === 'credit' ? 'Credits Only' : 'Debits Only'}</button>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setShowFilter(false)}>Apply Filter</button>
            {hasFilters && <button className="btn btn-sm" style={{ background: '#fee2e2', color: 'var(--danger)', border: 'none', width: 'auto' }} onClick={clearFilters}>Clear All</button>}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { tag: 'IN', bg: '#dcfce7', color: '#166634', value: fmt(totalCredits), label: 'Total Funded', sub: `${filtered.filter(t => t.type === 'credit').length} credit(s)`, dir: 'up' },
          { tag: 'OUT', bg: '#fee2e2', color: '#991b1b', value: fmt(totalDebits), label: 'Total Spent', sub: `${filtered.filter(t => t.type === 'debit').length} debit(s)`, dir: 'down' },
          { tag: 'NET', bg: '#e8f6f9', color: '#2d8a9e', value: fmt(totalCredits - totalDebits), label: 'Net', sub: `${filtered.length} shown`, dir: 'up' },
        ].map(s => (
          <div key={s.tag} className="stat-card">
            <span className="stat-tag" style={{ background: s.bg, color: s.color }}>{s.tag}</span>
            <div className="stat-value" style={{ marginTop: 6, fontSize: 20 }}>{loading ? '—' : s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-change ${s.dir}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate)', fontSize: 13 }}>Loading transactions...</div>
        : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>{hasFilters ? 'No transactions match your filters' : 'No transactions yet'}</div>
            {hasFilters && <button className="btn btn-outline btn-sm" style={{ marginTop: 14, width: 'auto' }} onClick={clearFilters}>Clear Filters</button>}
          </div>
        ) : (
          <div className="txn-list">
            {filtered.map(t => {
              const style = getTxnStyle(t);
              return (
                <div key={t.id} className="txn-item">
                  <div className="txn-icon" style={{ background: style.bg, color: style.color }}>{style.label}</div>
                  <div className="txn-info">
                    <div className="txn-name">{t.description || 'Transaction'}</div>
                    <div className="txn-date">
                      {formatTxnDate(t.created_at)}
                      {t.reference && <span style={{ marginLeft: 8, background: '#f1f5f9', padding: '1px 7px', borderRadius: 20, fontSize: 10, color: 'var(--slate)' }}>Ref: {t.reference}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`txn-amount ${t.type}`}>{t.type === 'credit' ? '+' : '-'}N{Number(t.amount).toLocaleString()}</div>
                    <span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: 10, marginTop: 3 }}>{t.type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TELEMEDICINE PAGE ──────────────────────────────────────────────────────────
export function TelemedicinePage({ userId, userName, autoBookDoctor, onAutoBookClear }) {
  const [doctors, setDoctors] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [surveyDuration, setSurveyDuration] = useState('');
  const [surveySeverity, setSurveySeverity] = useState('');
  const [surveyNotes, setSurveyNotes] = useState('');
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState('video');
  const [callDoctor, setCallDoctor] = useState(null);
  const [agoraClient, setAgoraClient] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const localRef = useRef();
  const remoteRef = useRef();

  const AGORA_APP_ID = '5e972a5ba048430980f63dd3a549880b';

  useEffect(() => { fetchDoctors(); fetchWallet(); }, [userId]);
  useEffect(() => { if (autoBookDoctor) { setSelectedDoctor(autoBookDoctor); setBookingStep(1); setTimeout(() => onAutoBookClear?.(), 500); } }, [autoBookDoctor]);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data } = await supabase.from('doctors').select('*').eq('status', 'approved');
    setDoctors(data || []); setLoading(false);
  };

  const fetchWallet = async () => {
    if (!userId) return;
    const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
    setWallet(data);
  };

  const confirmBooking = async () => {
    if (!userId || !selectedDoctor) return;
    setBookingError('');
    if (!wallet || Number(wallet.balance) < 3000) { setBookingError('Insufficient balance. Please fund your wallet with at least N3,000 to book a consultation.'); return; }
    setBooking(true);
    try {
      const channel = `consult_${userId.replace(/-/g, '').slice(0, 16)}_${selectedDoctor.id.replace(/-/g, '').slice(0, 16)}`;
      const [year, month, day] = selectedDate.split('-');
      const appointmentDate = `${year}-${month}-${day}T09:00:00+01:00`;
      const { error: apptError } = await supabase.from('appointments').insert({ user_id: userId, patient_id: userId, patient_name: userName, doctor_id: selectedDoctor.id, doctor_name: selectedDoctor.full_name, title: `Consultation with ${selectedDoctor.full_name}`, date: appointmentDate, type: consultationType, status: 'upcoming', agora_channel: channel, notes: reason });
      if (apptError) throw apptError;
      await supabase.from('notifications').insert({ user_id: selectedDoctor.user_id, title: 'New Appointment Booked', message: `${userName} has booked a ${consultationType} consultation on ${selectedDate}. Concern: ${reason}. Duration: ${surveyDuration}. Severity: ${surveySeverity}.${surveyNotes ? ' Notes: ' + surveyNotes : ''}`, type: 'appointment' });
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_wallet_and_record', { p_user_id: userId, p_amount: 3000, p_name: `Consultation fee — ${selectedDoctor.full_name}` });
      if (deductError) throw deductError;
      if (!deductResult.success) throw new Error(deductResult.error);
      setWallet({ ...wallet, balance: deductResult.new_balance });
      setBooking(false); setSelectedDoctor(null); setBookingStep(1); setSelectedDate(''); setReason('');
      alert(`Booking confirmed! Your appointment with ${selectedDoctor.full_name} is scheduled for ${selectedDate}. N3,000 has been deducted from your wallet.`);
    } catch (e) { setBookingError(e.message); setBooking(false); }
  };

  const startCall = async (doctor, type) => {
    if (!wallet || Number(wallet.balance) < 3000) { alert('Insufficient balance. Please fund your wallet with at least N3,000 to start a consultation.'); return; }
    setCallDoctor(doctor); setCallType(type); setCallActive(true);
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setAgoraClient(client);
      const channel = `span${userId.replace(/-/g, '').slice(0, 10)}${doctor.id.replace(/-/g, '').slice(0, 10)}`;
      const { error: apptError } = await supabase.from('appointments').insert({ user_id: userId, patient_id: userId, patient_name: userName, doctor_id: doctor.id, doctor_name: doctor.full_name, title: `${type === 'video' ? 'Video' : 'Audio'} Call`, date: new Date().toISOString(), type, status: 'active', agora_channel: channel });
      if (apptError) throw apptError;
      const tokenRes = await fetch('https://ssmjjtbvrakzfsxezavp.supabase.co/functions/v1/agora-token', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbWpqdGJ2cmFremZzeGV6YXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzE5NzQsImV4cCI6MjA4NzQ0Nzk3NH0.f3VNuJC0Tu7wcYOoCDvFULVpuOVLQoAS0c39bpJKXRg' }, body: JSON.stringify({ channelName: channel, uid: 1 }) });
      const { token } = await tokenRes.json();
      await client.join(AGORA_APP_ID, channel, token, 1);
      if (type === 'video') {
        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTrack([micTrack, camTrack]); camTrack.play(localRef.current); await client.publish([micTrack, camTrack]);
      } else {
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalTrack([micTrack]); await client.publish([micTrack]);
      }
      client.on('user-published', async (user, mediaType) => { await client.subscribe(user, mediaType); if (mediaType === 'video') user.videoTrack?.play(remoteRef.current); if (mediaType === 'audio') user.audioTrack?.play(); setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]); });
      client.on('user-unpublished', (user) => setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid)));
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_wallet_and_record', { p_user_id: userId, p_amount: 3000, p_name: `${type === 'video' ? 'Video' : 'Audio'} consultation — ${doctor.full_name}` });
      if (deductError) throw deductError;
      if (!deductResult.success) throw new Error(deductResult.error);
      setWallet({ ...wallet, balance: deductResult.new_balance });
    } catch (e) { console.error('Agora error:', e); alert('Call error: ' + e.message); setCallActive(false); setAgoraClient(null); setLocalTrack(null); }
  };

  const endCall = async () => {
    try {
      if (localTrack) { const tracks = Array.isArray(localTrack) ? localTrack : [localTrack]; tracks.forEach(t => { t.stop(); t.close(); }); }
      if (agoraClient) await agoraClient.leave();
      await supabase.from('appointments').update({ status: 'completed' }).eq('user_id', userId).eq('status', 'active');
    } catch (e) { console.error('End call error:', e); }
    finally { setCallActive(false); setAgoraClient(null); setLocalTrack(null); setRemoteUsers([]); setCallDoctor(null); }
  };

  const filtered = filter === 'all' ? doctors : doctors.filter(d => d.is_available === (filter === 'online'));
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DR';

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">Telemedicine</div><div className="page-sub">Consult with qualified doctors from anywhere — N3,000 flat rate</div></div>
        <div style={{ display: 'flex', gap: 7 }}>
          {['all', 'online', 'offline'].map(f => (
            <button key={f} className={'btn btn-sm ' + (filter === f ? 'btn-primary' : 'btn-outline')} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All Doctors' : f === 'online' ? 'Available' : 'Unavailable'}
            </button>
          ))}
        </div>
      </div>

      {wallet && Number(wallet.balance) < 3000 && (
        <div style={{ background: '#fee2e2', border: '1.5px solid var(--danger)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#991b1b' }}>
          <strong>Low balance:</strong> Your wallet balance is insufficient for a consultation. Please fund your wallet with at least N3,000.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", color: 'var(--success)' }}>{doctors.filter(d => d.is_available).length}</div>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>Available Now</div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", color: 'var(--primary)' }}>{doctors.length}</div>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>Total Doctors</div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", color: 'var(--warning)' }}>N3,000</div>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>Flat Rate Per Session</div>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)' }}>Loading doctors...</div>
      : filtered.length === 0 ? <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)' }}>No doctors found.</div>
      : (
        <div className="doctors-grid">
          {filtered.map(doc => (
            <div key={doc.id} className="doctor-card">
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div className="doctor-avatar">{doc.avatar_url ? <img src={doc.avatar_url} alt={doc.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} /> : getInitials(doc.full_name)}</div>
                <div>
                  <div className="doctor-name">{doc.full_name}</div>
                  <div className="doctor-specialty">{doc.specialty}</div>
                  <div className="doctor-rating">{doc.rating > 0 ? `Rating: ${doc.rating}` : 'New Doctor'} · {doc.experience_years} yrs exp</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, fontSize: 12, fontWeight: 600 }}>
                <span className={'status-dot ' + (doc.is_available ? 'online' : 'offline')} />
                <span style={{ color: doc.is_available ? 'var(--success)' : 'var(--slate-light)' }}>{doc.is_available ? 'Available' : 'Unavailable'}</span>
              </div>
              {doc.bio && <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 10, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.bio}</div>}
              <div className="doctor-call-actions">
                <button className="call-btn call-btn-video" onClick={() => startCall(doc, 'video')} disabled={!doc.is_available} style={{ opacity: doc.is_available ? 1 : 0.4 }}>Video</button>
                <button className="call-btn call-btn-audio" onClick={() => startCall(doc, 'audio')} disabled={!doc.is_available} style={{ opacity: doc.is_available ? 1 : 0.4 }}>Audio</button>
                <button className="call-btn call-btn-chat" onClick={() => { setSelectedDoctor(doc); setBookingStep(1); setConsultationType('chat'); }}>Schedule</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoctor && (
        <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{bookingStep === 1 ? 'Book Consultation' : 'Confirm Booking'}</div>
              <button className="modal-close" onClick={() => setSelectedDoctor(null)}>X</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 14, background: 'var(--bg)', borderRadius: 12, marginBottom: 20 }}>
                <div className="doctor-avatar">{getInitials(selectedDoctor.full_name)}</div>
                <div><div style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>{selectedDoctor.full_name}</div><div style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>{selectedDoctor.specialty}</div></div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}><div style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>N3,000</div><div style={{ fontSize: 11, color: 'var(--slate)' }}>consultation fee</div></div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                {[1, 2].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: bookingStep >= s ? 'var(--primary)' : '#dce8eb' }} />)}
              </div>

              {bookingStep === 1 && (
                <>
                  <div className="form-group"><label className="form-label">Select Date</label><input className="form-input" type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={e => setSelectedDate(e.target.value)} /></div>
                  <div className="form-group">
                    <label className="form-label">Consultation Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {['video', 'audio', 'chat'].map(t => (
                        <div key={t} onClick={() => setConsultationType(t)} style={{ border: `1.5px solid ${consultationType === t ? 'var(--primary)' : '#dce8eb'}`, borderRadius: 10, padding: 12, textAlign: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: consultationType === t ? 'var(--primary)' : 'var(--navy)', background: consultationType === t ? 'var(--primary-pale)' : 'white' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">Main Concern</label><select className="form-select" value={reason} onChange={e => setReason(e.target.value)}><option value="">Select your concern</option>{['Fever / Malaria','Hypertension','Diabetes','Respiratory issues','Skin condition',"Women's health",'Child health','General checkup','Other'].map(c => <option key={c}>{c}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">How Long Has This Been Going On?</label><select className="form-select" value={surveyDuration} onChange={e => setSurveyDuration(e.target.value)}><option value="">Select duration</option>{['Today','2–3 days','About a week','More than a week','Chronic / ongoing'].map(d => <option key={d}>{d}</option>)}</select></div>
                  <div className="form-group">
                    <label className="form-label">Severity</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                      {['1–2','3–4','5–6','7–8','9–10'].map((s, i) => (
                        <div key={s} onClick={() => setSurveySeverity(s)} style={{ border: `1.5px solid ${surveySeverity === s ? 'var(--primary)' : '#dce8eb'}`, borderRadius: 8, padding: '8px 4px', textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: surveySeverity === s ? (i < 2 ? '#dcfce7' : i < 4 ? '#fef9c3' : '#fee2e2') : 'white', color: surveySeverity === s ? (i < 2 ? '#166634' : i < 4 ? '#854d0e' : '#991b1b') : 'var(--navy)' }}>{s}</div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--slate)', marginTop: 4 }}><span>Mild</span><span>Severe</span></div>
                  </div>
                  <div className="form-group"><label className="form-label">Additional Notes (optional)</label><textarea className="form-input" rows={3} placeholder="Any other symptoms..." value={surveyNotes} onChange={e => setSurveyNotes(e.target.value)} style={{ resize: 'none' }} /></div>
                  <div style={{ background: 'var(--primary-pale)', border: '1.5px solid var(--secondary)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--primary-dark)', lineHeight: 1.6 }}>The doctor receives your survey instantly and will respond within minutes.</div>
                  {bookingError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{bookingError}</div>}
                  <button className="btn btn-primary" onClick={() => setBookingStep(2)} disabled={!selectedDate || !reason || !surveyDuration || !surveySeverity}>Review Booking</button>
                </>
              )}

              {bookingStep === 2 && (
                <>
                  <div style={{ background: 'var(--primary-pale)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
                    <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 12, fontSize: 13, fontFamily: "'Montserrat',sans-serif" }}>Booking Summary</div>
                    <div style={{ fontSize: 13, lineHeight: 2.2 }}>
                      <div>Date: <strong>{selectedDate}</strong></div>
                      <div>Type: <strong>{consultationType}</strong></div>
                      <div>Concern: <strong>{reason}</strong></div>
                      <div>Duration: <strong>{surveyDuration}</strong></div>
                      <div>Severity: <strong>{surveySeverity}</strong></div>
                      {surveyNotes && <div>Notes: <strong>{surveyNotes}</strong></div>}
                      <div>Fee: <strong style={{ color: 'var(--danger)' }}>N3,000</strong> will be deducted</div>
                    </div>
                  </div>
                  {bookingError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{bookingError}</div>}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setBookingStep(1)}>Back</button>
                    <button className="btn btn-primary" style={{ flex: 2 }} onClick={confirmBooking} disabled={booking}>{booking ? 'Confirming...' : 'Confirm Booking — N3,000'}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {callActive && (
        <div style={{ position: 'fixed', inset: 0, background: '#0f1f2e', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div><div style={{ fontWeight: 700, fontSize: 16, color: 'white', fontFamily: "'Montserrat',sans-serif" }}>{callType === 'video' ? 'Video' : 'Audio'} Consultation</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Dr. {callDoctor?.full_name}</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} /><span style={{ fontSize: 12, color: 'var(--success)' }}>Connected</span></div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 24 }}>
            <div ref={remoteRef} style={{ width: '100%', maxWidth: 800, height: 450, background: '#1a2f42', borderRadius: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}><div style={{ fontSize: 48, marginBottom: 12 }}>👤</div><div>Waiting for doctor...</div></div>
            </div>
            {callType === 'video' && <div ref={localRef} style={{ position: 'absolute', bottom: 40, right: 40, width: 160, height: 120, background: '#0f1f2e', borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }} />}
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={endCall} style={{ padding: '14px 32px', borderRadius: 50, background: 'var(--danger)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>End Call</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MESSAGES PAGE ──────────────────────────────────────────────────────────────
export function MessagesPage({ userId, userName }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [msgMenuId, setMsgMenuId] = useState(null);
  const messagesEndRef = useRef();
  const chatFileRef = useRef();
  const [selectedChatFile, setSelectedChatFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => { fetchDoctors(); }, [userId]);

  useEffect(() => {
    if (!selectedDoctor) return;
    fetchMessages(); markAsRead();
    const subscription = supabase.channel('messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      const msg = payload.new;
      if ((msg.sender_id === userId && msg.receiver_id === selectedDoctor.user_id) || (msg.sender_id === selectedDoctor.user_id && msg.receiver_id === userId)) {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }).subscribe();
    return () => supabase.removeChannel(subscription);
  }, [selectedDoctor]);

  useEffect(() => { setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }, [messages]);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data } = await supabase.from('doctors').select('*').eq('status', 'approved');
    setDoctors(data || []); setLoading(false);
  };

  const fetchMessages = async () => {
    if (!selectedDoctor || !userId) return;
    const { data } = await supabase.from('messages').select('*').or(`and(sender_id.eq.${userId},receiver_id.eq.${selectedDoctor.user_id}),and(sender_id.eq.${selectedDoctor.user_id},receiver_id.eq.${userId})`).order('created_at');
    setMessages(data || []);
  };

  const markAsRead = async () => {
    if (!selectedDoctor || !userId) return;
    await supabase.from('messages').update({ read: true }).eq('receiver_id', userId).eq('sender_id', selectedDoctor.user_id).eq('read', false);
  };

  const deleteMessage = async (msgId) => {
    await supabase.from('messages').delete().eq('id', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setMsgMenuId(null);
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedChatFile) || !selectedDoctor || !userId) return;
    setSending(true);
    try {
      let file_url = null, file_name = null, file_type = null;
      if (selectedChatFile) {
        const ext = selectedChatFile.name.split('.').pop();
        const path = `chat/${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('documents').upload(path, selectedChatFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
        file_url = urlData.publicUrl; file_name = selectedChatFile.name; file_type = selectedChatFile.type;
      }
      const { data, error } = await supabase.from('messages').insert({ sender_id: userId, receiver_id: selectedDoctor.user_id, sender_name: userName, content: newMessage.trim() || '', file_url, file_name, file_type }).select().maybeSingle();
      if (!error && data) { setMessages(prev => [...prev, data]); setNewMessage(''); setSelectedChatFile(null); setFilePreview(null); setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }
    } catch (e) { console.error('Send error:', e); }
    setSending(false);
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DR';
  const formatMsgTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toDateString() === new Date().toDateString()
      ? d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos' })
      : d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', timeZone: 'Africa/Lagos' });
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="topbar"><div><div className="page-title">Messages</div><div className="page-sub">Chat with your doctors</div></div></div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, overflow: 'hidden' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...(showMobileChat ? { display: 'none' } : {}) }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #eef2f5', fontWeight: 700, fontSize: 13, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>Doctors</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13 }}>Loading...</div>
            : doctors.length === 0 ? <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13, textAlign: 'center' }}>No doctors available</div>
            : doctors.map(doc => (
              <div key={doc.id} onClick={() => { setSelectedDoctor(doc); setShowMobileChat(true); }} style={{ padding: '12px 18px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: selectedDoctor?.id === doc.id ? 'var(--primary-pale)' : 'white', borderLeft: selectedDoctor?.id === doc.id ? '3px solid var(--primary)' : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0, overflow: 'hidden' }}>
                  {doc.avatar_url ? <img src={doc.avatar_url} alt={doc.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(doc.full_name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.full_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--primary)' }}>{doc.specialty}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: doc.is_available ? 'var(--success)' : '#dce8eb', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', gridColumn: showMobileChat ? '1 / -1' : 'auto' }}>
          {!selectedDoctor ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)', fontSize: 13 }}>Select a doctor to start messaging</div> : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef2f5', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => { setShowMobileChat(false); setSelectedDoctor(null); }} style={{ display: 'none', width: 32, height: 32, borderRadius: 8, border: '1.5px solid #dce8eb', background: 'white', cursor: 'pointer', fontSize: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} className="mobile-back-btn">←</button>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', overflow: 'hidden' }}>
                  {selectedDoctor.avatar_url ? <img src={selectedDoctor.avatar_url} alt={selectedDoctor.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(selectedDoctor.full_name)}
                </div>
                <div><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>{selectedDoctor.full_name}</div><div style={{ fontSize: 11, color: selectedDoctor.is_available ? 'var(--success)' : 'var(--slate)', fontWeight: 600 }}>{selectedDoctor.is_available ? 'Available' : 'Unavailable'}</div></div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--slate)', fontSize: 13, marginTop: 40 }}>No messages yet. Say hello to {selectedDoctor.full_name}!</div>}
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === userId;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', position: 'relative' }}
                        onMouseEnter={e => { const btn = e.currentTarget.querySelector('.msg-menu-btn'); if (btn) btn.style.opacity = '1'; }}
                        onMouseLeave={e => { const btn = e.currentTarget.querySelector('.msg-menu-btn'); if (btn) btn.style.opacity = '0'; }}>
                        <button className="msg-menu-btn" onClick={() => setMsgMenuId(msgMenuId === msg.id ? null : msg.id)} style={{ position: 'absolute', top: -8, [isMe ? 'left' : 'right']: -28, opacity: 0, transition: 'opacity 0.2s', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--slate)', padding: 4, borderRadius: 6, zIndex: 10 }}>⋮</button>
                        {msgMenuId === msg.id && (
                          <div style={{ position: 'absolute', top: 0, [isMe ? 'left' : 'right']: -110, background: 'white', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: 100, overflow: 'hidden' }}>
                            <div onClick={() => deleteMessage(msg.id)} style={{ padding: '10px 16px', fontSize: 13, color: 'var(--danger)', fontWeight: 600, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>🗑 Delete</div>
                          </div>
                        )}
                        <div style={{ padding: '10px 14px', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isMe ? 'var(--primary)' : '#f1f5f9', color: isMe ? 'white' : 'var(--navy)', fontSize: 13, lineHeight: 1.5 }}>
                          {msg.file_url && (msg.file_type?.includes('image') ? <a href={msg.file_url} target="_blank" rel="noreferrer"><img src={msg.file_url} alt={msg.file_name} style={{ maxWidth: 200, maxHeight: 160, borderRadius: 8, display: 'block' }} /></a> : <a href={msg.file_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: isMe ? 'white' : 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: 12 }}><span style={{ background: isMe ? 'rgba(255,255,255,0.2)' : 'var(--primary-pale)', padding: '3px 7px', borderRadius: 5, fontSize: 10 }}>PDF</span>{msg.file_name}</a>)}
                          {msg.content && <div>{msg.content}</div>}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--slate)', marginTop: 3 }}>{formatMsgTime(msg.created_at)}</div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div style={{ padding: '14px 20px', borderTop: '1px solid #eef2f5' }}>
                {filePreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--primary-pale)', borderRadius: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)' }}>{filePreview.type.includes('pdf') ? 'PDF' : 'IMG'}</div>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{filePreview.name}</div>
                    <button onClick={() => { setFilePreview(null); setSelectedChatFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)', fontSize: 14 }}>✕</button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => chatFileRef.current.click()} style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📎</button>
                  <input ref={chatFileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={e => { const file = e.target.files[0]; if (file) { setSelectedChatFile(file); setFilePreview(file); } }} />
                  <input className="form-input" style={{ flex: 1, marginBottom: 0 }} placeholder={`Message ${selectedDoctor.full_name}...`} value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !selectedChatFile && sendMessage()} />
                  <button className="btn btn-primary" style={{ width: 'auto', padding: '0 20px', flexShrink: 0 }} onClick={sendMessage} disabled={sending || (!newMessage.trim() && !selectedChatFile)}>Send</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── APPOINTMENTS PAGE ──────────────────────────────────────────────────────────
export function AppointmentsPage({ userId }) {
  const [tab, setTab] = useState('Upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (userId) fetchAppointments(); }, [userId]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase.from('appointments').select('*').eq('user_id', userId).order('date', { ascending: false });
    setAppointments(data || []); setLoading(false);
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  const filtered = appointments.filter(a => {
    if (tab === 'Upcoming') return a.status === 'upcoming' || a.status === 'active';
    if (tab === 'Completed') return a.status === 'completed';
    if (tab === 'Cancelled') return a.status === 'cancelled';
    return true;
  });

  return (
    <div>
      <div className="topbar"><div><div className="page-title">Appointments</div><div className="page-sub">Your scheduled and past consultations</div></div></div>
      <div className="tab-bar">
        {['Upcoming', 'Completed', 'Cancelled'].map(t => (
          <button key={t} className={'tab-btn' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>
            {t}
            {t === 'Upcoming' && appointments.filter(a => a.status === 'upcoming' || a.status === 'active').length > 0 && (
              <span style={{ marginLeft: 6, background: 'var(--primary)', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{appointments.filter(a => a.status === 'upcoming' || a.status === 'active').length}</span>
            )}
          </button>
        ))}
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)' }}>Loading...</div>
      : filtered.length === 0 ? <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)' }}>No {tab.toLowerCase()} appointments.</div>
      : (
        <div className="schedule-list">
          {filtered.map(a => (
            <div key={a.id} className="appt-item">
              <div style={{ minWidth: 70, textAlign: 'center' }}>
                <div className="appt-time-val">{a.date ? new Date(a.date).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos' }) + ' WAT' : 'N/A'}</div>
                <div className="appt-time-date">{a.date ? new Date(a.date).toLocaleDateString('en-NG', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' }) : ''}</div>
              </div>
              <div className="appt-divider" />
              <div style={{ flex: 1 }}>
                <div className="appt-title">{a.title || 'Consultation'}</div>
                <div className="appt-doctor">{a.doctor_name || 'Doctor'}</div>
                {a.notes && <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 3 }}>{a.notes}</div>}
              </div>
              <span className={'badge ' + (a.status === 'completed' ? 'badge-success' : a.status === 'cancelled' ? 'badge-danger' : a.status === 'active' ? 'badge-warning' : 'badge-info')}>{a.status || 'upcoming'}</span>
              <div style={{ display: 'flex', gap: 7 }}>
                {(a.status === 'upcoming' || a.status === 'active') && <button className="btn btn-sm" style={{ background: '#fee2e2', color: 'var(--danger)', border: 'none' }} onClick={() => cancelAppointment(a.id)}>Cancel</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DOCUMENTS PAGE ─────────────────────────────────────────────────────────────
export function DocumentsPage({ userId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [label, setLabel] = useState('General');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef();
  const CATEGORIES = ['General','Lab Result','Prescription','Scan','Report','Insurance','Other'];

  useEffect(() => { if (userId) fetchDocuments(); }, [userId]);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data } = await supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    setDocuments(data || []); setLoading(false);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg','image/png','image/jpg','application/pdf'];
    if (!allowed.includes(file.type)) { setUploadError('Only JPG, PNG and PDF files are allowed.'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError('File size must be under 10MB.'); return; }
    setUploadError(''); setSelectedFile(file);
  };

  const uploadDocument = async () => {
    if (!selectedFile || !userId) return;
    setUploading(true); setUploadError('');
    try {
      const ext = selectedFile.name.split('.').pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('documents').upload(path, selectedFile, { upsert: false });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
      const { data, error: dbError } = await supabase.from('documents').insert({ user_id: userId, name: selectedFile.name, file_url: urlData.publicUrl, type: selectedFile.type, file_size: selectedFile.size, label }).select().maybeSingle();
      if (dbError) throw dbError;
      setDocuments([data, ...documents]); setShowUpload(false); setSelectedFile(null); setLabel('General');
    } catch (e) { setUploadError('Upload failed: ' + e.message); }
    setUploading(false);
  };

  const deleteDocument = async (doc) => {
    if (!window.confirm('Delete this document?')) return;
    const path = doc.file_url.split('/documents/')[1];
    await supabase.storage.from('documents').remove([path]);
    await supabase.from('documents').delete().eq('id', doc.id);
    setDocuments(documents.filter(d => d.id !== doc.id));
  };

  const formatSize = (bytes) => { if (!bytes) return 'N/A'; if (bytes < 1024) return bytes + ' B'; if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'; return (bytes / (1024 * 1024)).toFixed(1) + ' MB'; };
  const getFileIcon = (type) => { if (!type) return 'DOC'; if (type.includes('pdf')) return 'PDF'; if (type.includes('image')) return 'IMG'; return 'DOC'; };
  const getFileColor = (type) => { if (!type) return '#e8f6f9'; if (type.includes('pdf')) return '#fee2e2'; if (type.includes('image')) return '#dcfce7'; return '#e8f6f9'; };
  const getFileTextColor = (type) => { if (!type) return 'var(--primary)'; if (type.includes('pdf')) return 'var(--danger)'; if (type.includes('image')) return 'var(--success)'; return 'var(--primary)'; };

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">Health Documents</div><div className="page-sub">Upload and manage your medical records</div></div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>+ Upload Document</button>
      </div>

      <div className="upload-zone" style={{ border: `2px dashed ${dragOver ? 'var(--primary)' : '#b0cccf'}`, background: dragOver ? 'var(--primary-pale)' : 'white', cursor: 'pointer', marginBottom: 24 }}
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); setShowUpload(true); }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontWeight: 800, fontSize: 11, color: 'var(--primary)', fontFamily: "'Montserrat',sans-serif" }}>UPLOAD</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>Drag and drop files here or click to browse</div>
        <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6}}>Supports PDF, JPG, PNG · Max 10MB</div>
      </div>
      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={e => { handleFileSelect(e.target.files[0]); setShowUpload(true); }} />

      {loading ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate)' }}>Loading documents...</div>
      : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>No documents yet</div>
          <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 6 }}>Upload your first health document to get started.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {documents.map(doc => (
            <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: getFileColor(doc.type), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10, color: getFileTextColor(doc.type), flexShrink: 0, fontFamily: "'Montserrat',sans-serif" }}>{getFileIcon(doc.type)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 2 }}>{formatSize(doc.file_size)} · {doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-info" style={{ fontSize: 10 }}>{doc.label || 'General'}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ padding: '5px 12px', borderRadius: 8, background: 'var(--primary-pale)', color: 'var(--primary)', fontSize: 11, fontWeight: 700, textDecoration: 'none', border: 'none', cursor: 'pointer' }}>View</a>
                  <button onClick={() => deleteDocument(doc)} style={{ padding: '5px 12px', borderRadius: 8, background: '#fee2e2', color: 'var(--danger)', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div className="modal-overlay" onClick={() => { setShowUpload(false); setSelectedFile(null); setUploadError(''); }}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Upload Document</div><button className="modal-close" onClick={() => { setShowUpload(false); setSelectedFile(null); setUploadError(''); }}>X</button></div>
            <div className="modal-body">
              {!selectedFile ? (
                <div className="upload-zone" onClick={() => fileRef.current.click()} style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', marginBottom: 6 }}>Select a file</div>
                  <div style={{ fontSize: 12, color: 'var(--slate)' }}>PDF, JPG or PNG — max 10MB</div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--primary-pale)', borderRadius: 12, marginBottom: 16, border: '1.5px solid var(--secondary)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: getFileColor(selectedFile.type), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10, color: getFileTextColor(selectedFile.type), fontFamily: "'Montserrat',sans-serif" }}>{getFileIcon(selectedFile.type)}</div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13, color: 'var(--navy)' }}>{selectedFile.name}</div><div style={{ fontSize: 11, color: 'var(--slate)' }}>{formatSize(selectedFile.size)}</div></div>
                  <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)', fontSize: 16 }}>✕</button>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {CATEGORIES.map(c => (
                    <div key={c} onClick={() => setLabel(c)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${label === c ? 'var(--primary)' : '#dce8eb'}`, background: label === c ? 'var(--primary-pale)' : 'white', color: label === c ? 'var(--primary)' : 'var(--navy)' }}>{c}</div>
                  ))}
                </div>
              </div>
              {uploadError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{uploadError}</div>}
              <button className="btn btn-primary" onClick={uploadDocument} disabled={!selectedFile || uploading}>{uploading ? 'Uploading...' : 'Upload Document'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PROFILE PAGE ───────────────────────────────────────────────────────────────
export function ProfilePage({ userId, userName }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showIDCard, setShowIDCard] = useState(false);
  const fileRef = useRef();
  const [form, setForm] = useState({ full_name: '', phone: '', date_of_birth: '', sex: '', blood_group: '', genotype: '', address: '', emergency_name: '', emergency_phone: '', emergency_relationship: '' });

  useEffect(() => { if (userId) fetchProfile(); }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    const data = await getProfile(userId);
    if (data) {
      setProfile(data);
      setForm({ full_name: data.full_name || '', phone: data.phone || '', date_of_birth: data.date_of_birth || '', sex: data.sex || '', blood_group: data.blood_group || '', genotype: data.genotype || '', address: data.address || '', emergency_name: data.emergency_name || '', emergency_phone: data.emergency_phone || '', emergency_relationship: data.emergency_relationship || '' });
    }
    setLoading(false);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadAvatar(userId, file);
      if (url) { setProfile({ ...profile, avatar_url: url }); setSuccess('Photo updated'); setTimeout(() => setSuccess(''), 3000); }
    } catch (e) { setError('Photo upload failed: ' + e.message); }
    setUploadingPhoto(false);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await updateProfile(userId, form);
      setProfile({ ...profile, ...form }); setEditing(false);
      setSuccess('Profile updated'); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError('Failed to save: ' + e.message); }
    setSaving(false);
  };

  const downloadIDCard = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
    doc.setFillColor(11, 42, 48); doc.rect(0, 0, 85.6, 54, 'F');
    doc.setFillColor(69, 157, 175); doc.rect(0, 0, 85.6, 12, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text('SPAN HEALTHCARE', 5, 8); doc.setFontSize(5); doc.setFont('helvetica', 'normal');
    doc.text('HEALTH SAVINGS PLATFORM', 5, 11);
    doc.setFillColor(255, 255, 255, 0.1); doc.circle(70, 6, 8);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text(profile?.full_name || '', 5, 22);
    doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(69, 157, 175);
    doc.text(profile?.span_id || 'SPN-ID', 5, 27);
    doc.setTextColor(200, 200, 200); doc.setFontSize(5.5);
    if (profile?.sex) doc.text(`Sex: ${profile.sex}`, 5, 33);
    if (profile?.blood_group) doc.text(`Blood Group: ${profile.blood_group}`, 5, 38);
    if (profile?.genotype) doc.text(`Genotype: ${profile.genotype}`, 5, 43);
    doc.setFillColor(69, 157, 175, 0.3); doc.rect(0, 49, 85.6, 5, 'F');
    doc.setTextColor(180, 180, 180); doc.setFontSize(4.5);
    doc.text('Valid · Span Healthcare Nigeria', 5, 52);
    doc.save(`SpanHC_ID_${profile?.full_name || 'Member'}.pdf`);
  };

  const initials = form.full_name ? form.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SPN';

  if (loading) return <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate)' }}>Loading profile...</div>;

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">My Profile</div><div className="page-sub">Your personal and medical information</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editing ? (
            <><button className="btn btn-outline btn-sm" onClick={() => { setEditing(false); setError(''); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button></>
          ) : (
            <><button className="btn btn-outline btn-sm" onClick={() => setShowIDCard(true)}>View ID Card</button><button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit Profile</button></>
          )}
        </div>
      </div>

      {success && <div style={{ background: '#dcfce7', border: '1.5px solid var(--success)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#166634' }}>{success}</div>}
      {error && <div style={{ background: '#fee2e2', border: '1.5px solid var(--danger)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#991b1b' }}>{error}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div className="profile-photo-upload" onClick={() => editing && fileRef.current.click()}>
            <div className="profile-photo">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="profile" /> : initials}
            </div>
            {editing && <div className="profile-photo-overlay">{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          <div style={{ flex: 1 }}>
            <div className="profile-name">{form.full_name || 'Member'}</div>
            <div className="profile-id">{profile?.span_id || 'Generating ID...'}</div>
            <div className="profile-tags">
              {form.blood_group && <span className="profile-tag">Blood: {form.blood_group}</span>}
              {form.genotype && <span className="profile-tag">Genotype: {form.genotype}</span>}
              {form.sex && <span className="profile-tag">{form.sex}</span>}
              <span className="profile-tag badge-success" style={{ background: '#dcfce7', color: '#16a34a' }}>Active Member</span>
            </div>
          </div>
          <button onClick={downloadIDCard} style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>Download ID Card</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>Personal Information</div>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.full_name} disabled={!editing} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={form.phone} disabled={!editing} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={form.date_of_birth} disabled={!editing} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Sex</label>{editing ? <select className="form-select" value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}><option value="">Select</option><option>Male</option><option>Female</option><option>Prefer not to say</option></select> : <input className="form-input" value={form.sex} disabled />}</div>
          <div className="form-group"><label className="form-label">Address</label><textarea className="form-input" rows={2} value={form.address} disabled={!editing} onChange={e => setForm({ ...form, address: e.target.value })} style={{ resize: 'none' }} /></div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>Medical Information</div>
          <div className="form-group"><label className="form-label">Blood Group</label>{editing ? <select className="form-select" value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}><option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}</select> : <input className="form-input" value={form.blood_group || 'Not set'} disabled />}</div>
          <div className="form-group"><label className="form-label">Genotype</label>{editing ? <select className="form-select" value={form.genotype} onChange={e => setForm({ ...form, genotype: e.target.value })}><option value="">Select</option>{['AA','AS','SS','AC','SC'].map(g => <option key={g}>{g}</option>)}</select> : <input className="form-input" value={form.genotype || 'Not set'} disabled />}</div>
          <div style={{ marginTop: 24 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>Emergency Contact</div>
            <div className="form-group"><label className="form-label">Contact Name</label><input className="form-input" placeholder="Full name" value={form.emergency_name} disabled={!editing} onChange={e => setForm({ ...form, emergency_name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Contact Phone</label><input className="form-input" placeholder="+234 8XX XXX XXXX" value={form.emergency_phone} disabled={!editing} onChange={e => setForm({ ...form, emergency_phone: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Relationship</label>{editing ? <select className="form-select" value={form.emergency_relationship} onChange={e => setForm({ ...form, emergency_relationship: e.target.value })}><option value="">Select</option>{['Spouse','Parent','Sibling','Child','Friend','Other'].map(r => <option key={r}>{r}</option>)}</select> : <input className="form-input" value={form.emergency_relationship || 'Not set'} disabled />}</div>
          </div>
        </div>
      </div>

      {showIDCard && (
        <div className="modal-overlay" onClick={() => setShowIDCard(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Member ID Card</div><button className="modal-close" onClick={() => setShowIDCard(false)}>X</button></div>
            <div className="modal-body">
              <div className="id-card" style={{ marginBottom: 20 }}>
                <div className="id-card-header">
                  <div><div className="id-card-logo">SPAN HEALTHCARE</div><div className="id-card-logo-sub">Health Savings Platform</div></div>
                  <div className="id-card-type">MEMBER</div>
                </div>
                <div className="id-card-body">
                  <div className="id-card-photo">{profile?.avatar_url ? <img src={profile.avatar_url} alt="profile" /> : initials}</div>
                  <div style={{ flex: 1 }}>
                    <div className="id-card-name">{form.full_name || 'Member'}</div>
                    <div className="id-card-id">{profile?.span_id || 'SPN-ID'}</div>
                    <div className="id-card-details">
                      {form.sex && <div><div className="id-card-detail-label">Sex</div><div className="id-card-detail-value">{form.sex}</div></div>}
                      {form.blood_group && <div><div className="id-card-detail-label">Blood Group</div><div className="id-card-detail-value">{form.blood_group}</div></div>}
                      {form.genotype && <div><div className="id-card-detail-label">Genotype</div><div className="id-card-detail-value">{form.genotype}</div></div>}
                      {form.date_of_birth && <div><div className="id-card-detail-label">Date of Birth</div><div className="id-card-detail-value">{form.date_of_birth}</div></div>}
                    </div>
                  </div>
                </div>
                <div className="id-card-footer">
                  <Barcode />
                  <div className="id-card-valid"><div>Valid Member</div><div style={{ marginTop: 2 }}>Span Healthcare Nigeria</div></div>
                </div>
              </div>
              <button className="btn btn-primary" onClick={downloadIDCard}>Download ID Card (PDF)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DEPENDENTS PAGE ────────────────────────────────────────────────────────────
export function DependentsPage({ userId, userName }) {
  const [dependents, setDependents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingDep, setEditingDep] = useState(null);
  const [form, setForm] = useState({ full_name: '', date_of_birth: '', sex: '', relationship: '', blood_group: '', genotype: '' });
  const [error, setError] = useState('');

  useEffect(() => { if (userId) fetchDependents(); }, [userId]);

  const fetchDependents = async () => {
    setLoading(true);
    const { data } = await supabase.from('dependents').select('*').eq('user_id', userId).order('created_at');
    setDependents(data || []); setLoading(false);
  };

  const openAdd = () => { setForm({ full_name: '', date_of_birth: '', sex: '', relationship: '', blood_group: '', genotype: '' }); setEditingDep(null); setError(''); setShowAdd(true); };
  const openEdit = (dep) => { setForm({ full_name: dep.full_name || '', date_of_birth: dep.date_of_birth || '', sex: dep.sex || '', relationship: dep.relationship || '', blood_group: dep.blood_group || '', genotype: dep.genotype || '' }); setEditingDep(dep); setError(''); setShowAdd(true); };

  const saveDep = async () => {
    if (!form.full_name || !form.relationship) { setError('Full name and relationship are required'); return; }
    setSaving(true); setError('');
    try {
      const spanId = generateSpanID(form.full_name);
      if (editingDep) {
        const { error: updateError } = await supabase.from('dependents').update({ ...form }).eq('id', editingDep.id);
        if (updateError) throw updateError;
        setDependents(dependents.map(d => d.id === editingDep.id ? { ...d, ...form } : d));
      } else {
        const { data, error: insertError } = await supabase.from('dependents').insert({ user_id: userId, span_id: spanId, ...form }).select().maybeSingle();
        if (insertError) throw insertError;
        setDependents([...dependents, data]);
      }
      setShowAdd(false); setEditingDep(null);
    } catch (e) { setError('Save failed: ' + e.message); }
    setSaving(false);
  };

  const deleteDep = async (id) => {
    if (!window.confirm('Remove this dependent?')) return;
    await supabase.from('dependents').delete().eq('id', id);
    setDependents(dependents.filter(d => d.id !== id));
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const colors = ['var(--primary)', '#7c3aed', '#db2777', '#d97706', '#059669'];

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">Dependents</div><div className="page-sub">Manage your family members under this plan</div></div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Dependent</button>
      </div>
      <div style={{ background: '#e8f6f9', border: '1.5px solid #98B7B9', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#1a2f42', lineHeight: 1.7 }}>
        <strong>Family Coverage:</strong> Add family members to share your health plan. Dependents have access to telemedicine and secondary healthcare services.
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate)' }}>Loading dependents...</div>
      : dependents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>No dependents added yet</div>
          <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 6 }}>Add a family member to extend your health coverage.</div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 16, width: 'auto' }} onClick={openAdd}>+ Add First Dependent</button>
        </div>
      ) : (
        <div className="dependents-grid">
          {dependents.map((dep, i) => (
            <div key={dep.id} className="dependent-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                <div className="dependent-avatar" style={{ background: colors[i % colors.length] }}>{getInitials(dep.full_name)}</div>
                <div style={{ flex: 1 }}>
                  <div className="dependent-name">{dep.full_name}</div>
                  <div className="dependent-id">{dep.span_id || 'SPN-DEP'}</div>
                  <span className="badge badge-info" style={{ marginTop: 6, fontSize: 10 }}>{dep.relationship}</span>
                </div>
              </div>
              <div className="dependent-meta">
                <div><div className="dependent-meta-label">Date of Birth</div><div className="dependent-meta-value">{dep.date_of_birth || 'Not set'}</div></div>
                <div><div className="dependent-meta-label">Sex</div><div className="dependent-meta-value">{dep.sex || 'Not set'}</div></div>
                <div><div className="dependent-meta-label">Blood Group</div><div className="dependent-meta-value">{dep.blood_group || 'Not set'}</div></div>
                <div><div className="dependent-meta-label">Genotype</div><div className="dependent-meta-value">{dep.genotype || 'Not set'}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-sm btn-outline" style={{ flex: 1 }} onClick={() => openEdit(dep)}>Edit</button>
                <button className="btn btn-sm" style={{ flex: 1, background: '#fee2e2', color: 'var(--danger)', border: 'none' }} onClick={() => deleteDep(dep.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">{editingDep ? 'Edit Dependent' : 'Add Dependent'}</div><button className="modal-close" onClick={() => setShowAdd(false)}>X</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="e.g. Fatima Bayero" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Relationship</label><select className="form-select" value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })}><option value="">Select relationship</option>{['Spouse','Child','Parent','Sibling','Other'].map(r => <option key={r}>{r}</option>)}</select></div>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Sex</label><select className="form-select" value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}><option value="">Select</option><option>Male</option><option>Female</option></select></div>
              </div>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Blood Group</label><select className="form-select" value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}><option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Genotype</label><select className="form-select" value={form.genotype} onChange={e => setForm({ ...form, genotype: e.target.value })}><option value="">Select</option>{['AA','AS','SS','AC','SC'].map(g => <option key={g}>{g}</option>)}</select></div>
              </div>
              {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={saveDep} disabled={saving}>{saving ? 'Saving...' : editingDep ? 'Save Changes' : 'Add Dependent'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── WELLNESS PAGE ──────────────────────────────────────────────────────────────
export function WellnessPage() {
  const metrics = [
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'normal', icon: '❤️' },
    { label: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal', icon: '💓' },
    { label: 'Blood Sugar', value: '5.4', unit: 'mmol/L', status: 'normal', icon: '🩸' },
    { label: 'BMI', value: '23.5', unit: 'kg/m²', status: 'normal', icon: '⚖️' },
    { label: 'Temperature', value: '36.6', unit: '°C', status: 'normal', icon: '🌡️' },
    { label: 'Oxygen Saturation', value: '98', unit: '%', status: 'normal', icon: '🫁' },
  ];
  const tips = ['Stay hydrated — drink at least 8 glasses of water daily', 'Aim for 7–8 hours of quality sleep every night', 'Exercise for at least 30 minutes, 5 days a week', 'Eat a balanced diet rich in fruits and vegetables', 'Manage stress through prayer, meditation, or light exercise', 'Schedule a routine health checkup every 6 months'];

  return (
    <div>
      <div className="topbar"><div><div className="page-title">Wellness Tracker</div><div className="page-sub">Monitor your key health indicators</div></div></div>
      <div style={{ background: 'linear-gradient(135deg, #e8f6f9, #d4eef2)', border: '1.5px solid var(--secondary)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>Health Score</div>
            <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>Based on your last check-in</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary)', fontFamily: "'Montserrat',sans-serif", lineHeight: 1 }}>85</div>
            <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>Good</div>
          </div>
        </div>
        <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.6)', borderRadius: 10, height: 10, overflow: 'hidden' }}>
          <div style={{ width: '85%', height: '100%', background: 'var(--primary)', borderRadius: 10 }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {metrics.map(m => (
          <div key={m.label} className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{m.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: "'Montserrat',sans-serif" }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif' " }}>{m.value} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--slate)' }}>{m.unit}</span></div>
              <span className="badge badge-success" style={{ fontSize: 10, marginTop: 3 }}>{m.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Health Tips</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: 'var(--bg)', borderRadius: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--primary)', flexShrink: 0, fontFamily: "'Montserrat',sans-serif" }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: 'var(--navy)', lineHeight: 1.6 }}>{tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CLAIMS PAGE ────────────────────────────────────────────────────────────────
export function ClaimsPage() {
  return (
    <div>
      <div className="topbar"><div><div className="page-title">Claims</div><div className="page-sub">Track your health service claims</div></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[{ label: 'Approved', value: CLAIMS.filter(c => c.status === 'approved').length, color: 'var(--success)', bg: '#dcfce7' },
          { label: 'Pending', value: CLAIMS.filter(c => c.status === 'pending').length, color: 'var(--warning)', bg: '#fef9c3' },
          { label: 'Rejected', value: CLAIMS.filter(c => c.status === 'rejected').length, color: 'var(--danger)', bg: '#fee2e2' }
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label} Claims</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Claims History</div>
        <table className="claims-table">
          <thead><tr><th>Claim ID</th><th>Service</th><th>Provider</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {CLAIMS.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.id}</td>
                <td>{c.service}</td>
                <td style={{ color: 'var(--slate)' }}>{c.doctor}</td>
                <td style={{ color: 'var(--slate)' }}>{c.date}</td>
                <td style={{ fontWeight: 700 }}>{c.amount}</td>
                <td><span className={`badge ${c.status === 'approved' ? 'badge-success' : c.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SETTINGS PAGE ──────────────────────────────────────────────────────────────
export function Settings({ onLogout }) {
  return (
    <div>
      <div className="topbar"><div><div className="page-title">Help & Support</div><div className="page-sub">Contact us or get answers to common questions</div></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {[{ title: 'Call Us', sub: '+234 800 SPAN HC', icon: '📞', action: 'tel:+2348007726' },
          { title: 'Email Support', sub: 'support@spanhealthcare.com.ng', icon: '✉️', action: 'mailto:support@spanhealthcare.com.ng' },
          { title: 'WhatsApp', sub: 'Chat with us on WhatsApp', icon: '💬', action: 'https://wa.me/2348007726' },
          { title: 'Visit Website', sub: 'spanhealthcare.com.ng', icon: '🌐', action: 'https://spanhealthcare.com.ng' },
        ].map(item => (
          <a key={item.title} href={item.action} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
              <div><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>{item.title}</div><div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 3 }}>{item.sub}</div></div>
            </div>
          </a>
        ))}
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 16 }}>Frequently Asked Questions</div>
        {[{ q: 'How do I fund my wallet?', a: 'Go to Wallet → Fund Wallet and transfer to the account details shown. Your balance updates automatically.' },
          { q: 'How does the Wakala-Mudarabah model work?', a: 'A 10% Wakala fee applies to all deposits. 45% goes to your health wallet, 45% to Konooz halal fund. Investment returns are shared 50/50.' },
          { q: 'How do I book a consultation?', a: 'Go to Telemedicine, select a doctor, click Schedule, choose your preferred date and consultation type, and complete the booking.' },
          { q: 'Can I add family members?', a: 'Yes. Go to Dependents and click Add Dependent to register family members under your plan.' },
          { q: 'Is my data secure?', a: 'Yes. Span Healthcare complies with NDPR (Nigeria Data Protection Regulation). Your data is encrypted and never shared without consent.' },
        ].map((faq, i) => (
          <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)', marginBottom: 6, fontFamily: "'Montserrat',sans-serif" }}>Q: {faq.q}</div>
            <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.7 }}>{faq.a}</div>
          </div>
        ))}
      </div>
      <button className="btn" style={{ background: '#fee2e2', color: 'var(--danger)', border: 'none', width: 'auto', padding: '11px 24px' }} onClick={onLogout}>Log Out of Account</button>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const ADMIN_EMAIL = 'ahmadabdullahibayero@gmail.com';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --primary: #459DAF; --primary-light: #5bb3c5; --primary-dark: #357f90;
    --primary-pale: #eef7f9; --navy: #1a2f3e; --slate: #5a7a8a;
    --slate-light: #8aaabb; --bg: #f5f7f8; --white: #ffffff;
    --danger: #e05252; --success: #2fb88a; --warning: #e8a444;
    --card-shadow: 0 1px 12px rgba(69,157,175,0.07); --border: #e8eef0;
  }
  body { font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--navy); }
  .admin-layout { display: flex; min-height: 100vh; }
  .admin-sidebar { width: 240px; min-height: 100vh; background: white; border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; }
  .admin-logo { padding: 20px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
  .admin-logo-icon { width: 32px; height: 32px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: white; font-family: 'Montserrat', sans-serif; }
  .admin-logo-text { font-size: 12px; font-weight: 800; color: var(--navy); font-family: 'Montserrat', sans-serif; line-height: 1.3; }
  .admin-logo-tag { font-size: 9px; color: var(--primary); font-weight: 600; }
  .admin-nav { flex: 1; padding: 12px 10px; }
  .admin-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 9px; cursor: pointer; color: var(--slate); font-size: 13px; font-weight: 600; transition: all 0.18s; margin-bottom: 2px; font-family: 'Manrope', sans-serif; }
  .admin-nav-item:hover { background: var(--primary-pale); color: var(--primary); }
  .admin-nav-item.active { background: var(--primary-pale); color: var(--primary); font-weight: 700; border-left: 3px solid var(--primary); border-radius: 0 9px 9px 0; }
  .admin-nav-icon { width: 26px; height: 26px; border-radius: 7px; background: #f0f3f4; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; flex-shrink: 0; font-family: 'Montserrat', sans-serif; color: var(--slate); }
  .admin-nav-item.active .admin-nav-icon { background: var(--primary); color: white; }
  .admin-footer { padding: 12px 10px; border-top: 1px solid var(--border); }
  .admin-logout { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 9px; cursor: pointer; color: var(--slate); font-size: 12px; font-weight: 600; transition: all 0.2s; background: none; border: none; width: 100%; font-family: 'Manrope', sans-serif; }
  .admin-logout:hover { background: #fee2e2; color: var(--danger); }
  .admin-content { margin-left: 240px; flex: 1; padding: 28px 32px; background: var(--bg); min-height: 100vh; }
  .admin-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .admin-page-title { font-size: 22px; font-weight: 800; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .admin-page-sub { font-size: 13px; color: var(--slate); margin-top: 2px; }
  .card { background: white; border-radius: 14px; padding: 20px; box-shadow: var(--card-shadow); border: 1px solid var(--border); }
  .card-title { font-size: 14px; font-weight: 700; color: var(--navy); margin-bottom: 16px; font-family: 'Montserrat', sans-serif; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .stat-card { background: white; border-radius: 14px; padding: 18px; box-shadow: var(--card-shadow); border: 1px solid var(--border); border-top: 3px solid var(--primary); }
  .stat-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--slate); font-family: 'Montserrat', sans-serif; margin-bottom: 8px; }
  .stat-value { font-size: 26px; font-weight: 800; font-family: 'Montserrat', sans-serif; color: var(--navy); }
  .stat-sub { font-size: 11px; color: var(--slate); margin-top: 4px; }
  .badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; font-family: 'Manrope', sans-serif; }
  .badge-success { background: #dcfce7; color: #16a34a; }
  .badge-warning { background: #fef9c3; color: #ca8a04; }
  .badge-danger { background: #fee2e2; color: #dc2626; }
  .badge-info { background: var(--primary-pale); color: var(--primary); }
  .table { width: 100%; border-collapse: collapse; }
  .table th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--slate-light); font-weight: 700; padding: 10px 14px; text-align: left; border-bottom: 1.5px solid var(--border); font-family: 'Montserrat', sans-serif; }
  .table td { padding: 12px 14px; border-bottom: 1px solid #f5f7f8; font-size: 13px; color: var(--navy); vertical-align: middle; font-family: 'Manrope', sans-serif; }
  .table tr:hover td { background: var(--primary-pale); }
  .table tr:last-child td { border-bottom: none; }
  .btn { padding: 8px 16px; border-radius: 8px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
  .btn-primary { background: var(--primary); color: white; }
  .btn-primary:hover { background: var(--primary-dark); }
  .btn-success { background: #dcfce7; color: #16a34a; }
  .btn-success:hover { background: var(--success); color: white; }
  .btn-danger { background: #fee2e2; color: var(--danger); }
  .btn-danger:hover { background: var(--danger); color: white; }
  .btn-outline { background: transparent; color: var(--primary); border: 1.5px solid var(--primary); }
  .btn-outline:hover { background: var(--primary-pale); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid #dce8eb; border-radius: 9px; font-size: 14px; font-family: 'Manrope', sans-serif; color: var(--navy); background: var(--bg); outline: none; transition: all 0.2s; }
  .form-input:focus { border-color: var(--primary); background: white; }
  .form-label { display: block; font-size: 11px; font-weight: 700; color: var(--slate); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.8px; font-family: 'Montserrat', sans-serif; }
  .search-bar { display: flex; gap: 10px; margin-bottom: 18px; }
  .search-input { flex: 1; padding: 9px 14px; border: 1.5px solid var(--border); border-radius: 9px; font-size: 13px; font-family: 'Manrope', sans-serif; outline: none; background: white; transition: border-color 0.2s; }
  .search-input:focus { border-color: var(--primary); }
  .empty-state { text-align: center; padding: 40px 20px; color: var(--slate); font-family: 'Manrope', sans-serif; font-size: 13px; }
  .tab-bar { display: flex; border-bottom: 1.5px solid var(--border); margin-bottom: 18px; }
  .tab-btn { padding: 10px 16px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13px; background: none; border: none; cursor: pointer; color: var(--slate); border-bottom: 2.5px solid transparent; margin-bottom: -1.5px; transition: all 0.2s; }
  .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
  .modal-overlay { position: fixed; inset: 0; background: rgba(26,47,62,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
  .modal { background: white; border-radius: 16px; width: 90%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
  .modal-header { padding: 18px 22px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .modal-title { font-size: 16px; font-weight: 800; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .modal-close { width: 30px; height: 30px; border-radius: 8px; border: none; background: var(--bg); cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; color: var(--slate); }
  .modal-close:hover { background: #fee2e2; color: var(--danger); }
  .modal-body { padding: 22px; }
  .login-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); }
  .login-card { background: white; border-radius: 16px; padding: 36px; width: 100%; max-width: 380px; box-shadow: var(--card-shadow); border: 1px solid var(--border); }
  .login-title { font-size: 22px; font-weight: 800; color: var(--navy); font-family: 'Montserrat', sans-serif; margin-bottom: 6px; }
  .login-sub { font-size: 13px; color: var(--slate); margin-bottom: 28px; }
  .form-group { margin-bottom: 16px; }
`;

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

// ── ADMIN LOGIN ──
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password'); return; }
    setLoading(true);
    setError('');
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      if (data.user.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        throw new Error('Access denied. This portal is for administrators only.');
      }
      onLogin(data.user);
    } catch(e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div className="admin-logo-icon">SP</div>
          <div>
            <div className="admin-logo-text">Span Healthcare</div>
            <div className="admin-logo-tag">Admin Portal</div>
          </div>
        </div>
        <div className="login-title">Admin Login</div>
        <div className="login-sub">Restricted access — authorised personnel only</div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="admin email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14 }} onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In to Admin'}
        </button>
      </div>
    </div>
  );
}

// ── OVERVIEW PAGE ──
function OverviewPage() {
  const [stats, setStats] = useState({ users: 0, doctors: 0, totalDeposits: 0, consultations: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: doctorCount } = await supabase
        .from('doctors')
        .select('*', { count: 'exact', head: true });

      const { count: consultCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { data: wallets } = await supabase
        .from('wallets')
        .select('balance, investment_balance');

      const { data: users } = await supabase
        .from('profiles')
        .select('full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: txns } = await supabase
        .from('transactions')
        .select('description, amount, type, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const totalDeposits = (wallets || []).reduce((sum, w) =>
        sum + Number(w.balance || 0) + Number(w.investment_balance || 0), 0);

      setStats({
        users: userCount || 0,
        doctors: doctorCount || 0,
        totalDeposits,
        consultations: consultCount || 0,
      });
      setRecentUsers(users || []);
      setRecentTxns(txns || []);
    } catch(e) {
      console.error('Overview fetch error:', e.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Overview</div>
          <div className="admin-page-sub">Platform summary at a glance</div>
        </div>
        <button className="btn btn-outline" onClick={fetchAll}>Refresh</button>
      </div>

      <div className="stats-grid">
        {[
          { tag: 'Users', value: loading ? '—' : stats.users, sub: 'Registered patients' },
          { tag: 'Doctors', value: loading ? '—' : stats.doctors, sub: 'On the platform' },
          { tag: 'Deposits', value: loading ? '—' : fmt(stats.totalDeposits), sub: 'Total wallet balances' },
          { tag: 'Consults', value: loading ? '—' : stats.consultations, sub: 'Completed consultations' },
        ].map(s => (
          <div key={s.tag} className="stat-card">
            <div className="stat-tag">{s.tag}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="card">
          <div className="card-title">Recent Registrations</div>
          {loading ? <div className="empty-state">Loading...</div>
          : recentUsers.length === 0 ? <div className="empty-state">No users yet</div>
          : (
            <table className="table">
              <thead><tr><th>Name</th><th>Joined</th></tr></thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{u.full_name || 'Unknown'}</td>
                    <td style={{ color: 'var(--slate)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-title">Recent Transactions</div>
          {loading ? <div className="empty-state">Loading...</div>
          : recentTxns.length === 0 ? <div className="empty-state">No transactions yet</div>
          : (
            <table className="table">
              <thead><tr><th>Description</th><th>Amount</th><th>Type</th></tr></thead>
              <tbody>
                {recentTxns.map((t, i) => (
                  <tr key={i}>
                    <td>{t.description || 'Transaction'}</td>
                    <td style={{ fontWeight: 700, color: t.type === 'credit' ? 'var(--success)' : 'var(--danger)' }}>
                      {t.type === 'credit' ? '+' : '-'}₦{Number(t.amount).toLocaleString()}
                    </td>
                    <td><span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-info'}`}>{t.type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── DOCTORS PAGE ──
function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [acting, setActing] = useState(false);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
    setDoctors(data || []);
    setLoading(false);
  };

  const approve = async (id) => {
    setActing(true);
    await supabase.from('doctors').update({ status: 'approved' }).eq('id', id);
    setDoctors(doctors.map(d => d.id === id ? { ...d, status: 'approved' } : d));
    setSelected(null);
    setActing(false);
  };

  const reject = async (id) => {
    if (!window.confirm('Reject this doctor application?')) return;
    setActing(true);
    await supabase.from('doctors').update({ status: 'rejected' }).eq('id', id);
    setDoctors(doctors.map(d => d.id === id ? { ...d, status: 'rejected' } : d));
    setSelected(null);
    setActing(false);
  };

  const filtered = doctors
    .filter(d => d.status === tab)
    .filter(d => !search || d.full_name?.toLowerCase().includes(search.toLowerCase()) || d.specialty?.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    pending: doctors.filter(d => d.status === 'pending').length,
    approved: doctors.filter(d => d.status === 'approved').length,
    rejected: doctors.filter(d => d.status === 'rejected').length,
  };

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Doctors</div>
          <div className="admin-page-sub">Manage doctor registrations and approvals</div>
        </div>
        <span className="badge badge-warning" style={{ fontSize: 13, padding: '6px 14px' }}>
          {counts.pending} Pending Approval
        </span>
      </div>

      <div className="card">
        <div className="tab-bar">
          {['pending', 'approved', 'rejected'].map(t => (
            <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
            </button>
          ))}
        </div>

        <div className="search-bar">
          <input className="search-input" placeholder="Search by name or specialty..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <div className="empty-state">Loading...</div>
        : filtered.length === 0 ? <div className="empty-state">No {tab} doctors{search ? ' matching your search' : ''}.</div>
        : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Specialty</th><th>Email</th>
                <th>Experience</th><th>Applied</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{doc.full_name}</div>
                    <span className={`badge ${doc.status === 'approved' ? 'badge-success' : doc.status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: 10, marginTop: 3 }}>
                      {doc.status}
                    </span>
                  </td>
                  <td>{doc.specialty}</td>
                  <td style={{ color: 'var(--slate)' }}>{doc.email}</td>
                  <td>{doc.experience_years} yrs</td>
                  <td style={{ color: 'var(--slate)' }}>{doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn" style={{ padding: '5px 10px', fontSize: 11, background: 'var(--primary-pale)', color: 'var(--primary)', border: 'none' }} onClick={() => setSelected(doc)}>View</button>
                      {doc.status === 'pending' && <>
                        <button className="btn btn-success" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => approve(doc.id)} disabled={acting}>Approve</button>
                        <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => reject(doc.id)} disabled={acting}>Reject</button>
                      </>}
                      {doc.status === 'rejected' && <button className="btn btn-success" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => approve(doc.id)} disabled={acting}>Approve</button>}
                      {doc.status === 'approved' && <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => reject(doc.id)} disabled={acting}>Revoke</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.full_name}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                {[
                  { label: 'Email', value: selected.email },
                  { label: 'Phone', value: selected.phone || '—' },
                  { label: 'Specialty', value: selected.specialty },
                  { label: 'Experience', value: `${selected.experience_years} years` },
                  { label: 'Status', value: selected.status },
                  { label: 'Applied', value: selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'Montserrat',sans-serif", marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {selected.bio && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'Montserrat',sans-serif", marginBottom: 6 }}>Bio</div>
                  <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.7 }}>{selected.bio}</div>
                </div>
              )}
              {selected.status === 'pending' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => reject(selected.id)} disabled={acting}>Reject</button>
                  <button className="btn btn-success" style={{ flex: 2, justifyContent: 'center' }} onClick={() => approve(selected.id)} disabled={acting}>{acting ? 'Processing...' : 'Approve Doctor'}</button>
                </div>
              )}
              {selected.status === 'approved' && <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={() => reject(selected.id)} disabled={acting}>Revoke Approval</button>}
              {selected.status === 'rejected' && <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }} onClick={() => approve(selected.id)} disabled={acting}>Approve Doctor</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── USERS PAGE ──
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('*');

      if (walletsError) throw walletsError;

      const merged = (profilesData || []).map(profile => ({
        ...profile,
        wallet: walletsData?.find(w => w.user_id === profile.id) || null
      }));

      setUsers(merged);
    } catch(e) {
      console.error('fetchUsers error:', e.message);
    }
    setLoading(false);
  };

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Users</div>
          <div className="admin-page-sub">{users.length} registered patients</div>
        </div>
      </div>

      <div className="card">
        <div className="search-bar">
          <input className="search-input" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <div className="empty-state">Loading...</div>
        : filtered.length === 0 ? <div className="empty-state">No users found.</div>
        : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Phone</th>
                <th>Available</th><th>Investment</th><th>Total</th>
                <th>Joined</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const available = Number(u.wallet?.balance || 0);
                const investment = Number(u.wallet?.investment_balance || 0);
                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.full_name || '—'}</td>
                    <td style={{ color: 'var(--slate)' }}>{u.phone || '—'}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{fmt(available)}</td>
                    <td style={{ color: '#7c3aed', fontWeight: 600 }}>{fmt(investment)}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 700 }}>{fmt(available + investment)}</td>
                    <td style={{ color: 'var(--slate)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td>
                      <button className="btn" style={{ padding: '5px 10px', fontSize: 11, background: 'var(--primary-pale)', color: 'var(--primary)', border: 'none' }} onClick={() => setSelected(u)}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.full_name}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                {[
                  { label: 'Full Name', value: selected.full_name || '—' },
                  { label: 'Phone', value: selected.phone || '—' },
                  { label: 'Sex', value: selected.sex || '—' },
                  { label: 'Blood Group', value: selected.blood_group || '—' },
                  { label: 'Genotype', value: selected.genotype || '—' },
                  { label: 'Date of Birth', value: selected.date_of_birth || '—' },
                  { label: 'Joined', value: selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'Montserrat',sans-serif", marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--primary-pale)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'Montserrat',sans-serif", marginBottom: 12 }}>Wallet</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div><div style={{ fontSize: 10, color: 'var(--slate)', marginBottom: 3 }}>Available</div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{fmt(Number(selected.wallet?.balance || 0))}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--slate)', marginBottom: 3 }}>Investment</div><div style={{ fontSize: 16, fontWeight: 700, color: '#7c3aed' }}>{fmt(Number(selected.wallet?.investment_balance || 0))}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--slate)', marginBottom: 3 }}>Total</div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>{fmt(Number(selected.wallet?.balance || 0) + Number(selected.wallet?.investment_balance || 0))}</div></div>
                </div>
                {selected.wallet?.account_number && (
                  <div style={{ marginTop: 12, fontSize: 12, color: 'var(--slate)' }}>
                    Account: <strong>{selected.wallet.account_number}</strong> · {selected.wallet.bank_name || 'Span Bank'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TRANSACTIONS PAGE ──
function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setTransactions(data || []);
    } catch(e) {
      console.error('Transactions error:', e.message);
    }
    setLoading(false);
  };

  const filtered = transactions
    .filter(t => typeFilter === 'all' || t.type === typeFilter)
    .filter(t => !search || t.description?.toLowerCase().includes(search.toLowerCase()));

  const totalCredits = filtered.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
  const totalDebits = filtered.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Transactions</div>
          <div className="admin-page-sub">All platform transactions</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { tag: 'Total In', value: fmt(totalCredits), color: 'var(--success)' },
          { tag: 'Total Out', value: fmt(totalDebits), color: 'var(--danger)' },
          { tag: 'Net', value: fmt(totalCredits - totalDebits), color: 'var(--primary)' },
        ].map(s => (
          <div key={s.tag} className="stat-card" style={{ borderTopColor: s.color }}>
            <div className="stat-tag">{s.tag}</div>
            <div className="stat-value" style={{ fontSize: 20, color: s.color }}>{s.value}</div>
            <div className="stat-sub">{filtered.length} transactions shown</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="search-bar">
          <input className="search-input" placeholder="Search by description..." value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'credit', 'debit'].map(t => (
              <button key={t} className="btn" style={{ padding: '7px 12px', fontSize: 11, background: typeFilter === t ? 'var(--primary)' : 'white', color: typeFilter === t ? 'white' : 'var(--slate)', border: '1.5px solid var(--border)' }} onClick={() => setTypeFilter(t)}>
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="empty-state">Loading...</div>
        : filtered.length === 0 ? <div className="empty-state">No transactions found.</div>
        : (
          <table className="table">
            <thead>
              <tr><th>Description</th><th>Amount</th><th>Type</th><th>Date</th></tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>{t.description || 'Transaction'}</td>
                  <td style={{ fontWeight: 700, color: t.type === 'credit' ? 'var(--success)' : 'var(--danger)' }}>
                    {t.type === 'credit' ? '+' : '-'}{fmt(t.amount)}
                  </td>
                  <td><span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-info'}`}>{t.type}</span></td>
                  <td style={{ color: 'var(--slate)' }}>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── APPOINTMENTS PAGE ──
function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: false })
      .limit(200);
    setAppointments(data || []);
    setLoading(false);
  };

  const filtered = appointments
    .filter(a => tab === 'all' || a.status === tab)
    .filter(a => !search ||
      a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor_name?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Appointments</div>
          <div className="admin-page-sub">All consultations across the platform</div>
        </div>
      </div>

      <div className="card">
        <div className="tab-bar">
          {['all', 'upcoming', 'completed', 'cancelled', 'active'].map(t => (
            <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)} ({appointments.filter(a => t === 'all' || a.status === t).length})
            </button>
          ))}
        </div>

        <div className="search-bar">
          <input className="search-input" placeholder="Search by patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? <div className="empty-state">Loading...</div>
        : filtered.length === 0 ? <div className="empty-state">No appointments found.</div>
        : (
          <table className="table">
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Type</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.patient_name || '—'}</td>
                  <td>{a.doctor_name || '—'}</td>
                  <td><span className="badge badge-info">{a.type || 'video'}</span></td>
                  <td style={{ color: 'var(--slate)' }}>{a.date ? new Date(a.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td>
                    <span className={`badge ${a.status === 'completed' ? 'badge-success' : a.status === 'cancelled' ? 'badge-danger' : a.status === 'active' ? 'badge-warning' : 'badge-info'}`}>
                      {a.status || 'upcoming'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── APPLICATIONS PAGE ──
function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('onboarding_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setApplications(data || []);
    setLoading(false);
  };

  const openApplication = (app) => {
    setSelected(app);
    setNotes(app.admin_notes || '');
    setSuccess('');
  };

  const updateStatus = async (id, status) => {
    setSaving(true);
    const { error } = await supabase
      .from('onboarding_applications')
      .update({ status, admin_notes: notes, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setApplications(applications.map(a => a.id === id ? { ...a, status, admin_notes: notes } : a));
      setSelected(prev => ({ ...prev, status, admin_notes: notes }));
      setSuccess('Updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
    setSaving(false);
  };

  const saveNotes = async (id) => {
    setSaving(true);
    const { error } = await supabase
      .from('onboarding_applications')
      .update({ admin_notes: notes })
      .eq('id', id);
    if (!error) {
      setApplications(applications.map(a => a.id === id ? { ...a, admin_notes: notes } : a));
      setSuccess('Notes saved');
      setTimeout(() => setSuccess(''), 3000);
    }
    setSaving(false);
  };

  const filtered = applications
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .filter(a => !search ||
      a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.phone_primary?.includes(search)
    );

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    account_created: applications.filter(a => a.status === 'account_created').length,
  };

  const Field = ({ label, value }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'Montserrat',sans-serif", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600, wordBreak: 'break-word' }}>{value || '—'}</div>
    </div>
  );

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <div className="admin-page-title">Applications</div>
          <div className="admin-page-sub">Onboarding applications from prospective members</div>
        </div>
        <span className="badge badge-warning" style={{ fontSize: 13, padding: '6px 14px' }}>
          {counts.pending} Pending Review
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total', value: counts.all, color: 'var(--primary)', bg: 'var(--primary-pale)' },
          { label: 'Pending', value: counts.pending, color: '#ca8a04', bg: '#fef9c3' },
          { label: 'Approved', value: counts.approved, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Account Created', value: counts.account_created, color: 'var(--primary)', bg: 'var(--primary-pale)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
            <div className="stat-tag" style={{ background: s.bg, color: s.color, borderRadius: 5, padding: '2px 8px', fontSize: 10 }}>{s.label}</div>
            <div className="stat-value" style={{ marginTop: 8 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Filters */}
        <div className="tab-bar">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'account_created', label: 'Account Created' },
            { key: 'rejected', label: 'Rejected' },
          ].map(t => (
            <button key={t.key} className={`tab-btn${statusFilter === t.key ? ' active' : ''}`} onClick={() => setStatusFilter(t.key)}>
              {t.label} ({counts[t.key] ?? 0})
            </button>
          ))}
        </div>

        <div className="search-bar">
          <input
            className="search-input"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-outline" onClick={fetchApplications} style={{ padding: '8px 16px', fontSize: 12, width: 'auto' }}>Refresh</button>
        </div>

        {loading ? <div className="empty-state">Loading applications...</div>
        : filtered.length === 0 ? <div className="empty-state">No applications found.</div>
        : (
          <table className="table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Account Type</th>
                <th>Phone</th>
                <th>Email</th>
                <th>State</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id}>
                  <td style={{ fontWeight: 700 }}>{app.full_name || '—'}</td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: 10 }}>{app.account_type || '—'}</span>
                  </td>
                  <td style={{ color: 'var(--slate)' }}>{app.phone_primary || '—'}</td>
                  <td style={{ color: 'var(--slate)', fontSize: 12 }}>{app.email || '—'}</td>
                  <td style={{ color: 'var(--slate)' }}>{app.state || '—'}</td>
                  <td style={{ color: 'var(--slate)', fontSize: 12 }}>
                    {app.created_at ? new Date(app.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td>
                    <span className={`badge ${
                      app.status === 'approved' || app.status === 'account_created' ? 'badge-success' :
                      app.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                    }`} style={{ fontSize: 10 }}>
                      {app.status === 'account_created' ? 'Account Created' : app.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn"
                      style={{ padding: '5px 12px', fontSize: 11, background: 'var(--primary-pale)', color: 'var(--primary)', border: 'none' }}
                      onClick={() => openApplication(app)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selected.full_name}</div>
                <span className={`badge ${
                  selected.status === 'approved' || selected.status === 'account_created' ? 'badge-success' :
                  selected.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                }`} style={{ fontSize: 11, marginTop: 4 }}>
                  {selected.status === 'account_created' ? 'Account Created' : selected.status || 'pending'}
                </span>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '0 0 24px' }}>

              {/* Tabs inside modal */}
              {['Personal','Contact','Health','Declarations','Admin Notes'].map((tab, i) => {
                const tabId = ['personal','contact','health','declarations','notes'][i];
                return null; // handled below
              })}

              <div style={{ padding: '0 26px' }}>

                {success && (
                  <div style={{ background: '#dcfce7', color: '#166634', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16, marginTop: 16 }}>
                    {success}
                  </div>
                )}

                {/* Section: Account */}
                <div style={{ background: 'var(--primary-pale)', borderRadius: 12, padding: '14px 18px', marginTop: 20, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'Montserrat',sans-serif", marginBottom: 10 }}>Account</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <Field label="Account Type" value={selected.account_type} />
                    <Field label="Deposit Plan" value={selected.deposit_plan} />
                    <Field label="Applied" value={selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'} />
                  </div>
                </div>

                {/* Section: Personal */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Personal Details</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <Field label="Full Name" value={selected.full_name} />
                    <Field label="Date of Birth" value={selected.date_of_birth} />
                    <Field label="Gender" value={selected.gender} />
                    <Field label="Marital Status" value={selected.marital_status} />
                    <Field label="NIN" value={selected.nin} />
                    <Field label="BVN" value={selected.bvn} />
                    <Field label="ID Type" value={selected.id_type} />
                    <Field label="ID Number" value={selected.id_number} />
                  </div>
                </div>

                {/* Section: Contact */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Contact Information</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <Field label="Primary Phone" value={selected.phone_primary} />
                    <Field label="WhatsApp" value={selected.phone_whatsapp} />
                    <Field label="Email" value={selected.email} />
                    <Field label="State" value={selected.state} />
                    <Field label="LGA" value={selected.lga} />
                    <Field label="Area" value={selected.address_area} />
                    <Field label="Street" value={selected.address_street} />
                    <Field label="Landmark" value={selected.landmark} />
                  </div>
                </div>

                {/* Section: Health + NOK */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Health & Next of Kin</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <Field label="Blood Group" value={selected.blood_group} />
                    <Field label="Genotype" value={selected.genotype} />
                    <Field label="Chronic Conditions" value={selected.chronic_conditions?.join(', ')} />
                    <Field label="NOK Name" value={selected.nok_full_name} />
                    <Field label="NOK Relationship" value={selected.nok_relationship} />
                    <Field label="NOK Phone" value={selected.nok_phone} />
                  </div>
                </div>

                {/* Section: Referral */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Referral</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Referral Source" value={selected.referral_source} />
                    <Field label="Referral Code" value={selected.referral_code} />
                  </div>
                </div>

                {/* Section: Declarations */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Declarations</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { field: 'consent_accuracy', label: 'Confirmed accuracy of information' },
                      { field: 'consent_ndpa', label: 'Consented to NDPA data processing' },
                      { field: 'consent_wakala', label: 'Acknowledged Wakala fee structure' },
                      { field: 'consent_mudarabah', label: 'Acknowledged Mudarabah arrangement' },
                      { field: 'consent_account_creation', label: 'Authorised account creation' },
                    ].map(d => (
                      <div key={d.field} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 5, background: selected[d.field] ? '#dcfce7' : '#fee2e2', border: `1.5px solid ${selected[d.field] ? '#86efac' : '#fca5a5'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: selected[d.field] ? '#16a34a' : '#dc2626', flexShrink: 0 }}>
                          {selected[d.field] ? '✓' : '✕'}
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--navy)' }}>{d.label}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 6, fontSize: 12, color: 'var(--slate)' }}>
                      Declaration Date: <strong>{selected.declaration_date || '—'}</strong>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Admin Notes</div>
                  <textarea
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #dce8eb', borderRadius: 9, fontSize: 13, fontFamily: "'Manrope',sans-serif", color: 'var(--navy)', background: 'var(--bg)', outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' }}
                    placeholder="Add internal notes about this applicant..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                  <button
                    className="btn btn-outline"
                    style={{ marginTop: 8, padding: '7px 16px', fontSize: 12, width: 'auto' }}
                    onClick={() => saveNotes(selected.id)}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  {selected.status !== 'account_created' && (
                    <button
                      className="btn btn-success"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => updateStatus(selected.id, 'account_created')}
                      disabled={saving}
                    >
                      Mark Account Created
                    </button>
                  )}
                  {selected.status !== 'approved' && selected.status !== 'account_created' && (
                    <button
                      className="btn btn-success"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => updateStatus(selected.id, 'approved')}
                      disabled={saving}
                    >
                      Approve
                    </button>
                  )}
                  {selected.status !== 'rejected' && (
                    <button
                      className="btn btn-danger"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => updateStatus(selected.id, 'rejected')}
                      disabled={saving}
                    >
                      Reject
                    </button>
                  )}
                  {selected.status === 'rejected' && (
                    <button
                      className="btn btn-success"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => updateStatus(selected.id, 'approved')}
                      disabled={saving}
                    >
                      Reopen & Approve
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ADMIN APP ──
export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [page, setPage] = useState('overview');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        setAuthed(true);
        setAdminUser(session.user);
      }
      setChecking(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
    setAdminUser(null);
  };

  const pages = {
    overview: <OverviewPage />,
    doctors: <DoctorsPage />,
    users: <UsersPage />,
    transactions: <TransactionsPage />,
    appointments: <AppointmentsPage />,
    applications: <ApplicationsPage />,
  };

  const navItems = [
    { id: 'overview', label: 'Overview', short: 'OV' },
    { id: 'doctors', label: 'Doctors', short: 'DR' },
    { id: 'users', label: 'Users', short: 'US' },
    { id: 'transactions', label: 'Transactions', short: 'TX' },
    { id: 'appointments', label: 'Appointments', short: 'AP' },
    { id: 'onboarding', label: 'Applications', short: 'APP' },
    { id: 'applications', label: 'Applications', short: 'AP' },
  ];

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', color: '#5a7a8a' }}>
      Loading...
    </div>
  );

  if (!authed) return (
    <>
      <style>{styles}</style>
      <AdminLogin onLogin={(user) => { setAuthed(true); setAdminUser(user); }} />
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="admin-layout">
        <div className="admin-sidebar">
          <div className="admin-logo">
            <div className="admin-logo-icon">SP</div>
            <div>
              <div className="admin-logo-text">Span Healthcare</div>
              <div className="admin-logo-tag">Admin Portal</div>
            </div>
          </div>
          <div className="admin-nav">
            {navItems.map(item => (
              <div key={item.id} className={`admin-nav-item${page === item.id ? ' active' : ''}`} onClick={() => setPage(item.id)}>
                <div className="admin-nav-icon">{item.short}</div>
                {item.label}
              </div>
            ))}
          </div>
          <div className="admin-footer">
            <div style={{ fontSize: 12, color: 'var(--slate)', padding: '4px 10px', marginBottom: 6 }}>
              {adminUser?.email}
            </div>
            <button className="admin-logout" onClick={handleLogout}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--danger)', fontFamily: "'Montserrat',sans-serif" }}>OUT</div>
              Log Out
            </button>
          </div>
        </div>
        <div className="admin-content">
          {pages[page] || pages.overview}
        </div>
      </div>
    </>
  );
}
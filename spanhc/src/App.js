import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from './supabase';
import { styles, AuthScreen, PasswordResetModal, Sidebar, NotificationBell } from './Shared';
import {
  Dashboard, WalletPage, Transactions, TelemedicinePage,
  MessagesPage, AppointmentsPage, DocumentsPage,
  ProfilePage, DependentsPage, WellnessPage, ClaimsPage, Settings
} from './Patient';

const DoctorDashboard = lazy(() => import('./Doctor'));
const AdminApp = lazy(() => import('./AdminApp'));
const Onboarding = lazy(() => import('./Onboarding'));

const ADMIN_EMAIL = 'ahmadabdullahibayero@gmail.com';

export default function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'patient' | 'doctor' | 'admin'
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [autoBookDoctor, setAutoBookDoctor] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) { setIsPasswordReset(true); setLoading(false); return; }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await handleSessionUser(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') { setIsPasswordReset(true); return; }
      if (session?.user) await handleSessionUser(session.user);
      else { setUser(null); setUserType(null); setDoctorProfile(null); setProfile(null); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSessionUser = async (authUser) => {
    setUser(authUser);
    if (authUser.email === ADMIN_EMAIL) { setUserType('admin'); return; }

    const { data: doctorData } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (doctorData) {
      setUserType('doctor');
      setDoctorProfile(doctorData);
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    setUserType('patient');
    setProfile(profileData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    setDoctorProfile(null);
    setProfile(null);
    setActivePage('dashboard');
  };

  const handleLogin = (authUser) => {
    if (authUser) setUser(authUser);
  };

  const handleDoctorLogin = (authUser, docProfile) => {
    setUser(authUser);
    setUserType('doctor');
    setDoctorProfile(docProfile);
  };

  const handleNav = (page) => {
    setActivePage(page);
    setMobileSidebarOpen(false);
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'white', fontFamily: "'Montserrat',sans-serif", letterSpacing: 0.5 }}>SPAN</div>
          <div style={{ fontSize: 13, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>Loading Span Healthcare...</div>
        </div>
      </>
    );
  }

  // ── Password reset flow ───────────────────────────────────────────────────
  if (isPasswordReset) {
    return (
      <>
        <style>{styles}</style>
        <PasswordResetModal onClose={() => { setIsPasswordReset(false); window.location.hash = ''; }} />
      </>
    );
  }

  // ── Onboarding route ─────────────────────────────────────────────────────
  if (window.location.pathname === '/onboarding') {
    return (
      <Suspense fallback={
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f4f9fa' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'#459DAF', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:11, color:'white', marginBottom:16 }}>SPAN</div>
          <div style={{ fontSize:13, color:'#5a7a8a' }}>Loading...</div>
        </div>
      }>
        <style>{styles}</style>
        <Onboarding />
      </Suspense>
    );
  }

  

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user || !userType) {
    return (
      <>
        <style>{styles}</style>
        <AuthScreen onLogin={handleLogin} onDoctorLogin={handleDoctorLogin} />
      </>
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  if (userType === 'admin') {
    return (
      <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f4f9fa', fontSize:13, color:'#5a7a8a' }}>Loading...</div>}>
        <AdminApp />
      </Suspense>
    );
  }

  // ── Doctor ────────────────────────────────────────────────────────────────
  if (userType === 'doctor') {
    return (
      <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f4f9fa', fontSize:13, color:'#5a7a8a' }}>Loading...</div>}>
        <DoctorDashboard
          doctorProfile={doctorProfile}
          doctorUser={user}
          onLogout={handleLogout}
        />
      </Suspense>
    );
  }

  // ── Patient ───────────────────────────────────────────────────────────────
  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Member';

  const pages = {
    dashboard: <Dashboard onNav={handleNav} userName={userName} userId={user.id} onBook={() => handleNav('telemedicine')} />,
    wallet: <WalletPage userId={user.id} />,
    transactions: <Transactions userId={user.id} userName={userName} />,
    telemedicine: <TelemedicinePage userId={user.id} userName={userName} autoBookDoctor={autoBookDoctor} onAutoBookClear={() => setAutoBookDoctor(null)} />,
    chat: <MessagesPage userId={user.id} userName={userName} />,
    appointments: <AppointmentsPage userId={user.id} />,
    documents: <DocumentsPage userId={user.id} />,
    profile: <ProfilePage userId={user.id} userName={userName} />,
    dependents: <DependentsPage userId={user.id} userName={userName} />,
    wellness: <WellnessPage />,
    claims: <ClaimsPage />,
    settings: <Settings onLogout={handleLogout} />,
  };

  return (
    <>
      <style>{styles}</style>
      <div className="main-layout">
        <Sidebar
          active={activePage}
          onNav={handleNav}
          userName={userName}
          onLogout={handleLogout}
          mobileOpen={mobileSidebarOpen}
        />
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }}
          />
        )}
        <div className="main-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #eef2f5' }}>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="mobile-menu-btn"
              style={{ width: 40, height: 40, borderRadius: 10, border: '1.5px solid #dce8eb', background: 'white', cursor: 'pointer', fontSize: 18, display: 'none', alignItems: 'center', justifyContent: 'center' }}
            >☰</button>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>
              Span Healthcare
            </div>
            <NotificationBell userId={user.id} />
          </div>
          {pages[activePage] || pages.dashboard}
        </div>
      </div>
    </>
  );
}
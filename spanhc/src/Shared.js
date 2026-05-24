import { useState, useRef, useEffect } from 'react';
import { supabase } from './supabase';
import { registerUser, loginUser, getProfile, uploadAvatar, updateProfile } from './Auth';

export const AGORA_APP_ID = '5e972a5ba048430980f63dd3a549880b';

export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary: #459DAf;
    --primary-light: #56b4c8;
    --primary-dark: #2d8a9e;
    --primary-pale: #eef7f9;
    --secondary: #98B7B9;
    --secondary-light: #b0cccf;
    --secondary-pale: #f0f7f8;
    --navy: #0f1f2e;
    --navy-mid: #1a2f42;
    --navy-light: #2a4560;
    --slate: #5a7a8a;
    --slate-light: #8aaabb;
    --bg: #f4f9fa;
    --white: #ffffff;
    --danger: #e05252;
    --success: #2fb88a;
    --warning: #e8a444;
    --card-shadow: 0 1px 12px rgba(69,157,175,0.07), 0 1px 3px rgba(0,0,0,0.04);
    --card-shadow-hover: 0 4px 24px rgba(69,157,175,0.13);
    --sidebar-bg: #ffffff;
    --sidebar-border: #e8eef0;
    --bg2: #eef1f3;
    --border: #e8eef0;
  }

  body { font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--navy); }
  h1,h2,h3,h4,h5 { font-family: 'Montserrat', sans-serif; }
  .app { display: flex; flex-direction: column; min-height: 100vh; }

  .auth-screen { min-height: 100vh; display: grid; grid-template-columns: 1.1fr 0.9fr; background: var(--white); }
  @media (max-width: 900px) {
    .auth-screen { grid-template-columns: 1fr !important; }
    .auth-left { display: none !important; }
    .auth-right { padding: 32px 24px !important; }
    .mobile-back-btn { display: flex !important; }
  }
  .auth-left {
    background: linear-gradient(160deg, var(--navy) 0%, var(--navy-mid) 40%, var(--primary-dark) 100%);
    display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
    padding: 64px; position: relative; overflow: hidden;
  }
  .auth-left::before { content: ''; position: absolute; bottom: -120px; right: -80px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(61,156,176,0.25) 0%, transparent 70%); border-radius: 50%; }
  .auth-left::after { content: ''; position: absolute; top: -80px; left: -60px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(152,183,185,0.15) 0%, transparent 70%); border-radius: 50%; }
  .auth-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 56px; z-index: 1; position: relative; }
  .auth-logo-img { height: 52px; width: auto; object-fit: contain; }
  .auth-logo-icon { width: 52px; height: 52px; background: var(--primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: white; font-family: 'Montserrat', sans-serif; letter-spacing: 0.5px; box-shadow: 0 4px 16px rgba(61,156,176,0.4); }
  .auth-logo-text { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 800; color: white; line-height: 1.2; }
  .auth-logo-sub { font-size: 11px; color: var(--secondary); font-weight: 500; letter-spacing: 1px; text-transform: uppercase; }
  .auth-headline { font-size: 40px; font-weight: 800; color: white; line-height: 1.15; margin-bottom: 20px; z-index: 1; position: relative; font-family: 'Montserrat', sans-serif; }
  .auth-headline span { color: var(--secondary-light); }
  .auth-sub { font-size: 15px; color: rgba(255,255,255,0.65); line-height: 1.8; z-index: 1; position: relative; max-width: 360px; font-family: 'Manrope', sans-serif; }
  .auth-features { margin-top: 44px; display: flex; flex-direction: column; gap: 14px; z-index: 1; position: relative; }
  .auth-feature { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.8); font-size: 14px; font-family: 'Manrope', sans-serif; }
  .auth-feature-dot { width: 7px; height: 7px; background: var(--primary); border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 8px rgba(61,156,176,0.6); }
  .auth-right { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 56px; background: var(--white); }
  .auth-form-container { width: 100%; max-width: 400px; }
  .auth-form-title { font-size: 28px; font-weight: 800; color: var(--navy); margin-bottom: 6px; font-family: 'Montserrat', sans-serif; }
  .auth-form-sub { color: var(--slate); font-size: 13px; margin-bottom: 36px; font-family: 'Manrope', sans-serif; }

  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 11px; font-weight: 700; color: var(--slate); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.8px; font-family: 'Montserrat', sans-serif; }
  .form-input { width: 100%; padding: 13px 16px; border: 1.5px solid #dce8eb; border-radius: 10px; font-size: 14px; font-family: 'Manrope', sans-serif; color: var(--navy); background: var(--bg); transition: all 0.2s; outline: none; }
  .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(61,156,176,0.12); background: white; }
  .form-select { width: 100%; padding: 13px 16px; border: 1.5px solid #dce8eb; border-radius: 10px; font-size: 14px; font-family: 'Manrope', sans-serif; color: var(--navy); background: var(--bg); outline: none; transition: all 0.2s; cursor: pointer; }
  .form-select:focus { border-color: var(--primary); }
  .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .consent-box { background: var(--primary-pale); border: 1.5px solid var(--secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px; }
  .consent-title { font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 8px; font-family: 'Montserrat', sans-serif; }
  .consent-text { font-size: 12px; color: var(--slate); line-height: 1.7; margin-bottom: 12px; font-family: 'Manrope', sans-serif; }
  .consent-check { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
  .consent-check input { margin-top: 2px; accent-color: var(--primary); width: 16px; height: 16px; flex-shrink: 0; }
  .consent-check-label { font-size: 12px; color: var(--navy); font-family: 'Manrope', sans-serif; line-height: 1.6; }
  .consent-check-label span { color: var(--primary); font-weight: 700; cursor: pointer; }

  .btn { padding: 13px 22px; border-radius: 10px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
  .btn-primary { background: var(--primary); color: white; width: 100%; justify-content: center; letter-spacing: 0.3px; }
  .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(61,156,176,0.35); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-outline { background: transparent; color: var(--primary); border: 1.5px solid var(--primary); }
  .btn-outline:hover { background: var(--primary-pale); }
  .btn-sm { padding: 8px 16px; font-size: 12px; border-radius: 8px; width: auto; }
  .btn-ghost { background: transparent; color: var(--slate); border: none; font-family: 'Manrope', sans-serif; }
  .btn-ghost:hover { color: var(--primary); background: var(--primary-pale); }

  .auth-tabs { display: flex; margin-bottom: 28px; border: 1.5px solid #dce8eb; border-radius: 10px; overflow: hidden; }
  .auth-tab { flex: 1; padding: 11px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13px; background: var(--white); color: var(--slate); cursor: pointer; border: none; transition: all 0.2s; }
  .auth-tab.active { background: var(--primary); color: white; }

  .verify-screen { text-align: center; padding: 24px 0; }
  .verify-title { font-size: 22px; font-weight: 800; color: var(--navy); margin-bottom: 8px; font-family: 'Montserrat', sans-serif; }
  .verify-sub { color: var(--slate); font-size: 13px; margin-bottom: 28px; line-height: 1.7; font-family: 'Manrope', sans-serif; }
  .otp-inputs { display: flex; gap: 8px; justify-content: center; margin-bottom: 24px; }
  .otp-input { width: 46px; height: 54px; text-align: center; font-size: 22px; font-weight: 700; border: 1.5px solid #dce8eb; border-radius: 10px; font-family: 'Montserrat', sans-serif; color: var(--navy); background: var(--bg); outline: none; transition: all 0.2s; }
  .otp-input:focus { border-color: var(--primary); }

  .main-layout { display: flex; min-height: 100vh; }
  .sidebar { width: 240px; min-height: 100vh; background: #ffffff; border-right: 1px solid #e8eef0; display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; }
  .sidebar-logo { padding: 20px 16px; border-bottom: 1px solid #e8eef0; display: flex; align-items: center; gap: 10px; }
  .sidebar-logo-icon { width: 32px; height: 32px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: white; font-family: 'Montserrat', sans-serif; }
  .sidebar-logo-img { height: 32px; width: auto; object-fit: contain; }
  .sidebar-logo-name { font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 800; color: var(--navy); line-height: 1.2; }
  .sidebar-logo-tag { font-size: 9px; color: var(--slate); font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; }
  .sidebar-nav { flex: 1; padding: 12px 10px; overflow-y: auto; }
  .sidebar-section-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--slate-light); padding: 8px 8px 4px; margin-top: 12px; font-family: 'Montserrat', sans-serif; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 9px; cursor: pointer; color: var(--slate); font-size: 13px; font-weight: 600; transition: all 0.18s; margin-bottom: 2px; font-family: 'Manrope', sans-serif; }
  .nav-item:hover { background: var(--primary-pale); color: var(--primary); }
  .nav-item.active { background: var(--primary-pale); color: var(--primary); font-weight: 700; border-left: 3px solid var(--primary); }
  .nav-icon { width: 26px; height: 26px; border-radius: 7px; background: var(--bg2); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; flex-shrink: 0; font-family: 'Montserrat', sans-serif; color: var(--slate); }
  .nav-item.active .nav-icon { background: var(--primary); color: white; }
  .sidebar-footer { padding: 12px 10px; border-top: 1px solid #e8eef0; }
  .sidebar-user { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 9px; cursor: pointer; transition: all 0.2s; }
  .sidebar-user:hover { background: var(--bg2); }
  .sidebar-avatar { width: 32px; height: 32px; border-radius: 8px; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 12px; flex-shrink: 0; font-family: 'Montserrat', sans-serif; overflow: hidden; }
  .sidebar-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .sidebar-user-name { font-size: 13px; font-weight: 600; color: var(--navy); font-family: 'Manrope', sans-serif; }
  .sidebar-user-role { font-size: 10px; color: var(--slate); font-family: 'Manrope', sans-serif; }
  .logout-btn { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 9px; cursor: pointer; color: var(--slate); font-size: 12px; font-weight: 600; transition: all 0.2s; background: none; border: none; width: 100%; font-family: 'Manrope', sans-serif; margin-top: 4px; }
  .logout-btn:hover { background: #fee2e2; color: var(--danger); }

  .main-content { margin-left: 240px; flex: 1; padding: 26px 30px; background: var(--bg); min-height: 100vh; }
  .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
  .page-title { font-size: 24px; font-weight: 800; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .page-sub { font-size: 13px; color: var(--slate); margin-top: 2px; font-family: 'Manrope', sans-serif; }

  .card { background: white; border-radius: 14px; padding: 20px; box-shadow: var(--card-shadow); transition: box-shadow 0.2s; border: 1px solid #eef2f4; }
  .card:hover { box-shadow: var(--card-shadow-hover); }
  .card-title { font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 4px; font-family: 'Montserrat', sans-serif; }
  .card-sub { font-size: 12px; color: var(--slate); font-family: 'Manrope', sans-serif; }

  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: white; border-radius: 16px; padding: 20px; box-shadow: var(--card-shadow); border-left: 3px solid var(--primary); }
  .stat-tag { display: inline-block; padding: 3px 9px; border-radius: 5px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; font-family: 'Montserrat', sans-serif; }
  .stat-value { font-size: 26px; font-weight: 800; font-family: 'Montserrat', sans-serif; color: var(--navy); }
  .stat-label { font-size: 12px; color: var(--slate); margin-top: 3px; font-family: 'Manrope', sans-serif; }
  .stat-change { font-size: 11px; font-weight: 600; margin-top: 6px; font-family: 'Manrope', sans-serif; }
  .stat-change.up { color: var(--success); }
  .stat-change.down { color: var(--danger); }

  .wallet-card { background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 50%, var(--primary-dark) 100%); border-radius: 20px; padding: 28px; color: white; position: relative; overflow: hidden; }
  .wallet-card::before { content: ''; position: absolute; top: -50px; right: -30px; width: 180px; height: 180px; border-radius: 50%; background: rgba(61,156,176,0.15); }
  .wallet-card::after { content: ''; position: absolute; bottom: -40px; left: 20px; width: 120px; height: 120px; border-radius: 50%; background: rgba(152,183,185,0.1); }
  .wallet-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.6; margin-bottom: 6px; font-family: 'Montserrat', sans-serif; }
  .wallet-amount { font-size: 38px; font-weight: 800; font-family: 'Montserrat', sans-serif; position: relative; z-index: 1; }
  .wallet-id { font-size: 12px; opacity: 0.5; margin-top: 4px; letter-spacing: 2px; font-family: 'Manrope', sans-serif; }
  .wallet-actions { display: flex; gap: 10px; margin-top: 24px; position: relative; z-index: 1; }
  .wallet-btn { flex: 1; padding: 11px; border-radius: 10px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer; border: none; transition: all 0.2s; letter-spacing: 0.3px; }
  .wallet-btn-primary { background: var(--primary); color: white; }
  .wallet-btn-primary:hover { background: var(--primary-light); }
  .wallet-btn-outline { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
  .wallet-btn-outline:hover { background: rgba(255,255,255,0.18); }

  .txn-list { display: flex; flex-direction: column; gap: 10px; }
  .txn-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; background: var(--bg); transition: background 0.2s; cursor: pointer; }
  .txn-item:hover { background: var(--primary-pale); }
  .txn-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; font-family: 'Montserrat', sans-serif; }
  .txn-info { flex: 1; }
  .txn-name { font-size: 13px; font-weight: 600; color: var(--navy); font-family: 'Manrope', sans-serif; }
  .txn-date { font-size: 11px; color: var(--slate); margin-top: 1px; font-family: 'Manrope', sans-serif; }
  .txn-amount { font-size: 14px; font-weight: 700; font-family: 'Montserrat', sans-serif; }
  .txn-amount.credit { color: var(--success); }
  .txn-amount.debit { color: var(--danger); }

  .dashboard-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }

  .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 16px; }
  .doctor-card { background: white; border-radius: 16px; padding: 18px; box-shadow: var(--card-shadow); transition: all 0.2s; }
  .doctor-card:hover { transform: translateY(-2px); box-shadow: var(--card-shadow-hover); }
  .doctor-avatar { width: 54px; height: 54px; border-radius: 14px; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: white; flex-shrink: 0; font-family: 'Montserrat', sans-serif; }
  .doctor-name { font-size: 15px; font-weight: 700; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .doctor-specialty { font-size: 12px; color: var(--primary); font-weight: 600; margin-top: 2px; font-family: 'Manrope', sans-serif; }
  .doctor-rating { font-size: 12px; font-weight: 600; color: var(--warning); margin-top: 3px; font-family: 'Manrope', sans-serif; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 5px; }
  .status-dot.online { background: var(--success); }
  .status-dot.offline { background: var(--slate-light); }
  .doctor-call-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-top: 10px; }
  .call-btn { padding: 9px; border-radius: 9px; font-size: 11px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; font-family: 'Montserrat', sans-serif; }
  .call-btn-video { background: var(--primary-pale); color: var(--primary-dark); }
  .call-btn-video:hover { background: var(--primary); color: white; }
  .call-btn-audio { background: #dcfce7; color: #166534; }
  .call-btn-audio:hover { background: var(--success); color: white; }
  .call-btn-chat { background: #eff6ff; color: #1d4ed8; }
  .call-btn-chat:hover { background: #3b82f6; color: white; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(15,31,46,0.75); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
  .modal { background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 70px rgba(0,0,0,0.25); }
  .modal-header { padding: 22px 26px; border-bottom: 1px solid #eef2f5; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: white; z-index: 1; border-radius: 20px 20px 0 0; }
  .modal-title { font-size: 20px; font-weight: 800; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .modal-close { width: 34px; height: 34px; border-radius: 9px; border: none; background: var(--bg); cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; color: var(--slate); font-weight: 700; transition: all 0.2s; }
  .modal-close:hover { background: #fee2e2; color: var(--danger); }
  .modal-body { padding: 26px; }

  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; font-family: 'Manrope', sans-serif; }
  .badge-success { background: #dcfce7; color: #16a34a; }
  .badge-warning { background: #fef9c3; color: #ca8a04; }
  .badge-danger { background: #fee2e2; color: #dc2626; }
  .badge-info { background: #eff6ff; color: #2563eb; }

  .schedule-list { display: flex; flex-direction: column; gap: 10px; }
  .appt-item { background: white; border-radius: 14px; padding: 14px 18px; box-shadow: var(--card-shadow); display: flex; gap: 14px; align-items: center; }
  .appt-time-val { font-size: 16px; font-weight: 800; font-family: 'Montserrat', sans-serif; color: var(--primary); }
  .appt-time-date { font-size: 10px; color: var(--slate); font-family: 'Manrope', sans-serif; }
  .appt-divider { width: 1.5px; height: 36px; background: var(--primary-pale); flex-shrink: 0; }
  .appt-title { font-size: 14px; font-weight: 700; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .appt-doctor { font-size: 12px; color: var(--slate); margin-top: 1px; font-family: 'Manrope', sans-serif; }

  .tab-bar { display: flex; border-bottom: 1.5px solid #eef2f5; margin-bottom: 20px; }
  .tab-btn { padding: 11px 18px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13px; background: none; border: none; cursor: pointer; color: var(--slate); border-bottom: 2.5px solid transparent; margin-bottom: -1.5px; transition: all 0.2s; }
  .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

  .toggle { width: 42px; height: 23px; background: var(--primary); border-radius: 12px; cursor: pointer; position: relative; flex-shrink: 0; transition: background 0.2s; }
  .toggle.off { background: #dce8eb; }
  .toggle-thumb { position: absolute; right: 2px; top: 2px; width: 19px; height: 19px; background: white; border-radius: 50%; transition: all 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
  .toggle.off .toggle-thumb { right: auto; left: 2px; }

  .notif-bell { position: relative; cursor: pointer; width: 36px; height: 36px; border-radius: 9px; background: var(--bg2); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.2s; }
  .notif-bell:hover { background: var(--primary-pale); border-color: var(--primary); }
  .notif-badge { position: absolute; top: -5px; right: -5px; width: 18px; height: 18px; border-radius: 50%; background: var(--danger); color: white; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; font-family: 'Montserrat', sans-serif; }
  .notif-dropdown { position: absolute; top: 44px; right: 0; width: 320px; background: white; border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); border: 1px solid var(--border); z-index: 500; overflow: hidden; }
  .notif-header { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .notif-title { font-size: 13px; font-weight: 700; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .notif-item { padding: 12px 16px; border-bottom: 1px solid #f5f7f8; cursor: pointer; transition: background 0.2s; }
  .notif-item:hover { background: var(--bg); }
  .notif-item.unread { background: var(--primary-pale); border-left: 3px solid var(--primary); }
  .notif-item-title { font-size: 13px; font-weight: 700; color: var(--navy); font-family: 'Montserrat', sans-serif; margin-bottom: 2px; }
  .notif-item-msg { font-size: 12px; color: var(--slate); font-family: 'Manrope', sans-serif; line-height: 1.5; }
  .notif-item-time { font-size: 10px; color: var(--slate-light); margin-top: 4px; font-family: 'Manrope', sans-serif; }
  .notif-empty { padding: 32px 16px; text-align: center; color: var(--slate); font-size: 13px; font-family: 'Manrope', sans-serif; }

  .dependents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 16px; margin-bottom: 20px; }
  .dependent-card { background: white; border-radius: 16px; padding: 20px; box-shadow: var(--card-shadow); transition: all 0.2s; position: relative; overflow: hidden; }
  .dependent-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--primary); }
  .dependent-card:hover { transform: translateY(-3px); box-shadow: var(--card-shadow-hover); }
  .dependent-avatar { width: 48px; height: 48px; border-radius: 12px; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: white; margin-bottom: 12px; font-family: 'Montserrat', sans-serif; }
  .dependent-name { font-size: 15px; font-weight: 700; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .dependent-id { font-size: 10px; color: var(--primary); font-weight: 600; letter-spacing: 0.5px; margin-top: 2px; font-family: 'Manrope', sans-serif; }
  .dependent-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
  .dependent-meta-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--slate-light); font-weight: 700; font-family: 'Montserrat', sans-serif; }
  .dependent-meta-value { font-size: 13px; font-weight: 600; color: var(--navy); margin-top: 1px; font-family: 'Manrope', sans-serif; }

  .upload-zone { border: 2px dashed #b0cccf; border-radius: 14px; padding: 36px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 20px; }
  .upload-zone:hover { border-color: var(--primary); background: var(--primary-pale); }

  .profile-photo-upload { position: relative; width: 100px; height: 100px; cursor: pointer; }
  .profile-photo { width: 100px; height: 100px; border-radius: 20px; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: white; overflow: hidden; font-family: 'Montserrat', sans-serif; }
  .profile-photo img { width: 100%; height: 100%; object-fit: cover; }
  .profile-photo-overlay { position: absolute; inset: 0; border-radius: 20px; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; font-size: 11px; font-weight: 700; color: white; font-family: 'Montserrat', sans-serif; }
  .profile-photo-upload:hover .profile-photo-overlay { opacity: 1; }
  .profile-name { font-size: 22px; font-weight: 800; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .profile-id { font-size: 11px; color: var(--primary); font-weight: 600; letter-spacing: 1px; margin-top: 3px; font-family: 'Manrope', sans-serif; }
  .profile-tags { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .profile-tag { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: var(--primary-pale); color: var(--primary-dark); font-family: 'Manrope', sans-serif; }

  .id-card { background: linear-gradient(135deg, var(--navy) 0%, var(--primary-dark) 100%); border-radius: 18px; padding: 24px; color: white; position: relative; overflow: hidden; }
  .id-card::before { content: ''; position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; border-radius: 50%; background: rgba(61,156,176,0.2); }
  .id-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; position: relative; z-index: 1; }
  .id-card-logo { font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 800; color: white; }
  .id-card-logo-sub { font-size: 8px; color: var(--secondary); letter-spacing: 1px; text-transform: uppercase; }
  .id-card-type { font-size: 9px; background: rgba(255,255,255,0.15); padding: 3px 8px; border-radius: 20px; letter-spacing: 0.5px; font-family: 'Manrope', sans-serif; }
  .id-card-body { display: flex; gap: 16px; align-items: flex-start; position: relative; z-index: 1; }
  .id-card-photo { width: 64px; height: 64px; border-radius: 12px; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3); overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; font-family: 'Montserrat', sans-serif; }
  .id-card-photo img { width: 100%; height: 100%; object-fit: cover; }
  .id-card-name { font-size: 16px; font-weight: 800; font-family: 'Montserrat', sans-serif; margin-bottom: 4px; }
  .id-card-id { font-size: 10px; color: var(--secondary-light); letter-spacing: 1.5px; font-family: 'Manrope', sans-serif; margin-bottom: 8px; }
  .id-card-details { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .id-card-detail-label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.5); font-family: 'Montserrat', sans-serif; }
  .id-card-detail-value { font-size: 11px; font-weight: 600; color: white; font-family: 'Manrope', sans-serif; }
  .id-card-footer { margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.15); display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
  .id-card-valid { font-size: 9px; color: rgba(255,255,255,0.5); font-family: 'Manrope', sans-serif; text-align: right; }

  .health-score-card { background: linear-gradient(135deg, #e8f6f9 0%, #d4eef2 100%); border-radius: 16px; padding: 20px; border: 1.5px solid var(--secondary); }
  .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .quick-action { background: white; border-radius: 14px; padding: 18px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: var(--card-shadow); border: 1.5px solid transparent; }
  .quick-action:hover { border-color: var(--primary); transform: translateY(-2px); }
  .quick-action-icon { width: 36px; height: 36px; border-radius: 9px; background: var(--primary-pale); display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 10px; font-weight: 700; color: var(--primary-dark); font-family: 'Montserrat', sans-serif; }
  .quick-action-label { font-size: 12px; font-weight: 600; color: var(--navy); font-family: 'Manrope', sans-serif; }

  .claims-table { width: 100%; border-collapse: collapse; }
  .claims-table th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--slate-light); font-weight: 700; padding: 11px 14px; text-align: left; border-bottom: 1.5px solid #eef2f5; font-family: 'Montserrat', sans-serif; }
  .claims-table td { padding: 13px 14px; border-bottom: 1px solid #f8fafc; font-size: 13px; color: var(--navy); vertical-align: middle; font-family: 'Manrope', sans-serif; }
  .claims-table tr:hover td { background: var(--bg); }

  .balance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .balance-card { background: white; border-radius: 16px; padding: 22px; box-shadow: var(--card-shadow); border: 1px solid #eef2f4; position: relative; overflow: hidden; }
  .balance-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 16px 16px 0 0; }
  .balance-card.available::before { background: var(--primary); }
  .balance-card.investment::before { background: rgb(190, 92, 246); }
  .balance-card.total::before { background: var(--success); }

  @media (max-width: 1100px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .dashboard-grid { grid-template-columns: 1fr; }
    .balance-grid { grid-template-columns: 1fr; gap: 10px; }
  }
  @media (max-width: 900px) {
    .auth-screen { grid-template-columns: 1fr !important; }
    .auth-left { display: none !important; }
    .auth-right { padding: 32px 24px !important; min-height: 100vh !important; }
    .auth-form-container { max-width: 100% !important; }
    .sidebar { transform: translateX(-100%) !important; transition: transform 0.3s ease !important; z-index: 200 !important; }
    .sidebar.mobile-open { transform: translateX(0) !important; }
    .main-content { margin-left: 0 !important; padding: 16px !important; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .dashboard-grid { grid-template-columns: 1fr; }
    .form-grid-2 { grid-template-columns: 1fr; }
    .doctors-grid { grid-template-columns: 1fr; }
    .dependents-grid { grid-template-columns: 1fr; }
    .topbar { flex-direction: column; align-items: flex-start; gap: 12px; }
    .modal { width: 95%; max-height: 95vh; }
    .page-title { font-size: 20px; }
    .wallet-amount { font-size: 28px; }
    .wallet-actions { flex-wrap: wrap; }
    .mobile-menu-btn { display: flex !important; }
    .balance-grid { grid-template-columns: 1fr; gap: 10px; }
  }
  body { --rebuild: 1; }
`;

export function generateSpanID(name) {
  const prefix = 'SPN';
  const year = new Date().getFullYear().toString().slice(-2);
  const nameCode = name ? name.slice(0, 2).toUpperCase() : 'XX';
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${year}-${nameCode}-${rand}`;
}

export function Barcode() {
  const heights = [14, 10, 16, 8, 14, 12, 16, 10, 14, 8, 12, 16, 10, 14, 8];
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
      {heights.map((h, i) => (
        <div key={i} style={{ width: i % 3 === 0 ? 3 : 1.5, height: h, background: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
      ))}
    </div>
  );
}

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, [userId]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
    setUnreadCount((data || []).filter(n => !n.read).length);
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAllRead };
}

export function NotificationBell({ userId }) {
  const { notifications, unreadCount, markAllRead } = useNotifications(userId);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short' });
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <div className="notif-bell" onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllRead(); }}>
        🔔
        {unreadCount > 0 && <div className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</div>}
      </div>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <div className="notif-title">Notifications</div>
            {unreadCount > 0 && (
              <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontFamily: "'Manrope',sans-serif" }} onClick={markAllRead}>
                Mark all read
              </span>
            )}
          </div>
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`notif-item${!n.read ? ' unread' : ''}`}>
                  <div className="notif-item-title">{n.title}</div>
                  <div className="notif-item-msg">{n.message}</div>
                  <div className="notif-item-time">{formatTime(n.created_at)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ active, onNav, userName, onLogout, mobileOpen }) {
  const sections = [
    { label: '', items: [
      { id: 'dashboard', label: 'Dashboard', short: 'DB' },
      { id: 'wallet', label: 'Wallet', short: 'WL' },
      { id: 'transactions', label: 'Transactions', short: 'TX' },
    ]},
    { label: 'Health', items: [
      { id: 'telemedicine', label: 'Telemedicine', short: 'TM' },
      { id: 'appointments', label: 'Appointments', short: 'AP' },
      { id: 'chat', label: 'Messages', short: 'MSG' },
      { id: 'documents', label: 'Documents', short: 'DOC' },
    ]},
    { label: 'Account', items: [
      { id: 'profile', label: 'My Profile', short: 'PR' },
      { id: 'dependents', label: 'Dependents', short: 'DP' },
      { id: 'settings', label: 'Get Help', short: 'HELP' },
    ]},
  ];
  const initials = userName ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SP';

  return (
    <div className={'sidebar' + (mobileOpen ? ' mobile-open' : '')}>
      <div className="sidebar-logo">
        <img src="/assets/logo.png" alt="Span Healthcare" className="sidebar-logo-img"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div className="sidebar-logo-icon" style={{ display: 'none' }}>SPAN</div>
        <div>
          <div className="sidebar-logo-name">Span Healthcare</div>
          <div className="sidebar-logo-tag">Health Savings</div>
        </div>
      </div>
      <div className="sidebar-nav">
        {sections.map(sec => (
          <div key={sec.label}>
            {sec.label && <div className="sidebar-section-label">{sec.label}</div>}
            {sec.items.map(item => (
              <div key={item.id} className={'nav-item' + (active === item.id ? ' active' : '')} onClick={() => onNav(item.id)}>
                <div className="nav-icon">{item.short}</div>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-user-name">{userName || 'Member'}</div>
            <div className="sidebar-user-role">Principal Member</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(224,82,82,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#e05252', fontFamily: "'Montserrat',sans-serif" }}>OUT</div>
          Log Out
        </button>
      </div>
    </div>
  );
}

export function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email) { setError('Please enter your email address'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Reset Password</div>
          <button className="modal-close" onClick={onClose}>X</button>
        </div>
        <div className="modal-body">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>✓</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", marginBottom: 8 }}>Email Sent!</div>
              <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.7, fontFamily: "'Manrope',sans-serif" }}>
                We sent a reset link to <strong>{email}</strong>.
              </div>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 20, lineHeight: 1.7, fontFamily: "'Manrope',sans-serif" }}>
                Enter your email and we will send you a reset link.
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
              </div>
              {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSend} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function PasswordResetModal({ onClose }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!password) { setError('Please enter a new password'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Reset session expired. Please request a new reset link.');
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      setTimeout(() => { onClose(); window.location.href = '/'; }, 2000);
    } catch(e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><div className="modal-title">Set New Password</div></div>
        <div className="modal-body">
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>✓</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", marginBottom: 8 }}>Password Updated!</div>
              <div style={{ fontSize: 13, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>Redirecting you now...</div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="Enter new password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" placeholder="Repeat new password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReset()} />
              </div>
              {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{error}</div>}
              <button className="btn btn-primary" onClick={handleReset} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AuthScreen({ onLogin, onDoctorLogin }) {
  const [mode, setMode] = useState('login');
  const [userType, setUserType] = useState('patient');
  const [step, setStep] = useState(1);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [form, setForm] = useState({
    email: '', phone: '', name: '', password: '', confirmPassword: '',
    dob: '', sex: 'Male', specialty: '', experience_years: '', bio: ''
  });

  const SPECIALTIES = [
    'General Practitioner', 'Cardiologist', 'Pediatrician', 'Dermatologist',
    'Gynecologist', 'Dentist', 'Orthopedist', 'Neurologist', 'Psychiatrist',
    'Ophthalmologist', 'ENT Specialist', 'Urologist', 'Oncologist', 'Other'
  ];

  const next = async () => {
    setError('');
    if (userType === 'patient' && mode === 'register' && step === 1) {
      if (!form.name || !form.email) { setError('Please fill in your name and email'); return; }
      setStep(2); return;
    }
    if (userType === 'patient' && mode === 'register' && step === 2) {
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
      if (!consent) { setError('Please accept the terms to continue'); return; }
      setLoading(true);
      const result = await registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password, dob: form.dob, sex: form.sex });
      setLoading(false);
      if (!result.success) { setError(result.error); return; }
      onLogin(result.user); return;
    }
    if (userType === 'doctor' && mode === 'register' && step === 1) {
      if (!form.name || !form.email || !form.specialty) { setError('Please fill in all required fields'); return; }
      setStep(2); return;
    }
    if (userType === 'doctor' && mode === 'register' && step === 2) {
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
      if (!consent) { setError('Please accept the terms to continue'); return; }
      setLoading(true);
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password });
        if (authError) throw authError;
        const { error: profileError } = await supabase.from('doctors').insert({
          user_id: authData.user.id, full_name: form.name, email: form.email, phone: form.phone,
          specialty: form.specialty, bio: form.bio, experience_years: parseInt(form.experience_years) || 0,
          status: 'pending', is_available: false,
        });
        if (profileError) throw profileError;
      } catch(e) { setLoading(false); setError(e.message); return; }
      setLoading(false); setStep(3); return;
    }
    if (userType === 'patient' && mode === 'login') {
      if (!form.email || !form.password) { setError('Please enter your email and password'); return; }
      setLoading(true);
      const result = await loginUser({ email: form.email, password: form.password });
      setLoading(false);
      if (!result.success) { setError(result.error); return; }
      const { data: doctorCheck } = await supabase.from('doctors').select('id').eq('user_id', result.user.id).maybeSingle();
      if (doctorCheck) { await supabase.auth.signOut(); setError('This account is registered as a doctor. Please use the Doctor login.'); return; }
      onLogin(result.user); return;
    }
    if (userType === 'doctor' && mode === 'login') {
      if (!form.email || !form.password) { setError('Please enter your email and password'); return; }
      setLoading(true);
      try {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (loginError) throw loginError;
        const { data: doctorData, error: docError } = await supabase.from('doctors').select('*').eq('user_id', data.user.id).maybeSingle();
        if (docError || !doctorData) throw new Error('No doctor profile found for this account');
        if (doctorData.status === 'pending') throw new Error('Your account is pending approval.');
        if (doctorData.status === 'rejected') throw new Error('Your application was not approved. Please contact support.');
        setLoading(false);
        onDoctorLogin(data.user, doctorData);
      } catch(e) { setLoading(false); setError(e.message); }
      return;
    }
    onLogin();
  };

  const switchUserType = (type) => {
    setUserType(type); setStep(1); setError('');
    setForm({ email: '', phone: '', name: '', password: '', confirmPassword: '', dob: '', sex: 'Male', specialty: '', experience_years: '', bio: '' });
  };

  return (
    <div className="auth-screen">
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      <div className="auth-left">
        <div className="auth-logo">
          <img src="/assets/logo.png" alt="Span Healthcare" className="auth-logo-img"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          <div className="auth-logo-icon" style={{ display: 'none' }}>SPAN</div>
        </div>
        <div className="auth-headline">
          {userType === 'doctor' ? <>Join as a<br /><span>Healthcare</span><br />Professional.</> : <>Your Health,<br /><span>Your Savings,</span><br />One Platform.</>}
        </div>
        <div className="auth-sub">
          {userType === 'doctor'
            ? 'Register as a doctor on Span Healthcare. Reach patients, manage consultations, and grow your practice digitally.'
            : 'A complete health finance ecosystem. Save for healthcare, consult doctors instantly, and manage your family health records seamlessly.'}
        </div>
        <div className="auth-features">
          {(userType === 'doctor' ? [
            'Set your availability and specialties',
            'Video, audio and chat consultations',
            'Competitive consultation earnings per session',
            'Manage appointments from your dashboard',
            'Pending approval before going live',
          ] : [
            'Health Savings Wallet — save anytime',
            'Telemedicine via video, audio and chat',
            'Family profile and dependent management',
            'Wellness tracking and health scoring',
            'Secure medical document vault',
          ]).map(f => (
            <div key={f} className="auth-feature"><div className="auth-feature-dot" />{f}</div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, border: '1.5px solid #dce8eb', borderRadius: 10, overflow: 'hidden' }}>
            {['patient', 'doctor'].map(t => (
              <button key={t} onClick={() => switchUserType(t)}
                style={{ flex: 1, padding: '10px', fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: userType === t ? 'var(--primary)' : 'white', color: userType === t ? 'white' : 'var(--slate)' }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {step === 3 ? (
            <div className="verify-screen">
              <div style={{ width: 72, height: 72, borderRadius: 18, background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontWeight: 800, fontSize: 15, color: 'var(--primary)', fontFamily: "'Montserrat',sans-serif" }}>
                {userType === 'doctor' ? 'PEND' : 'OTP'}
              </div>
              {userType === 'doctor' ? (
                <>
                  <div className="verify-title">Application Submitted</div>
                  <div className="verify-sub">Your profile has been submitted for review.<br /><strong>You will receive an email once approved.</strong></div>
                  <button className="btn btn-primary" onClick={() => { setStep(1); setMode('login'); }}>Back to Login</button>
                </>
              ) : (
                <>
                  <div className="verify-title">Verify your account</div>
                  <div className="verify-sub">We sent a 6-digit code to<br /><strong>{form.email}</strong></div>
                  <div className="otp-inputs">
                    {[0,1,2,3,4,5].map(i => <input key={i} className="otp-input" maxLength={1} type="text" />)}
                  </div>
                  <button className="btn btn-primary" onClick={onLogin}>Verify and Continue</button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="auth-form-title">
                {mode === 'login' ? (userType === 'doctor' ? 'Doctor Login' : 'Welcome back') : (userType === 'doctor' ? 'Doctor Registration' : 'Create account')}
              </div>
              <div className="auth-form-sub">
                {mode === 'login' ? (userType === 'doctor' ? 'Access your doctor dashboard' : 'Log in to your Span Healthcare dashboard') : (step === 1 ? 'Step 1 of 2 - Personal details' : 'Step 2 of 2 - Set your password')}
              </div>
              <div className="auth-tabs">
                <button className={'auth-tab' + (mode === 'login' ? ' active' : '')} onClick={() => { setMode('login'); setStep(1); setError(''); }}>Log In</button>
                <button className={'auth-tab' + (mode === 'register' ? ' active' : '')} onClick={() => { setMode('register'); setStep(1); setError(''); }}>Register</button>
              </div>

              {userType === 'patient' && mode === 'register' && step === 1 && <>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="e.g. Emeka Okafor" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" type="tel" placeholder="+234 8XX XXX XXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Sex</label><select className="form-select" value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}><option>Male</option><option>Female</option><option>Prefer not to say</option></select></div>
              </>}

              {userType === 'doctor' && mode === 'register' && step === 1 && <>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="Dr. First Last" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="doctor@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" type="tel" placeholder="+234 8XX XXX XXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Specialty</label>
                  <select className="form-select" value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}>
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Years of Experience</label><input className="form-input" type="number" placeholder="e.g. 8" value={form.experience_years} onChange={e => setForm({ ...form, experience_years: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Short Bio</label><textarea className="form-input" rows={3} placeholder="Brief description of your practice..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
              </>}

              {mode === 'register' && step === 2 && <>
                <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Create a strong password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} /></div>
                <div className="consent-box">
                  <div className="consent-title">Data Protection and Consent</div>
                  <div className="consent-text">
                    {userType === 'doctor' ? 'By registering as a doctor you agree to our platform terms and patient data protection policies under NDPR.' : 'Span Healthcare processes your data in accordance with NDPR.'}
                  </div>
                  <label className="consent-check">
                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                    <span className="consent-check-label">I agree to the <span>Terms of Service</span>, <span>Privacy Policy</span>, and <span>Data Protection Policy</span>.</span>
                  </label>
                </div>
              </>}

              {mode === 'login' && <>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Enter password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                <p style={{ textAlign: 'right', marginBottom: 18, fontSize: 12, fontFamily: "'Manrope',sans-serif" }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setShowForgot(true)}>Forgot password?</span>
                </p>
              </>}

              {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{error}</div>}
              <button className="btn btn-primary" onClick={next} disabled={loading || (mode === 'register' && step === 2 && !consent)}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : step === 1 ? 'Continue' : userType === 'doctor' ? 'Submit Application' : 'Create Account'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
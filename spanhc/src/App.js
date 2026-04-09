import "./App.css";
import { useState, useRef, useEffect } from "react";
import { registerUser, loginUser, logoutUser, getCurrentUser, getProfile, getWallet, getTransactions, updateProfile, uploadAvatar } from './Auth';
import { supabase } from './supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AGORA_APP_ID = '5e972a5ba048430980f63dd3a549880b';

const styles = `
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
--bg: #f5f7f8;
--bg2: #eef1f3;
  }

  body { font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--navy); }
  h1,h2,h3,h4,h5 { font-family: 'Montserrat', sans-serif; }

  .app { display: flex; flex-direction: column; min-height: 100vh; }

 .auth-screen { min-height: 100vh; display: grid; grid-template-columns: 1.1fr 0.9fr; background: var(--white); }
  @media (max-width: 900px) {
    .auth-screen { grid-template-columns: 1fr !important; }
    .auth-left { display: none !important; }
    .auth-right { padding: 32px 24px !important; }
  }
    @media (max-width: 900px) {
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

  .divider { display: flex; align-items: center; gap: 14px; margin: 20px 0; }
  .divider-line { flex: 1; height: 1px; background: #dce8eb; }
  .divider-text { color: var(--slate-light); font-size: 12px; font-family: 'Manrope', sans-serif; }

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
.nav-item:hover .nav-icon { background: var(--primary-pale2); color: var(--primary); }
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

  .card { background: white; border-radius: 14px; padding: 20px; box-shadow: var(--card-shadow); transition: box-shadow 0.2s; border: 1px solid #eef2f4;}
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

.balance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.balance-card { background: white; border-radius: 16px; padding: 22px; box-shadow: var(--card-shadow); border: 1px solid #eef2f4; position: relative; overflow: hidden; }
.balance-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 16px 16px 0 0; }
.balance-card.available::before { background: var(--primary); }
.balance-card.investment::before { background:rgb(190, 92, 246); }
.balance-card.total::before { background: var(--success); }
.balance-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--slate); font-family: 'Montserrat', sans-serif; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.balance-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.balance-amount { font-size: 24px; font-weight: 800; font-family: 'Montserrat', sans-serif; color: var(--navy); }
.balance-sub { font-size: 11px; color: var(--slate); margin-top: 5px; font-family: 'Manrope', sans-serif; line-height: 1.5; }

@media (max-width: 900px) {
  .balance-grid { grid-template-columns: 1fr; gap: 10px; }
}
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

  .health-score-card { background: linear-gradient(135deg, #e8f6f9 0%, #d4eef2 100%); border-radius: 16px; padding: 20px; border: 1.5px solid var(--secondary); }
  .health-score-value { font-size: 44px; font-weight: 800; font-family: 'Montserrat', sans-serif; color: var(--primary); }
  .health-score-bar { height: 6px; background: rgba(61,156,176,0.2); border-radius: 3px; overflow: hidden; margin-top: 10px; }
  .health-score-fill { height: 100%; background: var(--primary); border-radius: 3px; }

  .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .quick-action { background: white; border-radius: 14px; padding: 18px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: var(--card-shadow); border: 1.5px solid transparent; }
  .quick-action:hover { border-color: var(--primary); transform: translateY(-2px); }
  .quick-action-icon { width: 36px; height: 36px; border-radius: 9px; background: var(--primary-pale); display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 10px; font-weight: 700; color: var(--primary-dark); font-family: 'Montserrat', sans-serif; }
  .quick-action-label { font-size: 12px; font-weight: 600; color: var(--navy); font-family: 'Manrope', sans-serif; }

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

  .profile-photo-upload { position: relative; width: 100px; height: 100px; cursor: pointer; }
  .profile-photo { width: 100px; height: 100px; border-radius: 20px; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: white; overflow: hidden; font-family: 'Montserrat', sans-serif; }
  .profile-photo img { width: 100%; height: 100%; object-fit: cover; }
  .profile-photo-overlay { position: absolute; inset: 0; border-radius: 20px; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; font-size: 11px; font-weight: 700; color: white; font-family: 'Montserrat', sans-serif; }
  .profile-photo-upload:hover .profile-photo-overlay { opacity: 1; }
  .profile-name { font-size: 22px; font-weight: 800; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .profile-id { font-size: 11px; color: var(--primary); font-weight: 600; letter-spacing: 1px; margin-top: 3px; font-family: 'Manrope', sans-serif; }
  .profile-tags { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
  .profile-tag { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: var(--primary-pale); color: var(--primary-dark); font-family: 'Manrope', sans-serif; }
  .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

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

  .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 16px; }
  .doctor-card { background: white; border-radius: 16px; padding: 18px; box-shadow: var(--card-shadow); transition: all 0.2s; }
  .doctor-card:hover { transform: translateY(-2px); box-shadow: var(--card-shadow-hover); }
  .doctor-avatar { width: 54px; height: 54px; border-radius: 14px; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: white; flex-shrink: 0; font-family: 'Montserrat', sans-serif; }
  .doctor-name { font-size: 15px; font-weight: 700; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .doctor-specialty { font-size: 12px; color: var(--primary); font-weight: 600; margin-top: 2px; font-family: 'Manrope', sans-serif; }
  .doctor-rating { font-size: 12px; font-weight: 600; color: var(--warning); margin-top: 3px; font-family: 'Manrope', sans-serif; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 5px; }
  .status-dot.online { background: var(--success); }
  .status-dot.busy { background: var(--warning); }
  .status-dot.offline { background: var(--slate-light); }
  .doctor-tags { display: flex; gap: 5px; flex-wrap: wrap; margin: 8px 0; }
  .doctor-tag { padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; background: var(--bg); color: var(--slate); font-family: 'Manrope', sans-serif; }
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

  .chat-layout { display: grid; grid-template-columns: 280px 1fr; border-radius: 16px; overflow: hidden; background: white; box-shadow: var(--card-shadow); }
  .chat-sidebar { border-right: 1px solid #eef2f5; overflow-y: auto; }
  .chat-sidebar-header { padding: 18px; border-bottom: 1px solid #eef2f5; }
  .chat-search { width: 100%; padding: 9px 13px; border: 1.5px solid #dce8eb; border-radius: 9px; font-size: 13px; outline: none; background: var(--bg); transition: border-color 0.2s; font-family: 'Manrope', sans-serif; }
  .chat-search:focus { border-color: var(--primary); }
  .chat-contact { display: flex; gap: 10px; padding: 13px 15px; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #f8fafc; }
  .chat-contact:hover { background: var(--bg); }
  .chat-contact.active { background: var(--primary-pale); border-left: 3px solid var(--primary); }
  .chat-contact-avatar { width: 40px; height: 40px; border-radius: 11px; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--primary); color: white; font-family: 'Montserrat', sans-serif; }
  .chat-contact-name { font-size: 13px; font-weight: 700; color: var(--navy); font-family: 'Manrope', sans-serif; }
  .chat-contact-last { font-size: 11px; color: var(--slate); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Manrope', sans-serif; }
  .chat-contact-time { font-size: 10px; color: var(--slate-light); font-family: 'Manrope', sans-serif; }
  .chat-unread { background: var(--primary); color: white; border-radius: 20px; padding: 2px 6px; font-size: 10px; font-weight: 700; }
  .chat-main { display: flex; flex-direction: column; }
  .chat-header { padding: 14px 18px; border-bottom: 1px solid #eef2f5; display: flex; align-items: center; gap: 10px; }
  .chat-header-actions { margin-left: auto; display: flex; gap: 6px; }
  .chat-action-btn { padding: 7px 11px; border-radius: 9px; border: none; background: var(--bg); cursor: pointer; font-size: 11px; font-weight: 700; transition: all 0.2s; color: var(--navy); font-family: 'Montserrat', sans-serif; }
  .chat-action-btn:hover { background: var(--primary-pale); color: var(--primary); }
  .chat-messages { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 10px; background: var(--bg); min-height: 400px; }
  .chat-msg { max-width: 65%; }
  .chat-msg.sent { align-self: flex-end; }
  .chat-msg.received { align-self: flex-start; }
  .chat-bubble { padding: 11px 15px; border-radius: 14px; font-size: 13px; line-height: 1.6; font-family: 'Manrope', sans-serif; }
  .chat-bubble.sent { background: var(--primary); color: white; border-bottom-right-radius: 3px; }
  .chat-bubble.received { background: white; color: var(--navy); border-bottom-left-radius: 3px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .chat-time { font-size: 9px; color: var(--slate-light); margin-top: 3px; font-family: 'Manrope', sans-serif; }
  .chat-time.sent { text-align: right; }
  .chat-input-area { padding: 14px 18px; border-top: 1px solid #eef2f5; display: flex; gap: 8px; align-items: center; }
  .chat-input { flex: 1; padding: 11px 15px; border: 1.5px solid #dce8eb; border-radius: 10px; font-size: 13px; outline: none; font-family: 'Manrope', sans-serif; transition: border-color 0.2s; }
  .chat-input:focus { border-color: var(--primary); }
  .chat-attach { padding: 9px 12px; border-radius: 9px; border: 1.5px solid #dce8eb; background: white; cursor: pointer; font-size: 11px; font-weight: 700; color: var(--slate); transition: all 0.2s; font-family: 'Montserrat', sans-serif; }
  .chat-attach:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-pale); }

  .documents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px; }
  .doc-card { background: white; border-radius: 14px; padding: 18px; box-shadow: var(--card-shadow); cursor: pointer; transition: all 0.2s; }
  .doc-card:hover { transform: translateY(-2px); box-shadow: var(--card-shadow-hover); }
  .doc-icon { width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; margin-bottom: 10px; font-family: 'Montserrat', sans-serif; }
  .doc-name { font-size: 13px; font-weight: 600; color: var(--navy); font-family: 'Manrope', sans-serif; }
  .doc-meta { font-size: 11px; color: var(--slate); margin-top: 3px; font-family: 'Manrope', sans-serif; }
  .doc-tag { display: inline-block; margin-top: 7px; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; font-family: 'Manrope', sans-serif; }
  .doc-tag.lab { background: #eff6ff; color: #3b82f6; }
  .doc-tag.prescription { background: #ecfdf5; color: var(--success); }
  .doc-tag.report { background: #fef3c7; color: var(--warning); }
  .upload-zone { border: 2px dashed #b0cccf; border-radius: 14px; padding: 36px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 20px; }
  .upload-zone:hover { border-color: var(--primary); background: var(--primary-pale); }

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

  .claims-table { width: 100%; border-collapse: collapse; }
  .claims-table th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--slate-light); font-weight: 700; padding: 11px 14px; text-align: left; border-bottom: 1.5px solid #eef2f5; font-family: 'Montserrat', sans-serif; }
  .claims-table td { padding: 13px 14px; border-bottom: 1px solid #f8fafc; font-size: 13px; color: var(--navy); vertical-align: middle; font-family: 'Manrope', sans-serif; }
  .claims-table tr:hover td { background: var(--bg); }

  .tab-bar { display: flex; border-bottom: 1.5px solid #eef2f5; margin-bottom: 20px; }
  .tab-btn { padding: 11px 18px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13px; background: none; border: none; cursor: pointer; color: var(--slate); border-bottom: 2.5px solid transparent; margin-bottom: -1.5px; transition: all 0.2s; }
  .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

  .time-slots { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
  .time-slot { padding: 9px; border: 1.5px solid #dce8eb; border-radius: 9px; text-align: center; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--navy); transition: all 0.2s; background: white; font-family: 'Manrope', sans-serif; }
  .time-slot:hover { border-color: var(--primary); color: var(--primary); }
  .time-slot.selected { background: var(--primary); border-color: var(--primary); color: white; }

  .settings-section { background: white; border-radius: 16px; padding: 22px; box-shadow: var(--card-shadow); margin-bottom: 16px; }
  .settings-section-title { font-size: 14px; font-weight: 700; color: var(--navy); margin-bottom: 16px; font-family: 'Montserrat', sans-serif; display: flex; align-items: center; gap: 10px; }
  .settings-section-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--primary-pale); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: var(--primary-dark); font-family: 'Montserrat', sans-serif; }
  .settings-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #f4f9fa; }
  .settings-item:last-child { border-bottom: none; padding-bottom: 0; }
  .settings-item-left { flex: 1; }
  .settings-item-label { font-size: 14px; font-weight: 600; color: var(--navy); font-family: 'Manrope', sans-serif; }
  .settings-item-desc { font-size: 11px; color: var(--slate); margin-top: 2px; font-family: 'Manrope', sans-serif; }
  .toggle { width: 42px; height: 23px; background: var(--primary); border-radius: 12px; cursor: pointer; position: relative; flex-shrink: 0; transition: background 0.2s; }
  .toggle.off { background: #dce8eb; }
  .toggle-thumb { position: absolute; right: 2px; top: 2px; width: 19px; height: 19px; background: white; border-radius: 50%; transition: all 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
  .toggle.off .toggle-thumb { right: auto; left: 2px; }
  .settings-action { padding: 7px 14px; border-radius: 8px; border: 1.5px solid #dce8eb; background: white; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--navy); font-family: 'Montserrat', sans-serif; transition: all 0.2s; }
  .settings-action:hover { border-color: var(--primary); color: var(--primary); }
  .settings-action-danger { border-color: #fee2e2; color: var(--danger); }
  .settings-action-danger:hover { background: #fee2e2; }

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
    .documents-grid { grid-template-columns: repeat(2, 1fr); }
    .time-slots { grid-template-columns: repeat(3, 1fr); }
    .quick-actions { grid-template-columns: repeat(2, 1fr); }

    .topbar { flex-direction: column; align-items: flex-start; gap: 12px; }
    .modal { width: 95%; max-height: 95vh; }
    .page-title { font-size: 20px; }
    .wallet-amount { font-size: 28px; }
    .wallet-actions { flex-wrap: wrap; }

    .mobile-menu-btn { display: flex !important; }
  }
/* force rebuild */
body { --rebuild: 1; }
`;

function generateSpanID(name) {
  const prefix = "SPN";
  const year = new Date().getFullYear().toString().slice(-2);
  const nameCode = name ? name.slice(0, 2).toUpperCase() : "XX";
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${year}-${nameCode}-${rand}`;
}

function generateDependentID(relation) {
  const codes = { Spouse: "SP", Son: "SN", Daughter: "DT", Parent: "PR", Sibling: "SB", Other: "OT" };
  const code = codes[relation] || "DP";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DEP-${code}-${rand}`;
}

function Barcode() {
  const heights = [14, 10, 16, 8, 14, 12, 16, 10, 14, 8, 12, 16, 10, 14, 8];
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
      {heights.map((h, i) => (
        <div key={i} style={{ width: i % 3 === 0 ? 3 : 1.5, height: h, background: "rgba(255,255,255,0.5)", borderRadius: 1 }} />
      ))}
    </div>
  );
}

const DOCTORS = [
  { id: 1, name: "Dr. Amira Osei", specialty: "General Practitioner", rating: 4.9, status: "online", initials: "AO", tags: ["Family Medicine", "Preventive Care"], experience: "8 yrs", consultations: 1240, price: 5000 },
  { id: 2, name: "Dr. Chukwuemeka Bello", specialty: "Cardiologist", rating: 4.8, status: "online", initials: "CB", tags: ["Heart Health", "Hypertension"], experience: "12 yrs", consultations: 890, price: 8500 },
  { id: 3, name: "Dr. Fatima Al-Hassan", specialty: "Pediatrician", rating: 4.9, status: "busy", initials: "FA", tags: ["Child Health", "Vaccines"], experience: "10 yrs", consultations: 2100, price: 6000 },
  { id: 4, name: "Dr. James Adewale", specialty: "Dermatologist", rating: 4.7, status: "online", initials: "JA", tags: ["Skin Care", "Cosmetic"], experience: "6 yrs", consultations: 654, price: 7000 },
  { id: 5, name: "Dr. Sarah Nwosu", specialty: "Gynecologist", rating: 5.0, status: "offline", initials: "SN", tags: ["Women's Health", "Prenatal"], experience: "15 yrs", consultations: 3200, price: 9000 },
  { id: 6, name: "Dr. Ibrahim Musa", specialty: "Dentist", rating: 4.6, status: "online", initials: "IM", tags: ["Dental Care", "Orthodontics"], experience: "9 yrs", consultations: 780, price: 5500 },
];

const TRANSACTIONS = [
  { id: 1, name: "Wallet Top-up", type: "credit", amount: 50000, date: "Today, 10:32 AM", label: "TOP", bg: "#dcfce7", color: "#166534" },
  { id: 2, name: "Dr. Amira Osei Consult", type: "debit", amount: 5000, date: "Today, 9:15 AM", label: "MED", bg: "#fee2e2", color: "#991b1b" },
  { id: 3, name: "Lab Test - Full Blood Count", type: "debit", amount: 12000, date: "Yesterday, 2:00 PM", label: "LAB", bg: "#eff6ff", color: "#1d4ed8" },
  { id: 4, name: "Pharmacy - Medications", type: "debit", amount: 3200, date: "Feb 18, 2026", label: "PHM", bg: "#f3e8ff", color: "#6b21a8" },
  { id: 5, name: "Wallet Top-up", type: "credit", amount: 100000, date: "Feb 15, 2026", label: "TOP", bg: "#dcfce7", color: "#166534" },
];

const DOCUMENTS = [
  { id: 1, name: "Blood Test Results Feb 2026", type: "lab", label: "LAB", size: "1.2 MB", date: "Feb 20, 2026", bg: "#eff6ff", color: "#1d4ed8" },
  { id: 2, name: "Dr. Bello Prescription", type: "prescription", label: "RX", size: "0.5 MB", date: "Feb 18, 2026", bg: "#ecfdf5", color: "#166534" },
  { id: 3, name: "Annual Physical Report 2025", type: "report", label: "RPT", size: "3.4 MB", date: "Dec 12, 2025", bg: "#fef3c7", color: "#92400e" },
  { id: 4, name: "X-Ray Chest Scan", type: "lab", label: "IMG", size: "8.7 MB", date: "Nov 5, 2025", bg: "#eff6ff", color: "#1d4ed8" },
  { id: 5, name: "Malaria Test Negative", type: "lab", label: "LAB", size: "0.8 MB", date: "Oct 28, 2025", bg: "#eff6ff", color: "#1d4ed8" },
];

const APPOINTMENTS = [
  { id: 1, time: "9:00 AM", date: "Feb 24", title: "General Checkup", doctor: "Dr. Amira Osei", type: "Video" },
  { id: 2, time: "2:30 PM", date: "Feb 26", title: "Cardiology Follow-up", doctor: "Dr. Chukwuemeka Bello", type: "Audio" },
  { id: 3, time: "11:00 AM", date: "Mar 1", title: "Dental Cleaning", doctor: "Dr. Ibrahim Musa", type: "In-Person" },
];

const CLAIMS = [
  { id: "CLM-001", service: "General Consultation", doctor: "Dr. Amira Osei", date: "Feb 20", amount: "N5,000", status: "approved" },
  { id: "CLM-002", service: "Full Blood Count", doctor: "Lab Services", date: "Feb 18", amount: "N12,000", status: "pending" },
  { id: "CLM-003", service: "Medications", doctor: "Pharmacy", date: "Feb 18", amount: "N3,200", status: "approved" },
  { id: "CLM-004", service: "Cardiology Consult", doctor: "Dr. Bello", date: "Jan 30", amount: "N8,500", status: "rejected" },
];

const CHAT_CONTACTS = [
  { id: 1, name: "Dr. Amira Osei", role: "General Practitioner", initials: "AO", lastMsg: "Your results look great!", time: "10:32 AM", unread: 2, online: true },
  { id: 2, name: "Dr. Chukwuemeka Bello", role: "Cardiologist", initials: "CB", lastMsg: "Take your medication as prescribed.", time: "Yesterday", unread: 0, online: false },
  { id: 3, name: "Support Team", role: "Span Healthcare", initials: "SH", lastMsg: "How can we help you today?", time: "Feb 20", unread: 1, online: true },
];

const CHAT_MESSAGES = [
  { id: 1, text: "Hello Dr. Amira! I have been feeling some chest tightness lately.", sent: true, time: "10:20 AM" },
  { id: 2, text: "Hi! I understand your concern. How long have you been experiencing this? Any other symptoms?", sent: false, time: "10:22 AM" },
  { id: 3, text: "About 3 days now. Sometimes I feel short of breath especially when climbing stairs.", sent: true, time: "10:24 AM" },
  { id: 4, text: "I see. Can you upload your latest blood pressure readings? I would also recommend a quick video call.", sent: false, time: "10:26 AM" },
  { id: 5, text: "Sure, let me get that. Should I be worried?", sent: true, time: "10:28 AM" },
  { id: 6, text: "Do not worry, we will get to the bottom of this. Your results from last week look great.", sent: false, time: "10:32 AM" },
];

function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email) { setError('Please enter your email address'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
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
                We sent a reset link to <strong>{email}</strong>. Check your inbox and click the link to reset your password.
              </div>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 20, lineHeight: 1.7, fontFamily: "'Manrope',sans-serif" }}>
                Enter the email address on your account and we will send you a password reset link.
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
              </div>
              {error && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16, fontFamily: "'Manrope',sans-serif" }}>
                  {error}
                </div>
              )}
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

function AuthScreen({ onLogin, onDoctorLogin }) {
  const [mode, setMode] = useState("login");
  const [userType, setUserType] = useState("patient");
  const [step, setStep] = useState(1);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [form, setForm] = useState({
    email: "", phone: "", name: "", password: "", confirmPassword: "",
    dob: "", sex: "Male", specialty: "", experience_years: "", bio: ""
  });

  const SPECIALTIES = [
    "General Practitioner", "Cardiologist", "Pediatrician", "Dermatologist",
    "Gynecologist", "Dentist", "Orthopedist", "Neurologist", "Psychiatrist",
    "Ophthalmologist", "ENT Specialist", "Urologist", "Oncologist", "Other"
  ];

  const next = async () => {
    setError("");

    // ── PATIENT REGISTER ──
    if (userType === "patient" && mode === "register" && step === 1) {
      if (!form.name || !form.email) { setError("Please fill in your name and email"); return; }
      setStep(2); return;
    }
    if (userType === "patient" && mode === "register" && step === 2) {
      if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
      if (!consent) { setError("Please accept the terms to continue"); return; }
      setLoading(true);
      const result = await registerUser({
        name: form.name, email: form.email, phone: form.phone,
        password: form.password, dob: form.dob, sex: form.sex,
      });
      setLoading(false);
      if (!result.success) { setError(result.error); return; }
onLogin(result.user);
return;
    }

    // ── DOCTOR REGISTER ──
    if (userType === "doctor" && mode === "register" && step === 1) {
      if (!form.name || !form.email || !form.specialty) { setError("Please fill in all required fields"); return; }
      setStep(2); return;
    }
    if (userType === "doctor" && mode === "register" && step === 2) {
      if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
      if (!consent) { setError("Please accept the terms to continue"); return; }
      setLoading(true);
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (authError) throw authError;
        const { error: profileError } = await supabase.from('doctors').insert({
          user_id: authData.user.id,
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          specialty: form.specialty,
          bio: form.bio,
          experience_years: parseInt(form.experience_years) || 0,
          status: 'pending',
          is_available: false,
        });
        if (profileError) throw profileError;
      } catch(e) {
        setLoading(false);
        setError(e.message); return;
      }
      setLoading(false);
      setStep(3); return;
    }

    // ── PATIENT LOGIN ──
    if (userType === "patient" && mode === "login") {
      if (!form.email || !form.password) { setError("Please enter your email and password"); return; }
      setLoading(true);
      const result = await loginUser({ email: form.email, password: form.password });
      setLoading(false);
      if (!result.success) { setError(result.error); return; }
      
      // Block doctors from logging into patient portal
      const { data: doctorCheck } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', result.user.id)
        .maybeSingle();
      if (doctorCheck) {
        await supabase.auth.signOut();
        setError("This account is registered as a doctor. Please use the Doctor login.");
        return;
      }

      onLogin(result.user);
      return;
    }

    // ── DOCTOR LOGIN ──
    if (userType === "doctor" && mode === "login") {
      if (!form.email || !form.password) { setError("Please enter your email and password"); return; }
      setLoading(true);
      try {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: form.email, password: form.password,
        });
        if (loginError) throw loginError;
        const { data: doctorData, error: docError } = await supabase
  .from('doctors')
  .select('*')
  .eq('user_id', data.user.id)
  .maybeSingle();
if (docError || !doctorData) throw new Error("No doctor profile found for this account");
if (doctorData.status === 'pending') throw new Error("Your account is pending approval. You will receive an email once approved.");
if (doctorData.status === 'rejected') throw new Error("Your application was not approved. Please contact support.");
setLoading(false);
onDoctorLogin(data.user, doctorData);
      } catch(e) {
        setLoading(false);
        setError(e.message);
      }
      return;
    }

    onLogin();
  };

  const switchUserType = (type) => {
    setUserType(type);
    setStep(1);
    setError("");
    setForm({ email: "", phone: "", name: "", password: "", confirmPassword: "", dob: "", sex: "Male", specialty: "", experience_years: "", bio: "" });
  };

  return (
    <div className="auth-screen">
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      <div className="auth-left">
        <div className="auth-logo">
          <img
            src="/assets/logo.png"
            alt="Span Healthcare"
            className="auth-logo-img"
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
          <div className="auth-logo-icon" style={{ display: "none" }}>SPAN</div>
        </div>
        <div className="auth-headline">
          {userType === "doctor" ? <>Join as a<br /><span>Healthcare</span><br />Professional.</> : <>Your Health,<br /><span>Your Savings,</span><br />One Platform.</>}
        </div>
        <div className="auth-sub">
          {userType === "doctor"
            ? "Register as a doctor on Span Healthcare. Reach patients, manage consultations, and grow your practice digitally."
            : "A complete health finance ecosystem. Save for healthcare, consult doctors instantly, and manage your family health records seamlessly."}
        </div>
        <div className="auth-features">
          {userType === "doctor" ? [
            "Set your availability and specialties",
            "Video, audio and chat consultations",
            "Competitive consultation earnings per session",
            "Manage appointments from your dashboard",
            "Pending approval before going live",
          ] : [
            "Health Savings Wallet — save anytime",
            "Telemedicine via video, audio and chat",
            "Family profile and dependent management",
            "Wellness tracking and health scoring",
            "Secure medical document vault",
          ].map(f => (
            <div key={f} className="auth-feature">
              <div className="auth-feature-dot" />{f}
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">

          {/* User type switcher */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, border: '1.5px solid #dce8eb', borderRadius: 10, overflow: 'hidden' }}>
            <button
              onClick={() => switchUserType('patient')}
              style={{ flex: 1, padding: '10px', fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: userType === 'patient' ? 'var(--primary)' : 'white', color: userType === 'patient' ? 'white' : 'var(--slate)' }}
            >
              Patient
            </button>
            <button
              onClick={() => switchUserType('doctor')}
              style={{ flex: 1, padding: '10px', fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: userType === 'doctor' ? 'var(--primary)' : 'white', color: userType === 'doctor' ? 'white' : 'var(--slate)' }}
            >
              Doctor
            </button>
          </div>

          {step === 3 ? (
            <div className="verify-screen">
              <div style={{ width: 72, height: 72, borderRadius: 18, background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontWeight: 800, fontSize: 15, color: 'var(--primary)', fontFamily: "'Montserrat',sans-serif" }}>
                {userType === 'doctor' ? 'PEND' : 'OTP'}
              </div>
              {userType === 'doctor' ? (
                <>
                  <div className="verify-title">Application Submitted</div>
                  <div className="verify-sub">
                    Your doctor profile has been submitted for review.<br />
                    <strong>You will receive an email once approved.</strong><br />
                    After approval you can log in and start accepting consultations.
                  </div>
                  <button className="btn btn-primary" onClick={() => { setStep(1); setMode('login'); }}>
                    Back to Login
                  </button>
                </>
              ) : (
                <>
                  <div className="verify-title">Verify your account</div>
                  <div className="verify-sub">We sent a 6-digit code to<br /><strong>{form.email || form.phone}</strong></div>
                  <div className="otp-inputs">
                    {[0,1,2,3,4,5].map(i => <input key={i} className="otp-input" maxLength={1} type="text" />)}
                  </div>
                  <button className="btn btn-primary" onClick={onLogin}>Verify and Continue</button>
                  <p style={{ marginTop: 14, fontSize: 12, color: 'var(--slate)', textAlign: 'center', fontFamily: "'Manrope',sans-serif" }}>
                    Did not get it? <span style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Resend code</span>
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="auth-form-title">
                {mode === 'login'
                  ? userType === 'doctor' ? 'Doctor Login' : 'Welcome back'
                  : userType === 'doctor' ? 'Doctor Registration' : 'Create account'}
              </div>
              <div className="auth-form-sub">
                {mode === 'login'
                  ? userType === 'doctor' ? 'Access your doctor dashboard' : 'Log in to your Span Healthcare dashboard'
                  : step === 1 ? 'Step 1 of 2 - Personal details' : 'Step 2 of 2 - Set your password'}
              </div>

              <div className="auth-tabs">
                <button className={"auth-tab" + (mode === "login" ? " active" : "")} onClick={() => { setMode("login"); setStep(1); setError(""); }}>Log In</button>
                <button className={"auth-tab" + (mode === "register" ? " active" : "")} onClick={() => { setMode("register"); setStep(1); setError(""); }}>Register</button>
              </div>

              {/* PATIENT REGISTER STEP 1 */}
              {userType === "patient" && mode === "register" && step === 1 && <>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="e.g. Emeka Okafor" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" type="tel" placeholder="+234 8XX XXX XXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Sex</label><select className="form-select" value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}><option>Male</option><option>Female</option><option>Prefer not to say</option></select></div>
              </>}

              {/* DOCTOR REGISTER STEP 1 */}
              {userType === "doctor" && mode === "register" && step === 1 && <>
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
                <div className="form-group"><label className="form-label">Short Bio</label><textarea className="form-textarea" rows={3} placeholder="Brief description of your practice and expertise..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
              </>}

              {/* STEP 2 — PASSWORD (both patient and doctor) */}
              {mode === "register" && step === 2 && <>
                <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Create a strong password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} /></div>
                <div className="consent-box">
                  <div className="consent-title">Data Protection and Consent</div>
                  <div className="consent-text">
                    {userType === 'doctor'
                      ? "By registering as a doctor on Span Healthcare you agree to our platform terms, patient data protection policies, and medical consultation guidelines under NDPR."
                      : "Span Healthcare collects and processes your personal and health data in accordance with the Nigeria Data Protection Regulation (NDPR)."}
                  </div>
                  <label className="consent-check">
                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                    <span className="consent-check-label">I agree to the <span>Terms of Service</span>, <span>Privacy Policy</span>, and <span>Data Protection Policy</span>.</span>
                  </label>
                </div>
              </>}

              {/* LOGIN FORM */}
              {mode === "login" && <>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Enter password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                <p style={{ textAlign: 'right', marginBottom: 18, fontSize: 12, fontFamily: "'Manrope',sans-serif" }}>
  <span
    style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
    onClick={() => setShowForgot(true)}
  >
    Forgot password?
  </span>
</p>
              </>}

              {error && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16, fontFamily: "'Manrope',sans-serif" }}>
                  {error}
                </div>
              )}

              <button className="btn btn-primary" onClick={next} disabled={loading || (mode === "register" && step === 2 && !consent)}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : step === 1 ? 'Continue' : userType === 'doctor' ? 'Submit Application' : 'Create Account'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationBell({ userId }) {
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

function Sidebar({ active, onNav, userPhoto, userName, onLogout, mobileOpen }) {
  const sections = [
    { label: "", items: [{ id: "dashboard", label: "Dashboard", short: "DB" }, { id: "wallet", label: "Wallet", short: "WL" }, { id: "transactions", label: "Transactions", short: "TX" }] },
    { label: "Health", items: [{ id: "telemedicine", label: "Telemedicine", short: "TM" }, { id: "appointments", label: "Appointments", short: "AP" }, { id: "chat", label: "Messages", short: "MSG" }, { id: "documents", label: "Documents", short: "DOC" }] },
    { label: "Account", items: [{ id: "profile", label: "My Profile", short: "PR" }, { id: "dependents", label: "Dependents", short: "DP" }, { id: "settings", label: "Get Help", short: "HELP" }] },
  ];
  const initials = userName ? userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "EO";
  return (
    <div className={"sidebar" + (mobileOpen ? " mobile-open" : "")}>
      <div className="sidebar-logo">
        <img
          src="/assets/logo.png"
          alt="Span Healthcare"
          className="sidebar-logo-img"
          onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
        />
        <div className="sidebar-logo-icon" style={{ display: "none" }}>SPAN</div>
        <div><div className="sidebar-logo-name">Span Healthcare</div><div className="sidebar-logo-tag">Health Savings</div></div>
      </div>
      <div className="sidebar-nav">
        {sections.map(sec => (
          <div key={sec.label}>
            {sec.label && <div className="sidebar-section-label">{sec.label}</div>}
            {sec.items.map(item => (
              <div key={item.id} className={"nav-item" + (active === item.id ? " active" : "")} onClick={() => onNav(item.id)}>
                <div className="nav-icon">{item.short}</div>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{userPhoto ? <img src={userPhoto} alt="profile" /> : initials}</div>
          <div><div className="sidebar-user-name">{userName || "Emeka Okafor"}</div><div className="sidebar-user-role">Principal Member</div></div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(224,82,82,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#e05252", fontFamily: "'Montserrat',sans-serif" }}>OUT</div>
          Log Out
        </button>
      </div>
    </div>
  );
}

function Dashboard({ onNav, userName, userId }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dependents, setDependents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchAll();
  }, [userId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      setWallet(walletData);

      const { data: txnData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(4);
      setTransactions(txnData || []);

      const { data: depData } = await supabase
        .from('dependents')
        .select('id')
        .eq('user_id', userId);
      setDependents(depData || []);

      const { data: apptData } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'upcoming')
        .order('date', { ascending: true })
        .limit(2);
      setAppointments(apptData || []);

    } catch (e) {
      console.error('Dashboard fetch error:', e.message);
    }
    setLoading(false);
  };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthlySpent = transactions
    .filter(t => t.type === 'debit' && t.created_at >= startOfMonth)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const fmt = (n) => `N${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const getTxnStyle = (txn) => {
    const desc = (txn.description || '').toLowerCase();
    if (txn.type === 'credit') return { label: 'TOP', bg: '#dcfce7', color: '#166534' };
    if (desc.includes('consult') || desc.includes('doctor')) return { label: 'MED', bg: '#fee2e2', color: '#991b1b' };
    if (desc.includes('lab') || desc.includes('test')) return { label: 'LAB', bg: '#eff6ff', color: '#1d4ed8' };
    if (desc.includes('pharma') || desc.includes('drug') || desc.includes('medic')) return { label: 'PHM', bg: '#f3e8ff', color: '#6b21a8' };
    if (desc.includes('insur')) return { label: 'INS', bg: '#fef9c3', color: '#854d0e' };
    return { label: 'TXN', bg: '#f4f9fa', color: '#5a7a8a' };
  };

  const formatTxnDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString())
      return `Today, ${d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`;
    if (d.toDateString() === yesterday.toDateString())
      return `Yesterday, ${d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatApptDate = (iso) => {
    if (!iso) return 'N/A'
    return new Date(iso).toLocaleDateString('en-NG', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Africa/Lagos'  // ← this too
    })
  }

  const firstName = userName ? userName.split(' ')[0] : '';
  const todayStr = new Date().toLocaleDateString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Hello, {firstName}!</div>
          <div className="page-sub">{todayStr}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onNav('telemedicine')}>
          + Book Appointment
        </button>
      </div>
      <div className="dashboard-grid">
        <div>
        <div className="wallet-card" style={{ marginBottom: 20 }}>
  <div className="wallet-label">Health Savings Wallet</div>

  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16, marginBottom: 8, position: 'relative', zIndex: 1 }}>
    <div>
      <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Montserrat',sans-serif", marginBottom: 4 }}>Available</div>
      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Montserrat',sans-serif" }}>
        {loading ? '—' : fmt(wallet?.balance || 0)}
      </div>
      <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2, fontFamily: "'Manrope',sans-serif" }}>45% · health wallet</div>
    </div>
    <div>
      <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Montserrat',sans-serif", marginBottom: 4 }}>Investment</div>
      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", color: '#c4b5fd' }}>
        {loading ? '—' : fmt(wallet?.investment_balance || 0)}
      </div>
      <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2, fontFamily: "'Manrope',sans-serif" }}>45% · Konooz Fund</div>
    </div>
    <div>
      <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Montserrat',sans-serif", marginBottom: 4 }}>Total</div>
      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", color: '#6ee7b7' }}>
        {loading ? '—' : fmt((wallet?.balance || 0) + (wallet?.investment_balance || 0))}
      </div>
      <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2, fontFamily: "'Manrope',sans-serif" }}>Available + Investment</div>
    </div>
  </div>

  <div className="wallet-id">
    {wallet?.account_number
      ? `${wallet.account_number} · ${wallet.bank_name || 'Span Bank'}`
      : 'Setting up your account...'}
  </div>

  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
    <div style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: "'Manrope',sans-serif" }}>
      {dependents.length} Dependent{dependents.length !== 1 ? 's' : ''}
    </div>
    <div style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: "'Manrope',sans-serif" }}>
      Active Member
    </div>
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
            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>
                No transactions yet. Fund your wallet to get started.
              </div>
            ) : (
              <div className="txn-list">
                {transactions.map(t => {
                  const style = getTxnStyle(t);
                  return (
                    <div key={t.id} className="txn-item">
                      <div className="txn-icon" style={{ background: style.bg, color: style.color }}>
                        {style.label}
                      </div>
                      <div className="txn-info">
                        <div className="txn-name">{t.description || 'Transaction'}</div>
                        <div className="txn-date">{formatTxnDate(t.created_at)}</div>
                      </div>
                      <div className={`txn-amount ${t.type}`}>
                        {t.type === 'credit' ? '+' : '-'}N{Number(t.amount).toLocaleString()}
                      </div>
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
              {[
                { label: 'See a Doctor', short: 'DOC', page: 'telemedicine' },
                { label: 'Fund Wallet', short: 'PAY', page: 'wallet' },
                { label: 'Dependents', short: 'FAM', page: 'dependents' },
                { label: 'Documents', short: 'FIL', page: 'documents' },
              ].map(a => (
                <div key={a.label} className="quick-action" onClick={() => onNav(a.page)}>
                  <div className="quick-action-icon">{a.short}</div>
                  <div className="quick-action-label">{a.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Upcoming Appointments</div>
            {loading ? (
              <div style={{ fontSize: 13, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>
                Loading...
              </div>
            ) : appointments.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif", textAlign: 'center', padding: '16px 0' }}>
                No upcoming appointments.{' '}
                <span
                  style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => onNav('telemedicine')}
                >
                  Book one now
                </span>
              </div>
            ) : (
              <div className="schedule-list">
                {appointments.map(a => {
                  const { time, date } = formatApptDate(a.date);
                  return (
                    <div key={a.id} className="appt-item" style={{ padding: '10px 12px' }}>
                      <div style={{ minWidth: 56, textAlign: 'center' }}>
                        <div className="appt-time-val" style={{ fontSize: 13 }}>{time}</div>
                        <div className="appt-time-date">{date}</div>
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

function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
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
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAllRead };
}

const createNotification = async (userId, title, message, type = 'info') => {
  await supabase.from('notifications').insert({ user_id: userId, title, message, type });
};

function WalletPage({ userId }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFund, setShowFund] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stmtFrom, setStmtFrom] = useState('');
  const [stmtTo, setStmtTo] = useState('');
  const [stmtFormat, setStmtFormat] = useState('PDF');

  useEffect(() => {
    if (!userId) return;
    fetchWalletData();
  }, [userId]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
      setWallet(walletData);
      const { data: txnData } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setTransactions(txnData || []);
    } catch (e) {
      console.error('Wallet fetch error:', e.message);
    }
    setLoading(false);
  };

  const fmt = (n) => `N${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const getTxnStyle = (txn) => {
    const desc = (txn.name || txn.description || '').toLowerCase();
    if (txn.type === 'credit') return { label: 'TOP', bg: '#dcfce7', color: '#166634' };
    if (desc.includes('consult') || desc.includes('doctor')) return { label: 'MED', bg: '#fee2e2', color: '#991b1b' };
    if (desc.includes('lab') || desc.includes('test')) return { label: 'LAB', bg: '#eff6ff', color: '#1d4ed8' };
    if (desc.includes('pharma') || desc.includes('drug') || desc.includes('medic')) return { label: 'PHM', bg: '#f3e8ff', color: '#6b21a8' };
    if (desc.includes('insur')) return { label: 'INS', bg: '#fef9c3', color: '#854d0e' };
    return { label: 'TXN', bg: '#f4f9fa', color: '#5a7a8a' };
  };

  const formatTxnDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString())
      return `Today, ${d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`;
    if (d.toDateString() === yesterday.toDateString())
      return `Yesterday, ${d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFilteredTxns = () => {
    return transactions.filter(t => {
      if (!stmtFrom && !stmtTo) return true;
      const d = new Date(t.created_at);
      if (stmtFrom && d < new Date(stmtFrom)) return false;
      if (stmtTo && d > new Date(stmtTo + 'T23:59:59')) return false;
      return true;
    });
  };

  const downloadPDF = () => {
    const filtered = getFilteredTxns();
    const doc = new jsPDF();
    const teal = [30, 139, 166];
    const navy = [26, 47, 66];
    doc.setFillColor(...teal);
    doc.rect(0, 0, 210, 38, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Span Healthcare', 14, 16);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Wallet Statement', 14, 25);
    doc.setFontSize(9);
    doc.text(`Period: ${stmtFrom || 'All'} to ${stmtTo || 'Now'}`, 14, 33);
    const credits = filtered.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
    const debits = filtered.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0);
    doc.setFillColor(245, 250, 252);
    doc.rect(14, 44, 182, 22, 'F');
    doc.setTextColor(...navy);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Funded: N${credits.toLocaleString()}`, 20, 53);
    doc.text(`Total Spent: N${debits.toLocaleString()}`, 80, 53);
    doc.text(`Net: N${(credits - debits).toLocaleString()}`, 155, 53);
    import('jspdf-autotable').then(({ default: autoTable }) => {
      autoTable(doc, {
        startY: 72,
        head: [['Date', 'Description', 'Type', 'Amount']],
        body: filtered.map(t => [
          new Date(t.created_at).toLocaleDateString('en-NG'),
          t.name || t.description || 'Transaction',
          t.type,
          `${t.type === 'credit' ? '+' : '-'}N${Number(t.amount).toLocaleString()}`,
        ]),
        headStyles: { fillColor: teal, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 252, 253] },
      });
      doc.save(`SpanHC_Statement_${stmtFrom || 'all'}_to_${stmtTo || 'now'}.pdf`);
      setShowStatement(false);
    });
  };

  const downloadExcel = () => {
    const filtered = getFilteredTxns();
    const rows = [
      ['Date', 'Description', 'Type', 'Amount'],
      ...filtered.map(t => [
        new Date(t.created_at).toLocaleDateString('en-NG'),
        t.name || t.description || 'Transaction',
        t.type,
        `${t.type === 'credit' ? '+' : '-'}${Number(t.amount).toLocaleString()}`,
      ])
    ];
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SpanHC_Statement_${stmtFrom || 'all'}_to_${stmtTo || 'now'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowStatement(false);
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Wallet</div>
          <div className="page-sub">Your health savings account</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowFund(true)}>+ Fund Wallet</button>
      </div>

      <div className="wallet-card" style={{ marginBottom: 24 }}>
        <div className="wallet-label">Available Balance</div>
        <div className="wallet-amount">{loading ? 'Loading...' : fmt(wallet?.balance)}</div>
        <div className="wallet-id">
          {wallet?.account_number ? `${wallet.account_number} · ${wallet.bank_name || 'Span Bank'}` : 'Setting up your account...'}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <div style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: "'Manrope',sans-serif" }}>Health Savings</div>
          <div style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: "'Manrope',sans-serif" }}>Active</div>
        </div>
        <div className="wallet-actions">
          <button className="wallet-btn wallet-btn-primary" onClick={() => setShowFund(true)}>Fund Wallet</button>
          <button className="wallet-btn wallet-btn-outline" onClick={() => setShowStatement(true)}>Statement</button>
        </div>
      </div>

      <div style={{ background: '#e8f6f9', border: '1.5px solid #98B7B9', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#2d8a9e', background: '#b0cccf', padding: '3px 8px', borderRadius: 6, fontFamily: "'Montserrat',sans-serif", flexShrink: 0, marginTop: 1 }}>INFO</div>
        <div style={{ fontSize: 13, color: '#1a2f42', fontFamily: "'Manrope',sans-serif", lineHeight: 1.7 }}>
          Your health savings wallet is a <strong>dedicated account</strong>. Once funds are deposited they are reserved for your healthcare and cannot be transferred out. To add funds, click <strong>Fund Wallet</strong> and transfer to the account details shown.
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 18 }}>Transaction History</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'var(--primary)', margin: '0 auto 14px', fontFamily: "'Montserrat',sans-serif" }}>EMPTY</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>No transactions yet</div>
            <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 6, fontFamily: "'Manrope',sans-serif", lineHeight: 1.7 }}>
              Fund your wallet by transferring to your dedicated account.
            </div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16, width: 'auto' }} onClick={() => setShowFund(true)}>View Account Details</button>
          </div>
        ) : (
          <div className="txn-list">
            {transactions.map(t => {
              const style = getTxnStyle(t);
              return (
                <div key={t.id} className="txn-item">
                  <div className="txn-icon" style={{ background: style.bg, color: style.color }}>{style.label}</div>
                  <div className="txn-info">
                    <div className="txn-name">{t.name || t.description || 'Transaction'}</div>
                    <div className="txn-date">{formatTxnDate(t.created_at)}</div>
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

      {/* Fund Wallet Modal */}
      {showFund && (
        <div className="modal-overlay" onClick={() => setShowFund(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Fund Your Wallet</div>
              <button className="modal-close" onClick={() => setShowFund(false)}>X</button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--primary-pale)', border: '1.5px solid var(--secondary)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16, fontFamily: "'Montserrat',sans-serif" }}>Your Dedicated Account Details</div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: "'Montserrat',sans-serif" }}>Bank Name</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginTop: 4, fontFamily: "'Manrope',sans-serif" }}>{wallet?.bank_name || 'Wema Bank'}</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: "'Montserrat',sans-serif" }}>Account Number</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', letterSpacing: 2, fontFamily: "'Montserrat',sans-serif" }}>{wallet?.account_number || 'Pending setup'}</div>
                    {wallet?.account_number && (
                      <button onClick={() => copyToClipboard(wallet.account_number)} style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid var(--primary)', background: copied ? 'var(--primary)' : 'white', color: copied ? 'white' : 'var(--primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Montserrat',sans-serif" }}>
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: "'Montserrat',sans-serif" }}>Account Name</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginTop: 4, fontFamily: "'Manrope',sans-serif" }}>{wallet?.account_name || 'Span Healthcare'}</div>
                </div>
              </div>
              <div style={{ background: '#fef9c3', border: '1.5px solid #e8a444', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#854d0e', fontFamily: "'Manrope',sans-serif", lineHeight: 1.7 }}>
                  <strong>How to fund:</strong> Transfer any amount to the account details above from any Nigerian bank. Your wallet balance will be updated automatically within a few minutes of payment confirmation.
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowFund(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Statement Modal */}
      {showStatement && (
        <div className="modal-overlay" onClick={() => setShowStatement(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Account Statement</div>
              <button className="modal-close" onClick={() => setShowStatement(false)}>X</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">From Date</label>
                <input className="form-input" type="date" value={stmtFrom} onChange={e => setStmtFrom(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">To Date</label>
                <input className="form-input" type="date" value={stmtTo} onChange={e => setStmtTo(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Format</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {['PDF', 'Excel'].map(f => (
                    <div
                      key={f}
                      onClick={() => setStmtFormat(f)}
                      style={{ border: `1.5px solid ${stmtFormat === f ? 'var(--primary)' : '#dce8eb'}`, background: stmtFormat === f ? 'var(--primary-pale)' : 'white', borderRadius: 10, padding: 14, textAlign: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: stmtFormat === f ? 'var(--primary)' : 'var(--navy)', fontFamily: "'Manrope',sans-serif" }}
                    >
                      {f}
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => stmtFormat === 'PDF' ? downloadPDF() : downloadExcel()}>
                Download Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function ProfilePage({ userId }) {
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [showID, setShowID] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (!userId) return;
    getProfile(userId).then(p => {
      if (p) {
        setProfile(p);
        if (p.avatar_url) setPhoto(p.avatar_url);
      }
    }).catch(e => console.log('Profile load error:', e));
  }, [userId]);

  const handleSave = async () => {
    if (!userId || !profile) return;
    setSaving(true);
    try {
      await updateProfile(userId, {
        full_name: profile.full_name,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth,
        sex: profile.sex,
        blood_group: profile.blood_group,
        genotype: profile.genotype,
        height: profile.height,
        weight: profile.weight,
        allergies: profile.allergies,
        chronic_conditions: profile.chronic_conditions,
        current_medications: profile.current_medications,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_relation: profile.emergency_contact_relation,
        emergency_contact_phone: profile.emergency_contact_phone,
      });
      setEditing(false);
    } catch(e) {
      console.log('Save error:', e);
    }
    setSaving(false);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
    try {
      const url = await uploadAvatar(userId, file);
      await updateProfile(userId, { avatar_url: url });
      setPhoto(url);
    } catch(e) {
      console.log('Upload error:', e);
    }
  };

  const spanID = profile?.span_id || generateSpanID(profile?.full_name || '');

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">My Profile</div><div className="page-sub">Manage your health identity</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowID(true)}>View ID Card</button>
          <button className="btn btn-primary btn-sm" onClick={() => editing ? handleSave() : setEditing(true)}>{saving ? "Saving..." : editing ? "Save Changes" : "Edit Profile"}</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
        <div>
          <div className="profile-photo-upload" onClick={() => editing && fileRef.current.click()}>
            <div className="profile-photo">{photo ? <img src={photo} alt="profile" /> : "EO"}</div>
            {editing && <div className="profile-photo-overlay">Change</div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
          {editing && <div style={{ fontSize: 11, color: "var(--slate)", textAlign: "center", marginTop: 6, fontFamily: "'Manrope',sans-serif" }}>Click to upload</div>}
        </div>
        <div className="profile-id-card" style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
            <div className="profile-name">{profile?.full_name || 'Loading...'}</div>
            <div className="profile-id">{spanID}</div>
              <div className="profile-tags">
                <span className="profile-tag">Principal Member</span>
                <span className="profile-tag" style={{ background: "#dcfce7", color: "var(--success)" }}>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>Personal Information</div>
          <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={profile?.full_name || ''} disabled={!editing} onChange={e => setProfile({...profile, full_name: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={profile?.phone || ''} disabled={!editing} onChange={e => setProfile({...profile, phone: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={profile?.date_of_birth || ''} disabled={!editing} onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Sex</label><select className="form-select" disabled={!editing} value={profile?.sex || 'Male'} onChange={e => setProfile({ ...profile, sex: e.target.value })}><option>Male</option><option>Female</option></select></div>
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>Medical Information</div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-select" disabled={!editing} value={profile?.blood_group || 'O+'} onChange={e => setProfile({ ...profile, blood_group: e.target.value })}>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Genotype</label>
              <select className="form-select" disabled={!editing} value={profile?.genotype || 'AA'} onChange={e => setProfile({ ...profile, genotype: e.target.value })}>
                {["AA","AS","SS","AC","SC"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input className="form-input" value={profile?.height || ''} disabled={!editing} placeholder="e.g. 175" onChange={e => setProfile({ ...profile, height: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input className="form-input" value={profile?.weight || ''} disabled={!editing} placeholder="e.g. 78" onChange={e => setProfile({ ...profile, weight: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1/-1" }}>
              <label className="form-label">Known Allergies</label>
              <input className="form-input" value={profile?.allergies || ''} disabled={!editing} placeholder="e.g. Penicillin or None" onChange={e => setProfile({ ...profile, allergies: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1/-1" }}>
              <label className="form-label">Chronic Conditions</label>
              <input className="form-input" value={profile?.chronic_conditions || ''} disabled={!editing} placeholder="e.g. Diabetes or None" onChange={e => setProfile({ ...profile, chronic_conditions: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: "1/-1" }}>
              <label className="form-label">Current Medications</label>
              <input className="form-input" value={profile?.current_medications || ''} disabled={!editing} placeholder="e.g. Metformin or None" onChange={e => setProfile({ ...profile, current_medications: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
      <div className="card">
  <div className="card-title" style={{ marginBottom: 18 }}>Emergency Contact</div>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
    <div className="form-group">
      <label className="form-label">Full Name</label>
      <input
        className="form-input"
        value={profile?.emergency_contact_name || ''}
onChange={e => setProfile({ ...profile, emergency_contact_name: e.target.value })}
        disabled={!editing}
        placeholder="Emergency contact name"
      />
    </div>
    <div className="form-group">
      <label className="form-label">Relationship</label>
      <input
        className="form-input"
        value={profile?.emergency_contact_relation || ''}
onChange={e => setProfile({ ...profile, emergency_contact_relation: e.target.value })}
        disabled={!editing}
        placeholder="e.g. Spouse, Parent"
      />
    </div>
    <div className="form-group">
      <label className="form-label">Phone Number</label>
      <input
        className="form-input"
        value={profile?.emergency_contact_phone || ''}
        onChange={e => setProfile({ ...profile, emergency_contact_phone: e.target.value })}
        disabled={!editing}
        placeholder="+234 800 000 0000"
      />
    </div>
  </div>
</div>
      {showID && (
        <div className="modal-overlay" onClick={() => setShowID(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><div className="modal-title">Virtual ID Card</div><button className="modal-close" onClick={() => setShowID(false)}>X</button></div>
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <div className="id-card" style={{ width: "100%" }}>
                <div className="id-card-header">
                  <div><div className="id-card-logo">Span Healthcare</div><div className="id-card-logo-sub">Health Savings Platform</div></div>
                  <div className="id-card-type">Member Card</div>
                </div>
                <div className="id-card-body">
                  <div className="id-card-photo">{photo ? <img src={photo} alt="profile" /> : (profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'SP')}</div>
                  <div>
                    <div className="id-card-name">{profile?.full_name || 'Member'}</div>
                    <div className="id-card-id">{spanID}</div>
                    <div className="id-card-details">
                      <div><div className="id-card-detail-label">Blood Group</div><div className="id-card-detail-value">{profile?.blood_group || '—'}</div></div>
                      <div><div className="id-card-detail-label">Genotype</div><div className="id-card-detail-value">{profile?.genotype || '—'}</div></div>
                      <div><div className="id-card-detail-label">Member Since</div><div className="id-card-detail-value">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : 'Jan 2025'}</div></div>
                      <div><div className="id-card-detail-label">Status</div><div className="id-card-detail-value">Active</div></div>
                    </div>
                  </div>
                </div>
                <div className="id-card-footer">
                  <Barcode />
                  <div className="id-card-valid"><div>Valid Through</div><div style={{ fontWeight: 700, fontSize: 11 }}>Dec 2026</div></div>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={async () => {
                const { default: html2canvas } = await import('html2canvas');
                const card = document.querySelector('.id-card');
                if (!card) return;
                const canvas = await html2canvas(card, { scale: 2, useCORS: true });
                const link = document.createElement('a');
                link.download = `SpanHC_ID_${profile?.full_name?.replace(/\s+/g, '_') || 'Card'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
              }}>Download ID Card</button>
            </div>
          </div>
        </div>
      )}
    </div>
 );
}
function SchedulePage({ doctorId }) {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const TIME_SLOTS = ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'];

  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newSlot, setNewSlot] = useState({ day: 'Monday', start_time: '9:00 AM', end_time: '5:00 PM' });

  useEffect(() => {
    if (!doctorId) return;
    fetchAvailability();
  }, [doctorId]);

  const fetchAvailability = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('id');
    setAvailability(data || []);
    setLoading(false);
  };

  const addSlot = async () => {
    if (!doctorId) {
      alert('Doctor ID is missing. Please log out and log back in.');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from('doctor_availability')
      .insert({ doctor_id: doctorId, ...newSlot, is_active: true })
      .select()
      .maybeSingle();
    if (error) {
      alert('Error saving slot: ' + error.message);
      console.error('Slot save error:', error);
    } else {
      setAvailability([...availability, data]);
      setShowAdd(false);
      setSuccess('Schedule updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
    setSaving(false);
  };

  const toggleSlot = async (slot) => {
    const updated = !slot.is_active;
    await supabase.from('doctor_availability').update({ is_active: updated }).eq('id', slot.id);
    setAvailability(availability.map(s => s.id === slot.id ? { ...s, is_active: updated } : s));
  };

  const deleteSlot = async (id) => {
    await supabase.from('doctor_availability').delete().eq('id', id);
    setAvailability(availability.filter(s => s.id !== id));
  };

  const groupedByDay = DAYS.reduce((acc, day) => {
    acc[day] = availability.filter(s => s.day === day);
    return acc;
  }, {});

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">My Schedule</div>
          <div className="page-sub">Set your available days and time slots</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          + Add Time Slot
        </button>
      </div>

      {success && (
        <div style={{ background: '#dcfce7', border: '1.5px solid var(--success)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#166634', fontFamily: "'Manrope',sans-serif" }}>
          {success}
        </div>
      )}

      <div style={{ background: '#e8f6f9', border: '1.5px solid #98B7B9', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#1a2f42', fontFamily: "'Manrope',sans-serif", lineHeight: 1.7 }}>
        <strong>How it works:</strong> Add time slots for each day you are available. Patients will only be able to book appointments within these slots. Toggle a slot off to temporarily disable it without deleting it.
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>Loading schedule...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {DAYS.map(day => (
            <div key={day} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: groupedByDay[day].length > 0 ? 14 : 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>{day}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {groupedByDay[day].length === 0 && (
                    <span style={{ fontSize: 12, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>No slots added</span>
                  )}
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ width: 'auto', fontSize: 11 }}
                    onClick={() => { setNewSlot({ ...newSlot, day }); setShowAdd(true); }}
                  >
                    + Add
                  </button>
                </div>
              </div>
              {groupedByDay[day].length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {groupedByDay[day].map(slot => (
                    <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: slot.is_active ? 'var(--primary-pale)' : '#f1f5f9', border: `1.5px solid ${slot.is_active ? 'var(--primary)' : '#dce8eb'}` }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: slot.is_active ? 'var(--primary-dark)' : 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>
                        {slot.start_time} — {slot.end_time}
                      </span>
                      <div
                        className={'toggle' + (slot.is_active ? '' : ' off')}
                        style={{ width: 32, height: 18 }}
                        onClick={() => toggleSlot(slot)}
                      >
                        <div className="toggle-thumb" style={{ width: 14, height: 14 }} />
                      </div>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: '#fee2e2', color: 'var(--danger)', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Time Slot</div>
              <button className="modal-close" onClick={() => setShowAdd(false)}>X</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Day</label>
                <select className="form-select" value={newSlot.day} onChange={e => setNewSlot({ ...newSlot, day: e.target.value })}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <select className="form-select" value={newSlot.start_time} onChange={e => setNewSlot({ ...newSlot, start_time: e.target.value })}>
                    {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <select className="form-select" value={newSlot.end_time} onChange={e => setNewSlot({ ...newSlot, end_time: e.target.value })}>
                    {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={addSlot} disabled={saving}>
                  {saving ? 'Saving...' : 'Add Slot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConsultationNotesPage({ doctorId }) {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState({ diagnosis: '', notes: '', follow_up: '', prescription: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!doctorId) return;
    fetchAppointments();
  }, [doctorId]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('date', { ascending: false });
    setAppointments(data || []);
    setLoading(false);
  };

  const selectAppointment = async (appt) => {
    setSelected(appt);
    const { data } = await supabase
      .from('consultation_notes')
      .select('*')
      .eq('appointment_id', appt.id)
      .maybeSingle();
    if (data) {
      setNote({ diagnosis: data.diagnosis || '', notes: data.notes || '', follow_up: data.follow_up || '', prescription: data.prescription || '' });
    } else {
      setNote({ diagnosis: '', notes: '', follow_up: '', prescription: '' });
    }
  };

  const saveNote = async () => {
    if (!selected) return;
    setSaving(true);
    const { data: existing } = await supabase
      .from('consultation_notes')
      .select('id')
      .eq('appointment_id', selected.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('consultation_notes').update({
        ...note, updated_at: new Date().toISOString()
      }).eq('id', existing.id);
    } else {
      await supabase.from('consultation_notes').insert({
        appointment_id: selected.id,
        doctor_id: doctorId,
        patient_id: selected.patient_id,
        ...note,
      });
    }
    setSaving(false);
    setSuccess('Notes saved successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Consultation Notes</div>
          <div className="page-sub">Private notes per consultation — not visible to patients</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Appointments list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #eef2f5', fontWeight: 700, fontSize: 13, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>
            Consultations
          </div>
          {loading ? (
            <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>Loading...</div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif", textAlign: 'center' }}>
              No consultations yet
            </div>
          ) : (
            <div>
              {appointments.map(a => (
                <div
                  key={a.id}
                  onClick={() => selectAppointment(a)}
                  style={{ padding: '12px 18px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: selected?.id === a.id ? 'var(--primary-pale)' : 'white', borderLeft: selected?.id === a.id ? '3px solid var(--primary)' : '3px solid transparent', transition: 'all 0.2s' }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--navy)', fontFamily: "'Manrope',sans-serif" }}>
                    {a.patient_name || 'Patient'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 2, fontFamily: "'Manrope',sans-serif" }}>
                    {a.date ? new Date(a.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'}
                  </div>
                  <span className={`badge ${a.status === 'completed' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: 10, marginTop: 4 }}>
                    {a.status || 'upcoming'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes editor */}
        <div className="card">
          {!selected ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>
              <div style={{ fontSize: 13 }}>Select a consultation from the left to view or write notes</div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>
                    {selected.patient_name || 'Patient'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>
                    {selected.date ? new Date(selected.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                  </div>
                </div>
                {success && (
                  <div style={{ background: '#dcfce7', color: '#166634', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontFamily: "'Manrope',sans-serif" }}>
                    {success}
                  </div>
                )}
              </div>

              <div style={{ background: '#fef9c3', border: '1.5px solid #e8a444', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#854d0e', fontFamily: "'Manrope',sans-serif" }}>
                These notes are private and confidential. They are not visible to the patient.
              </div>

              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <input
                  className="form-input"
                  placeholder="Primary diagnosis..."
                  value={note.diagnosis}
                  onChange={e => setNote({ ...note, diagnosis: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Notes</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Detailed notes about the consultation, symptoms, observations..."
                  value={note.notes}
                  onChange={e => setNote({ ...note, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prescription</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Medications prescribed, dosage and duration..."
                  value={note.prescription}
                  onChange={e => setNote({ ...note, prescription: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Instructions</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Next steps, follow-up date, lifestyle recommendations..."
                  value={note.follow_up}
                  onChange={e => setNote({ ...note, follow_up: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button className="btn btn-primary" onClick={saveNote} disabled={saving}>
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function DoctorProfilePage({ profile, setProfile }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(profile?.avatar_url || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    specialty: profile?.specialty || '',
    experience_years: profile?.experience_years || '',
    bio: profile?.bio || '',
  });

  const SPECIALTIES = [
    "General Practitioner", "Cardiologist", "Pediatrician", "Dermatologist",
    "Gynecologist", "Dentist", "Orthopedist", "Neurologist", "Psychiatrist",
    "Ophthalmologist", "ENT Specialist", "Urologist", "Oncologist", "Other"
  ];

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${profile.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('doctor-avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from('doctor-avatars')
        .getPublicUrl(path);
      const url = urlData.publicUrl;
      await supabase.from('doctors').update({ avatar_url: url }).eq('id', profile.id);
      setPhoto(url);
      setProfile({ ...profile, avatar_url: url });
      setSuccess('Profile photo updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Photo upload failed: ' + e.message);
    }
    setUploadingPhoto(false);
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('doctors')
        .update({
          full_name: form.full_name,
          phone: form.phone,
          specialty: form.specialty,
          experience_years: parseInt(form.experience_years) || 0,
          bio: form.bio,
        })
        .eq('id', profile.id);
      if (updateError) throw updateError;
      setProfile({ ...profile, ...form });
      setEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Save failed: ' + e.message);
    }
    setSaving(false);
  };

  const initials = form.full_name
    ? form.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'DR';

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">My Profile</div>
          <div className="page-sub">Your doctor profile visible to patients</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editing ? (
            <>
              <button className="btn btn-outline btn-sm" onClick={() => { setEditing(false); setError(''); }}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>
      </div>

      {success && (
        <div style={{ background: '#dcfce7', border: '1.5px solid var(--success)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#166634', fontFamily: "'Manrope',sans-serif" }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#fee2e2', border: '1.5px solid var(--danger)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#991b1b', fontFamily: "'Manrope',sans-serif" }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Photo */}
          <div style={{ flexShrink: 0 }}>
            <div
              style={{ width: 100, height: 100, borderRadius: 20, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', fontFamily: "'Montserrat',sans-serif", overflow: 'hidden', position: 'relative', cursor: editing ? 'pointer' : 'default' }}
              onClick={() => editing && fileRef.current.click()}
            >
              {photo ? <img src={photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              {editing && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', fontFamily: "'Montserrat',sans-serif" }}>
                  {uploadingPhoto ? 'Uploading...' : 'Change'}
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            {editing && (
              <div style={{ fontSize: 11, color: 'var(--slate)', textAlign: 'center', marginTop: 6, fontFamily: "'Manrope',sans-serif" }}>
                Click to upload
              </div>
            )}
          </div>

          {/* Basic info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>
              {form.full_name}
            </div>
            <div style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600, marginTop: 3, fontFamily: "'Manrope',sans-serif" }}>
              {form.specialty}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span className={'badge ' + (profile?.status === 'approved' ? 'badge-success' : 'badge-warning')}>
                {profile?.status === 'approved' ? 'Approved' : 'Pending Approval'}
              </span>
              <span className="badge badge-info">{form.experience_years} years experience</span>
              <span className="badge badge-info">N1,500 per consultation</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>Personal Information</div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={form.full_name}
              disabled={!editing}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              value={form.phone}
              disabled={!editing}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              value={profile?.email || ''}
              disabled
            />
          </div>
          <div className="form-group">
            <label className="form-label">Specialty</label>
            {editing ? (
              <select
                className="form-select"
                value={form.specialty}
                onChange={e => setForm({ ...form, specialty: e.target.value })}
              >
                {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <input className="form-input" value={form.specialty} disabled />
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Years of Experience</label>
            <input
              className="form-input"
              type="number"
              value={form.experience_years}
              disabled={!editing}
              onChange={e => setForm({ ...form, experience_years: e.target.value })}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>About & Bio</div>
          <div className="form-group">
            <label className="form-label">Professional Bio</label>
            <textarea
              className="form-input"
              rows={10}
              style={{ resize: 'vertical', minHeight: 200 }}
              value={form.bio}
              disabled={!editing}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Describe your expertise, experience and approach to patient care..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Consultation Fee</label>
            <input className="form-input" value="N1,500 per session (Platform managed)" disabled />
          </div>
          <div style={{ background: 'var(--primary-pale)', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: 'var(--primary-dark)', fontFamily: "'Manrope',sans-serif", lineHeight: 1.7 }}>
            Your profile is visible to all patients on the platform. Keep your bio professional and up to date.
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorMessagesPage({ doctorUserId, doctorName }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const deleteMessage = async (msgId) => {
    await supabase.from('messages').delete().eq('id', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setMsgMenuId(null);
  };
  const [msgMenuId, setMsgMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef();
  const chatFileRef = useRef();
  const [selectedChatFile, setSelectedChatFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    if (!doctorUserId) return;
    fetchPatients();
  }, [doctorUserId]);

  useEffect(() => {
    if (!selectedPatient) return;
    fetchMessages();

    const subscription = supabase
      .channel('doctor-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new;
        if (
          (msg.sender_id === doctorUserId && msg.receiver_id === selectedPatient.user_id) ||
          (msg.sender_id === selectedPatient.user_id && msg.receiver_id === doctorUserId)
        ) {
          setMessages(prev => [...prev, msg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [selectedPatient]);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages]);

  const fetchPatients = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('sender_id, sender_name')
      .eq('receiver_id', doctorUserId);
    
    const unique = [];
    const seen = new Set();
    (data || []).forEach(m => {
      if (!seen.has(m.sender_id)) {
        seen.add(m.sender_id);
        unique.push({ user_id: m.sender_id, full_name: m.sender_name });
      }
    });
    setPatients(unique);
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!selectedPatient || !doctorUserId) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${doctorUserId},receiver_id.eq.${selectedPatient.user_id}),and(sender_id.eq.${selectedPatient.user_id},receiver_id.eq.${doctorUserId})`)
      .order('created_at');
    setMessages(data || []);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedChatFile || !selectedPatient || !doctorUserId) return;
    setSending(true);
    try {
      let file_url = null;
      let file_name = null;
      let file_type = null;

      if (selectedChatFile) {
        const ext = selectedChatFile.name.split('.').pop();
        const path = `chat/${doctorUserId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(path, selectedChatFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
        file_url = urlData.publicUrl;
        file_name = selectedChatFile.name;
        file_type = selectedChatFile.type;
      }

      const { data, error } = await supabase.from('messages').insert({
        sender_id: doctorUserId,
        receiver_id: selectedPatient.user_id,
        sender_name: doctorName,
        content: newMessage.trim() || '',
        file_url,
        file_name,
        file_type,
      }).select().maybeSingle();

      if (!error && data) {
        setMessages(prev => [...prev, {
          ...data,
          file_type: selectedChatFile ? selectedChatFile.type : null,
          file_name: selectedChatFile ? selectedChatFile.name : null,
        }]);
        setNewMessage('');
        setSelectedChatFile(null);
        setFilePreview(null);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (e) {
      console.error('Send error:', e);
    }
    setSending(false);
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  const formatMsgTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos' });
    }
    return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', timeZone: 'Africa/Lagos' });
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="topbar">
        <div>
          <div className="page-title">Messages</div>
          <div className="page-sub">Chat with your patients</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, overflow: 'hidden' }}>
        {/* Patients list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #eef2f5', fontWeight: 700, fontSize: 13, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>
            Patients
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>Loading...</div>
            ) : patients.length === 0 ? (
              <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13, textAlign: 'center', fontFamily: "'Manrope',sans-serif" }}>
                No messages yet
              </div>
            ) : (
              patients.map(p => (
                <div
                  key={p.user_id}
                  onClick={() => setSelectedPatient(p)}
                  style={{ padding: '12px 18px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: selectedPatient?.user_id === p.user_id ? 'var(--primary-pale)' : 'white', borderLeft: selectedPatient?.user_id === p.user_id ? '3px solid var(--primary)' : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', fontFamily: "'Montserrat',sans-serif" }}>
                    {getInitials(p.full_name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)', fontFamily: "'Manrope',sans-serif" }}>{p.full_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>Patient</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedPatient ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)', fontFamily: "'Manrope',sans-serif", fontSize: 13 }}>
              Select a patient to view messages
            </div>
          ) : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef2f5', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', fontFamily: "'Montserrat',sans-serif" }}>
                  {getInitials(selectedPatient.full_name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>{selectedPatient.full_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>Patient</div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif", marginTop: 40 }}>
                    No messages yet
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === doctorUserId;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', position: 'relative' }}
                        onMouseEnter={e => { const btn = e.currentTarget.querySelector('.msg-menu-btn'); if (btn) btn.style.opacity = '1'; }}
                        onMouseLeave={e => { const btn = e.currentTarget.querySelector('.msg-menu-btn'); if (btn) btn.style.opacity = '0'; }}
                      >
                        <button
                          className="msg-menu-btn"
                          onClick={() => setMsgMenuId(msgMenuId === msg.id ? null : msg.id)}
                          style={{ position: 'absolute', top: -8, [isMe ? 'left' : 'right']: -28, opacity: 0, transition: 'opacity 0.2s', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--slate)', padding: 4, borderRadius: 6, zIndex: 10 }}
                        >
                          ⋮
                        </button>
                        {msgMenuId === msg.id && (
                          <div style={{ position: 'absolute', top: 0, [isMe ? 'left' : 'right']: -110, background: 'white', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: 100, overflow: 'hidden' }}>
                            <div
                              onClick={() => deleteMessage(msg.id)}
                              style={{ padding: '10px 16px', fontSize: 13, color: 'var(--danger)', fontFamily: "'Manrope',sans-serif", fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                              onMouseLeave={e => e.currentTarget.style.background = 'white'}
                            >
                              🗑 Delete
                            </div>
                          </div>
                        )}
                        <div style={{
                          padding: msg.file_url && !msg.content ? '6px 10px' : '10px 14px',
                          borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: isMe ? 'var(--primary)' : '#f1f5f9',
                          color: isMe ? 'white' : 'var(--navy)',
                          fontSize: 13,
                          fontFamily: "'Manrope',sans-serif",
                          lineHeight: 1.6,
                        }}>
                          {msg.file_url && (
                            msg.file_type?.includes('image') ? (
                              <a href={msg.file_url} target="_blank" rel="noreferrer">
                                <img src={msg.file_url} alt={msg.file_name} style={{ maxWidth: 200, maxHeight: 160, borderRadius: 8, display: 'block' }} />
                              </a>
                            ) : (
                              <a href={msg.file_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: isMe ? 'white' : 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: 12 }}>
                                <span style={{ background: isMe ? 'rgba(255,255,255,0.2)' : 'var(--primary-pale)', padding: '3px 7px', borderRadius: 5, fontSize: 10, fontWeight: 800 }}>PDF</span>
                                {msg.file_name}
                              </a>
                            )
                          )}
                          {msg.content && <div>{msg.content}</div>}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--slate)', marginTop: 3, fontFamily: "'Manrope',sans-serif" }}>
                        {formatMsgTime(msg.created_at)}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: '14px 20px', borderTop: '1px solid #eef2f5' }}>
                {filePreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--primary-pale)', borderRadius: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', fontFamily: "'Montserrat',sans-serif" }}>
                      {filePreview.type.includes('pdf') ? 'PDF' : 'IMG'}
                    </div>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--navy)', fontFamily: "'Manrope',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {filePreview.name}
                    </div>
                    <button onClick={() => { setFilePreview(null); setSelectedChatFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)', fontSize: 14 }}>✕</button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => chatFileRef.current.click()}
                    style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    title="Attach file"
                  >
                    📎
                  </button>
                  <input
                    ref={chatFileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) { setSelectedChatFile(file); setFilePreview(file); }
                    }}
                  />
                  <input
                    className="form-input"
                    style={{ flex: 1, marginBottom: 0 }}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !selectedChatFile && sendMessage()}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '0 20px', flexShrink: 0 }}
                    onClick={sendMessage}
                    disabled={sending || (!newMessage.trim() && !selectedChatFile)}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function DoctorDashboard({ doctorProfile, doctorUser, onLogout }) {
  const [profile, setProfile] = useState(doctorProfile);
console.log('doctorProfile received:', doctorProfile);
  useEffect(() => {
    if (!doctorProfile?.id && doctorProfile?.user_id) {
      supabase.from('doctors').select('*').eq('user_id', doctorProfile.user_id).maybeSingle().then(({ data }) => {
        if (data) setProfile(data);
      });
    }
  }, [doctorProfile]);
  const [isAvailable, setIsAvailable] = useState(doctorProfile?.is_available || false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorCallActive, setDoctorCallActive] = useState(false);
  const [doctorCallClient, setDoctorCallClient] = useState(null);
  const [doctorLocalTrack, setDoctorLocalTrack] = useState(null);
  const doctorLocalRef = useRef();
  const doctorRemoteRef = useRef();
  const joinCall = async (appointment) => {
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setDoctorCallClient(client);
  
      // Use the channel name saved when patient started the call
      const channel = appointment.agora_channel;
      const tokenRes1 = await fetch(
        'https://ssmjjtbvrakzfsxezavp.supabase.co/functions/v1/agora-token',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbWpqdGJ2cmFremZzeGV6YXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzE5NzQsImV4cCI6MjA4NzQ0Nzk3NH0.f3VNuJC0Tu7wcYOoCDvFULVpuOVLQoAS0c39bpJKXRg',
          },
          body: JSON.stringify({ channelName: channel, uid: 0 }),
        }
      );
      const { token: agoraToken1 } = await tokenRes1.json();
      await client.join(AGORA_APP_ID, channel, agoraToken1, appointment.doctor_id.replace(/-/g, '').slice(0, 8));
      const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setDoctorLocalTrack([micTrack, camTrack]);
      await client.publish([micTrack, camTrack]);
      setDoctorCallActive(true);
      camTrack.play(doctorLocalRef.current);
  
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') user.videoTrack?.play(doctorRemoteRef.current);
        if (mediaType === 'audio') user.audioTrack?.play();
      });
  
    } catch (e) {
      alert('Error joining call: ' + e.message);
      console.error('Doctor join error:', e);
    }
  };

  const endDoctorCall = async () => {
    if (doctorLocalTrack) {
      (Array.isArray(doctorLocalTrack) ? doctorLocalTrack : [doctorLocalTrack]).forEach(t => { t.stop(); t.close(); });
    }
    if (doctorCallClient) await doctorCallClient.leave();
    setDoctorCallActive(false);
    setDoctorCallClient(null);
    setDoctorLocalTrack(null);
  };
  const [activePage, setActivePage] = useState('overview');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', profile.id)
        .order('date', { ascending: true });
      setAppointments(data || []);
    } catch(e) {
      console.error('Appointments fetch error:', e.message);
    }
    setLoading(false);
  };

  const toggleAvailability = async () => {
    const newVal = !isAvailable;
    setIsAvailable(newVal);
    await supabase
      .from('doctors')
      .update({ is_available: newVal })
      .eq('id', profile.id);
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'DR';

  const todayStr = new Date().toLocaleDateString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const upcomingCount = appointments.filter(a => a.status === 'upcoming').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <img
            src="/assets/logo.png"
            alt="Span Healthcare"
            className="sidebar-logo-img"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="sidebar-logo-icon" style={{ display: 'none' }}>SPAN</div>
          <div>
            <div className="sidebar-logo-name">Span Healthcare</div>
            <div className="sidebar-logo-tag">Doctor Portal</div>
          </div>
        </div>

        <div className="sidebar-nav">
          {[
            { id: 'overview', label: 'Overview', short: 'OV' },
            { id: 'appointments', label: 'Appointments', short: 'AP' },
            { id: 'messages', label: 'Messages', short: 'MSG' },
            { id: 'schedule', label: 'My Schedule', short: 'SC' },
            { id: 'notes', label: 'Consultation Notes', short: 'CN' },
            { id: 'profile', label: 'My Profile', short: 'PR' },
          ].map(item => (
            <div
              key={item.id}
              className={'nav-item' + (activePage === item.id ? ' active' : '')}
              onClick={() => setActivePage(item.id)}
            >
              <div className="nav-icon">{item.short}</div>
              {item.label}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          {/* Availability toggle */}
          <div style={{ padding: '10px 8px', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'Manrope',sans-serif", marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Availability
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: isAvailable ? 'var(--success)' : 'rgba(255,255,255,0.4)', fontFamily: "'Manrope',sans-serif", fontWeight: 600 }}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <div
                className={'toggle' + (isAvailable ? '' : ' off')}
                onClick={toggleAvailability}
              >
                <div className="toggle-thumb" />
              </div>
            </div>
          </div>

          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{profile?.full_name}</div>
              <div className="sidebar-user-role">{profile?.specialty}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(224,82,82,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#e05252', fontFamily: "'Montserrat',sans-serif" }}>OUT</div>
            Log Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">

        {/* Overview */}
        {activePage === 'overview' && (
          <div>
            <div className="topbar">
              <div>
                <div className="page-title">
                  Hello, {profile?.full_name?.split(' ')[0]}!
                </div>
                <div className="page-sub">{todayStr}</div>
              </div>
              {profile?.status === 'pending' && (
                <div style={{ background: '#fef9c3', border: '1.5px solid var(--warning)', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#854d0e', fontFamily: "'Manrope',sans-serif" }}>
                  Account pending approval
                </div>
              )}
            </div>

            {/* Pending notice */}
            {profile?.status === 'pending' && (
              <div style={{ background: '#fef9c3', border: '1.5px solid var(--warning)', borderRadius: 14, padding: '18px 22px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#854d0e', background: '#fde68a', padding: '3px 8px', borderRadius: 6, fontFamily: "'Montserrat',sans-serif", flexShrink: 0 }}>PENDING</div>
                <div style={{ fontSize: 13, color: '#713f12', fontFamily: "'Manrope',sans-serif", lineHeight: 1.7 }}>
                  Your doctor profile is currently under review by Span Healthcare admin.
                  You will receive an email once your account is approved and you can start accepting patients.
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-tag" style={{ background: '#e8f6f9', color: '#2d8a9e' }}>APPT</span>
                <div className="stat-value" style={{ marginTop: 6 }}>{loading ? '—' : upcomingCount}</div>
                <div className="stat-label">Upcoming</div>
                <div className="stat-change up">Scheduled consultations</div>
              </div>
              <div className="stat-card">
                <span className="stat-tag" style={{ background: '#dcfce7', color: '#166634' }}>DONE</span>
                <div className="stat-value" style={{ marginTop: 6 }}>{loading ? '—' : completedCount}</div>
                <div className="stat-label">Completed</div>
                <div className="stat-change up">Total consultations done</div>
              </div>
              <div className="stat-card">
                <span className="stat-tag" style={{ background: '#f3e8ff', color: '#6b21a8' }}>RATE</span>
                <div className="stat-value" style={{ marginTop: 6 }}>{profile?.rating || '—'}</div>
                <div className="stat-label">Rating</div>
                <div className="stat-change up">From patient reviews</div>
              </div>
              <div className="stat-card">
                <span className="stat-tag" style={{ background: '#fef9c3', color: '#854d0e' }}>FEE</span>
                <div className="stat-value" style={{ marginTop: 6 }}>N1,000</div>
                <div className="stat-label">Your Earnings</div>
                <div className="stat-change up">Per consultation</div>
              </div>
            </div>

            {/* Upcoming appointments */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Upcoming Appointments</div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>Loading...</div>
              ) : appointments.filter(a => a.status === 'upcoming').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>
                  No upcoming appointments yet.
                </div>
              ) : (
                <div className="schedule-list">
                  {appointments.filter(a => a.status === 'upcoming').map(a => (
                    <div key={a.id} className="appt-item">
                      <div style={{ minWidth: 60, textAlign: 'center' }}>
                        <div className="appt-time-val" style={{ fontSize: 13 }}>
                          {new Date(a.date).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="appt-time-date">
                          {new Date(a.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                      <div className="appt-divider" />
                      <div style={{ flex: 1 }}>
                        <div className="appt-title">{a.title || 'Consultation'}</div>
                        <div className="appt-doctor">{a.patient_name || 'Patient'}</div>
                      </div>
                      <span className="badge badge-info">{a.type || 'Video'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments page */}
        {activePage === 'appointments' && (
          <div>
            <div className="topbar">
              <div>
                <div className="page-title">Appointments</div>
                <div className="page-sub">All your scheduled consultations</div>
              </div>
            </div>
            <div className="tab-bar">
              {['Upcoming', 'Completed', 'Cancelled'].map((t, i) => (
                <button key={t} className={'tab-btn' + (i === 0 ? ' active' : '')}>{t}</button>
              ))}
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>Loading...</div>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>
                No appointments yet.
              </div>
            ) : (
              <div className="schedule-list">
                {appointments.map(a => (
                  <div key={a.id} className="appt-item">
                    <div style={{ minWidth: 60, textAlign: 'center' }}>
                      <div className="appt-time-val" style={{ fontSize: 13 }}>
                        {new Date(a.date).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="appt-time-date">
                        {new Date(a.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                    <div className="appt-divider" />
                    <div style={{ flex: 1 }}>
                      <div className="appt-title">{a.title || 'Consultation'}</div>
                      <div className="appt-doctor">{a.patient_name || 'Patient'}</div>
                    </div>
                    <span className={'badge ' + (a.status === 'completed' ? 'badge-success' : a.status === 'cancelled' ? 'badge-danger' : 'badge-info')}>
                      {a.status || 'upcoming'}
                    </span>
                    {a.status === 'active' && a.agora_channel && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ marginLeft: 8 }}
                        onClick={() => joinCall(a)}
                      >
                        Join Call
                      </button>
                    )}
                    {(a.status === 'upcoming' || a.status === 'active') && (
                      <button
                        className="btn btn-sm"
                        style={{ marginLeft: 8, background: '#dcfce7', color: '#166634', border: 'none' }}
                        onClick={async () => {
                          await supabase.from('appointments').update({ status: 'completed' }).eq('id', a.id);
                          setAppointments(appointments.map(ap => ap.id === a.id ? { ...ap, status: 'completed' } : ap));
                        }}
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages page */}
        {activePage === 'messages' && (
          <DoctorMessagesPage doctorUserId={doctorUser?.id} doctorName={profile?.full_name} />
        )}

        {/* Schedule page */}
        {activePage === 'schedule' && (
          <SchedulePage doctorId={profile?.id} />
        )}

        {/* Consultation Notes page */}
        {activePage === 'notes' && (
          <ConsultationNotesPage doctorId={profile?.id} />
        )}

        {/* Profile page */}
        {activePage === 'profile' && (
          <DoctorProfilePage profile={profile} setProfile={setProfile} />
        )}

      </div>

      {/* Doctor Active Call UI */}
      {doctorCallActive && (
        <div style={{ position: 'fixed', inset: 0, background: '#0f1f2e', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'white', fontFamily: "'Montserrat',sans-serif" }}>Patient Consultation</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: "'Manrope',sans-serif" }}>Video Call in Progress</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
              <span style={{ fontSize: 12, color: 'var(--success)', fontFamily: "'Manrope',sans-serif" }}>Connected</span>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 24 }}>
            <div ref={doctorRemoteRef} style={{ width: '100%', maxWidth: 800, height: 450, background: '#1a2f42', borderRadius: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: "'Manrope',sans-serif" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
                <div>Waiting for patient...</div>
              </div>
            </div>
            <div ref={doctorLocalRef} style={{ position: 'absolute', bottom: 40, right: 40, width: 160, height: 120, background: '#0f1f2e', borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }} />
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'center', gap: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={endDoctorCall}
              style={{ padding: '14px 32px', borderRadius: 50, background: 'var(--danger)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Montserrat',sans-serif" }}
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function DependentsPage({ userId }) {
  const [dependents, setDependents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editDep, setEditDep] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef();
  const [newDep, setNewDep] = useState({
    full_name: '', relation: 'Spouse', sex: 'Male',
    date_of_birth: '', blood_group: 'O+', genotype: 'AA',
    weight: '', height: '', allergies: ''
  });

  useEffect(() => {
    if (!userId) return;
    fetchDependents();
  }, [userId]);

  const fetchDependents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('dependents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    setDependents(data || []);
    setLoading(false);
  };

  const getAge = (dob) => {
    if (!dob) return 'N/A';
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const addDependent = async () => {
    if (!newDep.full_name) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('dependents')
      .insert({
        user_id: userId,
        full_name: newDep.full_name,
        relation: newDep.relation,
        sex: newDep.sex,
        date_of_birth: newDep.date_of_birth || null,
        blood_group: newDep.blood_group,
        genotype: newDep.genotype,
        weight: newDep.weight,
        height: newDep.height,
        allergies: newDep.allergies || 'None',
      })
      .select()
      .maybeSingle();
    if (!error) {
      setDependents([...dependents, data]);
      setShowAdd(false);
      setNewDep({ full_name: '', relation: 'Spouse', sex: 'Male', date_of_birth: '', blood_group: 'O+', genotype: 'AA', weight: '', height: '', allergies: '' });
    } else {
      alert('Error adding dependent: ' + error.message);
    }
    setSaving(false);
  };

  const saveEdit = async () => {
    if (!editDep) return;
    setEditSaving(true);
    try {
      let avatar_url = editDep.avatar_url;
      if (editDep._newPhoto) {
        const ext = editDep._newPhoto.name.split('.').pop();
        const path = `dependents/${editDep.id}/${Date.now()}.${ext}`;
        await supabase.storage.from('documents').upload(path, editDep._newPhoto, { upsert: true });
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }
      const { error } = await supabase.from('dependents').update({
        full_name: editDep.full_name,
        relation: editDep.relation,
        sex: editDep.sex,
        date_of_birth: editDep.date_of_birth,
        blood_group: editDep.blood_group,
        genotype: editDep.genotype,
        weight: editDep.weight,
        height: editDep.height,
        allergies: editDep.allergies,
        avatar_url,
      }).eq('id', editDep.id);
      if (!error) {
        setDependents(dependents.map(d => d.id === editDep.id ? { ...editDep, avatar_url } : d));
        setShowEdit(false);
        setEditDep(null);
      }
    } catch(e) {
      console.error('Edit error:', e);
    }
    setEditSaving(false);
  };

  const deleteDependent = async (id) => {
    if (!window.confirm('Remove this dependent?')) return;
    await supabase.from('dependents').delete().eq('id', id);
    setDependents(dependents.filter(d => d.id !== id));
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Dependents</div>
          <div className="page-sub">{dependents.length} family member{dependents.length !== 1 ? 's' : ''} on your plan</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Dependent</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>Loading...</div>
      ) : (
        <div className="dependents-grid">
          {dependents.map(dep => (
            <div key={dep.id} className="dependent-card">
              <div className="dependent-avatar" style={{ overflow: 'hidden' }}>
                {dep.avatar_url
                  ? <img src={dep.avatar_url} alt={dep.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : getInitials(dep.full_name)}
              </div>
              <div className="dependent-name">{dep.full_name}</div>
              <div className="dependent-id">{dep.dependent_id || dep.id?.slice(0, 8).toUpperCase()}</div>
              <span className="badge badge-info" style={{ marginTop: 5 }}>{dep.relation}</span>
              <div className="dependent-meta">
                {[
                  { label: 'Age', value: getAge(dep.date_of_birth) + ' yrs' },
                  { label: 'Sex', value: dep.sex },
                  { label: 'Blood Group', value: dep.blood_group },
                  { label: 'Genotype', value: dep.genotype },
                  { label: 'Weight', value: dep.weight ? dep.weight + 'kg' : 'N/A' },
                  { label: 'Height', value: dep.height ? dep.height + 'cm' : 'N/A' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="dependent-meta-label">{m.label}</div>
                    <div className="dependent-meta-value">{m.value}</div>
                  </div>
                ))}
              </div>
              {dep.allergies && dep.allergies !== 'None' && (
                <div style={{ marginTop: 8, padding: '5px 9px', background: '#fee2e2', borderRadius: 7, fontSize: 11, color: 'var(--danger)', fontWeight: 600, fontFamily: "'Manrope',sans-serif" }}>
                  Allergy: {dep.allergies}
                </div>
              )}
              <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => { setEditDep(dep); setShowEdit(true); }}>Edit</button>
                <button
                  className="btn btn-sm"
                  style={{ background: '#fee2e2', color: 'var(--danger)', flex: 1, border: 'none' }}
                  onClick={() => deleteDependent(dep.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div
            style={{ border: '2px dashed #b0cccf', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 180 }}
            onClick={() => setShowAdd(true)}
          >
            <div style={{ width: 44, height: 44, borderRadius: 11, background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: 'var(--primary)', marginBottom: 10 }}>+</div>
            <div style={{ fontWeight: 700, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", fontSize: 14 }}>Add Dependent</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 3, fontFamily: "'Manrope',sans-serif" }}>No limit on dependents</div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add New Dependent</div>
              <button className="modal-close" onClick={() => setShowAdd(false)}>X</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="Full name" value={newDep.full_name} onChange={e => setNewDep({ ...newDep, full_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <select className="form-select" value={newDep.relation} onChange={e => setNewDep({ ...newDep, relation: e.target.value })}>
                    {['Spouse', 'Son', 'Daughter', 'Parent', 'Sibling', 'Other'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sex</label>
                  <select className="form-select" value={newDep.sex} onChange={e => setNewDep({ ...newDep, sex: e.target.value })}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={newDep.date_of_birth} onChange={e => setNewDep({ ...newDep, date_of_birth: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-select" value={newDep.blood_group} onChange={e => setNewDep({ ...newDep, blood_group: e.target.value })}>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Genotype</label>
                  <select className="form-select" value={newDep.genotype} onChange={e => setNewDep({ ...newDep, genotype: e.target.value })}>
                    {['AA', 'AS', 'SS', 'AC', 'SC'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input className="form-input" placeholder="e.g. 170" value={newDep.height} onChange={e => setNewDep({ ...newDep, height: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input className="form-input" placeholder="e.g. 65" value={newDep.weight} onChange={e => setNewDep({ ...newDep, weight: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Known Allergies</label>
                  <input className="form-input" placeholder="e.g. Penicillin or None" value={newDep.allergies} onChange={e => setNewDep({ ...newDep, allergies: e.target.value })} />
                </div>
              </div>
              <div style={{ background: 'var(--primary-pale)', borderRadius: 10, padding: 12, marginBottom: 18, fontSize: 12, color: 'var(--primary-dark)', fontFamily: "'Manrope',sans-serif" }}>
                A unique Dependent ID will be auto-generated and linked to your account.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={addDependent} disabled={saving}>
                  {saving ? 'Adding...' : 'Add Dependent'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && editDep && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Edit Dependent</div>
              <button className="modal-close" onClick={() => setShowEdit(false)}>X</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
                <div
                  onClick={() => editFileRef.current.click()}
                  style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: 'white', fontFamily: "'Montserrat',sans-serif", cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                >
                  {editDep.avatar_url
                    ? <img src={editDep.avatar_url} alt={editDep.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : getInitials(editDep.full_name)}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', fontFamily: "'Manrope',sans-serif" }}>Change</div>
                </div>
                <input ref={editFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setEditDep({ ...editDep, avatar_url: ev.target.result, _newPhoto: file });
                  reader.readAsDataURL(file);
                }} />
                <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 6, fontFamily: "'Manrope',sans-serif" }}>Click photo to change</div>
              </div>
              <div className="form-grid-2">
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={editDep.full_name || ''} onChange={e => setEditDep({ ...editDep, full_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <select className="form-select" value={editDep.relation || 'Spouse'} onChange={e => setEditDep({ ...editDep, relation: e.target.value })}>
                    {['Spouse', 'Son', 'Daughter', 'Parent', 'Sibling', 'Other'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sex</label>
                  <select className="form-select" value={editDep.sex || 'Male'} onChange={e => setEditDep({ ...editDep, sex: e.target.value })}>
                    <option>Male</option><option>Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={editDep.date_of_birth || ''} onChange={e => setEditDep({ ...editDep, date_of_birth: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-select" value={editDep.blood_group || 'O+'} onChange={e => setEditDep({ ...editDep, blood_group: e.target.value })}>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Genotype</label>
                  <select className="form-select" value={editDep.genotype || 'AA'} onChange={e => setEditDep({ ...editDep, genotype: e.target.value })}>
                    {['AA', 'AS', 'SS', 'AC', 'SC'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input className="form-input" placeholder="e.g. 170" value={editDep.height || ''} onChange={e => setEditDep({ ...editDep, height: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input className="form-input" placeholder="e.g. 65" value={editDep.weight || ''} onChange={e => setEditDep({ ...editDep, weight: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Known Allergies</label>
                  <input className="form-input" placeholder="e.g. Penicillin or None" value={editDep.allergies || ''} onChange={e => setEditDep({ ...editDep, allergies: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowEdit(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={saveEdit} disabled={editSaving}>
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessagesPage({ userId, userName }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [msgMenuId, setMsgMenuId] = useState(null);
  const deleteMessage = async (msgId) => {
    await supabase.from('messages').delete().eq('id', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setMsgMenuId(null);
  };
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef();
  const chatFileRef = useRef();
  const [selectedChatFile, setSelectedChatFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, [userId]);

  useEffect(() => {
    if (!selectedDoctor) return;
    fetchMessages();
    markAsRead();

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new;
        if (
          (msg.sender_id === userId && msg.receiver_id === selectedDoctor.user_id) ||
          (msg.sender_id === selectedDoctor.user_id && msg.receiver_id === userId)
        ) {
          setMessages(prev => [...prev, msg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [selectedDoctor]);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages]);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('doctors')
      .select('*')
      .eq('status', 'approved');
    setDoctors(data || []);
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!selectedDoctor || !userId) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${selectedDoctor.user_id}),and(sender_id.eq.${selectedDoctor.user_id},receiver_id.eq.${userId})`)
      .order('created_at');
    setMessages(data || []);
  };

  const markAsRead = async () => {
    if (!selectedDoctor || !userId) return;
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', selectedDoctor.user_id)
      .eq('read', false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedChatFile || !selectedDoctor || !userId) return;
    setSending(true);
    try {
      let file_url = null;
      let file_name = null;
      let file_type = null;

      if (selectedChatFile) {
        const ext = selectedChatFile.name.split('.').pop();
        const path = `chat/${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(path, selectedChatFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
        file_url = urlData.publicUrl;
        file_name = selectedChatFile.name;
        file_type = selectedChatFile.type;
      }

      const { data, error } = await supabase.from('messages').insert({
        sender_id: userId,
        receiver_id: selectedDoctor.user_id,
        sender_name: userName,
        content: newMessage.trim() || '',
        file_url,
        file_name,
        file_type,
      }).select().maybeSingle();

      if (!error && data) {
        setMessages(prev => [...prev, {
          ...data,
          file_type: selectedChatFile ? selectedChatFile.type : null,
          file_name: selectedChatFile ? selectedChatFile.name : null,
        }]);
        setNewMessage('');
        setSelectedChatFile(null);
        setFilePreview(null);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (e) {
      console.error('Send error:', e);
    }
    setSending(false);
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DR';

  const formatMsgTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos' });
    }
    return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', timeZone: 'Africa/Lagos' });
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="topbar">
        <div>
          <div className="page-title">Messages</div>
          <div className="page-sub">Chat with your doctors</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, overflow: 'hidden' }}>
        {/* Doctors list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...(showMobileChat ? { display: 'none' } : {}) }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #eef2f5', fontWeight: 700, fontSize: 13, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>
            Doctors
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>Loading...</div>
            ) : doctors.length === 0 ? (
              <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13, textAlign: 'center', fontFamily: "'Manrope',sans-serif" }}>No doctors available</div>
            ) : (
              doctors.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => { setSelectedDoctor(doc); setShowMobileChat(true); }}
                  style={{ padding: '12px 18px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: selectedDoctor?.id === doc.id ? 'var(--primary-pale)' : 'white', borderLeft: selectedDoctor?.id === doc.id ? '3px solid var(--primary)' : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', fontFamily: "'Montserrat',sans-serif", flexShrink: 0, overflow: 'hidden' }}>
                    {doc.avatar_url ? <img src={doc.avatar_url} alt={doc.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(doc.full_name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)', fontFamily: "'Manrope',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.full_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--primary)', fontFamily: "'Manrope',sans-serif" }}>{doc.specialty}</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: doc.is_available ? 'var(--success)' : '#dce8eb', flexShrink: 0 }} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', gridColumn: showMobileChat ? '1 / -1' : 'auto' }}>
          {!selectedDoctor ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)', fontFamily: "'Manrope',sans-serif", fontSize: 13 }}>
              Select a doctor to start messaging
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef2f5', display: 'flex', alignItems: 'center', gap: 12 }}>
  <button
    onClick={() => { setShowMobileChat(false); setSelectedDoctor(null); }}
    style={{ display: 'none', width: 32, height: 32, borderRadius: 8, border: '1.5px solid #dce8eb', background: 'white', cursor: 'pointer', fontSize: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    className="mobile-back-btn"
  >
    ←
  </button>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', fontFamily: "'Montserrat',sans-serif", overflow: 'hidden' }}>
                  {selectedDoctor.avatar_url ? <img src={selectedDoctor.avatar_url} alt={selectedDoctor.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(selectedDoctor.full_name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>{selectedDoctor.full_name}</div>
                  <div style={{ fontSize: 11, color: selectedDoctor.is_available ? 'var(--success)' : 'var(--slate)', fontFamily: "'Manrope',sans-serif", fontWeight: 600 }}>
                    {selectedDoctor.is_available ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif", marginTop: 40 }}>
                    No messages yet. Say hello to {selectedDoctor.full_name}!
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === userId;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', position: 'relative' }}
                        onMouseEnter={e => { const btn = e.currentTarget.querySelector('.msg-menu-btn'); if (btn) btn.style.opacity = '1'; }}
                        onMouseLeave={e => { const btn = e.currentTarget.querySelector('.msg-menu-btn'); if (btn) btn.style.opacity = '0'; }}
                      >
                        <button
                          className="msg-menu-btn"
                          onClick={() => setMsgMenuId(msgMenuId === msg.id ? null : msg.id)}
                          style={{ position: 'absolute', top: -8, [isMe ? 'left' : 'right']: -28, opacity: 0, transition: 'opacity 0.2s', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--slate)', padding: 4, borderRadius: 6, zIndex: 10 }}
                        >
                          ⋮
                        </button>
                        {msgMenuId === msg.id && (
                          <div style={{ position: 'absolute', top: 0, [isMe ? 'left' : 'right']: -110, background: 'white', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: 100, overflow: 'hidden' }}>
                            <div
                              onClick={() => deleteMessage(msg.id)}
                              style={{ padding: '10px 16px', fontSize: 13, color: 'var(--danger)', fontFamily: "'Manrope',sans-serif", fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                              onMouseLeave={e => e.currentTarget.style.background = 'white'}
                            >
                              🗑 Delete
                            </div>
                          </div>
                        )}
                        <div style={{
                          padding: msg.file_url && !msg.content ? '6px 10px' : '10px 14px',
                          borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          background: isMe ? 'var(--primary)' : '#f1f5f9',
                          color: isMe ? 'white' : 'var(--navy)',
                          fontSize: 13,
                          fontFamily: "'Manrope',sans-serif",
                          lineHeight: 1.5,
                        }}>
                          {msg.file_url && (
                            msg.file_type?.includes('image') ? (
                              <a href={msg.file_url} target="_blank" rel="noreferrer">
                                <img src={msg.file_url} alt={msg.file_name} style={{ maxWidth: 200, maxHeight: 160, borderRadius: 8, display: 'block' }} />
                              </a>
                            ) : (
                              <a href={msg.file_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: isMe ? 'white' : 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: 12 }}>
                                <span style={{ background: isMe ? 'rgba(255,255,255,0.2)' : 'var(--primary-pale)', padding: '3px 7px', borderRadius: 5, fontSize: 10, fontWeight: 800 }}>PDF</span>
                                {msg.file_name}
                              </a>
                            )
                          )}
                          {msg.content && <div>{msg.content}</div>}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--slate)', marginTop: 3, fontFamily: "'Manrope',sans-serif" }}>
                        {formatMsgTime(msg.created_at)}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid #eef2f5' }}>
                {filePreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--primary-pale)', borderRadius: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', fontFamily: "'Montserrat',sans-serif" }}>
                      {filePreview.type.includes('pdf') ? 'PDF' : 'IMG'}
                    </div>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--navy)', fontFamily: "'Manrope',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {filePreview.name}
                    </div>
                    <button onClick={() => { setFilePreview(null); setSelectedChatFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)', fontSize: 14 }}>✕</button>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => chatFileRef.current.click()}
                    style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    title="Attach file"
                  >
                    📎
                  </button>
                  <input
                    ref={chatFileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) { setSelectedChatFile(file); setFilePreview(file); }
                    }}
                  />
                  <input
                    className="form-input"
                    style={{ flex: 1, marginBottom: 0 }}
                    placeholder={`Message ${selectedDoctor.full_name}...`}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !selectedChatFile && sendMessage()}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '0 20px', flexShrink: 0 }}
                    onClick={sendMessage}
                    disabled={sending || (!newMessage.trim() && !selectedChatFile)}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TelemedicinePage({ userId, userName }) {
 
  const [doctors, setDoctors] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
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

  useEffect(() => {
    fetchDoctors();
    fetchWallet();
  }, [userId]);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('doctors')
      .select('*')
      .eq('status', 'approved');
    setDoctors(data || []);
    setLoading(false);
  };

  const fetchWallet = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    setWallet(data);
  };

  const confirmBooking = async () => {
    if (!userId || !selectedDoctor) return;
    setBookingError('');

    if (!wallet || Number(wallet.balance) < 1000) {
      setBookingError('Insufficient balance. Please fund your wallet with at least N1,500 to book a consultation.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      setBookingError('Please select a date and time.');
      return;
    }

    setBooking(true);
    try {
      const channel = `consult_${userId.replace(/-/g, '').slice(0, 16)}_${selectedDoctor.id.replace(/-/g, '').slice(0, 16)}`;
     // Parse the time correctly in WAT (UTC+1)
const parseWATTime = (date, time) => {
  // Convert "2:00 PM" to 24hr
  const [timePart, period] = time.split(' ')
  let [hours, minutes] = timePart.split(':').map(Number)
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  
  // Build ISO string manually with +01:00 offset (WAT)
  const [year, month, day] = date.split('-')
  const pad = n => String(n).padStart(2, '0')
  return `${year}-${month}-${day}T${pad(hours)}:${pad(minutes)}:00+01:00`
}

const appointmentDate = parseWATTime(selectedDate, selectedTime === 'AM' ? '9:00 AM' : '2:00 PM')

      const { error: apptError } = await supabase.from('appointments').insert({
        user_id: userId,
        patient_id: userId,
        patient_name: userName,
        doctor_id: selectedDoctor.id,
        doctor_name: selectedDoctor.full_name,
        title: `Consultation with ${selectedDoctor.full_name}`,
        date: appointmentDate,
        type: consultationType,
        status: 'upcoming',
        agora_channel: channel,
        notes: reason,
      });
      if (apptError) throw apptError;

      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_wallet_and_record', {
        p_user_id: userId,
        p_amount: 1500,
        p_name: `Consultation fee — ${selectedDoctor.full_name}`,
      });
      if (deductError) throw deductError;
      if (!deductResult.success) throw new Error(deductResult.error);

      setWallet({ ...wallet, balance: deductResult.new_balance });
      setBooking(false);
      setSelectedDoctor(null);
      setBookingStep(1);
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
      alert(`Booking confirmed! Your appointment with ${selectedDoctor.full_name} is scheduled for ${selectedDate} at ${selectedTime}. N1,500 has been deducted from your wallet.`);
    } catch (e) {
      setBookingError(e.message);
      setBooking(false);
    }
  };

  const startCall = async (doctor, type) => {
    if (!wallet || Number(wallet.balance) < 1500) {
      alert('Insufficient balance. Please fund your wallet with at least N1,500 to start a consultation.');
      return;
    }
  
    setCallDoctor(doctor);
    setCallType(type);
    setCallActive(true);
  
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setAgoraClient(client);
  
      // Generate clean channel name — no dashes, within 64 bytes
      const channel = `span${userId.replace(/-/g, '').slice(0, 10)}${doctor.id.replace(/-/g, '').slice(0, 10)}`;
  
      // Save appointment with channel name so doctor can join same channel
      const { error: apptError } = await supabase.from('appointments').insert({
        user_id: userId,
        patient_id: userId,
        patient_name: userName,
        doctor_id: doctor.id,
        doctor_name: doctor.full_name,
        title: `${type === 'video' ? 'Video' : 'Audio'} Call`,
        date: new Date().toISOString(),
        type: type,
        status: 'active',
        agora_channel: channel,
      });
      if (apptError) throw apptError;
      
       // Join with null token (works for testing in Agora without token auth)
       const tokenRes2 = await fetch(
        'https://ssmjjtbvrakzfsxezavp.supabase.co/functions/v1/agora-token',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbWpqdGJ2cmFremZzeGV6YXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzE5NzQsImV4cCI6MjA4NzQ0Nzk3NH0.f3VNuJC0Tu7wcYOoCDvFULVpuOVLQoAS0c39bpJKXRg',
          },
          body: JSON.stringify({ channelName: channel, uid: 0 }),
        }
      );
      const tokenData2 = await tokenRes2.json();
      const agoraToken2 = tokenData2.token;
      await client.join(AGORA_APP_ID, channel, agoraToken2, userId.replace(/-/g, '').slice(0, 8));
      if (type === 'video') {
        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTrack([micTrack, camTrack]);
        camTrack.play(localRef.current);
        await client.publish([micTrack, camTrack]);
      } else {
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalTrack([micTrack]);
        await client.publish([micTrack]);
      }
      
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') user.videoTrack?.play(remoteRef.current);
        if (mediaType === 'audio') user.audioTrack?.play();
        setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
      });
      
      client.on('user-unpublished', (user) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      });
      // Only deduct AFTER successfully joining
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_wallet_and_record', {
        p_user_id: userId,
        p_amount: 1500,
        p_name: `${type === 'video' ? 'Video' : 'Audio'} consultation — ${doctor.full_name}`,
      });
      if (deductError) throw deductError;
      if (!deductResult.success) throw new Error(deductResult.error);
      setWallet({ ...wallet, balance: deductResult.new_balance });
  
    } catch (e) {
      console.error('Agora error:', e);
      alert('Call error: ' + e.message);
      setCallActive(false);
      setAgoraClient(null);
      setLocalTrack(null);
    }
  };

  const endCall = async () => {
    if (localTrack) {
      (Array.isArray(localTrack) ? localTrack : [localTrack]).forEach(t => { t.stop(); t.close(); });
    }
    if (agoraClient) await agoraClient.leave();
    await supabase.from('appointments').update({ status: 'completed' }).eq('user_id', userId).eq('status', 'active');
    setCallActive(false);
    setAgoraClient(null);
    setLocalTrack(null);
    setRemoteUsers([]);
    setCallDoctor(null);
  };

  const filtered = filter === 'all' ? doctors : doctors.filter(d => d.is_available === (filter === 'online'));
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DR';

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Telemedicine</div>
          <div className="page-sub">Consult with qualified doctors from anywhere — N1,500 flat rate</div>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          {['all', 'online', 'offline'].map(f => (
            <button key={f} className={'btn btn-sm ' + (filter === f ? 'btn-primary' : 'btn-outline')} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All Doctors' : f === 'online' ? 'Available' : 'Unavailable'}
            </button>
          ))}
        </div>
      </div>

      {wallet && Number(wallet.balance) < 1000 && (
        <div style={{ background: '#fee2e2', border: '1.5px solid var(--danger)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#991b1b', fontFamily: "'Manrope',sans-serif" }}>
          <strong>Low balance:</strong> Your wallet balance is insufficient for a consultation. Please fund your wallet with at least N1,500.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", color: 'var(--success)' }}>{doctors.filter(d => d.is_available).length}</div>
          <div style={{ fontSize: 12, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>Available Now</div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", color: 'var(--primary)' }}>{doctors.length}</div>
          <div style={{ fontSize: 12, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>Total Doctors</div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", color: 'var(--warning)' }}>N1,500</div>
          <div style={{ fontSize: 12, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>Flat Rate Per Session</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)' }}>Loading doctors...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)' }}>No doctors found.</div>
      ) : (
        <div className="doctors-grid">
          {filtered.map(doc => (
            <div key={doc.id} className="doctor-card">
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div className="doctor-avatar">
                  {doc.avatar_url ? <img src={doc.avatar_url} alt={doc.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} /> : getInitials(doc.full_name)}
                </div>
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
              {doc.bio && (
                <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 10, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {doc.bio}
                </div>
              )}
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
        <div className="modal-title">
          {bookingStep === 1 ? 'Book Consultation' : 'Confirm Booking'}
        </div>
        <button className="modal-close" onClick={() => setSelectedDoctor(null)}>X</button>
      </div>
      <div className="modal-body">

        {/* Doctor summary */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 14, background: 'var(--bg)', borderRadius: 12, marginBottom: 20 }}>
          <div className="doctor-avatar">{getInitials(selectedDoctor.full_name)}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>{selectedDoctor.full_name}</div>
            <div style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>{selectedDoctor.specialty}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>N1,500</div>
            <div style={{ fontSize: 11, color: 'var(--slate)' }}>consultation fee</div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: bookingStep >= s ? 'var(--primary)' : '#dce8eb' }} />
          ))}
        </div>

        {/* STEP 1 — Survey */}
        {bookingStep === 1 && (
          <>
            <div className="form-group">
              <label className="form-label">Select Date</label>
              <input
                className="form-input"
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Time</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['AM', 'PM'].map(period => (
                  <div
                    key={period}
                    onClick={() => setSelectedTime(period)}
                    style={{
                      border: `1.5px solid ${selectedTime === period ? 'var(--primary)' : '#dce8eb'}`,
                      borderRadius: 10, padding: '14px', textAlign: 'center', cursor: 'pointer',
                      fontSize: 14, fontWeight: 700,
                      color: selectedTime === period ? 'var(--primary)' : 'var(--navy)',
                      background: selectedTime === period ? 'var(--primary-pale)' : 'white',
                      fontFamily: "'Montserrat', sans-serif"
                    }}
                  >
                    {period === 'AM' ? 'Morning (AM)' : 'Afternoon (PM)'}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {['video', 'audio', 'chat'].map(t => (
                  <div
                    key={t}
                    onClick={() => setConsultationType(t)}
                    style={{
                      border: `1.5px solid ${consultationType === t ? 'var(--primary)' : '#dce8eb'}`,
                      borderRadius: 10, padding: 12, textAlign: 'center', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600,
                      color: consultationType === t ? 'var(--primary)' : 'var(--navy)',
                      background: consultationType === t ? 'var(--primary-pale)' : 'white'
                    }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Main Concern</label>
              <select className="form-select" value={reason} onChange={e => setReason(e.target.value)}>
                <option value="">Select your concern</option>
                {['Fever / Malaria', 'Hypertension', 'Diabetes', 'Respiratory issues', 'Skin condition', "Women's health", 'Child health', 'General checkup', 'Other'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">How Long Has This Been Going On?</label>
              <select className="form-select" value={surveyDuration} onChange={e => setSurveyDuration(e.target.value)}>
                <option value="">Select duration</option>
                {['Today', '2–3 days', 'About a week', 'More than a week', 'Chronic / ongoing'].map(d => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Severity</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {['1–2', '3–4', '5–6', '7–8', '9–10'].map((s, i) => (
                  <div
                    key={s}
                    onClick={() => setSurveySeverity(s)}
                    style={{
                      border: `1.5px solid ${surveySeverity === s ? 'var(--primary)' : '#dce8eb'}`,
                      borderRadius: 8, padding: '8px 4px', textAlign: 'center', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                      background: surveySeverity === s ? (i < 2 ? '#dcfce7' : i < 4 ? '#fef9c3' : '#fee2e2') : 'white',
                      color: surveySeverity === s ? (i < 2 ? '#166634' : i < 4 ? '#854d0e' : '#991b1b') : 'var(--navy)',
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--slate)', marginTop: 4, fontFamily: "'Manrope',sans-serif" }}>
                <span>Mild</span><span>Severe</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes (optional)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Any other symptoms or information for the doctor..."
                value={surveyNotes}
                onChange={e => setSurveyNotes(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ background: 'var(--primary-pale)', border: '1.5px solid var(--secondary)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--primary-dark)', fontFamily: "'Manrope',sans-serif", lineHeight: 1.6 }}>
              The doctor receives your survey instantly and will respond within minutes.
            </div>

            {bookingError && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{bookingError}</div>
            )}

            <button
              className="btn btn-primary"
              onClick={() => setBookingStep(2)}
              disabled={!selectedDate || !selectedTime || !reason || !surveyDuration || !surveySeverity}
            >
              Review Booking
            </button>
          </>
        )}

        {/* STEP 2 — Confirm */}
        {bookingStep === 2 && (
          <>
            <div style={{ background: 'var(--primary-pale)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
              <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 12, fontSize: 13, fontFamily: "'Montserrat',sans-serif" }}>Booking Summary</div>
              <div style={{ fontSize: 13, lineHeight: 2.2, fontFamily: "'Manrope',sans-serif" }}>
                <div>Date: <strong>{selectedDate}</strong></div>
                <div>Time: <strong>{selectedTime === 'AM' ? 'Morning (AM)' : 'Afternoon (PM)'}</strong></div>
                <div>Type: <strong>{consultationType}</strong></div>
                <div>Concern: <strong>{reason}</strong></div>
                <div>Duration: <strong>{surveyDuration}</strong></div>
                <div>Severity: <strong>{surveySeverity}</strong></div>
                {surveyNotes && <div>Notes: <strong>{surveyNotes}</strong></div>}
                <div>Fee: <strong style={{ color: 'var(--danger)' }}>N1,500</strong> will be deducted</div>
              </div>
            </div>

            {bookingError && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{bookingError}</div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setBookingStep(1)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={confirmBooking} disabled={booking}>
                {booking ? 'Confirming...' : 'Confirm Booking — N1,500'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  </div>
)}
    </div>
  );
}

function DocumentsPage({ userId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [label, setLabel] = useState('General');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef();

  const CATEGORIES = ['General', 'Lab Result', 'Prescription', 'Scan', 'Report', 'Insurance', 'Other'];

  useEffect(() => {
    if (!userId) return;
    fetchDocuments();
  }, [userId]);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setDocuments(data || []);
    setLoading(false);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only JPG, PNG and PDF files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be under 10MB.');
      return;
    }
    setUploadError('');
    setSelectedFile(file);
  };

  const uploadDocument = async () => {
    if (!selectedFile || !userId) return;
    setUploading(true);
    setUploadError('');
    try {
      const ext = selectedFile.name.split('.').pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, selectedFile, { upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(path);

      const { data, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          name: selectedFile.name,
          file_url: urlData.publicUrl,
          type: selectedFile.type,
          file_size: selectedFile.size,
          label: label,
        })
        .select()
        .maybeSingle();
      if (dbError) throw dbError;

      setDocuments([data, ...documents]);
      setShowUpload(false);
      setSelectedFile(null);
      setLabel('General');
    } catch (e) {
      setUploadError('Upload failed: ' + e.message);
    }
    setUploading(false);
  };

  const deleteDocument = async (doc) => {
    if (!window.confirm('Delete this document?')) return;
    const path = doc.file_url.split('/documents/')[1];
    await supabase.storage.from('documents').remove([path]);
    await supabase.from('documents').delete().eq('id', doc.id);
    setDocuments(documents.filter(d => d.id !== doc.id));
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type) => {
    if (!type) return 'DOC';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image')) return 'IMG';
    return 'DOC';
  };

  const getFileColor = (type) => {
    if (!type) return '#e8f6f9';
    if (type.includes('pdf')) return '#fee2e2';
    if (type.includes('image')) return '#dcfce7';
    return '#e8f6f9';
  };

  const getFileTextColor = (type) => {
    if (!type) return 'var(--primary)';
    if (type.includes('pdf')) return 'var(--danger)';
    if (type.includes('image')) return 'var(--success)';
    return 'var(--primary)';
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Health Documents</div>
          <div className="page-sub">Upload and manage your medical records</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>+ Upload Document</button>
      </div>

      {/* Upload zone */}
      <div
        className="upload-zone"
        style={{ border: `2px dashed ${dragOver ? 'var(--primary)' : '#b0cccf'}`, background: dragOver ? 'var(--primary-pale)' : 'white', cursor: 'pointer', marginBottom: 24 }}
        onClick={() => fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); setShowUpload(true); }}
      >
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontWeight: 800, fontSize: 11, color: 'var(--primary)', fontFamily: "'Montserrat',sans-serif" }}>
          UPLOAD
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>
          Drag and drop files here or click to browse
        </div>
        <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6, fontFamily: "'Manrope',sans-serif" }}>
          Supports JPG, PNG and PDF — Max 10MB
        </div>
        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={e => { handleFileSelect(e.target.files[0]); setShowUpload(true); }} />
      </div>

      {/* Documents list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>Loading...</div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>
          No documents uploaded yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {documents.map(doc => (
            <div key={doc.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: getFileColor(doc.type), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: getFileTextColor(doc.type), fontFamily: "'Montserrat',sans-serif", flexShrink: 0 }}>
                {getFileIcon(doc.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doc.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 3, fontFamily: "'Manrope',sans-serif" }}>
                  {doc.label} · {formatSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                
              href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                  
                <button
                  className="btn btn-sm"
                  style={{ background: '#fee2e2', color: 'var(--danger)', border: 'none' }}
                  onClick={() => deleteDocument(doc)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => { setShowUpload(false); setSelectedFile(null); setUploadError(''); }}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Upload Document</div>
              <button className="modal-close" onClick={() => { setShowUpload(false); setSelectedFile(null); setUploadError(''); }}>X</button>
            </div>
            <div className="modal-body">
              {!selectedFile ? (
                <div
                  style={{ border: '2px dashed #b0cccf', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => fileRef.current.click()}
                >
                  <div style={{ fontSize: 13, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>
                    Click to select a file
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 6, fontFamily: "'Manrope',sans-serif" }}>
                    JPG, PNG or PDF — Max 10MB
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--primary-pale)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: getFileColor(selectedFile.type), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: getFileTextColor(selectedFile.type), fontFamily: "'Montserrat',sans-serif" }}>
                    {getFileIcon(selectedFile.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)', fontFamily: "'Manrope',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedFile.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>{formatSize(selectedFile.size)}</div>
                  </div>
                  <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: 'var(--slate)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
              )}

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Category</label>
                <select className="form-select" value={label} onChange={e => setLabel(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {uploadError && (
                <div style={{ background: '#fee2e2', color: 'var(--danger)', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16, fontFamily: "'Manrope',sans-serif" }}>
                  {uploadError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowUpload(false); setSelectedFile(null); setUploadError(''); }}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={uploadDocument} disabled={uploading || !selectedFile}>
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentsPage({ userId }) {
  const [tab, setTab] = useState('Upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const formatApptTime = (iso) => {
    if (!iso) return 'N/A'
    return new Date(iso).toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Lagos'
    }) + ' WAT'
  }

  const formatApptDate = (iso) => {
    if (!iso) return 'N/A'
    return new Date(iso).toLocaleDateString('en-NG', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Africa/Lagos'
    })
  }

  useEffect(() => {
    if (!userId) return;
    fetchAppointments();
  }, [userId]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    setAppointments(data || []);
    setLoading(false);
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-NG', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Africa/Lagos'
    });
  };

  const formatTime = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleTimeString('en-NG', {
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'Africa/Lagos'
    }) + ' WAT';
  };

  const filtered = appointments.filter(a => {
    if (tab === 'Upcoming') return a.status === 'upcoming' || a.status === 'active';
    if (tab === 'Completed') return a.status === 'completed';
    if (tab === 'Cancelled') return a.status === 'cancelled';
    return true;
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Appointments</div>
          <div className="page-sub">Your scheduled and past consultations</div>
        </div>
      </div>

      <div className="tab-bar">
        {['Upcoming', 'Completed', 'Cancelled'].map(t => (
          <button
            key={t}
            className={'tab-btn' + (tab === t ? ' active' : '')}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Upcoming' && appointments.filter(a => a.status === 'upcoming' || a.status === 'active').length > 0 && (
              <span style={{ marginLeft: 6, background: 'var(--primary)', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                {appointments.filter(a => a.status === 'upcoming' || a.status === 'active').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>
          No {tab.toLowerCase()} appointments.
        </div>
      ) : (
        <div className="schedule-list">
          {filtered.map(a => (
            <div key={a.id} className="appt-item">
              <div style={{ minWidth: 70, textAlign: 'center' }}>
              <div className="appt-time-val">{formatApptTime(a.date)}</div>
              <div className="appt-time-date">{formatApptDate(a.date)}</div>
              </div>
              <div className="appt-divider" />
              <div style={{ flex: 1 }}>
                <div className="appt-title">{a.title || 'Consultation'}</div>
                <div className="appt-doctor">{a.doctor_name || 'Doctor'}</div>
                {a.notes && (
                  <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 3, fontFamily: "'Manrope',sans-serif" }}>
                    {a.notes}
                  </div>
                )}
              </div>
              <span className={'badge ' + (
                a.status === 'completed' ? 'badge-success' :
                a.status === 'cancelled' ? 'badge-danger' :
                a.status === 'active' ? 'badge-warning' : 'badge-info'
              )}>
                {a.status || 'upcoming'}
              </span>
              <div style={{ display: 'flex', gap: 7 }}>
                {(a.status === 'upcoming' || a.status === 'active') && (
                  <button
                    className="btn btn-sm"
                    style={{ background: '#fee2e2', color: 'var(--danger)', border: 'none' }}
                    onClick={() => cancelAppointment(a.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WellnessPage() {
  return (
    <div>
      <div className="topbar"><div><div className="page-title">Wellness Tracker</div><div className="page-sub">Monitor your health metrics and goals</div></div><button className="btn btn-primary btn-sm">+ Log Reading</button></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="health-score-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div><div className="card-title">Overall Health Score</div><div className="card-sub">Updated weekly</div></div>
            <div className="health-score-value">82</div>
          </div>
          <div className="health-score-bar"><div className="health-score-fill" style={{ width: "82%" }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
            {[{ label: "BMI", value: "25.5" }, { label: "BP", value: "120/80" }, { label: "Sugar", value: "98 mg" }].map(m => (
              <div key={m.label} style={{ textAlign: "center", background: "rgba(255,255,255,0.6)", borderRadius: 9, padding: 9 }}>
                <div style={{ fontSize: 10, color: "var(--slate)", fontWeight: 700, textTransform: "uppercase", fontFamily: "'Montserrat',sans-serif" }}>{m.label}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--navy)", marginTop: 3, fontFamily: "'Montserrat',sans-serif" }}>{m.value}</div>
                <div style={{ fontSize: 11, color: "var(--primary)", fontFamily: "'Manrope',sans-serif" }}>Normal</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>Today's Goals</div>
          {[{ label: "Steps", target: 10000, current: 7234, unit: "steps", color: "var(--primary)" }, { label: "Water Intake", target: 8, current: 5, unit: "glasses", color: "#3b82f6" }, { label: "Sleep", target: 8, current: 7, unit: "hrs", color: "#8b5cf6" }, { label: "Active Minutes", target: 30, current: 22, unit: "mins", color: "var(--warning)" }].map(g => (
            <div key={g.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}><span style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)", fontFamily: "'Manrope',sans-serif" }}>{g.label}</span><span style={{ fontSize: 12, color: "var(--slate)", fontFamily: "'Manrope',sans-serif" }}>{g.current}/{g.target} {g.unit}</span></div>
              <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", background: g.color, borderRadius: 3, width: Math.min(g.current / g.target * 100, 100) + "%" }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[{ label: "Heart Rate", value: "72", unit: "bpm", tag: "HR", bg: "#fee2e2", color: "#991b1b" }, { label: "Blood Pressure", value: "120/80", unit: "mmHg", tag: "BP", bg: "#dcfce7", color: "#166534" }, { label: "Blood Sugar", value: "98", unit: "mg/dL", tag: "BS", bg: "#eff6ff", color: "#1d4ed8" }, { label: "Temperature", value: "36.7", unit: "Celsius", tag: "TMP", bg: "#fef9c3", color: "#854d0e" }].map(m => (
          <div key={m.label} className="card">
            <div style={{ width: 38, height: 38, borderRadius: 9, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 10, color: m.color, marginBottom: 10, fontFamily: "'Montserrat',sans-serif" }}>{m.tag}</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", color: "var(--navy)" }}>{m.value}</div>
            <div style={{ fontSize: 11, color: "var(--slate)", fontFamily: "'Manrope',sans-serif" }}>{m.unit}</div>
            <div style={{ fontSize: 11, color: "var(--navy)", marginTop: 3, fontFamily: "'Manrope',sans-serif" }}>{m.label}</div>
            <span className="badge badge-success" style={{ marginTop: 7 }}>Normal</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClaimsPage() {
  return (
    <div>
      <div className="topbar"><div><div className="page-title">Claims</div><div className="page-sub">Submit and track your health claims</div></div><button className="btn btn-primary btn-sm">+ File Claim</button></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {[{ label: "Total Claims", value: "4", color: "var(--primary)" }, { label: "Approved", value: "2", color: "var(--success)" }, { label: "Pending", value: "1", color: "var(--warning)" }].map(s => (
          <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><div className="card-title">Claims History</div><button className="btn btn-primary btn-sm">+ New Claim</button></div>
        <table className="claims-table">
          <thead><tr><th>Claim ID</th><th>Service</th><th>Provider</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {CLAIMS.map(c => (
              <tr key={c.id}>
                <td style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, color: "var(--primary)", fontSize: 12 }}>{c.id}</td>
                <td>{c.service}</td>
                <td style={{ color: "var(--slate)" }}>{c.doctor}</td>
                <td style={{ color: "var(--slate)" }}>{c.date}</td>
                <td style={{ fontWeight: 700, fontFamily: "'Montserrat',sans-serif" }}>{c.amount}</td>
                <td><span className={"badge " + (c.status === "approved" ? "badge-success" : c.status === "pending" ? "badge-warning" : "badge-danger")}>{c.status === "approved" ? "Approved" : c.status === "pending" ? "Pending" : "Rejected"}</span></td>
                <td><button className="btn btn-ghost btn-sm">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Transactions({ userId, userName }) {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error) {
        setTransactions(data || []);
        setFiltered(data || []);
      }
    } catch (e) {
      console.error('Transactions fetch error:', e.message);
    }
    setLoading(false);
  };

  // Apply filters
  useEffect(() => {
    let result = [...transactions];
    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }
    if (dateFrom) {
      result = result.filter(t => new Date(t.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      result = result.filter(t => new Date(t.created_at) <= new Date(dateTo + 'T23:59:59'));
    }
    setFiltered(result);
  }, [typeFilter, dateFrom, dateTo, transactions]);

  const totalCredits = filtered
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDebits = filtered
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const fmt = (n) => `N${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const getTxnStyle = (txn) => {
    const desc = (txn.description || '').toLowerCase();
    if (txn.type === 'credit') return { label: 'TOP', bg: '#dcfce7', color: '#166634' };
    if (desc.includes('consult') || desc.includes('doctor')) return { label: 'MED', bg: '#fee2e2', color: '#991b1b' };
    if (desc.includes('lab') || desc.includes('test')) return { label: 'LAB', bg: '#eff6ff', color: '#1d4ed8' };
    if (desc.includes('pharma') || desc.includes('drug') || desc.includes('medic')) return { label: 'PHM', bg: '#f3e8ff', color: '#6b21a8' };
    if (desc.includes('insur')) return { label: 'INS', bg: '#fef9c3', color: '#854d0e' };
    return { label: 'TXN', bg: '#f4f9fa', color: '#5a7a8a' };
  };

  const formatTxnDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const time = d.toLocaleTimeString('en-NG', { 
      hour: '2-digit', minute: '2-digit', second: '2-digit', 
      hour12: true, timeZone: 'Africa/Lagos' 
    }) + ' WAT';
    if (d.toDateString() === today.toDateString())
      return `Today, ${time}`;
    if (d.toDateString() === yesterday.toDateString())
      return `Yesterday, ${time}`;
    return d.toLocaleDateString('en-NG', { 
      day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Africa/Lagos'
    }) + ', ' + time;
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setTypeFilter('all');
    setShowFilter(false);
  };

  const hasFilters = dateFrom || dateTo || typeFilter !== 'all';

  // PDF Export
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Header background
    doc.setFillColor(13, 110, 130);
    doc.rect(0, 0, 210, 30, 'F');

    // Logo text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Span Healthcare', 14, 13);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Health Savings Platform', 14, 21);

    // Statement label top right
    doc.setFontSize(10);
    doc.text('TRANSACTION STATEMENT', 140, 13);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' })}`, 140, 21);

    // User info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Account Name: ${userName || 'Member'}`, 14, 42);
    doc.text(`Period: ${dateFrom || 'All time'} to ${dateTo || 'Today'}`, 14, 50);

    // Summary box
    doc.setFillColor(232, 246, 249);
    doc.roundedRect(14, 57, 182, 24, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(90, 122, 138);
    doc.text('TOTAL FUNDED', 22, 65);
    doc.text('TOTAL SPENT', 90, 65);
    doc.text('NET', 160, 65);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(47, 184, 138);
    doc.text(fmt(totalCredits), 22, 75);
    doc.setTextColor(224, 82, 82);
    doc.text(fmt(totalDebits), 90, 75);
    const net = totalCredits - totalDebits;
    doc.setTextColor(net >= 0 ? 47 : 224, net >= 0 ? 184 : 82, net >= 0 ? 138 : 82);
    doc.text(fmt(net), 160, 75);

    // Table
    const tableRows = filtered.map(t => [
      new Date(t.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }),
      t.description || 'Transaction',
      t.type === 'credit' ? 'Credit' : 'Debit',
      `${t.type === 'credit' ? '+' : '-'}${fmt(t.amount)}`,
    ]);
    
    import('jspdf-autotable').then(({ default: autoTable }) => {
      autoTable(doc, {
        startY: 88,
        head: [['Date', 'Description', 'Type', 'Amount']],
        body: tableRows,
        headStyles: {
          fillColor: [13, 110, 130],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [244, 249, 250] },
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 90 },
          2: { cellWidth: 28 },
          3: { cellWidth: 32, halign: 'right' },
        },
        didParseCell: (data) => {
          if (data.column.index === 3 && data.section === 'body') {
            const val = data.cell.text[0] || '';
            data.cell.styles.textColor = val.startsWith('+') ? [47, 184, 138] : [224, 82, 82];
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });
    
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Span Healthcare — Confidential | Page ${i} of ${pageCount}`,
          14,
          doc.internal.pageSize.height - 8
        );
      }
    
      doc.save(`SpanHC_Statement_${dateFrom || 'all'}_to_${dateTo || 'today'}.pdf`);
    });
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-sub">Full history of your wallet activity</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-outline btn-sm"
            style={{ width: 'auto', position: 'relative' }}
            onClick={() => setShowFilter(!showFilter)}
          >
            {hasFilters ? '● Filter Active' : 'Filter'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            style={{ width: 'auto' }}
            onClick={downloadPDF}
            disabled={filtered.length === 0}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="card" style={{ marginBottom: 16, padding: '20px 24px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', marginBottom: 16, fontFamily: "'Montserrat',sans-serif" }}>
            Filter Transactions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From Date</label>
              <input
                className="form-input"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To Date</label>
              <input
                className="form-input"
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Transaction Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'credit', 'debit'].map(t => (
                <button
                  key={t}
                  className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: 'auto' }}
                  onClick={() => setTypeFilter(t)}
                >
                  {t === 'all' ? 'All' : t === 'credit' ? 'Credits Only' : 'Debits Only'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary btn-sm"
              style={{ width: 'auto' }}
              onClick={() => setShowFilter(false)}
            >
              Apply Filter
            </button>
            {hasFilters && (
              <button
                className="btn btn-sm"
                style={{ background: '#fee2e2', color: 'var(--danger)', border: 'none', width: 'auto' }}
                onClick={clearFilters}
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        <div className="stat-card">
          <span className="stat-tag" style={{ background: '#dcfce7', color: '#166634' }}>IN</span>
          <div className="stat-value" style={{ marginTop: 6, fontSize: 20 }}>
            {loading ? '—' : fmt(totalCredits)}
          </div>
          <div className="stat-label">Total Funded</div>
          <div className="stat-change up">
            {filtered.filter(t => t.type === 'credit').length} credit(s)
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-tag" style={{ background: '#fee2e2', color: '#991b1b' }}>OUT</span>
          <div className="stat-value" style={{ marginTop: 6, fontSize: 20 }}>
            {loading ? '—' : fmt(totalDebits)}
          </div>
          <div className="stat-label">Total Spent</div>
          <div className="stat-change down">
            {filtered.filter(t => t.type === 'debit').length} debit(s)
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-tag" style={{ background: '#e8f6f9', color: '#2d8a9e' }}>NET</span>
          <div className="stat-value" style={{ marginTop: 6, fontSize: 20, color: totalCredits - totalDebits >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {loading ? '—' : fmt(totalCredits - totalDebits)}
          </div>
          <div className="stat-label">Net</div>
          <div className="stat-change up">{filtered.length} shown</div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate)', fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>
            Loading transactions...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'var(--primary)', margin: '0 auto 14px', fontFamily: "'Montserrat',sans-serif" }}>
              EMPTY
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>
              {hasFilters ? 'No transactions match your filters' : 'No transactions yet'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 6, fontFamily: "'Manrope',sans-serif" }}>
              {hasFilters ? 'Try adjusting or clearing your filters' : 'Your transaction history will appear here once you fund your wallet'}
            </div>
            {hasFilters && (
              <button className="btn btn-outline btn-sm" style={{ marginTop: 14, width: 'auto' }} onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="txn-list">
            {filtered.map(t => {
              const style = getTxnStyle(t);
              return (
                <div key={t.id} className="txn-item">
                  <div className="txn-icon" style={{ background: style.bg, color: style.color }}>
                    {style.label}
                  </div>
                  <div className="txn-info">
                    <div className="txn-name">{t.description || 'Transaction'}</div>
                    <div className="txn-date">
                      {formatTxnDate(t.created_at)}
                      {t.reference && (
                        <span style={{ marginLeft: 8, background: '#f1f5f9', padding: '1px 7px', borderRadius: 20, fontSize: 10, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>
                          Ref: {t.reference}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`txn-amount ${t.type}`}>
                      {t.type === 'credit' ? '+' : '-'}N{Number(t.amount).toLocaleString()}
                    </div>
                    <span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: 10, marginTop: 3 }}>
                      {t.type}
                    </span>
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

function SettingsToggle({ on = true }) {
  const [isOn, setIsOn] = useState(on);
  return (
    <div className={"toggle" + (isOn ? "" : " off")} onClick={() => setIsOn(!isOn)}>
      <div className="toggle-thumb" />
    </div>
  );
}

function Settings() {
  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Get Help</div>
          <div className="page-sub">We are always here for you</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center', padding: '48px 40px' }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", marginBottom: 16 }}>
          Need Assistance?
        </div>
        <div style={{ fontSize: 15, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif", lineHeight: 1.8, marginBottom: 36 }}>
          We're here to support you. Reach out through any of the options below.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <a href="mailto:info@spanhealthcare.com.ng" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', background: 'var(--primary-pale)', borderRadius: 14, textDecoration: 'none', border: '1.5px solid var(--primary)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', fontFamily: "'Montserrat',sans-serif", flexShrink: 0 }}>EMAIL</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif", marginBottom: 2 }}>Email Us</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>info@spanhealthcare.com.ng</div>
            </div>
          </a>
          <a href="tel:0700SPANHEALTHCARE" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', background: '#f0fdf4', borderRadius: 14, textDecoration: 'none', border: '1.5px solid var(--success)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', fontFamily: "'Montserrat',sans-serif", flexShrink: 0 }}>CALL</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif", marginBottom: 2 }}>Call Us</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>0700-SPANHEALTHCARE</div>
            </div>
          </a>
        </div>

        <div style={{ marginTop: 36, fontSize: 12, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif", lineHeight: 1.8 }}>
          Our support team is available Monday – Friday, 8:00 AM – 6:00 PM WAT.
        </div>
      </div>
    </div>
  );
}

function PasswordResetModal({ onClose }) {
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
      setTimeout(() => {
        onClose();
        window.location.href = '/';
      }, 2000);
    } catch(e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Set New Password</div>
        </div>
        <div className="modal-body">
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>✓</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif", marginBottom: 8 }}>Password Updated!</div>
              <div style={{ fontSize: 13, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>
                Your password has been changed successfully. Redirecting you now...
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 20, lineHeight: 1.7, fontFamily: "'Manrope',sans-serif" }}>
                Choose a strong new password for your account.
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                />
              </div>
              {error && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16, fontFamily: "'Manrope',sans-serif" }}>
                  {error}
                </div>
              )}
              <button
                className="btn btn-primary"
                onClick={handleReset}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userPhoto] = useState(null);
  const [userName, setUserName] = useState("Loading...");
  const [userId, setUserId] = useState(null);
  const [doctorUser, setDoctorUser] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    // Check if this is a password recovery redirect
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setShowPasswordReset(true);
      return; // don't auto-login, show reset modal first
    }
  
    getCurrentUser().then(user => {
      if (user) {
        setAuthed(true);
        setUserId(user.id);
        getProfile(user.id).then(profile => {
          if (profile) setUserName(profile.full_name ? profile.full_name.split(' ')[0] : 'User');
        }).catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthed(false);
        setShowPasswordReset(true);
      }
      if (event === 'SIGNED_IN' && !showPasswordReset) {
        if (session?.user) {
          setAuthed(true);
          setUserId(session.user.id);
          getProfile(session.user.id).then(profile => {
            if (profile) setUserName(profile.full_name ? profile.full_name.split(' ')[0] : 'User');
          }).catch(() => {});
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setAuthed(true);
    setUserId(user.id);
    getProfile(user.id).then(profile => {
      if (profile) setUserName(profile.full_name);
    }).catch(() => {});
    setPage("dashboard");
  };

  const handleLogout = async () => {
    await logoutUser();
    setAuthed(false);
    setUserId(null);
    setUserName("Loading...");
    setPage("dashboard");
  };
  const handleDoctorLogin = (user, profile) => {
    setDoctorUser(user);
    setDoctorProfile(profile);
    setAuthed(true);
  };
  const pages = {
    dashboard: <Dashboard onNav={setPage} userName={userName} userId={userId} />,
    wallet: <WalletPage userId={userId} />,
    transactions: <Transactions userId={userId} userName={userName} />,
    telemedicine: <TelemedicinePage userId={userId} userName={userName} />,
    chat: <MessagesPage userId={userId} userName={userName} />,
    appointments: <AppointmentsPage userId={userId} />,
    documents: <DocumentsPage userId={userId} />,
    wellness: <WellnessPage />,
    profile: <ProfilePage userId={userId} />,
    dependents: <DependentsPage userId={userId} />,
    claims: <ClaimsPage />,
    settings: <Settings />,
  };

  if (!authed) return (
    <>
      <style>{styles}</style>
      {showPasswordReset && (
  <PasswordResetModal onClose={() => {
    setShowPasswordReset(false);
    // Clear the hash from URL
    window.history.replaceState(null, '', window.location.pathname);
  }} />
)}
      <AuthScreen onLogin={handleLogin} onDoctorLogin={handleDoctorLogin} />
    </>
  );

  if (!authed) return <><style>{styles}</style><AuthScreen onLogin={handleLogin} onDoctorLogin={handleDoctorLogin} /></>;

if (authed && doctorProfile) {
  return (
    <>
      <style>{styles}</style>
      <DoctorDashboard
        doctorProfile={doctorProfile}
        doctorUser={doctorUser}
        onLogout={handleLogout}
      />
    </>
  );
}

return (
  <>
    <style>{styles}</style>
    <div className="app">
      <div className="main-layout">
      <Sidebar active={page} onNav={(p) => { setPage(p); setSidebarOpen(false); }} userPhoto={userPhoto} userName={userName} onLogout={handleLogout} mobileOpen={sidebarOpen} />
      {sidebarOpen && (
  <div
    onClick={() => setSidebarOpen(false)}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }}
  />
)}
      <div className="main-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #eef2f5' }}>
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="mobile-menu-btn"
      style={{ width: 40, height: 40, borderRadius: 10, border: '1.5px solid #dce8eb', background: 'white', cursor: 'pointer', fontSize: 18, alignItems: 'center', justifyContent: 'center', display: 'none' }}
    >
      ☰
    </button>
    <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>
      Span Healthcare
    </div>
    <div style={{ marginLeft: 'auto' }}>
      <NotificationBell userId={userId} />
    </div>
  </div>
  {pages[page] || pages.dashboard}
</div>
      </div>
    </div>
  </>
);
}// mobile fix Fri Mar  6 20:37:23 UTC 2026

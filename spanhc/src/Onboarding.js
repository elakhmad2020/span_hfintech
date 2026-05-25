import { useState } from 'react';
import { supabase } from './supabase';

const NIGERIAN_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];

const STEPS = ['Account Type','Personal Details','Contact Information','Health & Next of Kin','Declaration'];

const inputStyle = { width:'100%', padding:'11px 14px', border:'1.5px solid #dce8eb', borderRadius:9, fontSize:14, fontFamily:"'Manrope',sans-serif", color:'#0B2A30', background:'#f9fbfc', outline:'none', boxSizing:'border-box' };
const inputErrStyle = { ...inputStyle, border:'1.5px solid #e05252', background:'#fff8f8' };
const selectStyle = { ...inputStyle, cursor:'pointer' };
const labelStyle = { display:'block', fontSize:11, fontWeight:700, color:'#5a7a8a', textTransform:'uppercase', letterSpacing:0.8, marginBottom:6, fontFamily:"'Montserrat',sans-serif" };
const groupStyle = { marginBottom:16 };
const grid2Style = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 };
const errStyle = { fontSize:12, color:'#dc2626', marginTop:4 };
const chipStyle = (active) => ({ padding:'7px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:`1.5px solid ${active ? '#459DAF' : '#dce8eb'}`, background: active ? '#eef7f9' : 'white', color: active ? '#459DAF' : '#0B2A30', transition:'all 0.2s', display:'inline-block' });
const optionStyle = (active) => ({ border:`1.5px solid ${active ? '#459DAF' : '#dce8eb'}`, borderRadius:10, padding:'13px 16px', cursor:'pointer', background: active ? '#eef7f9' : 'white', transition:'all 0.2s' });
const optionTitleStyle = (active) => ({ fontWeight:700, fontSize:14, color: active ? '#459DAF' : '#0B2A30', fontFamily:"'Montserrat',sans-serif" });
const optionSubStyle = { fontSize:12, color:'#5a7a8a', marginTop:3 };
const checkBoxStyle = (checked, err) => ({ width:20, height:20, borderRadius:5, border:`2px solid ${err ? '#dc2626' : checked ? '#459DAF' : '#aac4cb'}`, background: checked ? '#459DAF' : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2, cursor:'pointer', transition:'all 0.15s' });

const sanitise = (form) => {
  const out = { ...form };
  ['date_of_birth','declaration_date'].forEach(f => { if (!out[f]) out[f] = null; });
  return out;
};

const blank = {
  account_type:'', deposit_plan:'',
  full_name:'', date_of_birth:'', gender:'', marital_status:'',
  nin:'', bvn:'', id_type:'', id_number:'',
  phone_primary:'', phone_whatsapp:'', email:'',
  address_street:'', address_area:'', lga:'', state:'', landmark:'',
  blood_group:'', genotype:'', chronic_conditions:[],
  nok_full_name:'', nok_relationship:'', nok_phone:'',
  referral_source:'', referral_code:'',
  consent_accuracy:false, consent_ndpa:false,
  consent_wakala:false, consent_mudarabah:false,
  consent_account_creation:false, declaration_date:'',
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const toggleCondition = (c) => {
    const curr = form.chronic_conditions || [];
    set('chronic_conditions', curr.includes(c) ? curr.filter(x => x !== c) : [...curr, c]);
  };

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.account_type) e.account_type = 'Please select an account type';
      if (!form.deposit_plan) e.deposit_plan = 'Please select a deposit plan';
    }
    if (step === 2) {
      if (!form.full_name) e.full_name = 'Full name is required';
      if (!form.date_of_birth) e.date_of_birth = 'Date of birth is required';
      if (!form.gender) e.gender = 'Gender is required';
      if (!form.nin) e.nin = 'NIN is required';
      else if (form.nin.length !== 11) e.nin = 'NIN must be 11 digits';
      if (!form.bvn) e.bvn = 'BVN is required';
      else if (form.bvn.length !== 11) e.bvn = 'BVN must be 11 digits';
      if (!form.id_type) e.id_type = 'ID type is required';
      if (!form.id_number) e.id_number = 'ID number is required';
    }
    if (step === 3) {
      if (!form.phone_primary) e.phone_primary = 'Primary phone is required';
      if (!form.email) e.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
      if (!form.state) e.state = 'State is required';
      if (!form.lga) e.lga = 'LGA is required';
    }
    if (step === 4) {
      if (!form.nok_full_name) e.nok_full_name = 'Next of kin name is required';
      if (!form.nok_relationship) e.nok_relationship = 'Relationship is required';
      if (!form.nok_phone) e.nok_phone = 'Next of kin phone is required';
    }
    if (step === 5) {
      if (!form.consent_accuracy) e.consent_accuracy = 'Required';
      if (!form.consent_ndpa) e.consent_ndpa = 'Required';
      if (!form.consent_wakala) e.consent_wakala = 'Required';
      if (!form.consent_mudarabah) e.consent_mudarabah = 'Required';
      if (!form.consent_account_creation) e.consent_account_creation = 'Required';
      if (!form.declaration_date) e.declaration_date = "Please enter today's date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) { setStep(s => s + 1); window.scrollTo(0, 0); } };
  const back = () => { setStep(s => s - 1); setErrors({}); window.scrollTo(0, 0); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const { error } = await supabase.from('onboarding_applications').insert(sanitise(form));
      if (error) throw error;
      setSubmitted(true);
    } catch (e) {
      setSubmitError('Submission failed: ' + e.message);
    }
    setSubmitting(false);
  };

  if (submitted) return (
    <div style={{ minHeight:'100vh', background:'#f4f9fa', fontFamily:"'Manrope',sans-serif" }}>
      <div style={{ background:'linear-gradient(135deg,#0B2A30,#1a4a56)', padding:'22px 0', textAlign:'center', borderBottom:'3px solid #459DAF' }}>
        <div style={{ color:'white', fontSize:20, fontWeight:800, fontFamily:"'Montserrat',sans-serif" }}>Span Healthcare</div>
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:5 }}>Account Application</div>
      </div>
      <div style={{ maxWidth:600, margin:'0 auto', padding:'40px 20px' }}>
        <div style={{ background:'white', borderRadius:14, padding:'48px 32px', boxShadow:'0 2px 14px rgba(69,157,175,0.07)', textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:16, background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', border:'2px solid #86efac' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize:22, fontWeight:800, color:'#0B2A30', fontFamily:"'Montserrat',sans-serif", marginBottom:10 }}>Application Received</div>
          <div style={{ fontSize:14, color:'#5a7a8a', lineHeight:1.8, maxWidth:400, margin:'0 auto 24px' }}>
            Thank you, <strong>{form.full_name}</strong>. Your application has been submitted successfully.<br /><br />
            Our team will contact you at <strong>{form.phone_primary}</strong> or <strong>{form.email}</strong> within 2–3 business days.
          </div>
          <div style={{ background:'#eef7f9', border:'1px solid #98B7B9', borderRadius:10, padding:'14px 18px', fontSize:13, color:'#1a2e38', lineHeight:1.8, textAlign:'left' }}>
            <strong>What happens next:</strong><br />
            1. We verify your KYC information<br />
            2. Your account is created<br />
            3. You receive login credentials by email or SMS<br />
            4. You fund your wallet and begin using Span Healthcare
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f4f9fa', fontFamily:"'Manrope',sans-serif" }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0B2A30,#1a4a56)', padding:'22px 0', textAlign:'center', borderBottom:'3px solid #459DAF' }}>
        <div style={{ color:'white', fontSize:20, fontWeight:800, fontFamily:"'Montserrat',sans-serif" }}>Span Healthcare</div>
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:5 }}>Account Application Form</div>
      </div>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'32px 20px' }}>

        {/* Progress */}
        <div style={{ marginBottom:28 }}>
          <div style={{ height:5, background:'#dce8eb', borderRadius:3, marginBottom:10, overflow:'hidden' }}>
            <div style={{ height:'100%', background:'#459DAF', borderRadius:3, transition:'width 0.4s ease', width:`${(step/5)*100}%` }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#5a7a8a' }}>
            <span style={{ fontWeight:700, color:'#459DAF' }}>Step {step} of 5 — {STEPS[step-1]}</span>
            <span>{step*20}% complete</span>
          </div>
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={{ background:'white', borderRadius:14, padding:'28px 30px', boxShadow:'0 2px 14px rgba(69,157,175,0.07)', marginBottom:20, border:'1px solid #eef2f4' }}>
            <div style={{ fontSize:17, fontWeight:800, color:'#0B2A30', fontFamily:"'Montserrat',sans-serif", marginBottom:5 }}>Account Type</div>
            <div style={{ fontSize:13, color:'#5a7a8a', marginBottom:22, lineHeight:1.6 }}>Select the type of account you are opening and your preferred deposit plan.</div>

            <div style={groupStyle}>
              <label style={labelStyle}>Account Type <span style={{ color:'#dc2626' }}>*</span></label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {[
                  { val:'Individual', desc:'Single member account' },
                  { val:'Family', desc:'You and your dependants' },
                  { val:'Organisation', desc:'Schools, SMEs, institutions' },
                ].map(t => (
                  <div key={t.val} style={optionStyle(form.account_type === t.val)} onClick={() => set('account_type', t.val)}>
                    <div style={optionTitleStyle(form.account_type === t.val)}>{t.val}</div>
                    <div style={optionSubStyle}>{t.desc}</div>
                  </div>
                ))}
              </div>
              {errors.account_type && <div style={errStyle}>{errors.account_type}</div>}
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Deposit Plan <span style={{ color:'#dc2626' }}>*</span></label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { val:'Individual', label:'Individual Plan', min:'Minimum N30,000 initial deposit' },
                  { val:'Family/Organisation', label:'Family / Organisation Plan', min:'Minimum N100,000 initial deposit' },
                ].map(p => (
                  <div key={p.val} style={optionStyle(form.deposit_plan === p.val)} onClick={() => set('deposit_plan', p.val)}>
                    <div style={optionTitleStyle(form.deposit_plan === p.val)}>{p.label}</div>
                    <div style={optionSubStyle}>{p.min}</div>
                  </div>
                ))}
              </div>
              {errors.deposit_plan && <div style={errStyle}>{errors.deposit_plan}</div>}
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div style={{ background:'white', borderRadius:14, padding:'28px 30px', boxShadow:'0 2px 14px rgba(69,157,175,0.07)', marginBottom:20, border:'1px solid #eef2f4' }}>
            <div style={{ fontSize:17, fontWeight:800, color:'#0B2A30', fontFamily:"'Montserrat',sans-serif", marginBottom:5 }}>Personal Details</div>
            <div style={{ fontSize:13, color:'#5a7a8a', marginBottom:22, lineHeight:1.6 }}>Provide your legal information exactly as it appears on your government-issued ID.</div>

            <div style={groupStyle}>
              <label style={labelStyle}>Full Legal Name <span style={{ color:'#dc2626' }}>*</span></label>
              <input style={errors.full_name ? inputErrStyle : inputStyle} placeholder="As it appears on your ID" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              {errors.full_name && <div style={errStyle}>{errors.full_name}</div>}
            </div>

            <div style={grid2Style}>
              <div style={groupStyle}>
                <label style={labelStyle}>Date of Birth <span style={{ color:'#dc2626' }}>*</span></label>
                <input style={errors.date_of_birth ? inputErrStyle : inputStyle} type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
                {errors.date_of_birth && <div style={errStyle}>{errors.date_of_birth}</div>}
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Gender <span style={{ color:'#dc2626' }}>*</span></label>
                <select style={errors.gender ? inputErrStyle : selectStyle} value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Prefer not to say</option>
                </select>
                {errors.gender && <div style={errStyle}>{errors.gender}</div>}
              </div>
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Marital Status</label>
              <select style={selectStyle} value={form.marital_status} onChange={e => set('marital_status', e.target.value)}>
                <option value="">Select</option>
                <option>Single</option>
                <option>Married</option>
                <option>Divorced</option>
                <option>Widowed</option>
              </select>
            </div>

            <div style={{ background:'#eef7f9', border:'1px solid #98B7B9', borderRadius:10, padding:'12px 16px', fontSize:13, color:'#1a2e38', lineHeight:1.7, marginBottom:16 }}>
              Your NIN and BVN are required for KYC compliance under NDPA 2023. This information is encrypted and processed securely.
            </div>

            <div style={grid2Style}>
              <div style={groupStyle}>
                <label style={labelStyle}>NIN (11 digits) <span style={{ color:'#dc2626' }}>*</span></label>
                <input style={errors.nin ? inputErrStyle : inputStyle} placeholder="12345678901" maxLength={11} value={form.nin} onChange={e => set('nin', e.target.value.replace(/\D/g, ''))} />
                {errors.nin && <div style={errStyle}>{errors.nin}</div>}
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>BVN (11 digits) <span style={{ color:'#dc2626' }}>*</span></label>
                <input style={errors.bvn ? inputErrStyle : inputStyle} placeholder="12345678901" maxLength={11} value={form.bvn} onChange={e => set('bvn', e.target.value.replace(/\D/g, ''))} />
                {errors.bvn && <div style={errStyle}>{errors.bvn}</div>}
              </div>
            </div>

            <div style={grid2Style}>
              <div style={groupStyle}>
                <label style={labelStyle}>ID Type <span style={{ color:'#dc2626' }}>*</span></label>
                <select style={errors.id_type ? inputErrStyle : selectStyle} value={form.id_type} onChange={e => set('id_type', e.target.value)}>
                  <option value="">Select</option>
                  <option>National ID</option>
                  <option>Voter's Card</option>
                  <option>Driver's Licence</option>
                  <option>International Passport</option>
                </select>
                {errors.id_type && <div style={errStyle}>{errors.id_type}</div>}
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>ID Number <span style={{ color:'#dc2626' }}>*</span></label>
                <input style={errors.id_number ? inputErrStyle : inputStyle} placeholder="Enter ID number" value={form.id_number} onChange={e => set('id_number', e.target.value)} />
                {errors.id_number && <div style={errStyle}>{errors.id_number}</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div style={{ background:'white', borderRadius:14, padding:'28px 30px', boxShadow:'0 2px 14px rgba(69,157,175,0.07)', marginBottom:20, border:'1px solid #eef2f4' }}>
            <div style={{ fontSize:17, fontWeight:800, color:'#0B2A30', fontFamily:"'Montserrat',sans-serif", marginBottom:5 }}>Contact Information</div>
            <div style={{ fontSize:13, color:'#5a7a8a', marginBottom:22, lineHeight:1.6 }}>Your primary phone must be the number linked to your BVN.</div>

            <div style={grid2Style}>
              <div style={groupStyle}>
                <label style={labelStyle}>Primary Phone <span style={{ color:'#dc2626' }}>*</span></label>
                <input style={errors.phone_primary ? inputErrStyle : inputStyle} type="tel" placeholder="+234 8XX XXX XXXX" value={form.phone_primary} onChange={e => set('phone_primary', e.target.value)} />
                {errors.phone_primary && <div style={errStyle}>{errors.phone_primary}</div>}
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>WhatsApp Number</label>
                <input style={inputStyle} type="tel" placeholder="If different from above" value={form.phone_whatsapp} onChange={e => set('phone_whatsapp', e.target.value)} />
              </div>
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Email Address <span style={{ color:'#dc2626' }}>*</span></label>
              <input style={errors.email ? inputErrStyle : inputStyle} type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <div style={errStyle}>{errors.email}</div>}
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Street Address</label>
              <input style={inputStyle} placeholder="House number and street name" value={form.address_street} onChange={e => set('address_street', e.target.value)} />
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Area / Neighbourhood</label>
              <input style={inputStyle} placeholder="e.g. Barnawa, Malali" value={form.address_area} onChange={e => set('address_area', e.target.value)} />
            </div>

            <div style={grid2Style}>
              <div style={groupStyle}>
                <label style={labelStyle}>State <span style={{ color:'#dc2626' }}>*</span></label>
                <select style={errors.state ? inputErrStyle : selectStyle} value={form.state} onChange={e => set('state', e.target.value)}>
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map(st => <option key={st}>{st}</option>)}
                </select>
                {errors.state && <div style={errStyle}>{errors.state}</div>}
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Local Government Area <span style={{ color:'#dc2626' }}>*</span></label>
                <input style={errors.lga ? inputErrStyle : inputStyle} placeholder="e.g. Chikun" value={form.lga} onChange={e => set('lga', e.target.value)} />
                {errors.lga && <div style={errStyle}>{errors.lga}</div>}
              </div>
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Nearest Landmark</label>
              <input style={inputStyle} placeholder="e.g. Behind Kaduna Polytechnic" value={form.landmark} onChange={e => set('landmark', e.target.value)} />
            </div>
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <div style={{ background:'white', borderRadius:14, padding:'28px 30px', boxShadow:'0 2px 14px rgba(69,157,175,0.07)', marginBottom:20, border:'1px solid #eef2f4' }}>
            <div style={{ fontSize:17, fontWeight:800, color:'#0B2A30', fontFamily:"'Montserrat',sans-serif", marginBottom:5 }}>Health & Next of Kin</div>
            <div style={{ fontSize:13, color:'#5a7a8a', marginBottom:22, lineHeight:1.6 }}>Basic health information and emergency contact details.</div>

            <div style={grid2Style}>
              <div style={groupStyle}>
                <label style={labelStyle}>Blood Group</label>
                <select style={selectStyle} value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Genotype</label>
                <select style={selectStyle} value={form.genotype} onChange={e => set('genotype', e.target.value)}>
                  <option value="">Select</option>
                  {['AA','AS','SS','AC','SC'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Current Chronic Conditions</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:4 }}>
                {['None','Diabetes','Hypertension','Asthma','Heart Disease','Kidney Disease','Sickle Cell','Other'].map(c => (
                  <div key={c} style={chipStyle(form.chronic_conditions?.includes(c))} onClick={() => toggleCondition(c)}>{c}</div>
                ))}
              </div>
            </div>

            <div style={{ height:1, background:'#eef2f4', margin:'20px 0' }} />

            <div style={{ fontWeight:700, fontSize:14, color:'#0B2A30', fontFamily:"'Montserrat',sans-serif", marginBottom:14 }}>Next of Kin / Emergency Contact</div>

            <div style={groupStyle}>
              <label style={labelStyle}>Full Name <span style={{ color:'#dc2626' }}>*</span></label>
              <input style={errors.nok_full_name ? inputErrStyle : inputStyle} placeholder="Next of kin full name" value={form.nok_full_name} onChange={e => set('nok_full_name', e.target.value)} />
              {errors.nok_full_name && <div style={errStyle}>{errors.nok_full_name}</div>}
            </div>

            <div style={grid2Style}>
              <div style={groupStyle}>
                <label style={labelStyle}>Relationship <span style={{ color:'#dc2626' }}>*</span></label>
                <select style={errors.nok_relationship ? inputErrStyle : selectStyle} value={form.nok_relationship} onChange={e => set('nok_relationship', e.target.value)}>
                  <option value="">Select</option>
                  {['Spouse','Parent','Sibling','Child','Friend','Other'].map(r => <option key={r}>{r}</option>)}
                </select>
                {errors.nok_relationship && <div style={errStyle}>{errors.nok_relationship}</div>}
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Phone Number <span style={{ color:'#dc2626' }}>*</span></label>
                <input style={errors.nok_phone ? inputErrStyle : inputStyle} type="tel" placeholder="+234 8XX XXX XXXX" value={form.nok_phone} onChange={e => set('nok_phone', e.target.value)} />
                {errors.nok_phone && <div style={errStyle}>{errors.nok_phone}</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5 ── */}
        {step === 5 && (
          <div style={{ background:'white', borderRadius:14, padding:'28px 30px', boxShadow:'0 2px 14px rgba(69,157,175,0.07)', marginBottom:20, border:'1px solid #eef2f4' }}>
            <div style={{ fontSize:17, fontWeight:800, color:'#0B2A30', fontFamily:"'Montserrat',sans-serif", marginBottom:5 }}>Declaration & Consent</div>
            <div style={{ fontSize:13, color:'#5a7a8a', marginBottom:22, lineHeight:1.6 }}>Read and confirm each statement before submitting your application.</div>

            <div style={groupStyle}>
              <label style={labelStyle}>How did you hear about Span Healthcare?</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {['Member referral','Social media','School / University','Employer','Community','Other'].map(src => (
                  <div key={src} style={chipStyle(form.referral_source === src)} onClick={() => set('referral_source', src)}>{src}</div>
                ))}
              </div>
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Referring Member Name or Code</label>
              <input style={inputStyle} placeholder="e.g. Ahmad Bayero or SPN-25-AH-12345" value={form.referral_code} onChange={e => set('referral_code', e.target.value)} />
            </div>

            <div style={{ height:1, background:'#eef2f4', margin:'20px 0' }} />

            <div style={{ fontWeight:700, fontSize:14, color:'#0B2A30', fontFamily:"'Montserrat',sans-serif", marginBottom:14 }}>Declarations</div>

            {[
              { field:'consent_accuracy', text:'I confirm that all information provided in this application is accurate, complete and truthful to the best of my knowledge.' },
              { field:'consent_ndpa', text:'I consent to Span Healthcare processing my personal and health data in accordance with the Nigeria Data Protection Act 2023 (NDPA) for the purposes of account creation, health savings management, and telemedicine services.' },
              { field:'consent_wakala', text:'I understand and accept the Wakala fee structure: a 10% Wakala fee applies on all deposits; 45% is allocated to my health wallet and 45% to the Konooz Halal Investment Fund.' },
              { field:'consent_mudarabah', text:'I understand that the 45% Mudarabah pool is invested in Sharia-compliant instruments, that returns are not guaranteed, and that profit is shared 50/50 between myself and Span Healthcare.' },
              { field:'consent_account_creation', text:'I authorise Span Healthcare to create a digital health savings account in my name using the information provided in this application.' },
            ].map(item => (
              <div key={item.field} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12, cursor:'pointer' }} onClick={() => set(item.field, !form[item.field])}>
                <div style={checkBoxStyle(form[item.field], errors[item.field])}>
                  {form[item.field] && <span style={{ color:'white', fontSize:12, fontWeight:800, lineHeight:1 }}>✓</span>}
                </div>
                <div style={{ fontSize:13, color:'#1a2e38', lineHeight:1.7 }}>{item.text}</div>
              </div>
            ))}

            {['consent_accuracy','consent_ndpa','consent_wakala','consent_mudarabah','consent_account_creation'].some(f => errors[f]) && (
              <div style={errStyle}>Please confirm all declarations above</div>
            )}

            <div style={{ ...groupStyle, marginTop:20 }}>
              <label style={labelStyle}>Date <span style={{ color:'#dc2626' }}>*</span></label>
              <input style={errors.declaration_date ? inputErrStyle : inputStyle} type="date" value={form.declaration_date} onChange={e => set('declaration_date', e.target.value)} />
              {errors.declaration_date && <div style={errStyle}>{errors.declaration_date}</div>}
            </div>

            {submitError && (
              <div style={{ background:'#fee2e2', color:'#dc2626', padding:'12px 16px', borderRadius:9, fontSize:13, marginBottom:16 }}>
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
          <button
            style={{ background:'transparent', color:'#459DAF', border:'1.5px solid #459DAF', borderRadius:9, padding:'11px 22px', fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer', visibility: step === 1 ? 'hidden' : 'visible' }}
            onClick={back}
          >
            Back
          </button>
          {step < 5 ? (
            <button
              style={{ background:'#459DAF', color:'white', border:'none', borderRadius:9, padding:'12px 28px', fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer', letterSpacing:0.3 }}
              onClick={next}
            >
              Continue
            </button>
          ) : (
            <button
              style={{ background: submitting ? '#98B7B9' : '#459DAF', color:'white', border:'none', borderRadius:9, padding:'12px 28px', fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:14, cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing:0.3 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
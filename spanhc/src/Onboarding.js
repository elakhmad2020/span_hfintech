import { useState, useRef } from 'react';
import { supabase } from './supabase';

const NIGERIAN_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];

const TOTAL_STEPS = 10;

const progressLabels = ['Account Type','Personal Details','Contact Info','Next of Kin','Family Details','Organisation','Health Info','Financial','Referral','Declaration'];

const initialForm = {
  // S1
  account_type: '', deposit_plan: '',
  // S2
  full_name: '', date_of_birth: '', gender: '', marital_status: '',
  nin: '', bvn: '', passport_photo_url: '', id_type: '', id_number: '',
  id_expiry_date: '', id_front_url: '', id_back_url: '',
  // S3
  phone_primary: '', phone_whatsapp: '', email: '',
  address_house: '', address_street: '', address_area: '',
  lga: '', state: '', landmark: '',
  // S4
  nok_full_name: '', nok_relationship: '', nok_phone: '', nok_address: '',
  // S5
  spouse_name: '', spouse_dob: '', spouse_nin: '',
  num_dependants: 0, dependants: [], family_size: '',
  // S6
  org_name: '', org_type: '', org_rc_number: '', org_address: '',
  org_contact_name: '', org_contact_role: '', org_contact_phone: '',
  org_contact_email: '', org_staff_count: '', org_signatory_name: '',
  org_signatory_url: '',
  // S7
  blood_group: '', genotype: '', allergies: '',
  chronic_conditions: [], current_medications: '',
  primary_facility: '', preferred_language: '',
  // S8
  deposit_frequency: '', preferred_topup_amount: '',
  payment_method: '', bank_name: '', bank_account_name: '',
  bank_account_number: '',
  // S9
  referral_source: '', referral_code: '',
  // S10
  consent_accuracy: false, consent_ndpa: false,
  consent_wakala: false, consent_mudarabah: false,
  consent_account_creation: false, declaration_date: '',
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const passportRef = useRef();
  const idFrontRef = useRef();
  const idBackRef = useRef();
  const signatoryRef = useRef();

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const uploadFile = async (file, folder, field) => {
    if (!file) return;
    const allowed = ['image/jpeg','image/png','image/jpg','application/pdf'];
    if (!allowed.includes(file.type)) { setErrors(e => ({ ...e, [field]: 'Only JPG, PNG or PDF allowed' })); return; }
    if (file.size > 5 * 1024 * 1024) { setErrors(e => ({ ...e, [field]: 'File must be under 5MB' })); return; }
    setUploading(u => ({ ...u, [field]: true }));
    try {
      const ext = file.name.split('.').pop();
      const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('onboarding-docs').upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('onboarding-docs').getPublicUrl(path);
      set(field, data.publicUrl);
      setErrors(e => ({ ...e, [field]: '' }));
    } catch (e) {
      setErrors(er => ({ ...er, [field]: 'Upload failed: ' + e.message }));
    }
    setUploading(u => ({ ...u, [field]: false }));
  };

  const updateDependant = (index, field, value) => {
    const deps = [...(form.dependants || [])];
    if (!deps[index]) deps[index] = {};
    deps[index][field] = value;
    set('dependants', deps);
  };

  const toggleCondition = (condition) => {
    const current = form.chronic_conditions || [];
    if (current.includes(condition)) set('chronic_conditions', current.filter(c => c !== condition));
    else set('chronic_conditions', [...current, condition]);
  };

  const validateStep = () => {
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
      if (!form.bvn) e.bvn = 'BVN is required';
      if (!form.id_type) e.id_type = 'ID type is required';
      if (!form.id_number) e.id_number = 'ID number is required';
      if (form.nin && form.nin.length !== 11) e.nin = 'NIN must be 11 digits';
      if (form.bvn && form.bvn.length !== 11) e.bvn = 'BVN must be 11 digits';
    }
    if (step === 3) {
      if (!form.phone_primary) e.phone_primary = 'Primary phone is required';
      if (!form.email) e.email = 'Email is required';
      if (!form.address_street) e.address_street = 'Street address is required';
      if (!form.state) e.state = 'State is required';
      if (!form.lga) e.lga = 'LGA is required';
      if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    }
    if (step === 4) {
      if (!form.nok_full_name) e.nok_full_name = 'Next of kin name is required';
      if (!form.nok_relationship) e.nok_relationship = 'Relationship is required';
      if (!form.nok_phone) e.nok_phone = 'Next of kin phone is required';
    }
    if (step === 10) {
      if (!form.consent_accuracy) e.consent_accuracy = 'You must confirm accuracy';
      if (!form.consent_ndpa) e.consent_ndpa = 'You must consent to data processing';
      if (!form.consent_wakala) e.consent_wakala = 'You must acknowledge the Wakala structure';
      if (!form.consent_mudarabah) e.consent_mudarabah = 'You must acknowledge the Mudarabah arrangement';
      if (!form.consent_account_creation) e.consent_account_creation = 'You must authorise account creation';
      if (!form.declaration_date) e.declaration_date = 'Please enter today\'s date';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, TOTAL_STEPS)); window.scrollTo(0, 0); };
  const back = () => { setStep(s => Math.max(s - 1, 1)); setErrors({}); window.scrollTo(0, 0); };

  // Skip family step if not family, skip org step if not org
  const effectiveNext = () => {
    if (!validateStep()) return;
    let nextStep = step + 1;
    if (nextStep === 5 && form.account_type !== 'Family') nextStep = 6;
    if (nextStep === 6 && form.account_type !== 'Organisation') nextStep = 7;
    setStep(Math.min(nextStep, TOTAL_STEPS));
    window.scrollTo(0, 0);
  };

  const effectiveBack = () => {
    let prevStep = step - 1;
    if (prevStep === 6 && form.account_type !== 'Organisation') prevStep = 5;
    if (prevStep === 5 && form.account_type !== 'Family') prevStep = 4;
    setStep(Math.max(prevStep, 1));
    setErrors({});
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        ...form,
        num_dependants: form.num_dependants ? parseInt(form.num_dependants) : null,
        org_staff_count: form.org_staff_count ? parseInt(form.org_staff_count) : null,
        family_size: form.family_size ? parseInt(form.family_size) : null,
        declaration_date: form.declaration_date || null,
        status: 'pending',
      };
      const { error } = await supabase.from('onboarding_applications').insert(payload);
      if (error) throw error;
      setSubmitted(true);
    } catch (e) {
      setSubmitError('Submission failed: ' + e.message);
    }
    setSubmitting(false);
  };

  // ── Styles ─────────────────────────────────────────────────────────────
  const s = {
    wrap: { minHeight: '100vh', background: '#f4f9fa', fontFamily: "'Manrope', sans-serif" },
    header: { background: 'linear-gradient(135deg, #0B2A30 0%, #357f90 100%)', padding: '20px 0', textAlign: 'center' },
    headerTitle: { color: 'white', fontSize: 22, fontWeight: 800, fontFamily: "'Montserrat',sans-serif", margin: 0 },
    headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 },
    container: { maxWidth: 720, margin: '0 auto', padding: '32px 20px' },
    progressWrap: { marginBottom: 32 },
    progressBar: { height: 6, background: '#dce8eb', borderRadius: 3, marginBottom: 10, overflow: 'hidden' },
    progressFill: { height: '100%', background: '#459DAF', borderRadius: 3, transition: 'width 0.4s ease' },
    progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5a7a8a' },
    card: { background: 'white', borderRadius: 16, padding: '28px 32px', boxShadow: '0 2px 16px rgba(69,157,175,0.08)', marginBottom: 20, border: '1px solid #eef2f4' },
    sectionTitle: { fontSize: 18, fontWeight: 800, color: '#0B2A30', fontFamily: "'Montserrat',sans-serif", marginBottom: 6 },
    sectionSub: { fontSize: 13, color: '#5a7a8a', marginBottom: 24, lineHeight: 1.6 },
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: '#5a7a8a', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, fontFamily: "'Montserrat',sans-serif" },
    input: { width: '100%', padding: '12px 16px', border: '1.5px solid #dce8eb', borderRadius: 10, fontSize: 14, fontFamily: "'Manrope',sans-serif", color: '#0B2A30', background: '#f4f9fa', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
    select: { width: '100%', padding: '12px 16px', border: '1.5px solid #dce8eb', borderRadius: 10, fontSize: 14, fontFamily: "'Manrope',sans-serif", color: '#0B2A30', background: '#f4f9fa', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' },
    textarea: { width: '100%', padding: '12px 16px', border: '1.5px solid #dce8eb', borderRadius: 10, fontSize: 14, fontFamily: "'Manrope',sans-serif", color: '#0B2A30', background: '#f4f9fa', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 80 },
    group: { marginBottom: 18 },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    error: { fontSize: 12, color: '#dc2626', marginTop: 5 },
    required: { color: '#dc2626', marginLeft: 2 },
    uploadBox: { border: '2px dashed #b0cccf', borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer', background: '#f4f9fa', transition: 'all 0.2s' },
    uploadDone: { border: '2px solid #459DAF', borderRadius: 12, padding: '14px 16px', background: '#eef7f9', display: 'flex', alignItems: 'center', gap: 12 },
    btnPrimary: { background: '#459DAF', color: 'white', border: 'none', borderRadius: 10, padding: '13px 28px', fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' },
    btnOutline: { background: 'transparent', color: '#459DAF', border: '1.5px solid #459DAF', borderRadius: 10, padding: '12px 24px', fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' },
    checkRow: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14, cursor: 'pointer' },
    checkBox: { width: 20, height: 20, borderRadius: 5, border: '2px solid #459DAF', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, cursor: 'pointer' },
    infoBox: { background: '#eef7f9', border: '1.5px solid #98B7B9', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#1a2f42', lineHeight: 1.7, marginBottom: 20 },
    warningBox: { background: '#fef9c3', border: '1.5px solid #e8a444', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#854d0e', lineHeight: 1.7, marginBottom: 20 },
  };

  const Err = ({ field }) => errors[field] ? <div style={s.error}>{errors[field]}</div> : null;

  const FileUpload = ({ field, label, inputRef, folder }) => (
    <div style={s.group}>
      <label style={s.label}>{label}</label>
      {form[field] ? (
        <div style={s.uploadDone}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#459DAF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0 }}>DONE</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0B2A30' }}>File uploaded</div>
            <a href={form[field]} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#459DAF' }}>View uploaded file</a>
          </div>
          <button onClick={() => set(field, '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a7a8a', fontSize: 16 }}>✕</button>
        </div>
      ) : (
        <div style={s.uploadBox} onClick={() => inputRef.current.click()}>
          {uploading[field] ? (
            <div style={{ color: '#459DAF', fontSize: 13, fontWeight: 600 }}>Uploading...</div>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0B2A30' }}>Click to upload</div>
              <div style={{ fontSize: 11, color: '#5a7a8a', marginTop: 4 }}>JPG, PNG or PDF · Max 5MB</div>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={e => uploadFile(e.target.files[0], folder, field)} />
      <Err field={field} />
    </div>
  );

  // ── Success screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={s.wrap}>
        <div style={s.header}>
          <div style={s.headerTitle}>Span Healthcare</div>
          <div style={s.headerSub}>Health Savings Platform</div>
        </div>
        <div style={s.container}>
          <div style={{ ...s.card, textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>✓</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0B2A30', fontFamily: "'Montserrat',sans-serif", marginBottom: 10 }}>Application Received!</div>
            <div style={{ fontSize: 14, color: '#5a7a8a', lineHeight: 1.8, maxWidth: 420, margin: '0 auto 28px' }}>
              Thank you, <strong>{form.full_name}</strong>. Your Span Healthcare account application has been submitted successfully.<br /><br />
              Our team will review your application and contact you at <strong>{form.email}</strong> or <strong>{form.phone_primary}</strong> within <strong>2–3 business days</strong>.
            </div>
            <div style={{ background: '#eef7f9', borderRadius: 12, padding: '16px 20px', marginBottom: 24, fontSize: 13, color: '#1a2f42', lineHeight: 1.7 }}>
              <strong>What happens next:</strong><br />
              1. We verify your KYC documents<br />
              2. Your account is created and funded<br />
              3. You receive your login credentials by email<br />
              4. You can start using Span Healthcare immediately
            </div>
            <div style={{ fontSize: 13, color: '#5a7a8a' }}>Questions? Contact us at <strong>support@spanhealthcare.com.ng</strong></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <img src="/assets/logo.png" alt="Span Healthcare" style={{ height: 40, marginBottom: 8 }} onError={e => e.target.style.display = 'none'} />
        <div style={s.headerTitle}>Span Healthcare</div>
        <div style={s.headerSub}>Account Application Form</div>
      </div>

      <div style={s.container}>
        {/* Progress */}
        <div style={s.progressWrap}>
          <div style={s.progressBar}>
            <div style={{ ...s.progressFill, width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
          <div style={s.progressLabel}>
            <span style={{ fontWeight: 700, color: '#459DAF' }}>Step {step} of {TOTAL_STEPS} — {progressLabels[step - 1]}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
        </div>

        {/* ── STEP 1: Account Type ───────────────────────────────────────── */}
        {step === 1 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Account Type</div>
            <div style={s.sectionSub}>Select the type of account you are opening and your preferred deposit plan.</div>
            <div style={s.group}>
              <label style={s.label}>Account Type <span style={s.required}>*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {['Individual', 'Family', 'Organisation'].map(t => (
                  <div key={t} onClick={() => set('account_type', t)} style={{ border: `2px solid ${form.account_type === t ? '#459DAF' : '#dce8eb'}`, borderRadius: 12, padding: '18px 14px', textAlign: 'center', cursor: 'pointer', background: form.account_type === t ? '#eef7f9' : 'white', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{t === 'Individual' ? '👤' : t === 'Family' ? '👨‍👩‍👧‍👦' : '🏢'}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0B2A30', fontFamily: "'Montserrat',sans-serif" }}>{t}</div>
                    <div style={{ fontSize: 11, color: '#5a7a8a', marginTop: 4 }}>
                      {t === 'Individual' ? 'Single member' : t === 'Family' ? 'You + dependants' : 'Schools, SMEs, Orgs'}
                    </div>
                  </div>
                ))}
              </div>
              <Err field="account_type" />
            </div>
            <div style={s.group}>
              <label style={s.label}>Deposit Plan <span style={s.required}>*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Individual Plan', value: 'Individual', min: 'N30,000 minimum', desc: 'For individual accounts' },
                  { label: 'Family / Organisation Plan', value: 'Family/Organisation', min: 'N100,000 minimum', desc: 'For family and organisation accounts' },
                ].map(p => (
                  <div key={p.value} onClick={() => set('deposit_plan', p.value)} style={{ border: `2px solid ${form.deposit_plan === p.value ? '#459DAF' : '#dce8eb'}`, borderRadius: 12, padding: '16px', cursor: 'pointer', background: form.deposit_plan === p.value ? '#eef7f9' : 'white', transition: 'all 0.2s' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0B2A30', fontFamily: "'Montserrat',sans-serif" }}>{p.label}</div>
                    <div style={{ fontSize: 13, color: '#459DAF', fontWeight: 700, marginTop: 4 }}>{p.min}</div>
                    <div style={{ fontSize: 11, color: '#5a7a8a', marginTop: 3 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
              <Err field="deposit_plan" />
            </div>
            <div style={s.infoBox}>
              <strong>Wakala-Mudarabah Model:</strong> A 10% Wakala fee applies on all deposits. 45% goes to your health wallet for services, 45% is invested in Konooz halal fund. Investment returns are shared 50/50 with Span Healthcare.
            </div>
          </div>
        )}

        {/* ── STEP 2: Personal Details ───────────────────────────────────── */}
        {step === 2 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Personal Details</div>
            <div style={s.sectionSub}>Provide your legal information exactly as it appears on your government-issued ID.</div>
            <div style={s.warningBox}><strong>Important:</strong> Your NIN and BVN are required for KYC compliance. This information is encrypted and processed securely in accordance with NDPA 2023.</div>
            <div style={s.group}><label style={s.label}>Full Legal Name <span style={s.required}>*</span></label><input style={s.input} placeholder="As it appears on your ID" value={form.full_name} onChange={e => set('full_name', e.target.value)} /><Err field="full_name" /></div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>Date of Birth <span style={s.required}>*</span></label><input style={s.input} type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} /><Err field="date_of_birth" /></div>
              <div style={s.group}><label style={s.label}>Gender <span style={s.required}>*</span></label><select style={s.select} value={form.gender} onChange={e => set('gender', e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option><option>Prefer not to say</option></select><Err field="gender" /></div>
            </div>
            <div style={s.group}><label style={s.label}>Marital Status</label><select style={s.select} value={form.marital_status} onChange={e => set('marital_status', e.target.value)}><option value="">Select</option><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option></select></div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>NIN (11 digits) <span style={s.required}>*</span></label><input style={s.input} placeholder="12345678901" maxLength={11} value={form.nin} onChange={e => set('nin', e.target.value.replace(/\D/g, ''))} /><Err field="nin" /></div>
              <div style={s.group}><label style={s.label}>BVN (11 digits) <span style={s.required}>*</span></label><input style={s.input} placeholder="12345678901" maxLength={11} value={form.bvn} onChange={e => set('bvn', e.target.value.replace(/\D/g, ''))} /><Err field="bvn" /></div>
            </div>
            <FileUpload field="passport_photo_url" label="Passport Photograph" inputRef={passportRef} folder="passports" />
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>ID Type <span style={s.required}>*</span></label><select style={s.select} value={form.id_type} onChange={e => set('id_type', e.target.value)}><option value="">Select</option><option>National ID</option><option>Voter's Card</option><option>Driver's Licence</option><option>International Passport</option></select><Err field="id_type" /></div>
              <div style={s.group}><label style={s.label}>ID Number <span style={s.required}>*</span></label><input style={s.input} placeholder="Enter ID number" value={form.id_number} onChange={e => set('id_number', e.target.value)} /><Err field="id_number" /></div>
            </div>
            <div style={s.group}><label style={s.label}>ID Expiry Date</label><input style={s.input} type="date" value={form.id_expiry_date} onChange={e => set('id_expiry_date', e.target.value)} /></div>
            <div style={s.grid2}>
              <FileUpload field="id_front_url" label="ID Upload — Front" inputRef={idFrontRef} folder="ids" />
              <FileUpload field="id_back_url" label="ID Upload — Back" inputRef={idBackRef} folder="ids" />
            </div>
          </div>
        )}

        {/* ── STEP 3: Contact Information ────────────────────────────────── */}
        {step === 3 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Contact Information</div>
            <div style={s.sectionSub}>Provide your current contact details. Your primary phone must be the number linked to your BVN.</div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>Primary Phone (BVN-linked) <span style={s.required}>*</span></label><input style={s.input} type="tel" placeholder="+234 8XX XXX XXXX" value={form.phone_primary} onChange={e => set('phone_primary', e.target.value)} /><Err field="phone_primary" /></div>
              <div style={s.group}><label style={s.label}>WhatsApp Number (if different)</label><input style={s.input} type="tel" placeholder="+234 8XX XXX XXXX" value={form.phone_whatsapp} onChange={e => set('phone_whatsapp', e.target.value)} /></div>
            </div>
            <div style={s.group}><label style={s.label}>Email Address <span style={s.required}>*</span></label><input style={s.input} type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} /><Err field="email" /></div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>House Number</label><input style={s.input} placeholder="e.g. 12B" value={form.address_house} onChange={e => set('address_house', e.target.value)} /></div>
              <div style={s.group}><label style={s.label}>Street Name <span style={s.required}>*</span></label><input style={s.input} placeholder="e.g. Ahmadu Bello Way" value={form.address_street} onChange={e => set('address_street', e.target.value)} /><Err field="address_street" /></div>
            </div>
            <div style={s.group}><label style={s.label}>Area / Neighbourhood</label><input style={s.input} placeholder="e.g. Barnawa" value={form.address_area} onChange={e => set('address_area', e.target.value)} /></div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>State <span style={s.required}>*</span></label><select style={s.select} value={form.state} onChange={e => set('state', e.target.value)}><option value="">Select State</option>{NIGERIAN_STATES.map(st => <option key={st}>{st}</option>)}</select><Err field="state" /></div>
              <div style={s.group}><label style={s.label}>Local Government Area <span style={s.required}>*</span></label><input style={s.input} placeholder="e.g. Chikun" value={form.lga} onChange={e => set('lga', e.target.value)} /><Err field="lga" /></div>
            </div>
            <div style={s.group}><label style={s.label}>Nearest Landmark</label><input style={s.input} placeholder="e.g. Behind Kaduna Polytechnic" value={form.landmark} onChange={e => set('landmark', e.target.value)} /></div>
          </div>
        )}

        {/* ── STEP 4: Next of Kin ────────────────────────────────────────── */}
        {step === 4 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Next of Kin / Emergency Contact</div>
            <div style={s.sectionSub}>If you are incapacitated, this person can make health service requests on your behalf.</div>
            <div style={s.group}><label style={s.label}>Full Name <span style={s.required}>*</span></label><input style={s.input} placeholder="Next of kin full name" value={form.nok_full_name} onChange={e => set('nok_full_name', e.target.value)} /><Err field="nok_full_name" /></div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>Relationship <span style={s.required}>*</span></label><select style={s.select} value={form.nok_relationship} onChange={e => set('nok_relationship', e.target.value)}><option value="">Select</option><option>Spouse</option><option>Parent</option><option>Sibling</option><option>Child</option><option>Friend</option><option>Other</option></select><Err field="nok_relationship" /></div>
              <div style={s.group}><label style={s.label}>Phone Number <span style={s.required}>*</span></label><input style={s.input} type="tel" placeholder="+234 8XX XXX XXXX" value={form.nok_phone} onChange={e => set('nok_phone', e.target.value)} /><Err field="nok_phone" /></div>
            </div>
            <div style={s.group}><label style={s.label}>Address</label><textarea style={s.textarea} placeholder="Next of kin residential address" value={form.nok_address} onChange={e => set('nok_address', e.target.value)} /></div>
          </div>
        )}

        {/* ── STEP 5: Family Details (conditional) ──────────────────────── */}
        {step === 5 && form.account_type === 'Family' && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Family Account Details</div>
            <div style={s.sectionSub}>Provide details of your spouse and dependants to be covered under this plan.</div>
            <div style={s.group}><label style={s.label}>Spouse Full Name</label><input style={s.input} placeholder="Spouse's legal name" value={form.spouse_name} onChange={e => set('spouse_name', e.target.value)} /></div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>Spouse Date of Birth</label><input style={s.input} type="date" value={form.spouse_dob} onChange={e => set('spouse_dob', e.target.value)} /></div>
              <div style={s.group}><label style={s.label}>Spouse NIN</label><input style={s.input} placeholder="11-digit NIN" maxLength={11} value={form.spouse_nin} onChange={e => set('spouse_nin', e.target.value.replace(/\D/g, ''))} /></div>
            </div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>Number of Dependants</label><input style={s.input} type="number" min={0} max={10} value={form.num_dependants} onChange={e => set('num_dependants', e.target.value)} /></div>
              <div style={s.group}><label style={s.label}>Total Family Size</label><input style={s.input} type="number" min={1} value={form.family_size} onChange={e => set('family_size', e.target.value)} /></div>
            </div>
            {Array.from({ length: Math.min(parseInt(form.num_dependants) || 0, 8) }).map((_, i) => (
              <div key={i} style={{ background: '#f4f9fa', borderRadius: 12, padding: '16px', marginBottom: 12, border: '1px solid #eef2f4' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0B2A30', marginBottom: 12, fontFamily: "'Montserrat',sans-serif" }}>Dependant {i + 1}</div>
                <div style={s.grid2}>
                  <div style={s.group}><label style={s.label}>Full Name</label><input style={s.input} placeholder="Dependant's name" value={form.dependants?.[i]?.name || ''} onChange={e => updateDependant(i, 'name', e.target.value)} /></div>
                  <div style={s.group}><label style={s.label}>Date of Birth</label><input style={s.input} type="date" value={form.dependants?.[i]?.dob || ''} onChange={e => updateDependant(i, 'dob', e.target.value)} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 6: Organisation Details (conditional) ─────────────────── */}
        {step === 6 && form.account_type === 'Organisation' && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Organisation Details</div>
            <div style={s.sectionSub}>Provide your organisation's registration and contact information.</div>
            <div style={s.group}><label style={s.label}>Organisation Name</label><input style={s.input} placeholder="Registered name" value={form.org_name} onChange={e => set('org_name', e.target.value)} /></div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>Organisation Type</label><select style={s.select} value={form.org_type} onChange={e => set('org_type', e.target.value)}><option value="">Select</option><option>School</option><option>Hospital</option><option>SME</option><option>Government Agency</option><option>Other</option></select></div>
              <div style={s.group}><label style={s.label}>RC Number (CAC)</label><input style={s.input} placeholder="CAC registration number" value={form.org_rc_number} onChange={e => set('org_rc_number', e.target.value)} /></div>
            </div>
            <div style={s.group}><label style={s.label}>Organisation Address</label><textarea style={s.textarea} placeholder="Full address" value={form.org_address} onChange={e => set('org_address', e.target.value)} /></div>
            <div style={{ ...s.infoBox, marginTop: 8 }}>Contact Person</div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>Contact Name</label><input style={s.input} value={form.org_contact_name} onChange={e => set('org_contact_name', e.target.value)} /></div>
              <div style={s.group}><label style={s.label}>Role / Title</label><input style={s.input} value={form.org_contact_role} onChange={e => set('org_contact_role', e.target.value)} /></div>
            </div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>Contact Phone</label><input style={s.input} type="tel" value={form.org_contact_phone} onChange={e => set('org_contact_phone', e.target.value)} /></div>
              <div style={s.group}><label style={s.label}>Contact Email</label><input style={s.input} type="email" value={form.org_contact_email} onChange={e => set('org_contact_email', e.target.value)} /></div>
            </div>
            <div style={s.group}><label style={s.label}>Number of Staff / Members to Enrol</label><input style={s.input} type="number" min={1} value={form.org_staff_count} onChange={e => set('org_staff_count', e.target.value)} /></div>
            <div style={s.group}><label style={s.label}>Authorised Signatory Name</label><input style={s.input} value={form.org_signatory_name} onChange={e => set('org_signatory_name', e.target.value)} /></div>
            <FileUpload field="org_signatory_url" label="Authorised Signatory Signature (upload)" inputRef={signatoryRef} folder="signatures" />
          </div>
        )}

        {/* ── STEP 7: Health Information ─────────────────────────────────── */}
        {step === 7 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Health Information</div>
            <div style={s.sectionSub}>This feeds your health profile and helps doctors provide better consultations from day one.</div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>Blood Group</label><select style={s.select} value={form.blood_group} onChange={e => set('blood_group', e.target.value)}><option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}</select></div>
              <div style={s.group}><label style={s.label}>Genotype</label><select style={s.select} value={form.genotype} onChange={e => set('genotype', e.target.value)}><option value="">Select</option>{['AA','AS','SS','AC','SC'].map(g => <option key={g}>{g}</option>)}</select></div>
            </div>
            <div style={s.group}><label style={s.label}>Known Allergies</label><input style={s.input} placeholder="e.g. Penicillin, peanuts — or 'None'" value={form.allergies} onChange={e => set('allergies', e.target.value)} /></div>
            <div style={s.group}>
              <label style={s.label}>Current Chronic Conditions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {['None','Diabetes','Hypertension','Asthma','Heart Disease','Kidney Disease','Sickle Cell','Other'].map(c => (
                  <div key={c} onClick={() => toggleCondition(c)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${form.chronic_conditions?.includes(c) ? '#459DAF' : '#dce8eb'}`, background: form.chronic_conditions?.includes(c) ? '#eef7f9' : 'white', color: form.chronic_conditions?.includes(c) ? '#459DAF' : '#0B2A30', transition: 'all 0.2s' }}>{c}</div>
                ))}
              </div>
            </div>
            <div style={s.group}><label style={s.label}>Current Medications (if any)</label><textarea style={s.textarea} placeholder="List any medications you are currently taking, or write 'None'" value={form.current_medications} onChange={e => set('current_medications', e.target.value)} /></div>
            <div style={s.group}><label style={s.label}>Primary Healthcare Facility Currently Using</label><input style={s.input} placeholder="e.g. Barau Dikko Teaching Hospital, Kaduna" value={form.primary_facility} onChange={e => set('primary_facility', e.target.value)} /></div>
            <div style={s.group}><label style={s.label}>Preferred Telemedicine Language</label><select style={s.select} value={form.preferred_language} onChange={e => set('preferred_language', e.target.value)}><option value="">Select</option><option>English</option><option>Hausa</option><option>Both</option></select></div>
          </div>
        )}

        {/* ── STEP 8: Financial Preferences ─────────────────────────────── */}
        {step === 8 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Financial Preferences</div>
            <div style={s.sectionSub}>Tell us how you prefer to manage your health savings deposits.</div>
            <div style={s.group}>
              <label style={s.label}>Preferred Deposit Frequency</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['One-time lump sum', 'Monthly top-up'].map(f => (
                  <div key={f} onClick={() => set('deposit_frequency', f)} style={{ border: `2px solid ${form.deposit_frequency === f ? '#459DAF' : '#dce8eb'}`, borderRadius: 12, padding: 16, textAlign: 'center', cursor: 'pointer', background: form.deposit_frequency === f ? '#eef7f9' : 'white', fontSize: 13, fontWeight: 600, color: form.deposit_frequency === f ? '#459DAF' : '#0B2A30' }}>{f}</div>
                ))}
              </div>
            </div>
            <div style={s.group}><label style={s.label}>Preferred Monthly Top-up Amount (optional)</label><input style={s.input} placeholder="e.g. N10,000" value={form.preferred_topup_amount} onChange={e => set('preferred_topup_amount', e.target.value)} /></div>
            <div style={s.group}>
              <label style={s.label}>Preferred Payment Method for Future Deposits</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {['Bank Transfer', 'Card', 'USSD'].map(m => (
                  <div key={m} onClick={() => set('payment_method', m)} style={{ border: `2px solid ${form.payment_method === m ? '#459DAF' : '#dce8eb'}`, borderRadius: 12, padding: 14, textAlign: 'center', cursor: 'pointer', background: form.payment_method === m ? '#eef7f9' : 'white', fontSize: 13, fontWeight: 600, color: form.payment_method === m ? '#459DAF' : '#0B2A30' }}>{m}</div>
                ))}
              </div>
            </div>
            <div style={{ ...s.infoBox, marginTop: 8 }}>Your bank details below are for reference only. Span Healthcare will never debit your account without your explicit instruction.</div>
            <div style={s.group}><label style={s.label}>Your Bank Name</label><input style={s.input} placeholder="e.g. Access Bank" value={form.bank_name} onChange={e => set('bank_name', e.target.value)} /></div>
            <div style={s.grid2}>
              <div style={s.group}><label style={s.label}>Account Name</label><input style={s.input} value={form.bank_account_name} onChange={e => set('bank_account_name', e.target.value)} /></div>
              <div style={s.group}><label style={s.label}>Account Number</label><input style={s.input} placeholder="10-digit account number" maxLength={10} value={form.bank_account_number} onChange={e => set('bank_account_number', e.target.value.replace(/\D/g, ''))} /></div>
            </div>
          </div>
        )}

        {/* ── STEP 9: Referral ───────────────────────────────────────────── */}
        {step === 9 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Referral & Source</div>
            <div style={s.sectionSub}>Help us understand how you found Span Healthcare.</div>
            <div style={s.group}>
              <label style={s.label}>How did you hear about Span Healthcare?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['Existing member referral','Social media','School / University','Employer','Community / Mosque / Church','Other'].map(src => (
                  <div key={src} onClick={() => set('referral_source', src)} style={{ border: `1.5px solid ${form.referral_source === src ? '#459DAF' : '#dce8eb'}`, borderRadius: 10, padding: 12, cursor: 'pointer', background: form.referral_source === src ? '#eef7f9' : 'white', fontSize: 13, fontWeight: 600, color: form.referral_source === src ? '#459DAF' : '#0B2A30' }}>{src}</div>
                ))}
              </div>
            </div>
            <div style={s.group}><label style={s.label}>Referring Member Name or Code (if applicable)</label><input style={s.input} placeholder="e.g. Ahmad Bayero or SPN-25-AH-12345" value={form.referral_code} onChange={e => set('referral_code', e.target.value)} /></div>
          </div>
        )}

        {/* ── STEP 10: Declaration & Consent ────────────────────────────── */}
        {step === 10 && (
          <div style={s.card}>
            <div style={s.sectionTitle}>Declaration and Consent</div>
            <div style={s.sectionSub}>Please read and confirm each declaration carefully before submitting.</div>
            {[
              { field: 'consent_accuracy', text: 'I confirm that all information provided in this application is accurate, complete and truthful to the best of my knowledge.' },
              { field: 'consent_ndpa', text: 'I consent to Span Healthcare processing my personal and health data in accordance with the Nigeria Data Protection Act 2023 (NDPA) for the purposes of account creation, health savings management, and telemedicine services.' },
              { field: 'consent_wakala', text: 'I understand and accept the Wakala fee structure: a 10% Wakala fee applies on all deposits; 45% is allocated to my health wallet for services and 45% to the Konooz Halal Investment Fund.' },
              { field: 'consent_mudarabah', text: 'I understand that the 45% Mudarabah pool is invested in Sharia-compliant instruments under Konooz Investment Fund, that investment returns are not guaranteed, and that profit is shared 50/50 between myself and Span Healthcare.' },
              { field: 'consent_account_creation', text: 'I authorise Span Healthcare to create a digital health savings account in my name using the information provided in this application.' },
            ].map(item => (
              <div key={item.field} style={s.checkRow} onClick={() => set(item.field, !form[item.field])}>
                <div style={{ ...s.checkBox, background: form[item.field] ? '#459DAF' : 'white', borderColor: errors[item.field] ? '#dc2626' : '#459DAF' }}>
                  {form[item.field] && <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ fontSize: 13, color: '#0B2A30', lineHeight: 1.7 }}>{item.text}</div>
              </div>
            ))}
            {Object.keys(errors).filter(k => k.startsWith('consent')).map(k => <Err key={k} field={k} />)}
            <div style={{ ...s.group, marginTop: 20 }}>
              <label style={s.label}>Date <span style={s.required}>*</span></label>
              <input style={s.input} type="date" value={form.declaration_date} onChange={e => set('declaration_date', e.target.value)} />
              <Err field="declaration_date" />
            </div>
            {submitError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{submitError}</div>}
            <div style={{ background: '#eef7f9', borderRadius: 12, padding: '14px 18px', fontSize: 12, color: '#1a2f42', lineHeight: 1.7 }}>
              By submitting this application you agree to all declarations above. Your application will be reviewed by the Span Healthcare team within 2–3 business days.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <button style={{ ...s.btnOutline, visibility: step === 1 ? 'hidden' : 'visible' }} onClick={effectiveBack}>← Back</button>
          {step < TOTAL_STEPS ? (
            <button style={s.btnPrimary} onClick={effectiveNext}>Continue →</button>
          ) : (
            <button style={{ ...s.btnPrimary, background: submitting ? '#98B7B9' : '#459DAF' }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
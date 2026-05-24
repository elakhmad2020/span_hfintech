import { useState, useRef, useEffect } from 'react';
import { supabase } from './supabase';
import { NotificationBell, styles } from './Shared';

const AGORA_APP_ID = '5e972a5ba048430980f63dd3a549880b';

// ── SCHEDULE PAGE ──────────────────────────────────────────────────────────────
function SchedulePage({ doctorId }) {
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const TIME_SLOTS = ['8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM'];
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newSlot, setNewSlot] = useState({ day: 'Monday', start_time: '9:00 AM', end_time: '5:00 PM' });

  useEffect(() => { if (doctorId) fetchAvailability(); }, [doctorId]);

  const fetchAvailability = async () => {
    setLoading(true);
    const { data } = await supabase.from('doctor_availability').select('*').eq('doctor_id', doctorId).order('id');
    setAvailability(data || []);
    setLoading(false);
  };

  const addSlot = async () => {
    if (!doctorId) { alert('Doctor ID missing. Please log out and back in.'); return; }
    setSaving(true);
    const { data, error } = await supabase.from('doctor_availability').insert({ doctor_id: doctorId, ...newSlot, is_active: true }).select().maybeSingle();
    if (error) { alert('Error saving slot: ' + error.message); }
    else { setAvailability([...availability, data]); setShowAdd(false); setSuccess('Schedule updated'); setTimeout(() => setSuccess(''), 3000); }
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

  const groupedByDay = DAYS.reduce((acc, day) => { acc[day] = availability.filter(s => s.day === day); return acc; }, {});

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">My Schedule</div><div className="page-sub">Set your available days and time slots</div></div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Time Slot</button>
      </div>
      {success && <div style={{ background: '#dcfce7', border: '1.5px solid var(--success)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#166634', fontFamily: "'Manrope',sans-serif" }}>{success}</div>}
      <div style={{ background: '#e8f6f9', border: '1.5px solid #98B7B9', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#1a2f42', fontFamily: "'Manrope',sans-serif", lineHeight: 1.7 }}>
        <strong>How it works:</strong> Add time slots for each day you are available. Toggle a slot off to temporarily disable it.
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate)' }}>Loading schedule...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {DAYS.map(day => (
            <div key={day} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: groupedByDay[day].length > 0 ? 14 : 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>{day}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {groupedByDay[day].length === 0 && <span style={{ fontSize: 12, color: 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>No slots added</span>}
                  <button className="btn btn-outline btn-sm" style={{ width: 'auto', fontSize: 11 }} onClick={() => { setNewSlot({ ...newSlot, day }); setShowAdd(true); }}>+ Add</button>
                </div>
              </div>
              {groupedByDay[day].length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {groupedByDay[day].map(slot => (
                    <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: slot.is_active ? 'var(--primary-pale)' : '#f1f5f9', border: `1.5px solid ${slot.is_active ? 'var(--primary)' : '#dce8eb'}` }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: slot.is_active ? 'var(--primary-dark)' : 'var(--slate)', fontFamily: "'Manrope',sans-serif" }}>{slot.start_time} — {slot.end_time}</span>
                      <div className={'toggle' + (slot.is_active ? '' : ' off')} style={{ width: 32, height: 18 }} onClick={() => toggleSlot(slot)}><div className="toggle-thumb" style={{ width: 14, height: 14 }} /></div>
                      <button onClick={() => deleteSlot(slot.id)} style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: '#fee2e2', color: 'var(--danger)', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</button>
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
            <div className="modal-header"><div className="modal-title">Add Time Slot</div><button className="modal-close" onClick={() => setShowAdd(false)}>X</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Day</label><select className="form-select" value={newSlot.day} onChange={e => setNewSlot({ ...newSlot, day: e.target.value })}>{DAYS.map(d => <option key={d}>{d}</option>)}</select></div>
              <div className="form-grid-2">
                <div className="form-group"><label className="form-label">Start Time</label><select className="form-select" value={newSlot.start_time} onChange={e => setNewSlot({ ...newSlot, start_time: e.target.value })}>{TIME_SLOTS.map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label className="form-label">End Time</label><select className="form-select" value={newSlot.end_time} onChange={e => setNewSlot({ ...newSlot, end_time: e.target.value })}>{TIME_SLOTS.map(t => <option key={t}>{t}</option>)}</select></div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={addSlot} disabled={saving}>{saving ? 'Saving...' : 'Add Slot'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CONSULTATION NOTES PAGE ────────────────────────────────────────────────────
function ConsultationNotesPage({ doctorId }) {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState({ diagnosis: '', notes: '', follow_up: '', prescription: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { if (doctorId) fetchAppointments(); }, [doctorId]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase.from('appointments').select('*').eq('doctor_id', doctorId).order('date', { ascending: false });
    setAppointments(data || []);
    setLoading(false);
  };

  const selectAppointment = async (appt) => {
    setSelected(appt);
    const { data } = await supabase.from('consultation_notes').select('*').eq('appointment_id', appt.id).maybeSingle();
    if (data) setNote({ diagnosis: data.diagnosis || '', notes: data.notes || '', follow_up: data.follow_up || '', prescription: data.prescription || '' });
    else setNote({ diagnosis: '', notes: '', follow_up: '', prescription: '' });
  };

  const saveNote = async () => {
    if (!selected) return;
    setSaving(true);
    const { data: existing } = await supabase.from('consultation_notes').select('id').eq('appointment_id', selected.id).maybeSingle();
    if (existing) await supabase.from('consultation_notes').update({ ...note, updated_at: new Date().toISOString() }).eq('id', existing.id);
    else await supabase.from('consultation_notes').insert({ appointment_id: selected.id, doctor_id: doctorId, patient_id: selected.patient_id, ...note });
    setSaving(false);
    setSuccess('Notes saved successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div>
      <div className="topbar"><div><div className="page-title">Consultation Notes</div><div className="page-sub">Private notes per consultation — not visible to patients</div></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #eef2f5', fontWeight: 700, fontSize: 13, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>Consultations</div>
          {loading ? <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13 }}>Loading...</div>
          : appointments.length === 0 ? <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13, textAlign: 'center' }}>No consultations yet</div>
          : appointments.map(a => (
            <div key={a.id} onClick={() => selectAppointment(a)} style={{ padding: '12px 18px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: selected?.id === a.id ? 'var(--primary-pale)' : 'white', borderLeft: selected?.id === a.id ? '3px solid var(--primary)' : '3px solid transparent', transition: 'all 0.2s' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--navy)', fontFamily: "'Manrope',sans-serif" }}>{a.patient_name || 'Patient'}</div>
              <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 2 }}>{a.date ? new Date(a.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'}</div>
              <span className={`badge ${a.status === 'completed' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: 10, marginTop: 4 }}>{a.status || 'upcoming'}</span>
            </div>
          ))}
        </div>
        <div className="card">
          {!selected ? <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--slate)', fontSize: 13 }}>Select a consultation from the left to view or write notes</div> : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>{selected.patient_name || 'Patient'}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate)' }}>{selected.date ? new Date(selected.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</div>
                </div>
                {success && <div style={{ background: '#dcfce7', color: '#166634', padding: '6px 14px', borderRadius: 8, fontSize: 12 }}>{success}</div>}
              </div>
              <div style={{ background: '#fef9c3', border: '1.5px solid #e8a444', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#854d0e' }}>These notes are private and confidential. They are not visible to the patient.</div>
              <div className="form-group"><label className="form-label">Diagnosis</label><input className="form-input" placeholder="Primary diagnosis..." value={note.diagnosis} onChange={e => setNote({ ...note, diagnosis: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Consultation Notes</label><textarea className="form-input" rows={4} placeholder="Detailed notes..." value={note.notes} onChange={e => setNote({ ...note, notes: e.target.value })} style={{ resize: 'vertical' }} /></div>
              <div className="form-group"><label className="form-label">Prescription</label><textarea className="form-input" rows={3} placeholder="Medications prescribed..." value={note.prescription} onChange={e => setNote({ ...note, prescription: e.target.value })} style={{ resize: 'vertical' }} /></div>
              <div className="form-group"><label className="form-label">Follow-up Instructions</label><textarea className="form-input" rows={3} placeholder="Next steps..." value={note.follow_up} onChange={e => setNote({ ...note, follow_up: e.target.value })} style={{ resize: 'vertical' }} /></div>
              <button className="btn btn-primary" onClick={saveNote} disabled={saving}>{saving ? 'Saving...' : 'Save Notes'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── DOCTOR PROFILE PAGE ────────────────────────────────────────────────────────
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

  const SPECIALTIES = ['General Practitioner','Cardiologist','Pediatrician','Dermatologist','Gynecologist','Dentist','Orthopedist','Neurologist','Psychiatrist','Ophthalmologist','ENT Specialist','Urologist','Oncologist','Other'];

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${profile.id}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('doctor-avatars').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('doctor-avatars').getPublicUrl(path);
      const url = urlData.publicUrl;
      await supabase.from('doctors').update({ avatar_url: url }).eq('id', profile.id);
      setPhoto(url);
      setProfile({ ...profile, avatar_url: url });
      setSuccess('Photo updated'); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError('Photo upload failed: ' + e.message); }
    setUploadingPhoto(false);
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true); setError('');
    try {
      const { error: updateError } = await supabase.from('doctors').update({ full_name: form.full_name, phone: form.phone, specialty: form.specialty, experience_years: parseInt(form.experience_years) || 0, bio: form.bio }).eq('id', profile.id);
      if (updateError) throw updateError;
      setProfile({ ...profile, ...form });
      setEditing(false);
      setSuccess('Profile updated'); setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError('Save failed: ' + e.message); }
    setSaving(false);
  };

  const initials = form.full_name ? form.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DR';

  return (
    <div>
      <div className="topbar">
        <div><div className="page-title">My Profile</div><div className="page-sub">Your doctor profile visible to patients</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editing ? (
            <><button className="btn btn-outline btn-sm" onClick={() => { setEditing(false); setError(''); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button></>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>
      </div>
      {success && <div style={{ background: '#dcfce7', border: '1.5px solid var(--success)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#166634' }}>{success}</div>}
      {error && <div style={{ background: '#fee2e2', border: '1.5px solid var(--danger)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#991b1b' }}>{error}</div>}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 100, height: 100, borderRadius: 20, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', fontFamily: "'Montserrat',sans-serif", overflow: 'hidden', position: 'relative', cursor: editing ? 'pointer' : 'default' }} onClick={() => editing && fileRef.current.click()}>
              {photo ? <img src={photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              {editing && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>{uploadingPhoto ? 'Uploading...' : 'Change'}</div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            {editing && <div style={{ fontSize: 11, color: 'var(--slate)', textAlign: 'center', marginTop: 6 }}>Click to upload</div>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>{form.full_name}</div>
            <div style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600, marginTop: 3 }}>{form.specialty}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span className={'badge ' + (profile?.status === 'approved' ? 'badge-success' : 'badge-warning')}>{profile?.status === 'approved' ? 'Approved' : 'Pending Approval'}</span>
              <span className="badge badge-info">{form.experience_years} years experience</span>
              <span className="badge badge-info">N1,000 per consultation</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>Personal Information</div>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.full_name} disabled={!editing} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={form.phone} disabled={!editing} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={profile?.email || ''} disabled /></div>
          <div className="form-group"><label className="form-label">Specialty</label>{editing ? <select className="form-select" value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}>{SPECIALTIES.map(s => <option key={s}>{s}</option>)}</select> : <input className="form-input" value={form.specialty} disabled />}</div>
          <div className="form-group"><label className="form-label">Years of Experience</label><input className="form-input" type="number" value={form.experience_years} disabled={!editing} onChange={e => setForm({ ...form, experience_years: e.target.value })} /></div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 18 }}>About & Bio</div>
          <div className="form-group"><label className="form-label">Professional Bio</label><textarea className="form-input" rows={10} style={{ resize: 'vertical', minHeight: 200 }} value={form.bio} disabled={!editing} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Describe your expertise..." /></div>
          <div className="form-group"><label className="form-label">Consultation Fee</label><input className="form-input" value="N1,000 per session (Platform managed)" disabled /></div>
          <div style={{ background: 'var(--primary-pale)', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: 'var(--primary-dark)', lineHeight: 1.7 }}>Keep your bio professional and up to date.</div>
        </div>
      </div>
    </div>
  );
}

// ── DOCTOR MESSAGES PAGE ───────────────────────────────────────────────────────
function DoctorMessagesPage({ doctorUserId, doctorName }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [msgMenuId, setMsgMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef();
  const chatFileRef = useRef();
  const [selectedChatFile, setSelectedChatFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => { if (doctorUserId) fetchPatients(); }, [doctorUserId]);

  useEffect(() => {
    if (!selectedPatient) return;
    fetchMessages();
    const subscription = supabase.channel('doctor-messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      const msg = payload.new;
      if ((msg.sender_id === doctorUserId && msg.receiver_id === selectedPatient.user_id) || (msg.sender_id === selectedPatient.user_id && msg.receiver_id === doctorUserId)) {
        setMessages(prev => [...prev, msg]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }).subscribe();
    return () => supabase.removeChannel(subscription);
  }, [selectedPatient]);

  useEffect(() => { setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }, [messages]);

  const fetchPatients = async () => {
    setLoading(true);
    const { data } = await supabase.from('messages').select('sender_id, sender_name').eq('receiver_id', doctorUserId);
    const unique = []; const seen = new Set();
    (data || []).forEach(m => { if (!seen.has(m.sender_id)) { seen.add(m.sender_id); unique.push({ user_id: m.sender_id, full_name: m.sender_name }); } });
    setPatients(unique);
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!selectedPatient || !doctorUserId) return;
    const { data } = await supabase.from('messages').select('*').or(`and(sender_id.eq.${doctorUserId},receiver_id.eq.${selectedPatient.user_id}),and(sender_id.eq.${selectedPatient.user_id},receiver_id.eq.${doctorUserId})`).order('created_at');
    setMessages(data || []);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const deleteMessage = async (msgId) => {
    await supabase.from('messages').delete().eq('id', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setMsgMenuId(null);
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedChatFile) || !selectedPatient || !doctorUserId) return;
    setSending(true);
    try {
      let file_url = null, file_name = null, file_type = null;
      if (selectedChatFile) {
        const ext = selectedChatFile.name.split('.').pop();
        const path = `chat/${doctorUserId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('documents').upload(path, selectedChatFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
        file_url = urlData.publicUrl; file_name = selectedChatFile.name; file_type = selectedChatFile.type;
      }
      const { data, error } = await supabase.from('messages').insert({ sender_id: doctorUserId, receiver_id: selectedPatient.user_id, sender_name: doctorName, content: newMessage.trim() || '', file_url, file_name, file_type }).select().maybeSingle();
      if (!error && data) { setMessages(prev => [...prev, data]); setNewMessage(''); setSelectedChatFile(null); setFilePreview(null); setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }
    } catch (e) { console.error('Send error:', e); }
    setSending(false);
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const formatMsgTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toDateString() === new Date().toDateString()
      ? d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Africa/Lagos' })
      : d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', timeZone: 'Africa/Lagos' });
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="topbar"><div><div className="page-title">Messages</div><div className="page-sub">Chat with your patients</div></div></div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, overflow: 'hidden' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #eef2f5', fontWeight: 700, fontSize: 13, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>Patients</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13 }}>Loading...</div>
            : patients.length === 0 ? <div style={{ padding: 20, color: 'var(--slate)', fontSize: 13, textAlign: 'center' }}>No messages yet</div>
            : patients.map(p => (
              <div key={p.user_id} onClick={() => setSelectedPatient(p)} style={{ padding: '12px 18px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: selectedPatient?.user_id === p.user_id ? 'var(--primary-pale)' : 'white', borderLeft: selectedPatient?.user_id === p.user_id ? '3px solid var(--primary)' : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', fontFamily: "'Montserrat',sans-serif" }}>{getInitials(p.full_name)}</div>
                <div><div style={{ fontWeight: 700, fontSize: 13, color: 'var(--navy)' }}>{p.full_name}</div><div style={{ fontSize: 11, color: 'var(--slate)' }}>Patient</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selectedPatient ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)', fontSize: 13 }}>Select a patient to view messages</div> : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef2f5', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white' }}>{getInitials(selectedPatient.full_name)}</div>
                <div><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>{selectedPatient.full_name}</div><div style={{ fontSize: 11, color: 'var(--slate)' }}>Patient</div></div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--slate)', fontSize: 13, marginTop: 40 }}>No messages yet</div>}
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === doctorUserId;
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
                        <div style={{ padding: '10px 14px', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isMe ? 'var(--primary)' : '#f1f5f9', color: isMe ? 'white' : 'var(--navy)', fontSize: 13, lineHeight: 1.6 }}>
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
                  <input className="form-input" style={{ flex: 1, marginBottom: 0 }} placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !selectedChatFile && sendMessage()} />
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

// ── DOCTOR DASHBOARD (main export) ────────────────────────────────────────────
export default function DoctorDashboard({ doctorProfile, doctorUser, onLogout }) {
  const [profile, setProfile] = useState(doctorProfile);
  const [isAvailable, setIsAvailable] = useState(doctorProfile?.is_available || false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [doctorCallActive, setDoctorCallActive] = useState(false);
  const [doctorCallClient, setDoctorCallClient] = useState(null);
  const [doctorLocalTrack, setDoctorLocalTrack] = useState(null);
  const doctorLocalRef = useRef();
  const doctorRemoteRef = useRef();

  useEffect(() => {
    if (!doctorProfile?.id && doctorProfile?.user_id) {
      supabase.from('doctors').select('*').eq('user_id', doctorProfile.user_id).maybeSingle().then(({ data }) => { if (data) setProfile(data); });
    }
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('appointments').select('*').eq('doctor_id', profile.id).order('date', { ascending: true });
      setAppointments(data || []);
    } catch(e) { console.error('Appointments fetch error:', e.message); }
    setLoading(false);
  };

  const toggleAvailability = async () => {
    const newVal = !isAvailable;
    setIsAvailable(newVal);
    await supabase.from('doctors').update({ is_available: newVal }).eq('id', profile.id);
  };

  const joinCall = async (appointment) => {
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setDoctorCallClient(client);
      const channel = appointment.agora_channel;
      const tokenRes = await fetch('https://ssmjjtbvrakzfsxezavp.supabase.co/functions/v1/agora-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbWpqdGJ2cmFremZzeGV6YXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzE5NzQsImV4cCI6MjA4NzQ0Nzk3NH0.f3VNuJC0Tu7wcYOoCDvFULVpuOVLQoAS0c39bpJKXRg' },
        body: JSON.stringify({ channelName: channel, uid: 2 }),
      });
      const { token } = await tokenRes.json();
      await client.join(AGORA_APP_ID, channel, token, 2);
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
    } catch (e) { alert('Error joining call: ' + e.message); }
  };

  const endDoctorCall = async () => {
    try {
      if (doctorLocalTrack) { const tracks = Array.isArray(doctorLocalTrack) ? doctorLocalTrack : [doctorLocalTrack]; tracks.forEach(t => { t.stop(); t.close(); }); }
      if (doctorCallClient) await doctorCallClient.leave();
    } catch (e) { console.error('End call error:', e); }
    finally { setDoctorCallActive(false); setDoctorCallClient(null); setDoctorLocalTrack(null); }
  };

  const initials = profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DR';
  const todayStr = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const upcomingCount = appointments.filter(a => a.status === 'upcoming').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <style>{styles}</style>

      {/* Sidebar */}
      <div className={'sidebar' + (mobileSidebarOpen ? ' mobile-open' : '')}>
        <div className="sidebar-logo">
          <img src="/assets/logo.png" alt="Span Healthcare" className="sidebar-logo-img" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          <div className="sidebar-logo-icon" style={{ display: 'none' }}>SPAN</div>
          <div><div className="sidebar-logo-name">Span Healthcare</div><div className="sidebar-logo-tag">Doctor Portal</div></div>
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
            <div key={item.id} className={'nav-item' + (activePage === item.id ? ' active' : '')} onClick={() => { setActivePage(item.id); setMobileSidebarOpen(false); }}>
              <div className="nav-icon">{item.short}</div>{item.label}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div style={{ padding: '10px 8px', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>Availability</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: isAvailable ? 'var(--success)' : 'var(--slate)', fontWeight: 600 }}>{isAvailable ? 'Available' : 'Unavailable'}</span>
              <div className={'toggle' + (isAvailable ? '' : ' off')} onClick={toggleAvailability}><div className="toggle-thumb" /></div>
            </div>
          </div>
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div><div className="sidebar-user-name">{profile?.full_name}</div><div className="sidebar-user-role">{profile?.specialty}</div></div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(224,82,82,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#e05252' }}>OUT</div>
            Log Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #eef2f5' }}>
          <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="mobile-menu-btn" style={{ width: 40, height: 40, borderRadius: 10, border: '1.5px solid #dce8eb', background: 'white', cursor: 'pointer', fontSize: 18, alignItems: 'center', justifyContent: 'center', display: 'none' }}>☰</button>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--navy)', fontFamily: "'Montserrat',sans-serif" }}>Span Healthcare</div>
          <div style={{ marginLeft: 'auto' }}><NotificationBell userId={doctorUser?.id} /></div>
        </div>
        {mobileSidebarOpen && <div onClick={() => setMobileSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} />}

        {/* Overview */}
        {activePage === 'overview' && (
          <div>
            <div className="topbar">
              <div><div className="page-title">Hello, {profile?.full_name?.split(' ')[0]}!</div><div className="page-sub">{todayStr}</div></div>
              <NotificationBell userId={doctorUser?.id} />
              {profile?.status === 'pending' && <div style={{ background: '#fef9c3', border: '1.5px solid var(--warning)', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#854d0e' }}>Account pending approval</div>}
            </div>
            {profile?.status === 'pending' && (
              <div style={{ background: '#fef9c3', border: '1.5px solid var(--warning)', borderRadius: 14, padding: '18px 22px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#854d0e', background: '#fde68a', padding: '3px 8px', borderRadius: 6 }}>PENDING</div>
                <div style={{ fontSize: 13, color: '#713f12', lineHeight: 1.7 }}>Your doctor profile is currently under review. You will receive an email once approved.</div>
              </div>
            )}
            <div className="stats-grid">
              {[
                { tag: 'APPT', bg: '#e8f6f9', color: '#2d8a9e', value: loading ? '—' : upcomingCount, label: 'Upcoming', sub: 'Scheduled consultations' },
                { tag: 'DONE', bg: '#dcfce7', color: '#166634', value: loading ? '—' : completedCount, label: 'Completed', sub: 'Total consultations done' },
                { tag: 'RATE', bg: '#f3e8ff', color: '#6b21a8', value: profile?.rating || '—', label: 'Rating', sub: 'From patient reviews' },
                { tag: 'FEE', bg: '#fef9c3', color: '#854d0e', value: 'N1,000', label: 'Your Earnings', sub: 'Per consultation' },
              ].map(s => (
                <div key={s.tag} className="stat-card">
                  <span className="stat-tag" style={{ background: s.bg, color: s.color }}>{s.tag}</span>
                  <div className="stat-value" style={{ marginTop: 6 }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-change up">{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Upcoming Appointments</div>
              {loading ? <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--slate)', fontSize: 13 }}>Loading...</div>
              : appointments.filter(a => a.status === 'upcoming').length === 0 ? <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--slate)', fontSize: 13 }}>No upcoming appointments yet.</div>
              : (
                <div className="schedule-list">
                  {appointments.filter(a => a.status === 'upcoming').map(a => (
                    <div key={a.id} className="appt-item">
                      <div style={{ minWidth: 60, textAlign: 'center' }}>
                        <div className="appt-time-val" style={{ fontSize: 13 }}>{new Date(a.date).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' })}</div>
                        <div className="appt-time-date">{new Date(a.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', timeZone: 'Africa/Lagos' })}</div>
                      </div>
                      <div className="appt-divider" />
                      <div style={{ flex: 1 }}><div className="appt-title">{a.title || 'Consultation'}</div><div className="appt-doctor">{a.patient_name || 'Patient'}</div></div>
                      <span className="badge badge-info">{a.type || 'Video'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments */}
        {activePage === 'appointments' && (
          <div>
            <div className="topbar"><div><div className="page-title">Appointments</div><div className="page-sub">All your scheduled consultations</div></div></div>
            <div className="tab-bar">
              {['Upcoming', 'Completed', 'Cancelled'].map((t, i) => (
                <button key={t} className={'tab-btn' + (i === 0 ? ' active' : '')}>{t}</button>
              ))}
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate)', fontSize: 13 }}>Loading...</div>
            : appointments.length === 0 ? <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--slate)', fontSize: 13 }}>No appointments yet.</div>
            : (
              <div className="schedule-list">
                {appointments.map(a => (
                  <div key={a.id} className="appt-item">
                    <div style={{ minWidth: 60, textAlign: 'center' }}>
                      <div className="appt-time-val" style={{ fontSize: 13 }}>{new Date(a.date).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' })}</div>
                      <div className="appt-time-date">{new Date(a.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', timeZone: 'Africa/Lagos' })}</div>
                    </div>
                    <div className="appt-divider" />
                    <div style={{ flex: 1 }}><div className="appt-title">{a.title || 'Consultation'}</div><div className="appt-doctor">{a.patient_name || 'Patient'}</div></div>
                    <span className={'badge ' + (a.status === 'completed' ? 'badge-success' : a.status === 'cancelled' ? 'badge-danger' : 'badge-info')}>{a.status || 'upcoming'}</span>
                    {a.status === 'active' && a.agora_channel && <button className="btn btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={() => joinCall(a)}>Join Call</button>}
                    {(a.status === 'upcoming' || a.status === 'active') && (
                      <button className="btn btn-sm" style={{ marginLeft: 8, background: '#dcfce7', color: '#166634', border: 'none' }} onClick={async () => { await supabase.from('appointments').update({ status: 'completed' }).eq('id', a.id); setAppointments(appointments.map(ap => ap.id === a.id ? { ...ap, status: 'completed' } : ap)); }}>Mark Complete</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activePage === 'messages' && <DoctorMessagesPage doctorUserId={doctorUser?.id} doctorName={profile?.full_name} />}
        {activePage === 'schedule' && <SchedulePage doctorId={profile?.id} />}
        {activePage === 'notes' && <ConsultationNotesPage doctorId={profile?.id} />}
        {activePage === 'profile' && <DoctorProfilePage profile={profile} setProfile={setProfile} />}
      </div>

      {/* Active call UI */}
      {doctorCallActive && (
        <div style={{ position: 'fixed', inset: 0, background: '#0f1f2e', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div><div style={{ fontWeight: 700, fontSize: 16, color: 'white' }}>Patient Consultation</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Video Call in Progress</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} /><span style={{ fontSize: 12, color: 'var(--success)' }}>Connected</span></div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 24 }}>
            <div ref={doctorRemoteRef} style={{ width: '100%', maxWidth: 800, height: 450, background: '#1a2f42', borderRadius: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}><div style={{ fontSize: 48, marginBottom: 12 }}>👤</div><div>Waiting for patient...</div></div>
            </div>
            <div ref={doctorLocalRef} style={{ position: 'absolute', bottom: 40, right: 40, width: 160, height: 120, background: '#0f1f2e', borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }} />
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={endDoctorCall} style={{ padding: '14px 32px', borderRadius: 50, background: 'var(--danger)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>End Call</button>
          </div>
        </div>
      )}
    </div>
  );
}
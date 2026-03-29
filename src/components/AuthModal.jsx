// src/components/AuthModal.jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { authAPI } from '../services/api'
import Icon from './Icon'

const STEM_INTERESTS = ['Web Development','Data Science','Backend Engineering','Cybersecurity','AI & Machine Learning','Mobile Development','Game Development','Cloud Computing']
const EDU_LEVELS     = ['High School','Undergraduate','Graduate','Bootcamp Graduate','Self-taught','Working Professional']
const EXPERTISE      = ['Software Engineering','Data Science','Cybersecurity','AI & ML','Mobile Development','Cloud & DevOps','UI/UX Design','Database Engineering']

export default function AuthModal() {
  const { modal, setModal, login, demoLogin, showToast } = useApp()
  if (!modal) return null

  const [tab,     setTab]     = useState(modal)
  const [role,    setRole]    = useState('student')
  const [form,    setForm]    = useState({})
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})
  const [apiErr,  setApiErr]  = useState('')

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); setApiErr('') }

  const validate = () => {
    const e = {}
    if (!form.email?.includes('@'))        e.email    = 'Enter a valid email'
    if ((form.password?.length ?? 0) < 6)  e.password = 'Password must be at least 6 characters'
    if (tab === 'register') {
      if (!form.name?.trim())              e.name     = 'Full name is required'
      if (form.password !== form.confirm)  e.confirm  = 'Passwords do not match'
      if (role === 'student' && !form.interest) e.interest = 'Pick a STEM interest'
      if (role === 'mentor'  && !form.expertise) e.expertise = 'Expertise is required'
    }
    return e
  }

  const isNetworkError = (err) =>
    err.message?.includes('Failed to fetch') ||
    err.message?.includes('NetworkError') ||
    err.message?.includes('Load failed')

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true); setApiErr('')

    try {
      if (tab === 'login') {
        try {
          const res = await authAPI.login({ email: form.email, password: form.password, role })
          login(res.user, res.token)
        } catch (err) {
          if (isNetworkError(err)) {
            demoLogin(role, `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`, form.email)
          } else {
            setApiErr(err.message)
          }
        }
      } else {
        if (role === 'admin') { setApiErr('Admin accounts can only be created by the platform owner.'); setLoading(false); return }
        try {
          const fd = new FormData()
          fd.append('fullName', form.name); fd.append('email', form.email)
          fd.append('password', form.password); fd.append('role', role)
          if (form.country)    fd.append('country', form.country)
          if (role === 'student') {
            fd.append('educationLevel', form.level || '')
            fd.append('stemInterest',   form.interest || '')
          }
          if (role === 'mentor') {
            fd.append('expertise', form.expertise || '')
            fd.append('yearsExp',  form.years || '0')
            fd.append('biography', form.bio || '')
            if (form.cvFile)    fd.append('cv',          form.cvFile)
            if (form.certFile)  fd.append('certificate', form.certFile)
            if (form.proofFile) fd.append('proof',       form.proofFile)
          }
          const res = await authAPI.register(fd)
          if (role === 'mentor') { showToast('Application submitted! Awaiting admin approval. ✅'); setModal(null) }
          else login(res.user, res.token)
        } catch (err) {
          if (isNetworkError(err)) {
            if (role === 'mentor') { showToast('Application submitted! (Demo mode) ✅'); setModal(null) }
            else demoLogin(role, form.name, form.email)
          } else {
            setApiErr(err.message)
          }
        }
      }
    } finally { setLoading(false) }
  }

  const Err = ({ field }) => errors[field] ? <div style={{ color:'var(--rose)', fontSize:12, marginTop:4 }}>{errors[field]}</div> : null

  const roles = [
    { id:'student', label:'Student', icon:'book',   color:'var(--accent)' },
    { id:'mentor',  label:'Mentor',  icon:'users',  color:'var(--sky)'    },
    { id:'admin',   label:'Admin',   icon:'shield', color:'var(--gold)'   },
  ]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
      <div className="modal-box">
        <button onClick={() => setModal(null)} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', color:'var(--muted)', cursor:'pointer', padding:6 }}>
          <Icon name="x" size={20}/>
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:28 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#00E5B0,#38BDF8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="compass" size={16} color="#030910"/>
          </div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18 }}>STEM<span style={{ color:'var(--accent)' }}>Path</span></span>
        </div>

        <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:4, marginBottom:24 }}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setApiErr('') }} style={{ flex:1, padding:9, borderRadius:8, border:'none', cursor:'pointer', background:tab===t?'var(--card)':'transparent', color:tab===t?'var(--text)':'var(--muted)', fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:14, transition:'all 0.18s' }}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, color:'var(--muted)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', display:'block', marginBottom:10 }}>I am a…</label>
          <div style={{ display:'flex', gap:8 }}>
            {roles.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)} style={{ flex:1, padding:'10px 8px', borderRadius:10, border:'1.5px solid', borderColor:role===r.id?r.color:'var(--border)', background:role===r.id?`color-mix(in srgb,${r.color} 12%,transparent)`:'transparent', color:role===r.id?r.color:'var(--muted)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6, fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:12, transition:'all 0.18s' }}>
                <Icon name={r.icon} size={18} color={role===r.id?r.color:'var(--muted)'}/>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {apiErr && (
          <div style={{ background:'rgba(244,114,182,0.1)', border:'1px solid rgba(244,114,182,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:16, color:'var(--rose)', fontSize:14 }}>
            ⚠️ {apiErr}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {tab === 'register' && <div><input placeholder="Full Name" value={form.name||''} onChange={e => set('name',e.target.value)}/><Err field="name"/></div>}
          <div><input type="email" placeholder="Email address" value={form.email||''} onChange={e => set('email',e.target.value)}/><Err field="email"/></div>
          <div><input type="password" placeholder="Password" value={form.password||''} onChange={e => set('password',e.target.value)}/><Err field="password"/></div>
          {tab === 'register' && <div><input type="password" placeholder="Confirm Password" value={form.confirm||''} onChange={e => set('confirm',e.target.value)}/><Err field="confirm"/></div>}

          {tab === 'register' && role === 'student' && (<>
            <select value={form.level||''} onChange={e => set('level',e.target.value)}>
              <option value="">Education Level</option>{EDU_LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
            <div><select value={form.interest||''} onChange={e => set('interest',e.target.value)}><option value="">STEM Interest</option>{STEM_INTERESTS.map(s => <option key={s}>{s}</option>)}</select><Err field="interest"/></div>
            <input placeholder="Country / Location" value={form.country||''} onChange={e => set('country',e.target.value)}/>
          </>)}

          {tab === 'register' && role === 'mentor' && (<>
            <div><select value={form.expertise||''} onChange={e => set('expertise',e.target.value)}><option value="">Area of Expertise</option>{EXPERTISE.map(s => <option key={s}>{s}</option>)}</select><Err field="expertise"/></div>
            <input type="number" placeholder="Years of Experience" value={form.years||''} onChange={e => set('years',e.target.value)}/>
            <textarea rows={3} placeholder="Short Biography" value={form.bio||''} onChange={e => set('bio',e.target.value)} style={{ resize:'vertical' }}/>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[['cvFile','CV / Resume'],['certFile','Certificate'],['proofFile','Professional Proof']].map(([k,label]) => (
                <div key={k}>
                  <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>{label}</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => set(k, e.target.files[0])} style={{ padding:'8px 12px', fontSize:13 }}/>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(255,181,71,0.08)', border:'1px solid rgba(255,181,71,0.2)', borderRadius:10, padding:12, fontSize:13, color:'var(--gold)' }}>⚠️ Mentor accounts require admin approval before activation.</div>
          </>)}

          {tab === 'register' && role === 'admin' && (
            <div style={{ background:'rgba(244,114,182,0.08)', border:'1px solid rgba(244,114,182,0.2)', borderRadius:10, padding:14, fontSize:13, color:'var(--rose)' }}>Admin accounts can only be created by the platform owner. Contact support.</div>
          )}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width:'100%', justifyContent:'center', marginTop:6, opacity:loading?0.7:1 }}>
            {loading ? 'Please wait…' : tab==='login' ? 'Sign In' : role==='mentor' ? 'Submit Application' : 'Create Account'}
            {!loading && <Icon name="arrow" size={16}/>}
          </button>
        </div>

        <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--muted)' }}>
          {tab === 'login'
            ? <>Don't have an account? <span onClick={() => setTab('register')} style={{ color:'var(--accent)', cursor:'pointer', fontWeight:600 }}>Sign up free</span></>
            : <>Already have an account? <span onClick={() => setTab('login')} style={{ color:'var(--accent)', cursor:'pointer', fontWeight:600 }}>Sign in</span></>
          }
        </p>
      </div>
    </div>
  )
}

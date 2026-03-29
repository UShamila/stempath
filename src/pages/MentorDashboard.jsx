import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashLayout from '../components/DashLayout'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'

const NAV = [
  { path:'/mentor',           icon:'home',    label:'Dashboard'       },
  { path:'/mentor/requests',  icon:'bell',    label:'Student Requests'},
  { path:'/mentor/students',  icon:'users',   label:'My Students'     },
  { path:'/mentor/progress',  icon:'trending',label:'Student Progress'},
  { path:'/mentor/chat',      icon:'message', label:'Messages'        },
  { path:'/mentor/settings',  icon:'settings',label:'Settings'        },
]

function Overview() {
  const stats = [
    { icon:'users',   color:'var(--accent)', label:'Active Students', val:'12'  },
    { icon:'bell',    color:'var(--sky)',    label:'Pending Requests', val:'3'   },
    { icon:'trending',color:'var(--gold)',   label:'Avg Progress',    val:'67%' },
    { icon:'star',    color:'var(--purple)', label:'Your Rating',     val:'4.9' },
  ]
  const students = [
    { name:'Amina Konate',  country:'Senegal', course:'Backend Engineering', progress:72, avatar:'AK', color:'var(--accent)' },
    { name:'Grace Mensah',  country:'Ghana',   course:'Data Science',        progress:55, avatar:'GM', color:'var(--sky)'    },
    { name:'Ngozi Eze',     country:'Nigeria', course:'Web Development',     progress:88, avatar:'NE', color:'var(--gold)'   },
  ]
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:28 }}>
        {stats.map((s,i) => (
          <div key={i} className="stat-card">
            <div style={{ width:40, height:40, borderRadius:10, background:`color-mix(in srgb,${s.color} 13%,transparent)`, border:`1px solid color-mix(in srgb,${s.color} 24%,transparent)`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <Icon name={s.icon} size={20} color={s.color}/>
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:30, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:24 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:20 }}>Active Students</h3>
        {students.map((s,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 0', borderBottom:i<students.length-1?'1px solid rgba(30,48,80,0.5)':'none' }}>
            <div style={{ width:40, height:40, borderRadius:10, background:`linear-gradient(135deg,${s.color},color-mix(in srgb,${s.color} 60%,transparent))`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:'#030910', flexShrink:0 }}>{s.avatar}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600 }}>{s.name} <span style={{ fontSize:12, color:'var(--muted)' }}>· {s.country}</span></div>
              <div style={{ fontSize:12, color:'var(--muted)' }}>{s.course}</div>
            </div>
            <div style={{ minWidth:120 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, color:'var(--muted)' }}>Progress</span>
                <span style={{ fontSize:12, color:'var(--accent)', fontWeight:700 }}>{s.progress}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width:`${s.progress}%` }}/></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudentRequests() {
  const { showToast } = useApp()
  const [requests, setRequests] = useState([
    { name:'Safi Mubarak',   country:'Uganda',  interest:'Data Science',      avatar:'SM', color:'var(--accent)', bio:'Passionate about ML, looking for guidance on where to start.' },
    { name:'Kadi Diallo',    country:'Guinea',  interest:'Web Development',    avatar:'KD', color:'var(--sky)',    bio:'Self-taught HTML/CSS, want to go deeper into JavaScript.' },
    { name:'Amara Traore',   country:'Mali',    interest:'Cybersecurity',      avatar:'AT', color:'var(--gold)',   bio:'Computer science student eager to enter the security field.' },
  ])
  const respond = (i, action) => {
    const name = requests[i].name
    setRequests(p => p.filter((_,idx) => idx !== i))
    showToast(action==='accept' ? `✅ Accepted ${name}'s request!` : `❌ Declined ${name}'s request.`)
  }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {requests.length === 0 && <div style={{ textAlign:'center', padding:60, color:'var(--muted)' }}>No pending requests. 🎉</div>}
      {requests.map((r,i) => (
        <div key={i} className="card-base" style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
            <div style={{ width:48, height:48, borderRadius:13, background:`linear-gradient(135deg,${r.color},color-mix(in srgb,${r.color} 60%,transparent))`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:'#030910', flexShrink:0 }}>{r.avatar}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>{r.name} <span style={{ fontSize:12, color:'var(--muted)', fontFamily:'inherit', fontWeight:400 }}>· {r.country}</span></div>
              <span className="tag" style={{ marginBottom:10, display:'inline-flex' }}>{r.interest}</span>
              <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.6 }}>{r.bio}</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:12, marginTop:18 }}>
            <button className="btn-primary" onClick={() => respond(i,'accept')} style={{ flex:1, justifyContent:'center' }}><Icon name="check" size={15}/>Accept</button>
            <button className="btn-outline" onClick={() => respond(i,'decline')} style={{ flex:1, justifyContent:'center', color:'var(--rose)', borderColor:'rgba(244,114,182,0.3)' }}><Icon name="x" size={15}/>Decline</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function Chat() {
  const { showToast } = useApp()
  const [selected, setSelected] = useState(0)
  const [input, setInput]   = useState('')
  const [convos, setConvos] = useState([
    { name:'Amina Konate', avatar:'AK', color:'var(--accent)', messages:[
        { from:'student', text:'Hi! I am stuck on Promises in JavaScript. Can you help?', time:'10:14' },
        { from:'mentor',  text:'Of course! Promises represent a value that may be available now, later, or never. Let me share an example.', time:'10:16' },
        { from:'student', text:'Thanks! The chaining concept makes more sense now.', time:'10:22' },
      ] },
    { name:'Grace Mensah', avatar:'GM', color:'var(--sky)', messages:[
        { from:'student', text:'Can we schedule a session this week?', time:'Yesterday' },
        { from:'mentor',  text:'Sure! How about Thursday at 3pm?', time:'Yesterday' },
      ] },
  ])
  const c = convos[selected]
  const send = () => {
    if (!input.trim()) return
    const updated = [...convos]
    updated[selected].messages.push({ from:'mentor', text:input, time:'Now' })
    setConvos(updated)
    setInput('')
  }
  return (
    <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:0, background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', height:520 }}>
      {/* Sidebar */}
      <div style={{ borderRight:'1px solid var(--border)', overflowY:'auto' }}>
        <div style={{ padding:'16px', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:'var(--muted)', borderBottom:'1px solid var(--border)' }}>Conversations</div>
        {convos.map((conv,i) => (
          <div key={i} onClick={() => setSelected(i)} style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', background:selected===i?'rgba(0,229,176,0.07)':'transparent', borderLeft:selected===i?'2px solid var(--accent)':'2px solid transparent' }}>
            <div style={{ width:36, height:36, borderRadius:9, background:`linear-gradient(135deg,${conv.color},color-mix(in srgb,${conv.color} 60%,transparent))`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:12, color:'#030910', flexShrink:0 }}>{conv.avatar}</div>
            <span style={{ fontSize:14, fontWeight:500, color:selected===i?'var(--accent)':'var(--text)' }}>{conv.name}</span>
          </div>
        ))}
      </div>
      {/* Chat area */}
      <div style={{ display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', fontFamily:"'Syne',sans-serif", fontWeight:700 }}>{c.name}</div>
        <div style={{ flex:1, padding:18, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
          {c.messages.map((msg,i) => (
            <div key={i} style={{ display:'flex', justifyContent:msg.from==='mentor'?'flex-end':'flex-start' }}>
              <div style={{ maxWidth:'75%', padding:'10px 14px', borderRadius:12, background:msg.from==='mentor'?'rgba(0,229,176,0.12)':'var(--surface)', border:`1px solid ${msg.from==='mentor'?'rgba(0,229,176,0.22)':'var(--border)'}`, fontSize:14 }}>
                <div>{msg.text}</div>
                <div style={{ fontSize:11, color:'var(--muted)', marginTop:4, textAlign:'right' }}>{msg.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:'12px 14px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Write a message…" style={{ flex:1 }}/>
          <button className="btn-primary" onClick={send} style={{ padding:'10px 14px' }}><Icon name="arrow" size={16}/></button>
        </div>
      </div>
    </div>
  )
}

function StudentProgress() {
  const students = [
    { name:'Amina Konate',  avatar:'AK', color:'var(--accent)', course:'Backend Engineering', progress:72, completed:2, active:3 },
    { name:'Grace Mensah',  avatar:'GM', color:'var(--sky)',    course:'Data Science',        progress:55, completed:1, active:2 },
    { name:'Ngozi Eze',     avatar:'NE', color:'var(--gold)',   course:'Web Development',     progress:88, completed:4, active:1 },
    { name:'Safi Mubarak',  avatar:'SM', color:'var(--purple)', course:'Cybersecurity',       progress:30, completed:0, active:2 },
  ]
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
      <table className="data-table">
        <thead>
          <tr><th>Student</th><th>Path</th><th>Progress</th><th>Completed</th><th>Active</th></tr>
        </thead>
        <tbody>
          {students.map((s,i) => (
            <tr key={i}>
              <td>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:8, background:`linear-gradient(135deg,${s.color},color-mix(in srgb,${s.color} 60%,transparent))`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:12, color:'#030910' }}>{s.avatar}</div>
                  {s.name}
                </div>
              </td>
              <td style={{ color:'var(--muted)' }}>{s.course}</td>
              <td>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="progress-bar" style={{ width:100, margin:0 }}><div className="progress-fill" style={{ width:`${s.progress}%` }}/></div>
                  <span style={{ color:'var(--accent)', fontWeight:700, fontSize:13 }}>{s.progress}%</span>
                </div>
              </td>
              <td><span style={{ color:'var(--accent)' }}>{s.completed}</span></td>
              <td><span style={{ color:'var(--sky)' }}>{s.active}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Settings() {
  const { showToast } = useApp()
  return (
    <div style={{ maxWidth:560 }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:28 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:20 }}>Mentor Profile</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:6 }}>Full Name</label><input defaultValue="Dr. Amara Diallo"/></div>
          <div><label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:6 }}>Area of Expertise</label><input defaultValue="Backend & Systems"/></div>
          <div><label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:6 }}>Max Students</label><input type="number" defaultValue="15"/></div>
          <div><label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:6 }}>Bio</label><textarea rows={4} defaultValue="10+ years building large-scale distributed systems. Passionate about helping women break into tech." style={{ resize:'vertical' }}/></div>
          <button className="btn-primary" onClick={() => showToast('Profile updated! ✅')} style={{ alignSelf:'flex-start' }}>Save Changes <Icon name="check" size={16}/></button>
        </div>
      </div>
    </div>
  )
}

const PAGES = {
  '/mentor':           { title:'Mentor Dashboard',   comp:Overview         },
  '/mentor/requests':  { title:'Student Requests',   comp:StudentRequests  },
  '/mentor/students':  { title:'My Students',        comp:Overview         },
  '/mentor/progress':  { title:'Student Progress',   comp:StudentProgress  },
  '/mentor/chat':      { title:'Messages',           comp:Chat             },
  '/mentor/settings':  { title:'Settings',           comp:Settings         },
}

export default function MentorDashboard() {
  const navigate = useNavigate()
  const { user }  = useApp()
  const loc       = window.location.pathname
  const page      = PAGES[loc] ?? PAGES['/mentor']
  const Comp      = page.comp

  if (!user || user.role !== 'mentor') {
    return <div style={{ padding:80, textAlign:'center' }}>
      <p style={{ color:'var(--muted)', marginBottom:20 }}>Please sign in as a mentor.</p>
      <button className="btn-primary" onClick={() => navigate('/')}>Go Home <Icon name="arrow" size={16}/></button>
    </div>
  }

  return (
    <DashLayout navItems={NAV} title={page.title}>
      <Comp/>
    </DashLayout>
  )
}

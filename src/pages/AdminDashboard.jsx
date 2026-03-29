import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashLayout from '../components/DashLayout'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'

const NAV = [
  { path:'/admin',           icon:'home',    label:'Dashboard'       },
  { path:'/admin/users',     icon:'users',   label:'Manage Users'    },
  { path:'/admin/courses',   icon:'book',    label:'Manage Courses'  },
  { path:'/admin/approvals', icon:'check2',  label:'Mentor Approvals'},
  { path:'/admin/analytics', icon:'chart',   label:'Analytics'       },
]

function Overview() {
  const stats = [
    { icon:'users',   color:'var(--accent)', label:'Total Students',   val:'12' },
    { icon:'person',  color:'var(--sky)',    label:'Total Mentors',    val:'8'   },
    { icon:'zap',     color:'var(--gold)',   label:'Active Users Today',val:'4'  },
    { icon:'award',   color:'var(--purple)', label:'Certificates Issued',val:'2'},
    { icon:'book',    color:'var(--rose)',   label:'Courses Active',   val:'8'    },
    { icon:'trending',color:'var(--accent)', label:'Completion Rate',  val:'34%'   },
  ]
  const recentActions = [
    { type:'mentor_approved', name:'Kemi Adeyeye',   time:'2m ago',  color:'var(--accent)' },
    { type:'new_student',     name:'Aisha Kamara',   time:'15m ago', color:'var(--sky)'    },
    { type:'course_added',    name:'React Advanced', time:'1h ago',  color:'var(--gold)'   },
    { type:'cert_issued',     name:'Amina Konate',   time:'3h ago',  color:'var(--purple)' },
  ]
  const icons = { mentor_approved:'check2', new_student:'person', course_added:'book', cert_issued:'award' }
  const labels = { mentor_approved:'Mentor approved', new_student:'New student', course_added:'Course added', cert_issued:'Certificate issued' }
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))', gap:16, marginBottom:28 }}>
        {stats.map((s,i) => (
          <div key={i} className="stat-card">
            <div style={{ width:40, height:40, borderRadius:10, background:`color-mix(in srgb,${s.color} 13%,transparent)`, border:`1px solid color-mix(in srgb,${s.color} 24%,transparent)`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
              <Icon name={s.icon} size={20} color={s.color}/>
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:24 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:18 }}>Recent Activity</h3>
        {recentActions.map((a,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:i<recentActions.length-1?'1px solid rgba(30,48,80,0.5)':'none' }}>
            <div style={{ width:36, height:36, borderRadius:9, background:`color-mix(in srgb,${a.color} 13%,transparent)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name={icons[a.type]} size={17} color={a.color}/>
            </div>
            <div style={{ flex:1 }}>
              <span style={{ fontWeight:600, fontSize:14 }}>{labels[a.type]}: </span>
              <span style={{ color:'var(--muted)', fontSize:14 }}>{a.name}</span>
            </div>
            <span style={{ fontSize:12, color:'var(--muted)' }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ManageUsers() {
  const { showToast } = useApp()
  const [users, setUsers] = useState([
    { name:'Amina Shemsa',  email:'shemsa@example.com',  role:'student', status:'active',   joined:'Oct 2024', avatar:'AK', color:'var(--accent)' },
    { name:'Doriane Keza',  email:'doriane@example.com',  role:'student', status:'active',   joined:'Sep 2024', avatar:'GM', color:'var(--sky)'    },
    { name:'Uwas Sandrine', email:'sandrine@example.com',  role:'student', status:'inactive', joined:'Aug 2024', avatar:'NE', color:'var(--gold)'   },
    { name:'Dr. A. Diallo', email:'amara@example.com',  role:'mentor',  status:'active',   joined:'Jul 2024', avatar:'AD', color:'var(--purple)' },
    { name:'Fatima Annick',     email:'fatima@example.com', role:'mentor',  status:'active',   joined:'Aug 2024', avatar:'FA', color:'var(--rose)'   },
  ])
  const ban = (i) => { const name = users[i].name; setUsers(p => p.filter((_,idx) => idx!==i)); showToast(`User "${name}" removed.`) }
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
      <table className="data-table">
        <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map((u,i) => (
            <tr key={i}>
              <td>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${u.color},color-mix(in srgb,${u.color} 60%,transparent))`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:11, color:'#030910' }}>{u.avatar}</div>
                  {u.name}
                </div>
              </td>
              <td style={{ color:'var(--muted)', fontSize:13 }}>{u.email}</td>
              <td><span className="tag" style={{ textTransform:'capitalize' }}>{u.role}</span></td>
              <td><span style={{ fontSize:12, padding:'3px 10px', borderRadius:20, background:u.status==='active'?'rgba(0,229,176,0.1)':'rgba(255,255,255,0.05)', color:u.status==='active'?'var(--accent)':'var(--muted)', border:`1px solid ${u.status==='active'?'rgba(0,229,176,0.25)':'var(--border)'}` }}>{u.status}</span></td>
              <td style={{ color:'var(--muted)', fontSize:13 }}>{u.joined}</td>
              <td>
                <button onClick={() => ban(i)} style={{ background:'none', border:'none', color:'var(--rose)', cursor:'pointer', padding:'4px 6px', borderRadius:6 }} title="Remove user">
                  <Icon name="trash" size={15} color="var(--rose)"/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ManageCourses() {
  const { showToast } = useApp()
  const [courses] = useState([
    { title:'HTML & CSS Foundations',   category:'Web Dev',    enrolled:342, rating:4.8, status:'Published' },
    { title:'JavaScript Essentials',    category:'Web Dev',    enrolled:289, rating:4.9, status:'Published' },
    { title:'Node.js Mastery',          category:'Backend',    enrolled:198, rating:4.7, status:'Published' },
    { title:'SQL & Databases',          category:'Backend',    enrolled:220, rating:4.8, status:'Published' },
    { title:'Python Fundamentals',      category:'Data Sci',   enrolled:175, rating:4.9, status:'Draft'     },
    { title:'Intro to Cybersecurity',   category:'Cyber',      enrolled:0,   rating:0,   status:'Draft'     },
  ])
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button className="btn-primary" onClick={() => showToast('Course creator coming soon!')}><Icon name="plus" size={16}/>Add Course</button>
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Course</th><th>Category</th><th>Enrolled</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {courses.map((c,i) => (
              <tr key={i}>
                <td style={{ fontWeight:600 }}>{c.title}</td>
                <td><span className="tag">{c.category}</span></td>
                <td style={{ color:'var(--muted)' }}>{c.enrolled}</td>
                <td>{c.rating ? <span className="star-badge"><Icon name="star" size={11} color="var(--gold)"/>{c.rating}</span> : '—'}</td>
                <td><span style={{ fontSize:12, padding:'3px 10px', borderRadius:20, background:c.status==='Published'?'rgba(0,229,176,0.1)':'rgba(255,181,71,0.1)', color:c.status==='Published'?'var(--accent)':'var(--gold)', border:`1px solid ${c.status==='Published'?'rgba(0,229,176,0.25)':'rgba(255,181,71,0.25)'}` }}>{c.status}</span></td>
                <td style={{ display:'flex', gap:8 }}>
                  <button onClick={() => showToast(`Editing "${c.title}"…`)} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer' }}><Icon name="edit" size={15}/></button>
                  <button onClick={() => showToast(`Deleted "${c.title}"`)} style={{ background:'none', border:'none', color:'var(--rose)', cursor:'pointer' }}><Icon name="trash" size={15} color="var(--rose)"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MentorApprovals() {
  const { showToast } = useApp()
  const [pending, setPending] = useState([
    { name:'Kemi Adeyeye',  expertise:'Cloud & DevOps', exp:'7 years', company:'AWS',       avatar:'KA', color:'var(--accent)', bio:'AWS certified architect with 7 years of cloud infrastructure experience.' },
    { name:'Sola Okonkwo',  expertise:'UI/UX Design',   exp:'5 years', company:'Figma',     avatar:'SO', color:'var(--sky)',    bio:'Led design systems at multiple African tech startups.' },
    { name:'Binta Diallo',  expertise:'Data Science',   exp:'4 years', company:'Palantir',  avatar:'BD', color:'var(--gold)',   bio:'PhD candidate specializing in African economic data analysis.' },
  ])
  const respond = (i, action) => {
    const name = pending[i].name
    setPending(p => p.filter((_,idx) => idx!==i))
    showToast(action==='approve' ? `✅ ${name} approved as mentor!` : `❌ ${name}'s application declined.`)
  }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {pending.length === 0 && <div style={{ textAlign:'center', padding:60, color:'var(--muted)' }}>No pending approvals. 🎉</div>}
      {pending.map((m,i) => (
        <div key={i} className="card-base" style={{ padding:24 }}>
          <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
            <div style={{ width:52, height:52, borderRadius:14, background:`linear-gradient(135deg,${m.color},color-mix(in srgb,${m.color} 60%,transparent))`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:'#030910', flexShrink:0 }}>{m.avatar}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontFamily:"'Syne',sans-serif", fontSize:17, marginBottom:4 }}>{m.name}</div>
              <div style={{ fontSize:13, color:'var(--muted)', marginBottom:8 }}>{m.expertise} · {m.exp} · {m.company}</div>
              <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.6 }}>{m.bio}</p>
              <div style={{ marginTop:12, display:'flex', gap:10, flexWrap:'wrap' }}>
                {['CV Uploaded','Certificate Uploaded','Professional Proof'].map((doc,di) => (
                  <div key={di} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--accent)' }}>
                    <Icon name="check" size={13} color="var(--accent)"/>{doc}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:12, marginTop:20 }}>
            <button className="btn-primary" onClick={() => respond(i,'approve')} style={{ flex:1, justifyContent:'center' }}><Icon name="check" size={15}/>Approve Mentor</button>
            <button className="btn-outline" onClick={() => respond(i,'decline')} style={{ flex:1, justifyContent:'center', color:'var(--rose)', borderColor:'rgba(244,114,182,0.3)' }}><Icon name="x" size={15}/>Decline</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function Analytics() {
  const metrics = [
    { label:'Course Completion Rate', val:50,  color:'var(--accent)', suffix:'%' },
    { label:'Mentor Response Rate',   val:7,  color:'var(--sky)',    suffix:'%' },
    { label:'Student Retention',      val:8,  color:'var(--gold)',   suffix:'%' },
    { label:'Placement Rate',         val:12,  color:'var(--purple)', suffix:'%' },
  ]
  const topCourses = [
    { name:'JavaScript Essentials',  enrolled:8, color:'var(--accent)' },
    { name:'HTML & CSS Foundations', enrolled:2, color:'var(--sky)'    },
    { name:'SQL & Databases',        enrolled:2, color:'var(--gold)'   },
    { name:'Node.js Mastery',        enrolled:4, color:'var(--purple)' },
    { name:'Python Fundamentals',    enrolled:1, color:'var(--rose)'   },
  ]
  const max = Math.max(...topCourses.map(c => c.enrolled))
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* KPI gauges */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
        {metrics.map((m,i) => (
          <div key={i} className="stat-card" style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:42, color:m.color }}>{m.val}{m.suffix}</div>
            <div style={{ fontSize:13, color:'var(--muted)', marginTop:4, marginBottom:12 }}>{m.label}</div>
            <div className="progress-bar"><div className="progress-fill" style={{ width:`${m.val}%`, background:`linear-gradient(90deg,${m.color},color-mix(in srgb,${m.color} 70%,#38BDF8))` }}/></div>
          </div>
        ))}
      </div>
      {/* Top courses bar chart */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:28 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:22 }}>Most Popular Courses</h3>
        {topCourses.map((c,i) => (
          <div key={i} style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
              <span style={{ fontSize:14, fontWeight:500 }}>{c.name}</span>
              <span style={{ fontSize:13, color:c.color, fontWeight:700 }}>{c.enrolled} enrolled</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width:`${(c.enrolled/max)*100}%`, background:`linear-gradient(90deg,${c.color},color-mix(in srgb,${c.color} 70%,#38BDF8))` }}/></div>
          </div>
        ))}
      </div>
      {/* Mentorship stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
        {[{label:'Active Mentorships',val:94,color:'var(--accent)'},{label:'Pending Requests',val:12,color:'var(--gold)'},{label:'Completed Sessions',val:1248,color:'var(--sky)'}].map((s,i) => (
          <div key={i} className="stat-card" style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:34, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const PAGES = {
  '/admin':           { title:'Admin Dashboard',   comp:Overview       },
  '/admin/users':     { title:'Manage Users',      comp:ManageUsers    },
  '/admin/courses':   { title:'Manage Courses',    comp:ManageCourses  },
  '/admin/approvals': { title:'Mentor Approvals',  comp:MentorApprovals},
  '/admin/analytics': { title:'Analytics',         comp:Analytics      },
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user }  = useApp()
  const loc       = window.location.pathname
  const page      = PAGES[loc] ?? PAGES['/admin']
  const Comp      = page.comp

  if (!user || user.role !== 'admin') {
    return <div style={{ padding:80, textAlign:'center' }}>
      <p style={{ color:'var(--muted)', marginBottom:20 }}>Please sign in as an admin.</p>
      <button className="btn-primary" onClick={() => navigate('/')}>Go Home <Icon name="arrow" size={16}/></button>
    </div>
  }

  return (
    <DashLayout navItems={NAV} title={page.title}>
      <Comp/>
    </DashLayout>
  )
}

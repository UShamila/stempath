import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashLayout from '../components/DashLayout'
import Icon from '../components/Icon'
import { useApp } from '../context/AppContext'
import { courseAPI, mentorshipAPI, mentorAPI, tokenStore } from '../services/api'

const NAV = [
  { path:'/student',          icon:'home',    label:'Dashboard'      },
  { path:'/student/mentors',  icon:'users',   label:'Browse Mentors' },
  { path:'/student/courses',  icon:'book',    label:'My Courses'     },
  { path:'/student/progress', icon:'trending',label:'Progress'       },
  { path:'/student/certs',    icon:'award',   label:'Certificates'   },
  { path:'/student/forum',    icon:'message', label:'Forum'          },
  { path:'/student/ai',       icon:'brain',   label:'AI Guide'       },
  { path:'/student/settings', icon:'settings',label:'Settings'       },
]

/*  Sub-pages  */

function Overview() {
  const { user, showToast } = useApp()
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState([])
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!tokenStore.get()) {
        setLoading(false)
        return
      }

      try {
        // Fetch enrolled courses
        const myCourses = await courseAPI.myCourses()
        setCourses(myCourses.slice(0, 3)) // Show first 3

        // Calculate stats
        const totalCourses = myCourses.length
        const completedCourses = myCourses.filter(c => c.completed_at).length
        const totalLessons = myCourses.reduce((sum, c) => sum + (c.total_lessons || 0), 0)
        const completedLessons = myCourses.reduce((sum, c) => sum + (c.completed_lessons || 0), 0)
        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

        setStats([
          { icon: 'book', color: 'var(--accent)', label: 'Courses Active', val: totalCourses.toString() },
          { icon: 'check2', color: 'var(--sky)', label: 'Courses Completed', val: completedCourses.toString() },
          { icon: 'award', color: 'var(--gold)', label: 'Certificates', val: completedCourses.toString() },
          { icon: 'trending', color: 'var(--purple)', label: 'Overall Progress', val: `${progressPercent}%` },
        ])

        // Fetch mentor info
        const mentorship = await mentorshipAPI.getMyMentor()
        if (mentorship) {
          setMentor(mentorship.mentor)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        showToast('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchData()
    else setLoading(false)
  }, [user, showToast])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Mentor banner */}
      {mentor && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:22, marginBottom:28, display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'linear-gradient(135deg,var(--accent),#38BDF8)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:'#030910', flexShrink:0 }}>
            {mentor.full_name?.split(' ').map(n => n[0]).join('') || 'M'}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>Your Mentor</div>
            <div style={{ fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{mentor.full_name}</div>
            <div style={{ fontSize:13, color:'var(--muted)' }}>{mentor.expertise} · {mentor.years_exp} years experience</div>
          </div>
          <button className="btn-outline" style={{ padding:'9px 16px', fontSize:13 }}><Icon name="message" size={15}/>Message</button>
        </div>
      )}

      {/* Stats */}
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

      {/* Courses in progress */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:24 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, marginBottom:20 }}>Courses in Progress</h3>
        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>
            No courses enrolled yet. Browse available courses to get started!
          </div>
        ) : (
          courses.map((c,i) => {
            const progress = c.total_lessons > 0 ? Math.round((c.completed_lessons / c.total_lessons) * 100) : 0
            return (
              <div key={c.id} style={{ marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={{ fontSize:14, fontWeight:500 }}>{c.title}</span>
                  <span style={{ fontSize:13, color:'var(--accent)', fontWeight:700 }}>{progress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width:`${progress}%`, background:`linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#38BDF8))` }}/></div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function BrowseMentors() {
  const { showToast } = useApp()
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await mentorAPI.list()
        setMentors(data)
      } catch (error) {
        console.error('Failed to fetch mentors:', error)
        showToast('Failed to load mentors')
      } finally {
        setLoading(false)
      }
    }
    fetchMentors()
  }, [showToast])

  const tags = ['All', 'Python', 'ML', 'React', 'Security', 'Cloud', 'Node.js', 'Data Science', 'AI', 'DevOps']
  const filtered = filter === 'All' ? mentors : mentors.filter(m =>
    m.expertise?.toLowerCase().includes(filter.toLowerCase()) ||
    m.tags?.some(t => t.toLowerCase().includes(filter.toLowerCase()))
  )

  const handleRequestMentorship = async (mentorId, mentorName) => {
    if (!tokenStore.get()) {
      showToast('Please sign in to request mentorship.')
      return
    }

    try {
      await mentorshipAPI.sendRequest(mentorId, 'I would like to request mentorship.')
      showToast(`Mentorship request sent to ${mentorName}! 🚀`)
      // Refresh mentors list to update availability
      const data = await mentorAPI.list()
      setMentors(data)
    } catch (error) {
      console.error('Failed to send mentorship request:', error)
      showToast('Failed to send mentorship request')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <div>Loading mentors...</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:28 }}>
        {tags.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding:'8px 18px', borderRadius:20, border:'1.5px solid', borderColor:filter===t?'var(--accent)':'var(--border)', background:filter===t?'rgba(0,229,176,0.1)':'transparent', color:filter===t?'var(--accent)':'var(--muted)', cursor:'pointer', fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:13, transition:'all 0.18s' }}>{t}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
        {filtered.map((m) => {
          const available = m.mentor_status === 'approved' && m.max_students > (m.current_students || 0)
          const color = 'var(--accent)' // You can add more colors based on expertise
          return (
            <div key={m.id} className="card-base" style={{ padding:26, display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:50, height:50, borderRadius:13, background:`linear-gradient(135deg,${color},color-mix(in srgb,${color} 60%,transparent))`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:'#030910', flexShrink:0 }}>
                  {m.full_name?.split(' ').map(n => n[0]).join('') || 'M'}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{m.full_name}</div>
                  <div style={{ fontSize:12, color:'var(--muted)' }}>{m.expertise} · {m.years_exp} years experience</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div className="star-badge"><Icon name="star" size={12} color="var(--gold)"/>{m.rating || 0}</div>
                <span style={{ fontSize:12, padding:'3px 10px', borderRadius:20, background:available?'rgba(0,229,176,0.1)':'rgba(255,255,255,0.05)', color:available?'var(--accent)':'var(--muted)', border:`1px solid ${available?'rgba(0,229,176,0.25)':'var(--border)'}` }}>
                  {available ? 'Available' : 'Available'}
                </span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                <span className="tag" style={{ background:`color-mix(in srgb,${color} 10%,transparent)`, borderColor:`color-mix(in srgb,${color} 24%,transparent)`, color:color }}>{m.expertise}</span>
              </div>
              <button
                className={available ? 'btn-primary' : 'btn-outline'}
                onClick={() => available ? handleRequestMentorship(m.id, m.full_name) : showToast('This mentor is currently unavailable.')}
                style={{ justifyContent:'center', opacity:available ? 1 : 0.6 }}
              >
                {available ? <><Icon name="users" size={15}/>Request Mentorship</> : 'Unavailable'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MyCourses() {
  const { showToast } = useApp()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      if (!tokenStore.get()) {
        setLoading(false)
        return
      }

      try {
        const data = await courseAPI.myCourses()
        setCourses(data)
      } catch (error) {
        console.error('Failed to fetch courses:', error)
        showToast('Failed to load courses')
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [showToast])

  const handleEnroll = async (courseId, courseTitle) => {
    if (!tokenStore.get()) {
      showToast('Please sign in to enroll in a course.')
      return
    }

    try {
      await courseAPI.enroll(courseId)
      showToast(`Successfully enrolled in ${courseTitle}!`)
      // Refresh courses
      const data = await courseAPI.myCourses()
      setCourses(data)
    } catch (error) {
      console.error('Failed to enroll:', error)
      showToast('Failed to enroll in course')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <div>Loading courses...</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
        {courses.map((c) => {
          const progress = c.total_lessons > 0 ? Math.round((c.completed_lessons / c.total_lessons) * 100) : 0
          const status = c.completed_at ? 'Completed' : 'In Progress'
          const color = 'var(--accent)' // You can vary colors based on category
          const icon = 'book' // You can map category to icons

          return (
            <div key={c.id} className="card-base" style={{ padding:26 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`color-mix(in srgb,${color} 13%,transparent)`, border:`1px solid color-mix(in srgb,${color} 24%,transparent)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name={icon} size={20} color={color}/>
                </div>
                <span style={{ fontSize:12, padding:'4px 10px', borderRadius:20, background:status==='Completed'?'rgba(0,229,176,0.1)':'rgba(56,189,248,0.1)', color:status==='Completed'?'var(--accent)':'var(--sky)', border:`1px solid ${status==='Completed'?'rgba(0,229,176,0.25)':'rgba(56,189,248,0.25)'}` }}>{status}</span>
              </div>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:8 }}>{c.title}</h3>
              <div style={{ fontSize:13, color:'var(--muted)', marginBottom:14 }}>{c.completed_lessons || 0}/{c.total_lessons || 0} lessons completed</div>
              <div className="progress-bar" style={{ marginBottom:16 }}><div className="progress-fill" style={{ width:`${progress}%` }}/></div>
              <button
                className={status==='Completed'?'btn-outline':'btn-primary'}
                onClick={() => status==='Completed' ? showToast(`Certificate for "${c.title}" is in your Certificates tab! 🏆`) : showToast(`Continuing "${c.title}"…`)}
                style={{ width:'100%', justifyContent:'center', fontSize:13, padding:'10px' }}
              >
                {status==='Completed' ? <><Icon name="award" size={15}/>View Certificate</> : <><Icon name="play" size={15}/>Continue</>}
              </button>
            </div>
          )
        })}
      </div>
      {courses.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>
          You haven't enrolled in any courses yet. Browse available courses to get started!
        </div>
      )}
    </div>
  )
}

function Progress() {
  const weekData = [60,45,80,30,90,70,55]
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const max = Math.max(...weekData)
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Weekly activity */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:28 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:24 }}>Weekly Study Activity (minutes)</h3>
        <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:160 }}>
          {weekData.map((v,i) => (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
              <div style={{ fontSize:11, color:'var(--muted)' }}>{v}m</div>
              <div style={{ width:'100%', background:`linear-gradient(180deg,var(--accent),#38BDF8)`, borderRadius:'6px 6px 0 0', height:`${(v/max)*120}px`, opacity:i===4?1:0.6, transition:'all 0.3s' }}/>
              <div style={{ fontSize:11, color:'var(--muted)' }}>{days[i]}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Path progress */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:28 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:24 }}>Backend Developer Path</h3>
        {[
          { label:'Programming Fundamentals', done:true  },
          { label:'JavaScript',               done:true  },
          { label:'Node.js',                  done:false, active:true },
          { label:'Express.js',               done:false },
          { label:'SQL & Databases',          done:false },
          { label:'API Development',          done:false },
        ].map((s,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:i<5?'1px solid rgba(30,48,80,0.5)':'none' }}>
            <div style={{ width:32, height:32, borderRadius:8, background:s.done?'rgba(0,229,176,0.15)':s.active?'rgba(56,189,248,0.12)':'rgba(255,255,255,0.04)', border:`1px solid ${s.done?'rgba(0,229,176,0.3)':s.active?'rgba(56,189,248,0.28)':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {s.done ? <Icon name="check" size={14} color="var(--accent)"/> : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:s.active?'var(--sky)':'var(--muted)' }}>{i+1}</span>}
            </div>
            <span style={{ flex:1, fontWeight:500, color:s.done?'var(--text)':s.active?'var(--sky)':'var(--muted)' }}>{s.label}</span>
            {s.done && <span style={{ fontSize:12, color:'var(--accent)' }}>Done</span>}
            {s.active && <span style={{ fontSize:12, color:'var(--sky)' }}>In Progress</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function Certificates() {
  const { showToast } = useApp()
  const certs = [
    { title:'HTML & CSS Foundations',   date:'Oct 2024', id:'SP-2024-001', color:'var(--accent)' },
    { title:'Programming Fundamentals', date:'Sep 2024', id:'SP-2024-002', color:'var(--sky)'    },
  ]
  return (
    <div>
      {certs.length === 0 && <div style={{ textAlign:'center', padding:80, color:'var(--muted)' }}>No certificates yet — keep learning! 🚀</div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:24 }}>
        {certs.map((c,i) => (
          <div key={i} style={{ background:`linear-gradient(135deg,rgba(0,229,176,0.07),rgba(56,189,248,0.05))`, border:`1px solid rgba(0,229,176,0.2)`, borderRadius:20, padding:32, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-20, right:-20, width:120, height:120, background:`radial-gradient(circle,color-mix(in srgb,${c.color} 18%,transparent) 0%,transparent 70%)`, borderRadius:'50%', filter:'blur(15px)' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
              <div style={{ width:48, height:48, borderRadius:13, background:`color-mix(in srgb,${c.color} 15%,transparent)`, border:`1px solid color-mix(in srgb,${c.color} 28%,transparent)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="award" size={24} color={c.color}/>
              </div>
              <div>
                <div style={{ fontSize:11, color:'var(--muted)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:2 }}>Certificate of Completion</div>
                <div style={{ fontSize:11, color:c.color }}>ID: {c.id}</div>
              </div>
            </div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, marginBottom:8 }}>{c.title}</h3>
            <p style={{ fontSize:13, color:'var(--muted)', marginBottom:20 }}>Issued {c.date} · STEMPath Verified</p>
            <button className="btn-outline" onClick={() => showToast('Certificate download starting… 📄')} style={{ width:'100%', justifyContent:'center', fontSize:13 }}>
              <Icon name="upload" size={15}/>Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Forum() {
  const { showToast } = useApp()
  const [newPost, setNewPost] = useState('')
  const [posts, setPosts] = useState([
    { author:'Amira S.', avatar:'AS', color:'var(--accent)', time:'2h ago', title:'How do I understand async/await in JavaScript?', replies:12, likes:34, tag:'JavaScript' },
    { author:'Fatou D.', avatar:'FD', color:'var(--sky)',    time:'5h ago', title:'Tips for passing the SQL certification quiz?',    replies:8,  likes:27, tag:'Databases' },
    { author:'Nadia K.', avatar:'NK', color:'var(--gold)',   time:'1d ago', title:'My first React project — feedback welcome!',      replies:21, likes:58, tag:'Web Dev' },
  ])
  const submit = () => {
    if (!newPost.trim()) return
    setPosts(p => [{ author:'You', avatar:'YO', color:'var(--purple)', time:'Just now', title:newPost, replies:0, likes:0, tag:'General' }, ...p])
    setNewPost('')
    showToast('Post published! 🎉')
  }
  return (
    <div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:22, marginBottom:24 }}>
        <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Ask a question or start a discussion…" rows={3} style={{ marginBottom:12, resize:'vertical' }}/>
        <button className="btn-primary" onClick={submit}><Icon name="plus" size={16}/>Post Question</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {posts.map((p,i) => (
          <div key={i} className="card-base" style={{ padding:'18px 22px', display:'flex', alignItems:'center', gap:18, cursor:'pointer' }} onClick={() => showToast('Opening thread…')}>
            <div style={{ width:40, height:40, borderRadius:10, background:`linear-gradient(135deg,${p.color},color-mix(in srgb,${p.color} 60%,transparent))`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:'#030910', flexShrink:0 }}>{p.avatar}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', gap:10, marginBottom:5, flexWrap:'wrap' }}>
                <span className="tag">{p.tag}</span>
                <span style={{ fontSize:12, color:'var(--muted)' }}>{p.author} · {p.time}</span>
              </div>
              <div style={{ fontWeight:600, fontFamily:"'Syne',sans-serif", whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.title}</div>
            </div>
            <div style={{ display:'flex', gap:16, flexShrink:0 }} className="hide-mobile">
              <div style={{ display:'flex', alignItems:'center', gap:5, color:'var(--muted)', fontSize:13 }}><Icon name="message" size={14}/>{p.replies}</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, color:'var(--muted)', fontSize:13 }}><Icon name="heart" size={14}/>{p.likes}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AIGuide() {
  const PATHS_MAP = {
    backend: ['Programming Fundamentals','JavaScript','Node.js','Express.js','SQL','API Development','Cloud Basics'],
    data:    ['Python','Statistics','Pandas','Machine Learning','Data Visualization','Deep Learning'],
    cyber:   ['Networking','Linux','Cryptography','Ethical Hacking','Penetration Testing'],
    web:     ['HTML & CSS','JavaScript','React','Responsive Design','Performance','Deployment'],
  }
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { type:'ai', text:"Hi! 👋 I'm your AI Career Guide. Tell me your dream STEM career and I'll map out exactly what you need to learn!" }
  ])
  const handleSend = () => {
    if (!input.trim()) return
    const l = input.toLowerCase()
    let text, path
    if (l.includes('backend') || l.includes('node'))           { text='Perfect! Here is your Backend Developer roadmap:'; path=PATHS_MAP.backend }
    else if (l.includes('data') || l.includes('ml'))          { text='Great choice! Here is your Data Science roadmap:'; path=PATHS_MAP.data    }
    else if (l.includes('cyber') || l.includes('security'))   { text='Excellent! Here is your Cybersecurity roadmap:'; path=PATHS_MAP.cyber   }
    else if (l.includes('web') || l.includes('front'))        { text='Awesome! Here is your Web Dev roadmap:'; path=PATHS_MAP.web }
    else { text='Tell me more! Try: Backend Developer, Data Scientist, Frontend Dev, or Cybersecurity.'; path=null }
    setMessages(p => [...p, { type:'user', text:input }, { type:'ai', text, path }])
    setInput('')
  }
  return (
    <div style={{ maxWidth:700, margin:'0 auto' }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', background:'rgba(0,229,176,0.05)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#00E5B0,#38BDF8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="brain" size={20} color="#030910"/>
          </div>
          <div>
            <div style={{ fontWeight:700, fontFamily:"'Syne',sans-serif" }}>AI Career Guide</div>
            <div style={{ fontSize:12, color:'var(--accent)', display:'flex', alignItems:'center', gap:4 }}><div style={{ width:6, height:6, background:'var(--accent)', borderRadius:'50%' }}/>Active</div>
          </div>
        </div>
        <div style={{ padding:20, minHeight:360, display:'flex', flexDirection:'column', gap:12, maxHeight:420, overflowY:'auto' }}>
          {messages.map((msg,i) => (
            <div key={i}>
              <div style={{ display:'flex', justifyContent:msg.type==='ai'?'flex-start':'flex-end' }}>
                <div style={{ maxWidth:'88%', padding:'12px 16px', borderRadius:12, background:msg.type==='ai'?'rgba(0,229,176,0.07)':'var(--surface)', border:`1px solid ${msg.type==='ai'?'rgba(0,229,176,0.18)':'var(--border)'}`, fontSize:14, lineHeight:1.6 }}>{msg.text}</div>
              </div>
              {msg.path && (
                <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6 }}>
                  {msg.path.map((item,pi) => (
                    <div key={pi} style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(0,229,176,0.05)', border:'1px solid rgba(0,229,176,0.15)', borderRadius:8, padding:'8px 14px', fontSize:13, animation:`fadeUp 0.3s ease ${pi*0.07}s both` }}>
                      <span style={{ color:'var(--accent)', fontWeight:700, minWidth:20, fontSize:12 }}>{pi+1}.</span>{item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSend()} placeholder="Type your career goal…" style={{ flex:1 }}/>
          <button className="btn-primary" onClick={handleSend} style={{ padding:'10px 16px' }}><Icon name="arrow" size={16}/></button>
        </div>
      </div>
    </div>
  )
}

function Settings() {
  const { user, showToast } = useApp()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  return (
    <div style={{ maxWidth:560 }}>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:28, marginBottom:20 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:20 }}>Profile Settings</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:6 }}>Full Name</label><input value={name} onChange={e => setName(e.target.value)}/></div>
          <div><label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:6 }}>Email</label><input value={email} onChange={e => setEmail(e.target.value)}/></div>
          <div><label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:6 }}>Country</label><input placeholder="Rwanda"/></div>
          <button className="btn-primary" onClick={() => showToast('Profile updated! ✅')} style={{ alignSelf:'flex-start' }}>Save Changes <Icon name="check" size={16}/></button>
        </div>
      </div>
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:28 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, marginBottom:20 }}>Notifications</h3>
        {['Mentor messages','Course completions','New certificates','Platform updates'].map((n,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:i<3?'1px solid rgba(30,48,80,0.5)':'none' }}>
            <span style={{ fontSize:14 }}>{n}</span>
            <div onClick={() => showToast(`Toggled: ${n}`)} style={{ width:44, height:24, background:'var(--accent)', borderRadius:12, cursor:'pointer', position:'relative' }}>
              <div style={{ position:'absolute', right:3, top:3, width:18, height:18, background:'#030910', borderRadius:'50%' }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const PAGES = {
  '/student':          { title:'Student Dashboard', comp: Overview      },
  '/student/mentors':  { title:'Browse Mentors',    comp: BrowseMentors },
  '/student/courses':  { title:'My Courses',        comp: MyCourses     },
  '/student/progress': { title:'Progress',          comp: Progress      },
  '/student/certs':    { title:'Certificates',      comp: Certificates  },
  '/student/forum':    { title:'Community Forum',   comp: Forum         },
  '/student/ai':       { title:'AI Career Guide',   comp: AIGuide       },
  '/student/settings': { title:'Settings',          comp: Settings      },
}

export default function StudentDashboard() {
  const navigate  = useNavigate()
  const { user }  = useApp()
  const loc       = window.location.pathname
  const page      = PAGES[loc] ?? PAGES['/student']
  const Comp      = page.comp

  if (!user || user.role !== 'student') {
    return <div style={{ padding:80, textAlign:'center' }}>
      <p style={{ color:'var(--muted)', marginBottom:20 }}>Please sign in as a student.</p>
      <button className="btn-primary" onClick={() => navigate('/')}>Go Home <Icon name="arrow" size={16}/></button>
    </div>
  }

  return (
    <DashLayout navItems={NAV} title={page.title}>
      <Comp />
    </DashLayout>
  )
}

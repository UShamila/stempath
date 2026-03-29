import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Icon from '../components/Icon'

/*  small helpers  */
const SectionLabel = ({ children, center }) => (
  <div className="section-label" style={{ justifyContent: center ? 'center' : 'flex-start' }}>{children}</div>
)

/* HERO */
function Hero() {
  const { setModal } = useApp()
  const stats = [
    { num: '4', label: 'Active Students' },
    { num: '10',   label: 'Expert Mentors'  },
    { num: '6',    label: 'STEM Courses'    },
    { num: '4%',    label: 'Completion Rate' },
  ]
  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center', position: 'relative' }}>
      {/* Live badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,176,0.08)', border: '1px solid rgba(0,229,176,0.22)', borderRadius: 24, padding: '8px 18px', marginBottom: 28, animation: 'fadeUp 0.5s ease both' }}>
        <div style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, fontFamily: "'Syne',sans-serif" }}>Empowering African Women in STEM</span>
      </div>

      <h1 style={{ fontSize: 'clamp(42px,7vw,88px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, maxWidth: 900, margin: '0 auto 14px', animation: 'fadeUp 0.6s ease 0.1s both' }}>
        Your Path to a{' '}
        <span className="shimmer-text">STEM Career</span><br />Starts Here
      </h1>

      <p style={{ fontSize: 'clamp(16px,2.5vw,20px)', color: 'var(--muted)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.75, animation: 'fadeUp 0.6s ease 0.2s both' }}>
        Connect with expert mentors, master in-demand skills, and track your progress
        through guided STEM learning paths built for the next generation.
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 72, animation: 'fadeUp 0.6s ease 0.3s both' }}>
        <button className="btn-primary" onClick={() => setModal('register')} style={{ fontSize: 16, padding: '16px 32px' }}>
          Join as Student <Icon name="arrow" size={18} />
        </button>
        <button className="btn-outline" onClick={() => setModal('register')} style={{ fontSize: 16, padding: '16px 32px' }}>
          Become a Mentor
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 'clamp(24px,5vw,64px)', flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeUp 0.6s ease 0.4s both' }}>
        {stats.map((s,i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, fontFamily: "'Syne',sans-serif", color: '#fff' }}>{s.num}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Decorative orbit */}
      <div className="animate-float" style={{ position: 'absolute', right: '5%', top: '20%', width: 200, height: 200, opacity: 0.14, pointerEvents: 'none' }}>
        <svg viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="#00E5B0" strokeWidth="1" strokeDasharray="4 8"/>
          <circle cx="100" cy="100" r="60" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 8"/>
          <circle cx="100" cy="100" r="30" stroke="#A78BFA" strokeWidth="1"/>
          <circle cx="100" cy="10"  r="8" fill="#00E5B0"/>
          <circle cx="190" cy="100" r="6" fill="#38BDF8"/>
          <circle cx="100" cy="190" r="5" fill="#A78BFA"/>
        </svg>
      </div>
    </section>
  )
}

/*
   MISSION */
function Mission() {
  const items = [
    { icon:'globe', color:'var(--accent)', stat:'54',    unit:'Countries',       desc:'Students learning across Africa and beyond' },
    { icon:'users', color:'var(--sky)',    stat:'24%',   unit:'Female Students', desc:'Specifically supporting girls in STEM' },
    { icon:'award', color:'var(--gold)',   stat:'35',unit:'Certificates',    desc:'Issued to students who completed paths' },
  ]
  return (
    <section style={{ padding: '100px 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
        <SectionLabel center>Our Mission</SectionLabel>
        <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 22 }}>
          Closing the gender gap in{' '}
          <span style={{ color: 'var(--accent)' }}>STEM education</span>
        </h2>
        <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'var(--muted)', lineHeight: 1.85, maxWidth: 720, margin: '0 auto 56px' }}>
          Across Africa, millions of talented girls are kept from pursuing STEM careers due to lack of access, mentorship, and resources.
          STEMPath exists to change that — one student, one mentor, one certificate at a time.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
          {items.map((it,i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px', background: `color-mix(in srgb,${it.color} 14%,transparent)`, border: `1px solid color-mix(in srgb,${it.color} 28%,transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={it.icon} size={24} color={it.color} />
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 36, color: it.color }}>{it.stat}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{it.unit}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{it.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/*
   HOW IT WORKS */
function HowItWorks() {
  const steps = [
    { num:'01', icon:'person',   color:'var(--accent)', title:'Create Your Account',    desc:'Sign up as a student or mentor. Tell us your STEM interests to personalize your journey from day one.' },
    { num:'02', icon:'network',  color:'var(--sky)',    title:'Request a Mentor',        desc:'Browse verified expert mentors. Send a request and get matched with the perfect guide for your STEM path.' },
    { num:'03', icon:'trending', color:'var(--gold)',   title:'Learn & Track Progress',  desc:'Complete courses, earn certificates, and watch your skills grow with real-time progress tracking and AI guidance.' },
  ]
  return (
    <section id="how-it-works" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <SectionLabel center>How It Works</SectionLabel>
        <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Three steps to your <span style={{ color: 'var(--accent)' }}>STEM future</span>
        </h2>
        <p style={{ color: 'var(--muted)', marginTop: 16, maxWidth: 520, margin: '16px auto 0' }}>
          From first login to landing your dream role — STEMPath guides every step.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
        {steps.map((s,i) => (
          <div key={i} className="card-base" style={{ padding: 36, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -10, right: 20, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 120, color: `color-mix(in srgb,${s.color} 6%,transparent)`, lineHeight: 1 }}>{s.num}</div>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `color-mix(in srgb,${s.color} 14%,transparent)`, border: `1px solid color-mix(in srgb,${s.color} 28%,transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Icon name={s.icon} size={24} color={s.color} />
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: s.color, letterSpacing: '0.1em', marginBottom: 12 }}>STEP {s.num}</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 15 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/*
   STEM PATHS */
function STEMPaths() {
  const { setModal } = useApp()
  const [active, setActive] = useState(0)
  const paths = [
    { title:'Web Development',    icon:'globe',    color:'var(--accent)', desc:'Build beautiful, fast, and accessible web applications from scratch.', duration:'6 months', level:'Beginner → Advanced', courses:['HTML & CSS Foundations','JavaScript Essentials','React & Modern Frameworks','Responsive Design','Performance Optimization'] },
    { title:'Backend Engineering',icon:'cpu',      color:'var(--sky)',    desc:'Design and build scalable server-side systems and powerful APIs.', duration:'8 months', level:'Intermediate', courses:['Programming Fundamentals','Node.js Mastery','Express.js & REST APIs','SQL & Database Design','Cloud Deployment'] },
    { title:'Data Science',       icon:'chart',    color:'var(--gold)',   desc:'Extract insights from data using statistics, ML, and visualization.', duration:'10 months', level:'Intermediate → Expert', courses:['Python Fundamentals','Statistics for Data Science','Machine Learning Basics','Data Visualization','Deep Learning Intro'] },
    { title:'Cybersecurity',      icon:'shield',   color:'var(--rose)',   desc:'Protect systems and networks from modern digital threats.', duration:'8 months', level:'Beginner → Advanced', courses:['Network Fundamentals','Ethical Hacking','Cryptography','Penetration Testing','Security Operations'] },
  ]
  const p = paths[active]
  return (
    <section id="paths" style={{ padding: '100px 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <SectionLabel center>Learning Paths</SectionLabel>
          <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Featured <span style={{ color: 'var(--accent)' }}>STEM Paths</span>
          </h2>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
          {paths.map((pt,i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              borderRadius: 10, border: '1.5px solid',
              borderColor: active===i ? pt.color : 'var(--border)',
              background: active===i ? `color-mix(in srgb,${pt.color} 10%,transparent)` : 'transparent',
              color: active===i ? pt.color : 'var(--muted)',
              cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
            }}>
              <Icon name={pt.icon} size={16} color={active===i ? pt.color : 'var(--muted)'} />
              {pt.title}
            </button>
          ))}
        </div>
        {/* Detail */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 'clamp(24px,5vw,48px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }} className="mobile-col">
          <div>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: `color-mix(in srgb,${p.color} 14%,transparent)`, border: `1px solid color-mix(in srgb,${p.color} 28%,transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Icon name={p.icon} size={28} color={p.color} />
            </div>
            <h3 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>{p.title}</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 28, lineHeight: 1.7 }}>{p.desc}</p>
            <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
              {[['Duration',p.duration],['Level',p.level]].map(([k,v]) => (
                <div key={k} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontWeight: 700, fontFamily: "'Syne',sans-serif", fontSize: 13 }}>{v}</div>
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setModal('register')} style={{ width: '100%', justifyContent: 'center' }}>
              Start This Path <Icon name="arrow" size={18} />
            </button>
          </div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 20, color: 'var(--muted)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Course Modules</div>
            {p.courses.map((c,ci) => (
              <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '15px 0', borderBottom: ci < p.courses.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `color-mix(in srgb,${p.color} 14%,transparent)`, border: `1px solid color-mix(in srgb,${p.color} 22%,transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: p.color, flexShrink: 0 }}>
                  {String(ci+1).padStart(2,'0')}
                </div>
                <div style={{ flex: 1, fontWeight: 500 }}>{c}</div>
                <div style={{ fontSize: 12, color: ci < 2 ? 'var(--accent)' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {ci < 2 ? <><Icon name="check" size={13} color="var(--accent)"/>Done</> : 'Locked'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/*
   MENTOR SPOTLIGHT */
function MentorSpotlight() {
  const { setModal } = useApp()
  const mentors = [
    { name:'Dr. Amara Diallo',   role:'Senior Software Engineer', company:'Google',    expertise:'Backend & Systems',    rating:4.9, students:48, tags:['Python','Cloud','APIs'],       avatar:'AD', color:'var(--accent)', bio:'10+ years building large-scale distributed systems. Passionate about helping women break into tech.' },
    { name:'Fatima Al-Rashid',   role:'Data Scientist',           company:'Microsoft', expertise:'AI & Machine Learning', rating:4.8, students:35, tags:['ML','Python','Data Viz'],     avatar:'FA', color:'var(--sky)',    bio:'Kaggle Grandmaster. Research background in NLP. Helping students build solid ML foundations.' },
    { name:'Chioma Divine',      role:'Cybersecurity Lead',       company:'IBM',       expertise:'Security & Networks',  rating:5.0, students:22, tags:['Security','Linux','CTF'],     avatar:'CO', color:'var(--gold)',   bio:'CEH certified. Built security programs at Fortune 500 companies. Mentor of the year 2023.' },
    { name:'Yewande Shemsa',    role:'Full-Stack Engineer',      company:'Stripe',    expertise:'Web Development',      rating:4.9, students:61, tags:['React','Node.js','TypeScript'],avatar:'YA', color:'var(--purple)', bio:'Led frontend teams at 2 unicorn startups. Passionate about accessible, beautiful web design.' },
  ]
  return (
    <section id="mentors" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 52 }}>
        <div>
          <SectionLabel>Mentor Spotlight</SectionLabel>
          <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Learn from the <span style={{ color: 'var(--accent)' }}>best in STEM</span>
          </h2>
        </div>
        <button className="btn-outline" onClick={() => setModal('login')}>View All Mentors <Icon name="arrow" size={16}/></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
        {mentors.map((m,i) => (
          <div key={i} className="card-base" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg,${m.color},color-mix(in srgb,${m.color} 60%,transparent))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: '#030910', flexShrink: 0 }}>{m.avatar}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "'Syne',sans-serif" }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.role} · {m.company}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="star-badge"><Icon name="star" size={12} color="var(--gold)"/>{m.rating}</div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{m.students} students</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{m.bio}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {m.tags.map((t,ti) => <span key={ti} className="tag" style={{ background: `color-mix(in srgb,${m.color} 10%,transparent)`, borderColor: `color-mix(in srgb,${m.color} 25%,transparent)`, color: m.color }}>{t}</span>)}
            </div>
            <button className="btn-outline" onClick={() => setModal('register')} style={{ marginTop: 'auto', padding: '10px 16px', fontSize: 13 }}>
              Request Mentorship
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

/*
   AI CAREER GUIDE PREVIEW */
function AIGuidePreview() {
  const { setModal } = useApp()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { type:'ai', text:"Hi! I'm your AI Career Guide 👋 What STEM career are you aiming for? (e.g. Backend Developer, Data Scientist, Cybersecurity Analyst)" }
  ])
  const PATHS_MAP = {
    backend: ['Programming Fundamentals','JavaScript','Node.js','Express.js','SQL & Databases','API Development','Cloud Basics'],
    data:    ['Python Fundamentals','Statistics','Pandas & NumPy','Machine Learning','Data Visualization','Deep Learning'],
    cyber:   ['Networking Basics','Linux Administration','Cryptography','Ethical Hacking','Penetration Testing'],
    web:     ['HTML & CSS','JavaScript','React','Responsive Design','Performance','Deployment'],
  }
  const handleSend = () => {
    if (!input.trim()) return
    const l = input.toLowerCase()
    let text, path
    if (l.includes('backend') || l.includes('node') || l.includes('server')) { text = 'Great choice! Here is your Backend Developer path:'; path = PATHS_MAP.backend }
    else if (l.includes('data') || l.includes('ml') || l.includes('ai'))    { text = 'Excellent! Here is your Data Science path:'; path = PATHS_MAP.data    }
    else if (l.includes('cyber') || l.includes('security'))                 { text = 'Cybersecurity is in demand! Your path:'; path = PATHS_MAP.cyber   }
    else if (l.includes('web') || l.includes('front') || l.includes('react')){ text = 'Web development is a great start! Your path:'; path = PATHS_MAP.web }
    else { text = 'Could you be more specific? Try: Backend Developer, Data Scientist, Frontend Dev, or Cybersecurity.'; path = null }
    setMessages(p => [...p, { type:'user', text: input }, { type:'ai', text, path }])
    setInput('')
  }
  return (
    <section style={{ padding: '100px 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="mobile-col">
        <div>
          <SectionLabel>AI Career Guide</SectionLabel>
          <h2 style={{ fontSize: 'clamp(30px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>
            Your personal AI <span style={{ color: 'var(--accent)' }}>learning advisor</span>
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginBottom: 32 }}>
            Not sure where to start? Our AI Career Guide asks the right questions, understands your goals,
            and builds a custom learning path just for you — then connects you to the right mentor.
          </p>
          {['Analyzes your STEM interests and career goals','Recommends specific courses in the right order','Adapts as you grow and complete milestones'].map((item,i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(0,229,176,0.12)', border: '1px solid rgba(0,229,176,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="check" size={13} color="var(--accent)"/>
              </div>
              <span style={{ fontSize: 15, color: 'var(--muted)' }}>{item}</span>
            </div>
          ))}
          <button className="btn-primary" onClick={() => setModal('register')} style={{ marginTop: 8 }}>
            Try AI Guide Free <Icon name="arrow" size={16}/>
          </button>
        </div>

        {/* Chat */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: 'rgba(0,229,176,0.05)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#00E5B0,#38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="brain" size={18} color="#030910"/>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontFamily: "'Syne',sans-serif", fontSize: 14 }}>STEMPath AI Guide</div>
              <div style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }}/>Online
              </div>
            </div>
          </div>
          <div style={{ padding: 18, minHeight: 260, display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
            {messages.map((msg,i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: msg.type==='ai' ? 'flex-start' : 'flex-end' }}>
                  <div style={{ maxWidth: '88%', padding: '11px 15px', borderRadius: 12, background: msg.type==='ai' ? 'rgba(0,229,176,0.07)' : 'var(--surface)', border: `1px solid ${msg.type==='ai' ? 'rgba(0,229,176,0.18)' : 'var(--border)'}`, fontSize: 14, lineHeight: 1.6 }}>
                    {msg.text}
                  </div>
                </div>
                {msg.path && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {msg.path.map((item,pi) => (
                      <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,229,176,0.05)', border: '1px solid rgba(0,229,176,0.14)', borderRadius: 8, padding: '7px 13px', fontSize: 13, animation: `fadeUp 0.3s ease ${pi*0.07}s both` }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 700, minWidth: 20, fontSize: 12 }}>{pi+1}.</span>{item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSend()} placeholder="Type your career goal…" style={{ flex: 1, padding: '10px 13px', borderRadius: 9, fontSize: 14 }}/>
            <button className="btn-primary" onClick={handleSend} style={{ padding: '10px 14px', borderRadius: 9 }}><Icon name="arrow" size={16}/></button>
          </div>
        </div>
      </div>
    </section>
  )
}

/*
   SUCCESS STORIES */
function SuccessStories() {
  const stories = [
    { name:'Amina Sandrine',  country:'Senegal', role:'→ Junior Backend Dev at Andela',        quote:'STEMPath gave me a real mentor, real courses, and real confidence. 6 months later I had my first tech job.', cert:'Backend Engineering', avatar:'AS', color:'var(--accent)' },
    { name:'Grace Mensah',  country:'Ghana',   role:'→ Data Analyst at TechCabal',           quote:'The AI guide helped me figure out exactly what to study. My mentor kept me accountable throughout the whole journey.', cert:'Data Science', avatar:'GM', color:'var(--sky)' },
    { name:'Ngozi Merveille',     country:'Nigeria', role:'→ Frontend Dev (Remote, EU company)',   quote:'I came in with zero experience. The community forum and structured paths made learning feel genuinely possible.', cert:'Web Development', avatar:'NM', color:'var(--gold)' },
  ]
  return (
    <section id="stories" style={{ padding: '100px 24px', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <SectionLabel center>Success Stories</SectionLabel>
          <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Real students, <span style={{ color: 'var(--accent)' }}>real results</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
          {stories.map((s,i) => (
            <div key={i} className="card-base" style={{ padding: 32, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, right: 26, fontFamily: 'Georgia,serif', fontSize: 80, color: `color-mix(in srgb,${s.color} 7%,transparent)`, lineHeight: 1, fontWeight: 900 }}>"</div>
              <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                {[...Array(5)].map((_,si) => <Icon key={si} name="star" size={16} color="var(--gold)"/>)}
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.75, fontStyle: 'italic', marginBottom: 28 }}>"{s.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${s.color},color-mix(in srgb,${s.color} 60%,transparent))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: '#030910', flexShrink: 0 }}>{s.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.country} · {s.role}</div>
                </div>
              </div>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, background: `color-mix(in srgb,${s.color} 7%,transparent)`, border: `1px solid color-mix(in srgb,${s.color} 18%,transparent)`, borderRadius: 8, padding: '8px 12px' }}>
                <Icon name="award" size={14} color={s.color}/>
                <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>Certified: {s.cert}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/*
   PLATFORM FEATURES */
function PlatformFeatures() {
  const features = [
    { icon:'brain',    color:'var(--accent)', title:'AI Career Guide',      desc:'Our AI learns your interests and recommends the perfect learning path, courses, and next steps tailored just for you.' },
    { icon:'users',    color:'var(--sky)',    title:'Mentor Matching',      desc:'Get paired with verified STEM professionals who guide your learning, review your work, and open career doors.' },
    { icon:'book',     color:'var(--gold)',   title:'Structured Courses',   desc:'Video lessons, exercises, quizzes, and projects — all hosted on-platform with zero external redirects.' },
    { icon:'trending', color:'var(--purple)', title:'Progress Tracking',    desc:'Visual dashboards show exactly where you are on each learning path and what to tackle next.' },
    { icon:'award',    color:'var(--rose)',   title:'Certificates',         desc:'Earn verifiable certificates upon course completion, stored on your profile and shareable with employers.' },
    { icon:'message',  color:'var(--accent)', title:'Community Forum',      desc:'Join a supportive community. Discuss problems, share wins, and learn from thousands of peers.' },
    { icon:'mic',      color:'var(--sky)',    title:'Voice Accessibility',  desc:'Full screen reader and voice-guided navigation for visually impaired users — because STEM is for everyone.' },
    { icon:'shield',   color:'var(--gold)',   title:'Secure & Private',     desc:'bcrypt passwords, JWT sessions, role-based access, and encrypted file uploads protect every account.' },
  ]
  return (
    <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <SectionLabel center>Platform Features</SectionLabel>
        <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Everything you need to <span style={{ color: 'var(--accent)' }}>succeed in STEM</span>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
        {features.map((f,i) => (
          <div key={i} className="card-base" style={{ padding: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: `color-mix(in srgb,${f.color} 12%,transparent)`, border: `1px solid color-mix(in srgb,${f.color} 24%,transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <Icon name={f.icon} size={22} color={f.color}/>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, fontFamily: "'Syne',sans-serif" }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/*
   COMMUNITY FORUM PREVIEW */
function CommunityForum() {
  const { setModal } = useApp()
  const posts = [
    { author:'Amira S.', avatar:'AS', color:'var(--accent)', time:'2h ago', title:'How do I understand async/await in JavaScript?', replies:2, likes:3, tag:'JavaScript' },
    { author:'Fatou D.', avatar:'FD', color:'var(--sky)',    time:'5d ago', title:'Tips for passing the SQL certification quiz?',    replies:8,  likes:2, tag:'Databases' },
    { author:'Nadia K.', avatar:'NK', color:'var(--gold)',   time:'1d ago', title:'My first React project — feedback welcome!',      replies:4, likes:5, tag:'Web Dev' },
    { author:'Safi M.',  avatar:'SM', color:'var(--purple)', time:'2m ago', title:'How do I find a mentor in cybersecurity?',        replies:6,  likes:9, tag:'Mentorship' },
  ]
  return (
    <section id="forum" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 44 }}>
        <div>
          <SectionLabel>Community</SectionLabel>
          <h2 style={{ fontSize: 'clamp(32px,5vw,48px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Learn together, <span style={{ color: 'var(--accent)' }}>grow together</span>
          </h2>
        </div>
        <button className="btn-outline" onClick={() => setModal('register')}>Join the Forum <Icon name="arrow" size={16}/></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.map((p,i) => (
          <div key={i} className="card-base" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer' }} onClick={() => setModal('register')}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${p.color},color-mix(in srgb,${p.color} 60%,transparent))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: '#030910', flexShrink: 0 }}>{p.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                <span className="tag" style={{ background: `color-mix(in srgb,${p.color} 10%,transparent)`, borderColor: `color-mix(in srgb,${p.color} 24%,transparent)`, color: p.color }}>{p.tag}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.author} · {p.time}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, fontFamily: "'Syne',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
            </div>
            <div style={{ display: 'flex', gap: 18, flexShrink: 0 }} className="hide-mobile">
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)', fontSize: 13 }}><Icon name="message" size={14}/>{p.replies}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)', fontSize: 13 }}><Icon name="heart" size={14}/>{p.likes}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/*
   CTA */
function CTA() {
  const { setModal } = useApp()
  return (
    <section style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: 'linear-gradient(135deg,rgba(0,229,176,0.08),rgba(56,189,248,0.06),rgba(167,139,250,0.06))', border: '1px solid rgba(0,229,176,0.22)', borderRadius: 28, padding: 'clamp(48px,8vw,80px) clamp(32px,6vw,80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, background: 'radial-gradient(circle,rgba(0,229,176,0.15) 0%,transparent 70%)', borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, background: 'radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 70%)', borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }}/>
        <SectionLabel center>Get Started Today</SectionLabel>
        <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 18 }}>
          Start Your <span style={{ color: 'var(--accent)' }}>STEM Journey</span> Today
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 'clamp(15px,2vw,18px)', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Join thousands of students already learning, growing, and landing their first STEM roles through STEMPath.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => setModal('register')} style={{ fontSize: 16, padding: '16px 36px' }}>Join as Student <Icon name="arrow" size={18}/></button>
          <button className="btn-outline" onClick={() => setModal('register')} style={{ fontSize: 16, padding: '16px 36px' }}>Become a Mentor</button>
        </div>
      </div>
    </section>
  )
}

/*
   FOOTER */
function Footer() {
  const nav = useNavigate()
  const scrollTo = (id) => { nav('/'); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }), 100) }
  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '64px 24px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 52 }} className="mobile-col">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }} onClick={() => nav('/')}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#00E5B0,#38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="compass" size={18} color="#030910"/>
              </div>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20 }}>STEM<span style={{ color: 'var(--accent)' }}>Path</span></span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, maxWidth: 280, marginBottom: 22 }}>
              Empowering the next generation of African women in STEM through mentorship, education, and community.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['twitter','linkedin','mail'].map(icon => (
                <button key={icon} onClick={() => {}} style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted)' }}>
                  <Icon name={icon} size={15}/>
                </button>
              ))}
            </div>
          </div>
          {[
            { title:'Platform', links:[['Browse Courses','paths'],['Find Mentors','mentors'],['Learning Paths','paths'],['Community Forum','forum'],['AI Career Guide','paths']] },
            { title:'For Mentors', links:[['Become a Mentor',null],['Mentor Dashboard',null],['Application Guide',null],['Mentor Resources',null],['Community',null]] },
            { title:'Company', links:[['About Us',null],['Mission',null],['Blog',null],['Careers',null],['Contact',null]] },
          ].map((col,i) => (
            <div key={i}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 20 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(([label,id]) => (
                  <span key={label} className="nav-link" style={{ fontSize: 14 }} onClick={() => id ? scrollTo(id) : {}}>{label}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>© 2025 STEMPath. Built with purpose. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy','Terms of Service','Accessibility'].map(item => (
              <span key={item} className="nav-link" style={{ fontSize: 13 }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/*
   LANDING PAGE (assembled) */
export default function LandingPage() {
  return (
    <>
      <Hero />
      <Mission />
      <HowItWorks />
      <STEMPaths />
      <MentorSpotlight />
      <AIGuidePreview />
      <SuccessStories />
      <PlatformFeatures />
      <CommunityForum />
      <CTA />
      <Footer />
    </>
  )
}

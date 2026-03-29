import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Icon from './Icon'

const LOGO_BG = 'linear-gradient(135deg,#00E5B0,#38BDF8)'

export default function Navbar() {
  const { user, logout, setModal, darkMode, setDarkMode } = useApp()
  const [scrolled, setScrolled]   = useState(false)
  const [mobileOpen, setMobile]   = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const scrollTo = (id) => {
    setMobile(false)
    if (!isLanding) { navigate('/'); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 200) }
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const dashPath = user?.role === 'student' ? '/student' : user?.role === 'mentor' ? '/mentor' : '/admin'

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px',
        background: scrolled ? 'rgba(5,10,20,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>

          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: LOGO_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="compass" size={18} color="#030910" />
            </div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: '#fff' }}>
              STEM<span style={{ color: 'var(--accent)' }}>Path</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
            {[['how-it-works','How It Works'],['paths','Paths'],['mentors','Mentors'],['stories','Stories'],['forum','Forum']].map(([id,label]) => (
              <span key={id} className="nav-link" onClick={() => scrollTo(id)}>{label}</span>
            ))}
          </div>

          {/* Right actions */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 6, display: 'flex' }}>
              <Icon name={darkMode ? 'sun' : 'moon'} size={18} />
            </button>
            {user ? (
              <>
                <button className="btn-outline" onClick={() => navigate(dashPath)} style={{ padding: '10px 18px', fontSize: 14 }}>
                  <Icon name="home" size={15} /> Dashboard
                </button>
                <button className="btn-outline" onClick={logout} style={{ padding: '10px 18px', fontSize: 14 }}>
                  <Icon name="logout" size={15} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button className="btn-outline" onClick={() => setModal('login')} style={{ padding: '10px 20px', fontSize: 14 }}>Sign In</button>
                <button className="btn-primary" onClick={() => setModal('register')} style={{ padding: '10px 20px', fontSize: 14 }}>Get Started</button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobile(!mobileOpen)} style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4 }} className="show-mobile">
            <Icon name={mobileOpen ? 'x' : 'menu'} size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position: 'fixed', top: 70, left: 0, right: 0, zIndex: 99, background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 18, animation: 'slideDown 0.25s ease' }}>
          {[['how-it-works','How It Works'],['paths','Paths'],['mentors','Mentors'],['stories','Stories'],['forum','Forum']].map(([id,label]) => (
            <span key={id} className="nav-link" style={{ fontSize: 16 }} onClick={() => scrollTo(id)}>{label}</span>
          ))}
          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            {user
              ? <><button className="btn-primary" onClick={() => { navigate(dashPath); setMobile(false) }} style={{ flex: 1, justifyContent: 'center' }}>Dashboard</button>
                  <button className="btn-outline" onClick={() => { logout(); setMobile(false) }} style={{ flex: 1, justifyContent: 'center' }}>Sign Out</button></>
              : <><button className="btn-outline" onClick={() => { setModal('login'); setMobile(false) }} style={{ flex: 1, justifyContent: 'center' }}>Sign In</button>
                  <button className="btn-primary" onClick={() => { setModal('register'); setMobile(false) }} style={{ flex: 1, justifyContent: 'center' }}>Get Started</button></>
            }
          </div>
        </div>
      )}
    </>
  )
}

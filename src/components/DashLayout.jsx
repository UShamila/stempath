import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Icon from './Icon'

export default function DashLayout({ navItems, children, title }) {
  const { user, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNav, setMobileNav] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside className="dash-sidebar">
        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 32, cursor: 'pointer', paddingLeft: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#00E5B0,#38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="compass" size={16} color="#030910"/>
          </div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17 }}>STEM<span style={{ color: 'var(--accent)' }}>Path</span></span>
        </div>

        {/* Role badge */}
        <div style={{ padding: '8px 12px', background: 'rgba(0,229,176,0.07)', border: '1px solid rgba(0,229,176,0.18)', borderRadius: 10, marginBottom: 24, fontSize: 12 }}>
          <div style={{ color: 'var(--muted)', marginBottom: 2 }}>Signed in as</div>
          <div style={{ fontWeight: 700, fontFamily: "'Syne',sans-serif", color: 'var(--accent)' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{user?.role}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`dash-nav-item${location.pathname === item.path ? ' active' : ''}`}>
              <Icon name={item.icon} size={17}/>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button className="dash-nav-item" onClick={() => navigate('/')}><Icon name="globe" size={17}/>View Site</button>
          <button className="dash-nav-item" onClick={() => { logout(); navigate('/') }} style={{ color: 'var(--rose)' }}><Icon name="logout" size={17} color="var(--rose)"/>Sign Out</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dash-content">
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>{title}</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Welcome back, {user?.name} 👋</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <button style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)' }}>
                <Icon name="bell" size={17}/>
              </button>
              <div className="notif-dot"/>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,var(--accent),#38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: '#030910', cursor: 'default' }}>
              {user?.name?.charAt(0) ?? 'U'}
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}

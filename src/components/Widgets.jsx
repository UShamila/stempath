import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Icon from './Icon'

export function Toast() {
  const { toast } = useApp()
  if (!toast) return null
  return (
    <div className="toast">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', flexShrink: 0 }} />
        {toast}
      </div>
    </div>
  )
}

export function VoiceWidget() {
  const [active, setActive] = useState(false)

  const speak = (text) => {
    if (!active || !('speechSynthesis' in window)) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.92
    utterance.pitch = 1
    utterance.volume = 1

    // Ensure voice is loaded
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      utterance.voice = voices[0] // Use the first available voice
    }

    window.speechSynthesis.speak(utterance)
  }

  const toggle = () => {
    const next = !active
    setActive(next)
    speak(next ? 'Voice accessibility enabled. Click any element to hear it.' : 'Voice accessibility disabled.')
  }

  // Add click listeners when active
  useEffect(() => {
    if (!active) return

    const handleClick = (e) => {
      // Get text content from the clicked element
      let text = e.target.textContent?.trim() || e.target.alt || e.target.title || ''

      // For buttons, try to get aria-label or meaningful text
      if (e.target.tagName === 'BUTTON') {
        text = e.target.getAttribute('aria-label') || e.target.textContent?.trim() || 'Button'
      }

      // For icons, try to get title or aria-label
      if (e.target.tagName === 'svg' || e.target.closest('svg')) {
        const icon = e.target.closest('[title]') || e.target.closest('[aria-label]')
        text = icon?.getAttribute('title') || icon?.getAttribute('aria-label') || 'Icon'
      }

      // Skip if no meaningful text
      if (!text || text.length < 2) return

      speak(text)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [active])

  return (
    <button onClick={toggle} title={active ? 'Disable voice accessibility' : 'Enable voice accessibility'}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 200,
        width: 52, height: 52, borderRadius: 14,
        background: active ? 'var(--accent)' : 'var(--card)',
        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        color: active ? '#030910' : 'var(--muted)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: active ? '0 8px 30px rgba(0,229,176,0.35)' : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'all 0.22s ease',
      }}>
      <Icon name="volume" size={22} color={active ? '#030910' : 'var(--muted)'} />
    </button>
  )
}

export function BackgroundGrid() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,229,176,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,176,0.03) 1px,transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: 600, height: 600, background: 'radial-gradient(circle,rgba(0,229,176,0.06) 0%,transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', top: '50%', right: 0, width: 500, height: 500, background: 'radial-gradient(circle,rgba(167,139,250,0.06) 0%,transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '30%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(56,189,248,0.05) 0%,transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
    </div>
  )
}

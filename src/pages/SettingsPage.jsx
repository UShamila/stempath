import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import DashLayout from '../components/DashLayout'
import Icon from '../components/Icon'
import settingsService from '../services/settingsService'

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'account', label: 'Account', icon: 'settings' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'privacy', label: 'Privacy', icon: 'lock' }
]

export default function SettingsPage() {
  const { user, showToast } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings()
        setSettings(data.settings)
        setFormData({
          name: user.name || '',
          bio: user.bio || '',
          country: user.country || '',
          email_notifications: data.settings.email_notifications,
          push_notifications: data.settings.push_notifications,
          theme: data.settings.theme,
          language: data.settings.language,
          privacy_profile: data.settings.privacy_profile
        })
      } catch (error) {
        showToast(error.message, 5000)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchSettings()
    }
  }, [user, showToast])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update profile if profile fields changed
      if (activeTab === 'profile') {
        const profileData = new FormData()
        profileData.append('name', formData.name)
        profileData.append('bio', formData.bio)
        profileData.append('country', formData.country)

        await settingsService.updateProfile(profileData)
        showToast('Profile updated successfully')
      } else {
        // Update settings
        const settingsData = {
          email_notifications: formData.email_notifications,
          push_notifications: formData.push_notifications,
          theme: formData.theme,
          language: formData.language,
          privacy_profile: formData.privacy_profile
        }

        await settingsService.updateSettings(settingsData)
        showToast('Settings updated successfully')
      }
    } catch (error) {
      showToast(error.message, 5000)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    const currentPassword = prompt('Enter your current password:')
    if (!currentPassword) return

    const newPassword = prompt('Enter your new password:')
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 5000)
      return
    }

    const confirmPassword = prompt('Confirm your new password:')
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 5000)
      return
    }

    try {
      await settingsService.changePassword(currentPassword, newPassword)
      showToast('Password changed successfully')
    } catch (error) {
      showToast(error.message, 5000)
    }
  }

  if (loading) {
    return (
      <DashLayout>
        <div className="loading-state">
          <Icon name="loader" size={24} />
          <span>Loading settings...</span>
        </div>
      </DashLayout>
    )
  }

  return (
    <DashLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>
            Settings
          </h1>
          <p style={{ color: 'var(--muted)' }}>
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: 'none',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14
              }}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 32
        }}>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, fontFamily: "'Syne', sans-serif" }}>
                Profile Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8 }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio || ''}
                    onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell others about yourself..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, fontFamily: "'Syne', sans-serif" }}>
                Account Settings
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  padding: 20,
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Change Password</h4>
                      <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <button
                      className="btn-outline"
                      onClick={handlePasswordChange}
                      style={{ padding: '8px 16px', fontSize: 14 }}
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                <div style={{
                  padding: 20,
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Email Address</h4>
                      <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                        {user.email}
                      </p>
                    </div>
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                      Primary email
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, fontFamily: "'Syne', sans-serif" }}>
                Notification Preferences
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  padding: 20,
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Email Notifications</h4>
                      <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                        Receive notifications via email
                      </p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={formData.email_notifications}
                        onChange={e => setFormData(prev => ({ ...prev, email_notifications: e.target.checked }))}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div style={{
                  padding: 20,
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Push Notifications</h4>
                      <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={formData.push_notifications}
                        onChange={e => setFormData(prev => ({ ...prev, push_notifications: e.target.checked }))}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, fontFamily: "'Syne', sans-serif" }}>
                Privacy Settings
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                    Profile Visibility
                  </label>
                  <select
                    value={formData.privacy_profile || 'public'}
                    onChange={e => setFormData(prev => ({ ...prev, privacy_profile: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8 }}
                  >
                    <option value="public">Public - Anyone can view my profile</option>
                    <option value="mentors">Mentors Only - Only approved mentors can view</option>
                    <option value="private">Private - Only I can view my profile</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                    Theme
                  </label>
                  <select
                    value={formData.theme || 'light'}
                    onChange={e => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8 }}
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="auto">Auto (System preference)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                    Language
                  </label>
                  <select
                    value={formData.language || 'en'}
                    onChange={e => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8 }}
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'right' }}>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '12px 24px', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </DashLayout>
  )
}
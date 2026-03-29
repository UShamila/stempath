const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class SettingsService {
  async getSettings() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/auth/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch settings')

    return data
  }

  async updateSettings(settings) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/auth/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to update settings')

    return data
  }

  async changePassword(currentPassword, newPassword) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to change password')

    return data
  }

  async forgotPassword(email) {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to send reset email')

    return data
  }

  async resetPassword(token, newPassword) {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        new_password: newPassword
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to reset password')

    return data
  }

  async getPublicProfile(userId) {
    const response = await fetch(`${API_BASE}/auth/profile/${userId}`)

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch profile')

    return data
  }
}

export default new SettingsService()
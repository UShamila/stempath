const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class AuthService {
  async register(formData) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: formData // FormData for file uploads
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Registration failed')

    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return data
  }

  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Login failed')

    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return data
  }

  async getProfile() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch profile')

    return data
  }

  async updateProfile(formData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to update profile')

    return data
  }

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  getToken() {
    return localStorage.getItem('token')
  }

  isAuthenticated() {
    return !!this.getToken()
  }
}

export default new AuthService()
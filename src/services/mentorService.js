const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class MentorService {
  async getAllMentors() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/mentor`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch mentors')

    return data
  }

  async getMentorById(mentorId) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/mentor/${mentorId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch mentor')

    return data
  }

  async requestMentorship(mentorId, message) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/mentor/${mentorId}/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to send request')

    return data
  }

  async getMentorshipRequests() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/mentor/requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch requests')

    return data
  }

  async respondToRequest(requestId, action, message = '') {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/mentor/requests/${requestId}/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to respond to request')

    return data
  }
}

const mentorService = new MentorService()
export default mentorService
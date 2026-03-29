const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class CourseService {
  async getAllCourses() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/courses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch courses')

    return data
  }

  async getCourse(id) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/courses/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch course')

    return data
  }

  async enrollInCourse(courseId) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to enroll in course')

    return data
  }

  async getEnrolledCourses() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/courses/enrolled`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch enrolled courses')

    return data
  }

  async getCourseProgress(courseId) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/courses/${courseId}/progress`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to fetch course progress')

    return data
  }

  async markContentComplete(courseId, contentId, score = null) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/courses/${courseId}/content/${contentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ score })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to mark content as complete')

    return data
  }

  // Admin methods
  async createCourse(courseData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courseData)
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to create course')

    return data
  }

  async updateCourse(id, courseData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courseData)
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to update course')

    return data
  }

  async deleteCourse(id) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to delete course')

    return data
  }

  async addCourseContent(courseId, contentData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE}/courses/${courseId}/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contentData)
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to add content')

    return data
  }
}

export default new CourseService()
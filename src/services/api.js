// src/services/api.js
// Central API client – all backend calls go through here

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Token storage 
export const tokenStore = {
  get:    ()    => localStorage.getItem('stempath_token'),
  set:    (tok) => localStorage.setItem('stempath_token', tok),
  clear:  ()    => localStorage.removeItem('stempath_token'),
}

// Core fetch wrapper 
async function request(method, path, body = null, opts = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = tokenStore.get()
  if (token) headers['Authorization'] = `Bearer ${token}`

  // For FormData, let browser set Content-Type (multipart boundary)
  if (body instanceof FormData) delete headers['Content-Type']
  
  
  console.log("Fetching from:", `${BASE_URL}${path}`);
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...opts,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = data.error || data.message || `HTTP ${res.status}`
    throw Object.assign(new Error(msg), { status: res.status, data })
  }
  return data
}

const get    = (path)          => request('GET',    path)
const post   = (path, body)    => request('POST',   path, body)
const patch  = (path, body)    => request('PATCH',  path, body)
const del    = (path)          => request('DELETE', path)
const postForm = (path, form)  => request('POST',   path, form)
const patchForm = (path, form) => request('PATCH',  path, form)


//  AUTH

export const authAPI = {
  register: (formData)   => postForm('/auth/register', formData),
  login:    (body)       => post('/auth/login', body),
  me:       ()           => get('/auth/me'),
  updateProfile: (form)  => patchForm('/auth/profile', form),
  changePassword: (body) => patch('/auth/password', body),
}


//  MENTORS

export const mentorAPI = {
  list:          (params = {}) => get(`/mentors?${new URLSearchParams(params)}`),
  get:           (id)          => get(`/mentors/${id}`),
  listPending:   ()            => get('/mentors/pending'),
  approve:       (id)          => post(`/mentors/${id}/approve`),
  reject:        (id, reason)  => post(`/mentors/${id}/reject`, { reason }),
  updateProfile: (body)        => patch('/mentors/profile', body),
  myStudents:    ()            => get('/mentors/my-students'),
}


//  MENTORSHIPS

export const mentorshipAPI = {
  sendRequest:      (mentorId, message) => post('/mentorships/request', { mentorId, message }),
  getRequests:      (status)            => get(`/mentorships/requests${status ? `?status=${status}` : ''}`),
  respondRequest:   (id, status)        => patch(`/mentorships/requests/${id}`, { status }),
  getMyMentor:      ()                  => get('/mentorships/my-mentor'),
  getActive:        ()                  => get('/mentorships/active'),
}


//  COURSES

export const courseAPI = {
  list:          (params = {}) => get(`/courses?${new URLSearchParams(params)}`),
  categories:    ()            => get('/courses/categories'),
  all:           ()            => get('/courses'),
  get:           (idOrSlug)    => get(`/courses/${idOrSlug}`),
  myCourses:     ()            => get('/courses/enrolled'),
  enroll:        (courseId)    => post(`/courses/${courseId}/enroll`),
  create:        (form)        => postForm('/courses', form),
  update:        (id, body)    => patch(`/courses/${id}`, body),
  delete:        (id)          => del(`/courses/${id}`),
}


//  MODULES

export const moduleAPI = {
  list: (courseId) => get(`/modules?courseId=${courseId}`),
}


//  LESSONS

export const lessonAPI = {
  list: (moduleId) => get(`/lessons?moduleId=${moduleId}`),
}


//  PROGRESS

export const progressAPI = {
  update:      (lessonId, completed, score) => post('/progress', { lessonId, completed, score }),
  getCourse:   (courseId)                   => get(`/progress/${courseId}`),
  mentorView:  ()                           => get('/progress/mentor-view'),
}


//  CERTIFICATES

export const certAPI = {
  mine: () => get('/certificates'),
  all:  () => get('/certificates/all'),
}


//  CHAT

export const chatAPI = {
  inbox:           ()                       => get('/chat/inbox'),
  unread:          ()                       => get('/chat/unread'),
  conversation:    (userId, params = {})    => get(`/chat/${userId}?${new URLSearchParams(params)}`),
  send:            (receiverId, content, type = 'text') => post('/chat', { receiverId, content, type }),
}


//  NOTIFICATIONS

export const notifAPI = {
  get:        (params = {}) => get(`/notifications?${new URLSearchParams(params)}`),
  markRead:   (id)          => patch(`/notifications/${id}/read`),
  markAllRead: ()           => patch('/notifications/all/read'),
  delete:     (id)          => del(`/notifications/${id}`),
}


//  FORUM

export const forumAPI = {
  posts:    (params = {}) => get(`/forum?${new URLSearchParams(params)}`),
  tags:     ()            => get('/forum/tags'),
  post:     (id)          => get(`/forum/${id}`),
  create:   (body)        => post('/forum', body),
  reply:    (id, body)    => post(`/forum/${id}/replies`, { body }),
  like:     (id)          => post(`/forum/${id}/like`),
  delete:   (id)          => del(`/forum/${id}`),
}


//  ADMIN

export const adminAPI = {
  analytics:        ()                     => get('/admin/analytics'),
  users:            (params = {})          => get(`/admin/users?${new URLSearchParams(params)}`),
  updateUserStatus: (id, status)           => patch(`/admin/users/${id}/status`, { status }),
  deleteUser:       (id)                   => del(`/admin/users/${id}`),
}

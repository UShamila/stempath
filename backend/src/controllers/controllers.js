// ── Progress, Certificate, Chat, Notification, Admin Controllers ──
// (bundled in one file to keep the project lean)
const repos          = require('../repositories/repos')
const CourseRepo     = repos                           // default export
const { ProgressRepo, CertificateRepo, MentorshipRepo, MessageRepo } = repos
const NotifRepo      = require('../repositories/notification.repo')
const db         = require('../db/QueryHelper')
const { v4: uuid } = require('uuid')

// POST /api/progress  – mark a lesson complete/incomplete
const updateProgress = async (req, res) => {
  try {
    const { lessonId, completed, score } = req.body
    const studentId = req.user.id

    // Verify lesson exists
    const lesson = await db.queryOne('SELECT l.*, m.course_id FROM lessons l JOIN modules m ON l.module_id=m.id WHERE l.id=$1', [lessonId])
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' })

    const progress = await ProgressRepo.upsert(studentId, lessonId, { completed: !!completed, score })

    // Check if entire course is now complete
    if (completed) {
      const pct = await ProgressRepo.coursePercent(studentId, lesson.course_id)
      if (pct === 100) {
        // Mark enrollment as complete
        await db.queryOne(
          `UPDATE enrollments SET completed_at=NOW()
           WHERE student_id=$1 AND course_id=$2 AND completed_at IS NULL`,
          [studentId, lesson.course_id]
        )

        // Issue certificate if not already issued
        const existing = await CertificateRepo.findByCourseAndStudent(studentId, lesson.course_id)
        if (!existing) {
          const certNum = `SP-${new Date().getFullYear()}-${uuid().slice(0,8).toUpperCase()}`
          const cert = await CertificateRepo.create(studentId, lesson.course_id, certNum)

          // Notify student
          const courseRow = await db.queryOne('SELECT title FROM courses WHERE id=$1', [lesson.course_id])
          await NotifRepo.create(
            studentId, 'cert_issued',
            `Certificate issued: ${courseRow?.title ?? 'Course'} 🏆`,
            `Your certificate number is ${certNum}. Well done!`,
            cert.id
          )

          return res.json({ progress, courseComplete: true, certificate: cert })
        }
      }
      return res.json({ progress, courseComplete: pct === 100 })
    }

    res.json({ progress, courseComplete: false })
  } catch (err) {
    console.error('updateProgress:', err)
    res.status(500).json({ error: 'Failed to update progress' })
  }
}

// GET /api/progress/:courseId  – student's progress for a course
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params
    const studentId    = req.user.id
    const items = await ProgressRepo.getForStudent(studentId, courseId)
    const pct   = await ProgressRepo.coursePercent(studentId, courseId)
    res.json({ progress: items, percent: pct })
  } catch (err) {
    console.error('getCourseProgress:', err)
    res.status(500).json({ error: 'Failed to fetch progress' })
  }
}

// GET /api/progress/mentor-view  – mentor sees all students' progress
const getMentorView = async (req, res) => {
  try {
    const data = await ProgressRepo.getAllForMentor(req.user.id)
    res.json(data)
  } catch (err) {
    console.error('getMentorView:', err)
    res.status(500).json({ error: 'Failed to fetch progress data' })
  }
}

module.exports = { updateProgress, getCourseProgress, getMentorView }


// ════════════════════════════════════════════════════════════
// src/controllers/certificate.controller.js
const getCertificates = async (req, res) => {
  try {
    const certs = await CertificateRepo.findByStudent(req.user.id)
    res.json(certs)
  } catch (err) {
    console.error('getCertificates:', err)
    res.status(500).json({ error: 'Failed to fetch certificates' })
  }
}

const getAllCertificates = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query
    const certs = await CertificateRepo.findAll({ limit: parseInt(limit), offset: parseInt(offset) })
    res.json(certs)
  } catch (err) {
    console.error('getAllCertificates:', err)
    res.status(500).json({ error: 'Failed to fetch certificates' })
  }
}

module.exports.certController = { getCertificates, getAllCertificates }


// ════════════════════════════════════════════════════════════
// src/controllers/chat.controller.js
// MessageRepo already imported at top

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, type } = req.body
    const senderId = req.user.id
    if (!receiverId || !content)
      return res.status(400).json({ error: 'receiverId and content are required' })

    const fileUrl = req.file?.path ?? null
    const msg = await MessageRepo.create(senderId, receiverId, content, type || 'text', fileUrl)

    // Notify receiver
    const sender = await db.queryOne('SELECT full_name FROM users WHERE id=$1', [senderId])
    await NotifRepo.create(
      receiverId, 'new_message',
      `New message from ${sender.full_name}`,
      content.slice(0, 80),
      msg.id
    )

    res.status(201).json(msg)
  } catch (err) {
    console.error('sendMessage:', err)
    res.status(500).json({ error: 'Failed to send message' })
  }
}

const getConversation = async (req, res) => {
  try {
    const { userId } = req.params
    const { limit = 50, offset = 0 } = req.query
    const messages = await MessageRepo.getConversation(req.user.id, userId, { limit: parseInt(limit), offset: parseInt(offset) })
    await MessageRepo.markRead(userId, req.user.id)
    res.json(messages.reverse())
  } catch (err) {
    console.error('getConversation:', err)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
}

const getInbox = async (req, res) => {
  try {
    const inbox = await MessageRepo.getInbox(req.user.id)
    res.json(inbox)
  } catch (err) {
    console.error('getInbox:', err)
    res.status(500).json({ error: 'Failed to fetch inbox' })
  }
}

const getUnreadCount = async (req, res) => {
  try {
    const result = await MessageRepo.countUnread(req.user.id)
    res.json({ unread: result.total })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unread count' })
  }
}

module.exports.chatController = { sendMessage, getConversation, getInbox, getUnreadCount }


// ════════════════════════════════════════════════════════════
// src/controllers/notification.controller.js
const getNotifications = async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query
    const notifs = await NotifRepo.getForUser(req.user.id, { limit: parseInt(limit), offset: parseInt(offset) })
    const { total: unread } = await NotifRepo.countUnread(req.user.id)
    res.json({ notifications: notifs, unread })
  } catch (err) {
    console.error('getNotifications:', err)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
}

const markRead = async (req, res) => {
  try {
    const { id } = req.params
    if (id === 'all') {
      await NotifRepo.markAllRead(req.user.id)
    } else {
      await NotifRepo.markRead(id, req.user.id)
    }
    res.json({ message: 'Marked as read' })
  } catch (err) {
    console.error('markRead:', err)
    res.status(500).json({ error: 'Failed to mark notification' })
  }
}

const deleteNotif = async (req, res) => {
  try {
    await NotifRepo.delete(req.params.id, req.user.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' })
  }
}

module.exports.notifController = { getNotifications, markRead, deleteNotif }


// ════════════════════════════════════════════════════════════
// src/controllers/admin.controller.js
const UserRepoAdmin = require('../repositories/user.repo')

const getAnalytics = async (req, res) => {
  try {
    const [
      { total: totalStudents },
      { total: totalMentors },
      { total: activeUsers },
      { total: totalCerts },
      { total: activeMentorships },
      { total: pendingRequests },
      popularCourses,
      recentUsers,
    ] = await Promise.all([
      db.queryOne("SELECT COUNT(*)::int AS total FROM users WHERE role='student'"),
      db.queryOne("SELECT COUNT(*)::int AS total FROM users WHERE role='mentor'"),
      db.queryOne("SELECT COUNT(*)::int AS total FROM users WHERE status='active'"),
      db.queryOne("SELECT COUNT(*)::int AS total FROM certificates WHERE status='issued'"),
      db.queryOne("SELECT COUNT(*)::int AS total FROM mentorships WHERE is_active=true"),
      db.queryOne("SELECT COUNT(*)::int AS total FROM mentorship_requests WHERE status='pending'"),
      db.queryAll(
        `SELECT c.title, COUNT(e.student_id)::int AS enrolled_count
         FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id
         WHERE c.status='published'
         GROUP BY c.id ORDER BY enrolled_count DESC LIMIT 5`
      ),
      db.queryAll(
        `SELECT id, full_name, email, role, status, created_at
         FROM users ORDER BY created_at DESC LIMIT 10`
      ),
    ])

    res.json({
      totalStudents, totalMentors, activeUsers, totalCerts,
      activeMentorships, pendingRequests,
      popularCourses, recentUsers,
    })
  } catch (err) {
    console.error('getAnalytics:', err)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}

const listUsers = async (req, res) => {
  try {
    const { role, status, limit = 50, offset = 0 } = req.query
    const users = await UserRepoAdmin.listAll({ role, status, limit: parseInt(limit), offset: parseInt(offset) })
    const { total } = await UserRepoAdmin.countAll({ role, status })
    res.json({ users, total })
  } catch (err) {
    console.error('listUsers:', err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!['active','inactive','banned'].includes(status))
      return res.status(400).json({ error: 'Invalid status' })
    const user = await UserRepoAdmin.updateStatus(id, status)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ message: `User status updated to ${status}`, user })
  } catch (err) {
    console.error('updateUserStatus:', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' })
    await UserRepoAdmin.delete(id)
    res.json({ message: 'User deleted' })
  } catch (err) {
    console.error('deleteUser:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
}

module.exports.adminController = { getAnalytics, listUsers, updateUserStatus, deleteUser }

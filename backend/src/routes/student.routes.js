import express from 'express'
import { authenticate, authorize } from '../middleware/authMiddleware.js'
import { dbAll, dbGet, dbRun } from '../database/initDb.js'

const router = express.Router()

// Get student dashboard data
router.get('/dashboard', authenticate, authorize('student'), async (req, res) => {
  try {
    const studentId = req.user.id

    // Get student profile
    const student = await dbGet('SELECT * FROM students WHERE user_id = ?', [studentId])

    // Get enrolled courses with progress
    const courses = await dbAll(`
      SELECT c.id, c.title, c.category, c.difficulty, e.progress_percentage, e.enrolled_at
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = ?
    `, [studentId])

    // Get certificates
    const certificates = await dbAll(`
      SELECT cert.id, c.title, cert.issued_at
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      WHERE cert.student_id = ?
    `, [studentId])

    res.json({
      profile: student,
      courses,
      certificates,
      stats: {
        coursesActive: courses.length,
        coursesCompleted: certificates.length,
        certificates: certificates.length
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
})

// Get mentorship requests
router.get('/requests', authenticate, authorize('student'), async (req, res) => {
  try {
    const requests = await dbAll(`
      SELECT mr.id, mr.status, mr.message, mr.requested_at, u.name as mentor_name, u.avatar
      FROM mentorship_requests mr
      JOIN users u ON mr.mentor_id = u.id
      WHERE mr.student_id = ?
      ORDER BY mr.requested_at DESC
    `, [req.user.id])

    res.json({ requests })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' })
  }
})

export default router
import express from 'express'
import { authenticate, authorize } from '../middleware/authMiddleware.js'
import { dbAll, dbGet, dbRun } from '../database/initDb.js'

const router = express.Router()

// Get all mentors (for browsing)
router.get('/', authenticate, async (req, res) => {
  try {
    const mentors = await dbAll(`
      SELECT u.id, u.name, u.bio, u.country, u.avatar, m.expertise, m.years_experience, m.rating, m.review_count
      FROM users u
      JOIN mentors m ON u.id = m.user_id
      WHERE m.is_approved = 1 AND u.is_active = 1
    `)

    res.json({ mentors })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentors' })
  }
})

// Get mentor details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const mentor = await dbGet(`
      SELECT u.id, u.name, u.bio, u.country, u.avatar, m.expertise, m.years_experience, m.rating, m.review_count
      FROM users u
      JOIN mentors m ON u.id = m.user_id
      WHERE u.id = ? AND m.is_approved = 1 AND u.is_active = 1
    `, [req.params.id])

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' })
    }

    res.json({ mentor })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentor' })
  }
})

// Request mentorship
router.post('/:id/request', authenticate, authorize('student'), async (req, res) => {
  try {
    const { message } = req.body
    const mentorId = req.params.id
    const studentId = req.user.id

    // Check if request already exists
    const existing = await dbGet(
      'SELECT id FROM mentorship_requests WHERE student_id = ? AND mentor_id = ?',
      [studentId, mentorId]
    )

    if (existing) {
      return res.status(409).json({ error: 'Request already exists' })
    }

    await dbRun(
      'INSERT INTO mentorship_requests (student_id, mentor_id, message) VALUES (?, ?, ?)',
      [studentId, mentorId, message]
    )

    res.json({ message: 'Mentorship request sent successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to send request' })
  }
})

export default router
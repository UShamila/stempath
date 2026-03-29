import express from 'express'
import { authenticate, authorize } from '../middleware/authMiddleware.js'
import { dbAll, dbGet, dbRun } from '../database/initDb.js'

const router = express.Router()

// Get admin dashboard stats
router.get('/dashboard', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = {
      totalStudents: await dbGet('SELECT COUNT(*) as count FROM users WHERE role = "student"'),
      totalMentors: await dbGet('SELECT COUNT(*) as count FROM mentors WHERE is_approved = 1'),
      pendingMentors: await dbGet('SELECT COUNT(*) as count FROM mentors WHERE is_approved = 0'),
      totalCourses: await dbGet('SELECT COUNT(*) as count FROM courses'),
      activeEnrollments: await dbGet('SELECT COUNT(*) as count FROM enrollments'),
      certificatesIssued: await dbGet('SELECT COUNT(*) as count FROM certificates')
    }

    res.json({ stats })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

// Get pending mentor approvals
router.get('/mentors/pending', authenticate, authorize('admin'), async (req, res) => {
  try {
    const mentors = await dbAll(`
      SELECT u.id, u.name, u.email, u.bio, u.country, m.expertise, m.years_experience,
             m.cv_path, m.certificate_path, m.proof_path, m.applied_at
      FROM users u
      JOIN mentors m ON u.id = m.user_id
      WHERE m.is_approved = 0
      ORDER BY m.applied_at DESC
    `)

    res.json({ mentors })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending mentors' })
  }
})

// Approve mentor
router.put('/mentors/:id/approve', authenticate, authorize('admin'), async (req, res) => {
  try {
    const mentorId = req.params.id

    // Check if mentor exists and is pending
    const mentor = await dbGet('SELECT * FROM mentors WHERE user_id = ? AND is_approved = 0', [mentorId])
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found or already approved' })
    }

    await dbRun(
      'UPDATE mentors SET is_approved = 1, approved_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [mentorId]
    )

    // Create notification for the mentor
    await dbRun(
      'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
      [mentorId, 'mentor_approved', 'Mentor Application Approved', 'Congratulations! Your mentor application has been approved. You can now accept student requests.']
    )

    res.json({ message: 'Mentor approved successfully' })
  } catch (error) {
    console.error('Mentor approval error:', error)
    res.status(500).json({ error: 'Failed to approve mentor' })
  }
})

// Reject mentor
router.put('/mentors/:id/reject', authenticate, authorize('admin'), async (req, res) => {
  try {
    const mentorId = req.params.id

    // Check if mentor exists and is pending
    const mentor = await dbGet('SELECT * FROM mentors WHERE user_id = ? AND is_approved = 0', [mentorId])
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found or already processed' })
    }

    // Delete mentor record and user account
    await dbRun('DELETE FROM mentors WHERE user_id = ?', [mentorId])
    await dbRun('DELETE FROM users WHERE id = ?', [mentorId])

    res.json({ message: 'Mentor application rejected' })
  } catch (error) {
    console.error('Mentor rejection error:', error)
    res.status(500).json({ error: 'Failed to reject mentor' })
  }
})

// Get all users
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await dbAll('SELECT id, name, email, role, created_at, is_active FROM users ORDER BY created_at DESC')
    res.json({ users })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

export default router
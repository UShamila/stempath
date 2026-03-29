import express from 'express'
import { authenticate, authorize } from '../middleware/authMiddleware.js'
import { dbAll, dbGet, dbRun } from '../database/initDb.js'

const router = express.Router()

// Get all courses
router.get('/', authenticate, async (req, res) => {
  try {
    const courses = await dbAll(`
      SELECT c.*, u.name as instructor_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.is_active = 1
      ORDER BY c.created_at DESC
    `)

    res.json({ courses })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

// Get course details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const course = await dbGet(`
      SELECT c.*, u.name as instructor_name
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.id = ? AND c.is_active = 1
    `, [req.params.id])

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    const content = await dbAll(
      'SELECT * FROM course_content WHERE course_id = ? ORDER BY order_index',
      [req.params.id]
    )

    res.json({ course, content })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' })
  }
})

// Enroll in course
router.post('/:id/enroll', authenticate, authorize('student'), async (req, res) => {
  try {
    const courseId = req.params.id
    const studentId = req.user.id

    // Check if already enrolled
    const existing = await dbGet(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    )

    if (existing) {
      return res.status(409).json({ error: 'Already enrolled in this course' })
    }

    await dbRun(
      'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
      [studentId, courseId]
    )

    res.json({ message: 'Successfully enrolled in course' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to enroll in course' })
  }
})

// Create course (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, description, category, difficulty, durationHours, instructorId } = req.body

    const result = await dbRun(
      'INSERT INTO courses (title, description, category, difficulty, duration_hours, instructor_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, category, difficulty, durationHours, instructorId]
    )

    res.status(201).json({ message: 'Course created successfully', courseId: result.id })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' })
  }
})

// Update course (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, description, category, difficulty, durationHours, instructorId, isActive } = req.body

    await dbRun(
      'UPDATE courses SET title = ?, description = ?, category = ?, difficulty = ?, duration_hours = ?, instructor_id = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, category, difficulty, durationHours, instructorId, isActive, req.params.id]
    )

    res.json({ message: 'Course updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' })
  }
})

// Delete course (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await dbRun('DELETE FROM courses WHERE id = ?', [req.params.id])
    res.json({ message: 'Course deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' })
  }
})

// Get student's enrolled courses
router.get('/enrolled', authenticate, authorize('student'), async (req, res) => {
  try {
    const courses = await dbAll(`
      SELECT c.*, e.enrolled_at, e.progress_percentage, e.completed_at
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `, [req.user.id])

    res.json({ courses })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrolled courses' })
  }
})

// Get course progress
router.get('/:id/progress', authenticate, async (req, res) => {
  try {
    const courseId = req.params.id
    const userId = req.user.id

    // Check if user is enrolled
    const enrollment = await dbGet(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [userId, courseId]
    )

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' })
    }

    // Get course content and progress
    const content = await dbAll(`
      SELECT cc.*, p.completed, p.completed_at, p.score
      FROM course_content cc
      LEFT JOIN progress p ON cc.id = p.content_id AND p.enrollment_id = ?
      WHERE cc.course_id = ?
      ORDER BY cc.order_index
    `, [enrollment.id, courseId])

    res.json({ enrollment, content })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course progress' })
  }
})

// Mark content as completed
router.post('/:courseId/content/:contentId/complete', authenticate, authorize('student'), async (req, res) => {
  try {
    const { courseId, contentId } = req.params
    const { score } = req.body

    // Get enrollment
    const enrollment = await dbGet(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
      [req.user.id, courseId]
    )

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' })
    }

    // Mark as completed
    await dbRun(
      'INSERT OR REPLACE INTO progress (enrollment_id, content_id, completed, completed_at, score) VALUES (?, ?, 1, CURRENT_TIMESTAMP, ?)',
      [enrollment.id, contentId, score || null]
    )

    // Update overall progress
    const totalContent = await dbGet('SELECT COUNT(*) as count FROM course_content WHERE course_id = ?', [courseId])
    const completedContent = await dbGet(`
      SELECT COUNT(*) as count FROM progress
      WHERE enrollment_id = ? AND completed = 1
    `, [enrollment.id])

    const progressPercentage = Math.round((completedContent.count / totalContent.count) * 100)

    await dbRun(
      'UPDATE enrollments SET progress_percentage = ? WHERE id = ?',
      [progressPercentage, enrollment.id]
    )

    // Check if course is completed
    if (progressPercentage === 100) {
      await dbRun(
        'UPDATE enrollments SET completed_at = CURRENT_TIMESTAMP WHERE id = ?',
        [enrollment.id]
      )

      // Generate certificate
      await dbRun(
        'INSERT INTO certificates (student_id, course_id) VALUES (?, ?)',
        [req.user.id, courseId]
      )
    }

    res.json({ message: 'Content marked as completed', progressPercentage })
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark content as completed' })
  }
})

// Add course content (admin only)
router.post('/:id/content', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, type, content, orderIndex, durationMinutes } = req.body

    const result = await dbRun(
      'INSERT INTO course_content (course_id, title, type, content, order_index, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, title, type, content, orderIndex, durationMinutes]
    )

    res.status(201).json({ message: 'Content added successfully', contentId: result.id })
  } catch (error) {
    res.status(500).json({ error: 'Failed to add content' })
  }
})

export default router
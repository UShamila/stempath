import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import { dbRun, dbGet } from '../database/initDb.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image and PDF files are allowed'))
    }
  }
})

// Register user
router.post('/register', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'certificate', maxCount: 1 },
  { name: 'proof', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, password, role, educationLevel, stemInterest, expertise, yearsExperience, bio, country } = req.body

    // Check if user already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const userResult = await dbRun(
      'INSERT INTO users (name, email, password, role, bio, country) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, bio, country]
    )

    const userId = userResult.id

    // Create role-specific profile
    if (role === 'student') {
      await dbRun(
        'INSERT INTO students (user_id, education_level, stem_interest) VALUES (?, ?, ?)',
        [userId, educationLevel, stemInterest]
      )
    } else if (role === 'mentor') {
      const cvPath = req.files.cv ? req.files.cv[0].path : null
      const certificatePath = req.files.certificate ? req.files.certificate[0].path : null
      const proofPath = req.files.proof ? req.files.proof[0].path : null

      await dbRun(
        'INSERT INTO mentors (user_id, expertise, years_experience, cv_path, certificate_path, proof_path) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, expertise, yearsExperience, cvPath, certificatePath, proofPath]
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: role === 'mentor' ? 'Registration successful! Awaiting admin approval.' : 'Registration successful!',
      token,
      user: { id: userId, name, email, role }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await dbGet('SELECT * FROM users WHERE email = ? AND is_active = 1', [email])
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check if mentor is approved
    if (user.role === 'mentor') {
      const mentor = await dbGet('SELECT is_approved FROM mentors WHERE user_id = ?', [user.id])
      if (!mentor || !mentor.is_approved) {
        return res.status(403).json({ error: 'Account pending admin approval' })
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        country: user.country
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = req.user

    let profile = { ...user }
    delete profile.password

    // Get role-specific data
    if (user.role === 'student') {
      const studentData = await dbGet('SELECT * FROM students WHERE user_id = ?', [user.id])
      profile.student = studentData
    } else if (user.role === 'mentor') {
      const mentorData = await dbGet('SELECT * FROM mentors WHERE user_id = ?', [user.id])
      profile.mentor = mentorData
    }

    res.json({ user: profile })

  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update profile
router.put('/profile', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const { name, bio, country } = req.body
    const avatar = req.file ? req.file.path : req.user.avatar

    await dbRun(
      'UPDATE users SET name = ?, bio = ?, country = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, bio, country, avatar, req.user.id]
    )

    res.json({ message: 'Profile updated successfully' })

  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Get user settings
router.get('/settings', authenticate, async (req, res) => {
  try {
    let settings = await dbGet('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id])

    if (!settings) {
      // Create default settings
      await dbRun(
        'INSERT INTO user_settings (user_id) VALUES (?)',
        [req.user.id]
      )
      settings = await dbGet('SELECT * FROM user_settings WHERE user_id = ?', [req.user.id])
    }

    res.json({ settings })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

// Update user settings
router.put('/settings', authenticate, async (req, res) => {
  try {
    const { email_notifications, push_notifications, theme, language, privacy_profile } = req.body

    await dbRun(
      `INSERT OR REPLACE INTO user_settings
       (user_id, email_notifications, push_notifications, theme, language, privacy_profile, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [req.user.id, email_notifications, push_notifications, theme, language, privacy_profile]
    )

    res.json({ message: 'Settings updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' })
  }
})

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body

    // Verify current password
    const isValid = await bcrypt.compare(current_password, req.user.password)
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10)

    // Update password
    await dbRun('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id])

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' })
  }
})

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    const user = await dbGet('SELECT id FROM users WHERE email = ?', [email])
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' })
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    )

    // Store token
    await dbRun(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, datetime("now", "+1 hour"))',
      [user.id, resetToken]
    )

    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`)

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' })
  }
})

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid token' })
    }

    // Check if token exists and is not used
    const tokenRecord = await dbGet(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime("now")',
      [token]
    )

    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid or expired token' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10)

    // Update password
    await dbRun('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, tokenRecord.user_id])

    // Mark token as used
    await dbRun('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [tokenRecord.id])

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid token' })
    }
    res.status(500).json({ error: 'Failed to reset password' })
  }
})

// Get public profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await dbGet(`
      SELECT id, name, bio, country, avatar, role, created_at
      FROM users
      WHERE id = ? AND is_active = 1
    `, [req.params.userId])

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    let profile = { ...user }

    // Add role-specific data
    if (user.role === 'student') {
      const studentData = await dbGet('SELECT education_level, stem_interest FROM students WHERE user_id = ?', [user.id])
      profile.student = studentData
    } else if (user.role === 'mentor') {
      const mentorData = await dbGet(`
        SELECT expertise, years_experience, rating, review_count, is_approved
        FROM mentors WHERE user_id = ?
      `, [user.id])
      profile.mentor = mentorData
    }

    res.json({ profile })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

export default router
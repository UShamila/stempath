// src/controllers/auth.controller.js
const UserRepo    = require('../repositories/user.repo')
const StudentRepo = require('../repositories/student.repo')
const MentorRepo  = require('../repositories/mentor.repo')
const { hashPassword, comparePassword } = require('../utils/hashPassword')
const { generateJWT } = require('../utils/generateJWT')

//  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { fullName, email, password, role, country,
            educationLevel, stemInterest,           // student fields
            expertise, yearsExp, biography           // mentor fields
          } = req.body

    const existing = await UserRepo.findByEmail(email)
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const validRoles = ['student','mentor']
    if (!validRoles.includes(role))
      return res.status(400).json({ error: 'Invalid role. Use: student or mentor' })

    const passwordHash = await hashPassword(password)
    // Mentors start as 'pending' (status=active but mentor_status=pending)
    const user = await UserRepo.create({ fullName, email, passwordHash, role, country })

    if (role === 'student') {
      await StudentRepo.upsert(user.id, { educationLevel, stemInterest, bio: null })
    }

    if (role === 'mentor') {
      // Handle uploaded docs from multer
      const cvUrl          = req.files?.cv?.[0]?.path          ?? null
      const certificateUrl = req.files?.certificate?.[0]?.path ?? null
      const proofUrl       = req.files?.proof?.[0]?.path       ?? null
      await MentorRepo.upsert(user.id, {
        expertise, yearsExp: parseInt(yearsExp) || 0, biography,
        cvUrl, certificateUrl, proofUrl,
      })
    }

    const token = generateJWT({ id: user.id, role: user.role })
    return res.status(201).json({
      message: role === 'mentor'
        ? 'Registration successful. Your account is pending admin approval.'
        : 'Registration successful.',
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
}

//  POST /api/auth/login 
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body

    const user = await UserRepo.findByEmail(email)
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await comparePassword(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    if (user.status === 'banned')   return res.status(403).json({ error: 'Account suspended' })
    if (user.status === 'inactive') return res.status(403).json({ error: 'Account inactive' })

    // If role supplied, enforce match (login page role selector)
    if (role && user.role !== role)
      return res.status(403).json({ error: `This account is not a ${role}` })

    // For mentors, check approval status
    if (user.role === 'mentor') {
      const mentor = await MentorRepo.findById(user.id)
      if (mentor?.mentor_status === 'pending')
        return res.status(403).json({ error: 'Mentor account is pending admin approval' })
      if (mentor?.mentor_status === 'rejected')
        return res.status(403).json({ error: 'Mentor application was rejected' })
    }

    const token = generateJWT({ id: user.id, role: user.role })
    res.json({
      token,
      user: {
        id:       user.id,
        fullName: user.full_name,
        email:    user.email,
        role:     user.role,
        country:  user.country,
        avatarUrl:user.avatar_url,
        darkMode: user.dark_mode,
      },
    })
  } catch (err) {
    console.error('login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
}

//  GET /api/auth/me 
const getMe = async (req, res) => {
  try {
    const user = await UserRepo.findById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Attach role-specific data
    let extra = {}
    if (user.role === 'student') {
      const s = await StudentRepo.findById(user.id)
      extra = { educationLevel: s?.education_level, stemInterest: s?.stem_interest, bio: s?.bio }
    }
    if (user.role === 'mentor') {
      const m = await MentorRepo.findById(user.id)
      extra = { expertise: m?.expertise, yearsExp: m?.years_exp, biography: m?.biography,
                mentorStatus: m?.mentor_status, rating: m?.rating, totalReviews: m?.total_reviews }
    }

    res.json({ id: user.id, fullName: user.full_name, email: user.email,
               role: user.role, country: user.country, avatarUrl: user.avatar_url,
               darkMode: user.dark_mode, ...extra })
  } catch (err) {
    console.error('getMe error:', err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

//  PATCH /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, country, darkMode } = req.body
    const avatarUrl = req.file?.path ?? undefined
    const user = await UserRepo.updateProfile(req.user.id, { fullName, country, avatarUrl, darkMode })
    res.json(user)
  } catch (err) {
    console.error('updateProfile error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

//  PATCH /api/auth/password 
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await UserRepo.findById(req.user.id)
    const valid = await comparePassword(currentPassword, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })
    const hash = await hashPassword(newPassword)
    await UserRepo.updatePassword(req.user.id, hash)
    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error('changePassword error:', err)
    res.status(500).json({ error: 'Failed to change password' })
  }
}

module.exports = { register, login, getMe, updateProfile, changePassword }

// src/controllers/mentor.controller.js
const MentorRepo   = require('../repositories/mentor.repo')
const UserRepo     = require('../repositories/user.repo')
const NotifRepo    = require('../repositories/notification.repo')
const { MentorshipRepo } = require('../repositories/repos')

// GET /api/mentors  – public list of approved mentors
const listMentors = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const mentors = await MentorRepo.listApproved({ limit: parseInt(limit), offset: parseInt(offset) })
    res.json(mentors)
  } catch (err) {
    console.error('listMentors:', err)
    res.status(500).json({ error: 'Failed to fetch mentors' })
  }
}

// GET /api/mentors/:id
const getMentor = async (req, res) => {
  try {
    const mentor = await MentorRepo.findById(req.params.id)
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' })
    res.json(mentor)
  } catch (err) {
    console.error('getMentor:', err)
    res.status(500).json({ error: 'Failed to fetch mentor' })
  }
}

// GET /api/mentors/pending  – admin only
const listPending = async (req, res) => {
  try {
    const pending = await MentorRepo.listPending()
    res.json(pending)
  } catch (err) {
    console.error('listPending:', err)
    res.status(500).json({ error: 'Failed to fetch pending mentors' })
  }
}

// POST /api/mentors/:id/approve  – admin only
const approveMentor = async (req, res) => {
  try {
    const { id } = req.params
    const mentor = await MentorRepo.findById(id)
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' })

    await MentorRepo.approve(id, req.user.id)
    await UserRepo.updateStatus(id, 'active')

    // Notify mentor
    await NotifRepo.create(
      id, 'mentor_approved',
      'Your mentor application was approved! 🎉',
      'You can now accept student mentorship requests and access your dashboard.',
      null
    )

    res.json({ message: 'Mentor approved successfully' })
  } catch (err) {
    console.error('approveMentor:', err)
    res.status(500).json({ error: 'Failed to approve mentor' })
  }
}

// POST /api/mentors/:id/reject  – admin only
const rejectMentor = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const mentor = await MentorRepo.findById(id)
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' })

    await MentorRepo.reject(id, req.user.id)

    await NotifRepo.create(
      id, 'general',
      'Your mentor application was not approved.',
      reason || 'Please review the requirements and reapply.',
      null
    )

    res.json({ message: 'Mentor application rejected' })
  } catch (err) {
    console.error('rejectMentor:', err)
    res.status(500).json({ error: 'Failed to reject mentor' })
  }
}

// PATCH /api/mentors/profile  – mentor only
const updateMentorProfile = async (req, res) => {
  try {
    const { expertise, yearsExp, biography, maxStudents } = req.body
    const updated = await MentorRepo.updateProfile(req.user.id, {
      expertise, yearsExp: yearsExp ? parseInt(yearsExp) : undefined,
      biography, maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
    })
    if (!updated) return res.status(404).json({ error: 'Mentor profile not found' })
    res.json(updated)
  } catch (err) {
    console.error('updateMentorProfile:', err)
    res.status(500).json({ error: 'Failed to update mentor profile' })
  }
}

// GET /api/mentors/my-students  – mentor only
const getMyStudents = async (req, res) => {
  try {
    const students = await MentorshipRepo.getMentorStudents(req.user.id)
    res.json(students)
  } catch (err) {
    console.error('getMyStudents:', err)
    res.status(500).json({ error: 'Failed to fetch students' })
  }
}

module.exports = { listMentors, getMentor, listPending, approveMentor, rejectMentor, updateMentorProfile, getMyStudents }

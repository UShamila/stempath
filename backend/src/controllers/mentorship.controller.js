// src/controllers/mentorship.controller.js
const { MentorshipRepo } = require('../repositories/repos')
const MentorRepo         = require('../repositories/mentor.repo')
const NotifRepo          = require('../repositories/notification.repo')
const UserRepo           = require('../repositories/user.repo')

// POST /api/mentorships/request  – student sends request
const sendRequest = async (req, res) => {
  try {
    const { mentorId, message } = req.body
    const studentId = req.user.id

    // Verify mentor exists and is approved
    const mentor = await MentorRepo.findById(mentorId)
    if (!mentor)                           return res.status(404).json({ error: 'Mentor not found' })
    if (mentor.mentor_status !== 'approved') return res.status(400).json({ error: 'Mentor is not available' })

    // Check for existing request
    const existing = await MentorshipRepo.getRequestByPair(studentId, mentorId)
    if (existing) {
      if (existing.status === 'pending')  return res.status(409).json({ error: 'Request already sent' })
      if (existing.status === 'accepted') return res.status(409).json({ error: 'Already in a mentorship with this mentor' })
    }

    // Check mentor capacity
    const currentStudents = parseInt(mentor.current_students ?? 0)
    if (currentStudents >= (mentor.max_students ?? 10))
      return res.status(400).json({ error: 'This mentor has reached their student limit' })

    const request = await MentorshipRepo.createRequest(studentId, mentorId, message)

    // Notify mentor
    const student = await UserRepo.findById(studentId)
    await NotifRepo.create(
      mentorId, 'mentor_request',
      `New mentorship request from ${student.full_name}`,
      message || 'A student has requested you as their mentor.',
      request.id
    )

    res.status(201).json({ message: 'Mentorship request sent successfully', request })
  } catch (err) {
    console.error('sendRequest:', err)
    res.status(500).json({ error: 'Failed to send request' })
  }
}

// GET /api/mentorships/requests  – mentor views their incoming requests
const getRequests = async (req, res) => {
  try {
    const { status } = req.query
    const requests = await MentorshipRepo.getMentorRequests(req.user.id, status)
    res.json(requests)
  } catch (err) {
    console.error('getRequests:', err)
    res.status(500).json({ error: 'Failed to fetch requests' })
  }
}

// PATCH /api/mentorships/requests/:id  – mentor accepts/rejects
const respondRequest = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body   // 'accepted' | 'rejected'

    if (!['accepted','rejected'].includes(status))
      return res.status(400).json({ error: 'Status must be accepted or rejected' })

    const request = await MentorshipRepo.getRequest(id)
    if (!request)                       return res.status(404).json({ error: 'Request not found' })
    if (request.mentor_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    if (request.status !== 'pending')   return res.status(400).json({ error: 'Request already responded to' })

    await MentorshipRepo.respondRequest(id, status)

    if (status === 'accepted') {
      await MentorshipRepo.activateMentorship(request.student_id, req.user.id)
      const mentor = await UserRepo.findById(req.user.id)
      await NotifRepo.create(
        request.student_id, 'request_accepted',
        `${mentor.full_name} accepted your mentorship request! 🎉`,
        'Head to your dashboard to start learning.',
        id
      )
    } else {
      const mentor = await UserRepo.findById(req.user.id)
      await NotifRepo.create(
        request.student_id, 'request_rejected',
        `${mentor.full_name} is unable to take you on right now.`,
        'Browse other mentors and send a new request.',
        id
      )
    }

    res.json({ message: `Request ${status}` })
  } catch (err) {
    console.error('respondRequest:', err)
    res.status(500).json({ error: 'Failed to update request' })
  }
}

// GET /api/mentorships/my-mentor  – student's active mentor
const getMyMentor = async (req, res) => {
  try {
    const mentor = await MentorshipRepo.getStudentMentor(req.user.id)
    res.json(mentor ?? null)
  } catch (err) {
    console.error('getMyMentor:', err)
    res.status(500).json({ error: 'Failed to fetch mentor' })
  }
}

// GET /api/mentorships/active  – admin only
const getActiveMentorships = async (req, res) => {
  try {
    const list = await MentorshipRepo.getActiveMentorships()
    res.json(list)
  } catch (err) {
    console.error('getActiveMentorships:', err)
    res.status(500).json({ error: 'Failed to fetch mentorships' })
  }
}

module.exports = { sendRequest, getRequests, respondRequest, getMyMentor, getActiveMentorships }

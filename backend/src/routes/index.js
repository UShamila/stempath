// src/routes/index.js  –  master router
const express = require('express')
const { body, param, query } = require('express-validator')

const { authenticate }   = require('../middleware/authMiddleware')
const { authorize }      = require('../middleware/roleMiddleware')
const { validate }       = require('../middleware/validationMiddleware')
const { uploadMentorDocs, uploadAvatar } = require('../utils/fileUpload')

// Controllers
const authCtrl       = require('../controllers/auth.controller')
const mentorCtrl     = require('../controllers/mentor.controller')
const mentorshipCtrl = require('../controllers/mentorship.controller')
const courseCtrl     = require('../controllers/course.controller')
const forumCtrl      = require('../controllers/forum.controller')
const {
  updateProgress, getCourseProgress, getMentorView,
  certController:  certCtrl,
  chatController:  chatCtrl,
  notifController: notifCtrl,
  adminController: adminCtrl,
} = require('../controllers/controllers')
const progressCtrl = { updateProgress, getCourseProgress, getMentorView }

const router = express.Router()

// ═══════════════════════════════════════════════════════════
//  AUTH  /api/auth
// ═══════════════════════════════════════════════════════════
const authRouter = express.Router()

authRouter.post('/register',
  uploadMentorDocs,
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student','mentor']).withMessage('Role must be student or mentor'),
  ],
  validate,
  authCtrl.register
)

authRouter.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authCtrl.login
)

authRouter.get('/me',            authenticate, authCtrl.getMe)
authRouter.patch('/profile',     authenticate, uploadAvatar.single('avatar'), authCtrl.updateProfile)
authRouter.patch('/password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  authCtrl.changePassword
)

router.use('/auth', authRouter)

// ═══════════════════════════════════════════════════════════
//  MENTORS  /api/mentors
// ═══════════════════════════════════════════════════════════
const mentorRouter = express.Router()

mentorRouter.get('/',         mentorCtrl.listMentors)           // public
mentorRouter.get('/pending',  authenticate, authorize('admin'), mentorCtrl.listPending)
mentorRouter.get('/my-students', authenticate, authorize('mentor'), mentorCtrl.getMyStudents)
mentorRouter.get('/:id',      mentorCtrl.getMentor)             // public
mentorRouter.post('/:id/approve', authenticate, authorize('admin'), mentorCtrl.approveMentor)
mentorRouter.post('/:id/reject',  authenticate, authorize('admin'), mentorCtrl.rejectMentor)
mentorRouter.patch('/profile',    authenticate, authorize('mentor'), mentorCtrl.updateMentorProfile)

router.use('/mentors', mentorRouter)

// ═══════════════════════════════════════════════════════════
//  MENTORSHIPS  /api/mentorships
// ═══════════════════════════════════════════════════════════
const mentorshipRouter = express.Router()

mentorshipRouter.post('/request',
  authenticate, authorize('student'),
  [body('mentorId').isUUID().withMessage('Valid mentor ID required')],
  validate,
  mentorshipCtrl.sendRequest
)
mentorshipRouter.get('/requests',     authenticate, authorize('mentor'), mentorshipCtrl.getRequests)
mentorshipRouter.patch('/requests/:id', authenticate, authorize('mentor'),
  [body('status').isIn(['accepted','rejected'])],
  validate,
  mentorshipCtrl.respondRequest
)
mentorshipRouter.get('/my-mentor',    authenticate, authorize('student'), mentorshipCtrl.getMyMentor)
mentorshipRouter.get('/active',       authenticate, authorize('admin'),   mentorshipCtrl.getActiveMentorships)

router.use('/mentorships', mentorshipRouter)

// ═══════════════════════════════════════════════════════════
//  COURSES  /api/courses
// ═══════════════════════════════════════════════════════════
const courseRouter = express.Router()

courseRouter.get('/',             courseCtrl.getCourses)       // public
courseRouter.get('/categories',   courseCtrl.getCourseCategoriesHandler) // public
courseRouter.get('/all',          authenticate, authorize('admin'), courseCtrl.getAllCourses)
courseRouter.get('/my-courses',   authenticate, authorize('student'), courseCtrl.getMyCourses)
courseRouter.get('/:idOrSlug',    courseCtrl.getCourse)        // public
courseRouter.post('/',            authenticate, authorize('admin'), courseCtrl.createCourse)
courseRouter.patch('/:id',        authenticate, authorize('admin'), courseCtrl.updateCourse)
courseRouter.delete('/:id',       authenticate, authorize('admin'), courseCtrl.deleteCourseHandler)
courseRouter.post('/:id/enroll',  authenticate, authorize('student'), courseCtrl.enroll)

router.use('/courses', courseRouter)

// ═══════════════════════════════════════════════════════════
//  MODULES  /api/modules
// ═══════════════════════════════════════════════════════════
const moduleRouter = express.Router()

moduleRouter.get('/', courseCtrl.getModules)  // public

router.use('/modules', moduleRouter)

// ═══════════════════════════════════════════════════════════
//  LESSONS  /api/lessons
// ═══════════════════════════════════════════════════════════
const lessonRouter = express.Router()

lessonRouter.get('/', courseCtrl.getLessons)  // public

router.use('/lessons', lessonRouter)

// ═══════════════════════════════════════════════════════════
//  PROGRESS  /api/progress
// ═══════════════════════════════════════════════════════════
const progressRouter = express.Router()

progressRouter.post('/',
  authenticate, authorize('student'),
  [
    body('lessonId').isUUID(),
    body('completed').isBoolean(),
  ],
  validate,
  progressCtrl.updateProgress
)
progressRouter.get('/mentor-view', authenticate, authorize('mentor'), progressCtrl.getMentorView)
progressRouter.get('/:courseId',   authenticate, authorize('student'), progressCtrl.getCourseProgress)

router.use('/progress', progressRouter)

// ═══════════════════════════════════════════════════════════
//  CERTIFICATES  /api/certificates
// ═══════════════════════════════════════════════════════════
const certRouter = express.Router()

certRouter.get('/',    authenticate, authorize('student'), certCtrl.getCertificates)
certRouter.get('/all', authenticate, authorize('admin'),   certCtrl.getAllCertificates)

router.use('/certificates', certRouter)

// ═══════════════════════════════════════════════════════════
//  CHAT  /api/chat
// ═══════════════════════════════════════════════════════════
const chatRouter = express.Router()

chatRouter.get('/inbox',          authenticate, chatCtrl.getInbox)
chatRouter.get('/unread',         authenticate, chatCtrl.getUnreadCount)
chatRouter.get('/:userId',        authenticate, chatCtrl.getConversation)
chatRouter.post('/',
  authenticate,
  [body('receiverId').isUUID(), body('content').notEmpty()],
  validate,
  chatCtrl.sendMessage
)

router.use('/chat', chatRouter)

// ═══════════════════════════════════════════════════════════
//  NOTIFICATIONS  /api/notifications
// ═══════════════════════════════════════════════════════════
const notifRouter = express.Router()

notifRouter.get('/',          authenticate, notifCtrl.getNotifications)
notifRouter.patch('/:id/read', authenticate, notifCtrl.markRead)   // id = UUID or 'all'
notifRouter.delete('/:id',     authenticate, notifCtrl.deleteNotif)

router.use('/notifications', notifRouter)

// ═══════════════════════════════════════════════════════════
//  FORUM  /api/forum
// ═══════════════════════════════════════════════════════════
const forumRouter = express.Router()

forumRouter.get('/tags',    forumCtrl.getTags)                  // public
forumRouter.get('/',        forumCtrl.getPosts)                 // public
forumRouter.get('/:id',     forumCtrl.getPost)                  // public
forumRouter.post('/',       authenticate, forumCtrl.createPost)
forumRouter.post('/:id/replies', authenticate, forumCtrl.addReply)
forumRouter.post('/:id/like',    authenticate, forumCtrl.likePost)
forumRouter.delete('/:id', authenticate, forumCtrl.deletePost)

router.use('/forum', forumRouter)

// ═══════════════════════════════════════════════════════════
//  ADMIN  /api/admin
// ═══════════════════════════════════════════════════════════
const adminRouter = express.Router()
adminRouter.use(authenticate, authorize('admin'))

adminRouter.get('/analytics',    adminCtrl.getAnalytics)
adminRouter.get('/users',        adminCtrl.listUsers)
adminRouter.patch('/users/:id/status', adminCtrl.updateUserStatus)
adminRouter.delete('/users/:id', adminCtrl.deleteUser)

router.use('/admin', adminRouter)

// ═══════════════════════════════════════════════════════════
//  HEALTH CHECK
// ═══════════════════════════════════════════════════════════
router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

module.exports = router

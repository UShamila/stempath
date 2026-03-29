// src/repositories/course.repo.js
const db = require('../db/QueryHelper')

const CourseRepo = {
  findById: (id) =>
    db.queryOne(
      `SELECT c.*, cat.name AS category_name, cat.color AS category_color
       FROM courses c LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = $1`, [id]
    ),

  findBySlug: (slug) =>
    db.queryOne(
      `SELECT c.*, cat.name AS category_name, cat.color AS category_color
       FROM courses c LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.slug = $1`, [slug]
    ),

  listPublished: ({ categoryId, difficulty, limit = 50, offset = 0 } = {}) => {
    const conds = ["c.status='published'"]
    const params = []
    let pi = 1
    if (categoryId)  { conds.push(`c.category_id=$${pi++}`); params.push(categoryId) }
    if (difficulty)  { conds.push(`c.difficulty=$${pi++}`);  params.push(difficulty) }
    params.push(limit, offset)
    return db.queryAll(
      `SELECT c.id, c.title, c.slug, c.description, c.difficulty, c.duration_hrs,
              c.thumbnail_url, cat.name AS category_name, cat.color AS category_color,
              (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) AS enrolled_count
       FROM courses c LEFT JOIN categories cat ON c.category_id=cat.id
       WHERE ${conds.join(' AND ')}
       ORDER BY enrolled_count DESC
       LIMIT $${pi} OFFSET $${pi+1}`, params
    )
  },

  listAll: () =>
    db.queryAll(
      `SELECT c.*, cat.name AS category_name,
              (SELECT COUNT(*) FROM enrollments WHERE course_id=c.id) AS enrolled_count
       FROM courses c LEFT JOIN categories cat ON c.category_id=cat.id
       ORDER BY c.created_at DESC`
    ),

  create: ({ title, slug, description, categoryId, difficulty, durationHrs, thumbnailUrl, createdBy }) =>
    db.queryOne(
      `INSERT INTO courses (title,slug,description,category_id,difficulty,duration_hrs,thumbnail_url,created_by)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, slug, description, categoryId, difficulty, durationHrs, thumbnailUrl, createdBy]
    ),

  update: (id, fields) => {
    const sets = []
    const vals = []
    let pi = 1
    const map = { title:'title', description:'description', status:'status', difficulty:'difficulty', durationHrs:'duration_hrs', thumbnailUrl:'thumbnail_url' }
    for (const [k, col] of Object.entries(map)) {
      if (fields[k] !== undefined) { sets.push(`${col}=$${pi++}`); vals.push(fields[k]) }
    }
    if (!sets.length) return Promise.resolve(null)
    vals.push(id)
    return db.queryOne(`UPDATE courses SET ${sets.join(',')} WHERE id=$${pi} RETURNING *`, vals)
  },

  delete: (id) => db.query('DELETE FROM courses WHERE id=$1', [id]),

  getModulesWithLessons: (courseId) =>
    db.queryAll(
      `SELECT m.id, m.title, m.order_index,
              json_agg(
                json_build_object('id',l.id,'title',l.title,'type',l.type,
                  'duration_min',l.duration_min,'order_index',l.order_index)
                ORDER BY l.order_index
              ) FILTER (WHERE l.id IS NOT NULL) AS lessons
       FROM modules m
       LEFT JOIN lessons l ON l.module_id = m.id
       WHERE m.course_id = $1
       GROUP BY m.id ORDER BY m.order_index`, [courseId]
    ),

  getModules: (courseId) =>
    db.queryAll(
      `SELECT m.id, m.title, m.order_index
       FROM modules m
       WHERE m.course_id = $1
       ORDER BY m.order_index`, [courseId]
    ),

  getLessons: (moduleId) =>
    db.queryAll(
      `SELECT l.id, l.title, l.type, l.content, l.video_url, l.duration_min, l.order_index
       FROM lessons l
       WHERE l.module_id = $1
       ORDER BY l.order_index`, [moduleId]
    ),

  enrollStudent: (studentId, courseId) =>
    db.queryOne(
      `INSERT INTO enrollments (student_id, course_id)
       VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING *`, [studentId, courseId]
    ),

  getEnrollment: (studentId, courseId) =>
    db.queryOne(
      'SELECT * FROM enrollments WHERE student_id=$1 AND course_id=$2', [studentId, courseId]
    ),

  getStudentCourses: (studentId) =>
    db.queryAll(
      `SELECT c.id, c.title, c.slug, c.difficulty, c.duration_hrs,
              cat.name AS category_name, cat.color AS category_color,
              e.enrolled_at, e.completed_at,
              (SELECT COUNT(*) FROM lessons l
               JOIN modules m ON l.module_id=m.id WHERE m.course_id=c.id) AS total_lessons,
              (SELECT COUNT(*) FROM lesson_progress lp
               JOIN lessons l ON lp.lesson_id=l.id
               JOIN modules m ON l.module_id=m.id
               WHERE m.course_id=c.id AND lp.student_id=$1 AND lp.completed=true) AS completed_lessons
       FROM enrollments e
       JOIN courses c ON e.course_id=c.id
       LEFT JOIN categories cat ON c.category_id=cat.id
       WHERE e.student_id=$1
       ORDER BY e.enrolled_at DESC`, [studentId]
    ),

  markComplete: (studentId, courseId) =>
    db.queryOne(
      `UPDATE enrollments SET completed_at=NOW()
       WHERE student_id=$1 AND course_id=$2 AND completed_at IS NULL
       RETURNING *`, [studentId, courseId]
    ),

  getCategories: () => db.queryAll('SELECT * FROM categories ORDER BY name'),
}

module.exports = CourseRepo


// ─────────────────────────────────────────────────────────────
// src/repositories/mentorship.repo.js
const MentorshipRepo = {
  createRequest: (studentId, mentorId, message) =>
    db.queryOne(
      `INSERT INTO mentorship_requests (student_id, mentor_id, message)
       VALUES ($1,$2,$3) RETURNING *`, [studentId, mentorId, message || null]
    ),

  getRequest: (id) =>
    db.queryOne('SELECT * FROM mentorship_requests WHERE id=$1', [id]),

  getRequestByPair: (studentId, mentorId) =>
    db.queryOne(
      'SELECT * FROM mentorship_requests WHERE student_id=$1 AND mentor_id=$2',
      [studentId, mentorId]
    ),

  getMentorRequests: (mentorId, status) => {
    const conds = ['r.mentor_id=$1']
    const params = [mentorId]
    if (status) { conds.push(`r.status=$2`); params.push(status) }
    return db.queryAll(
      `SELECT r.*, u.full_name AS student_name, u.email AS student_email,
              u.country AS student_country, s.stem_interest, s.education_level
       FROM mentorship_requests r
       JOIN users u ON r.student_id=u.id
       LEFT JOIN students s ON s.id=u.id
       WHERE ${conds.join(' AND ')}
       ORDER BY r.created_at DESC`, params
    )
  },

  respondRequest: (id, status) =>
    db.queryOne(
      `UPDATE mentorship_requests SET status=$1, responded_at=NOW()
       WHERE id=$2 RETURNING *`, [status, id]
    ),

  activateMentorship: (studentId, mentorId) =>
    db.queryOne(
      `INSERT INTO mentorships (student_id, mentor_id)
       VALUES ($1,$2) ON CONFLICT (student_id,mentor_id)
       DO UPDATE SET is_active=true, started_at=NOW()
       RETURNING *`, [studentId, mentorId]
    ),

  getMentorStudents: (mentorId) =>
    db.queryAll(
      `SELECT u.id, u.full_name, u.email, u.country, u.avatar_url,
              s.stem_interest, s.education_level, ms.started_at
       FROM mentorships ms
       JOIN users u ON ms.student_id=u.id
       LEFT JOIN students s ON s.id=u.id
       WHERE ms.mentor_id=$1 AND ms.is_active=true
       ORDER BY ms.started_at DESC`, [mentorId]
    ),

  getStudentMentor: (studentId) =>
    db.queryOne(
      `SELECT u.id, u.full_name, u.email, u.country, u.avatar_url,
              m.expertise, m.biography, m.rating
       FROM mentorships ms
       JOIN users u ON ms.mentor_id=u.id
       LEFT JOIN mentors m ON m.id=u.id
       WHERE ms.student_id=$1 AND ms.is_active=true
       LIMIT 1`, [studentId]
    ),

  getActiveMentorships: () =>
    db.queryAll(
      `SELECT ms.*,
              s.full_name AS student_name, m.full_name AS mentor_name
       FROM mentorships ms
       JOIN users s ON ms.student_id=s.id
       JOIN users m ON ms.mentor_id=m.id
       WHERE ms.is_active=true`
    ),
}

module.exports.MentorshipRepo = MentorshipRepo


// ─────────────────────────────────────────────────────────────
// src/repositories/progress.repo.js
const ProgressRepo = {
  upsert: (studentId, lessonId, { completed, score }) =>
    db.queryOne(
      `INSERT INTO lesson_progress (student_id, lesson_id, completed, score, completed_at)
       VALUES ($1,$2,$3,$4, CASE WHEN $3 THEN NOW() ELSE NULL END)
       ON CONFLICT (student_id, lesson_id) DO UPDATE
         SET completed=$3, score=COALESCE($4,lesson_progress.score),
             completed_at=CASE WHEN $3 AND lesson_progress.completed=false THEN NOW()
                               ELSE lesson_progress.completed_at END
       RETURNING *`,
      [studentId, lessonId, completed, score ?? null]
    ),

  getForStudent: (studentId, courseId) =>
    db.queryAll(
      `SELECT lp.lesson_id, lp.completed, lp.score, lp.completed_at
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id=l.id
       JOIN modules m ON l.module_id=m.id
       WHERE lp.student_id=$1 AND m.course_id=$2`, [studentId, courseId]
    ),

  coursePercent: async (studentId, courseId) => {
    const row = await db.queryOne(
      `SELECT
         COUNT(l.id) AS total,
         COUNT(lp.lesson_id) FILTER (WHERE lp.completed=true) AS done
       FROM lessons l
       JOIN modules m ON l.module_id=m.id
       LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.student_id=$1
       WHERE m.course_id=$2`, [studentId, courseId]
    )
    if (!row || row.total === 0) return 0
    return Math.round((row.done / row.total) * 100)
  },

  getAllForMentor: (mentorId) =>
    db.queryAll(
      `SELECT u.id AS student_id, u.full_name AS student_name,
              c.id AS course_id, c.title AS course_title,
              COUNT(l.id) AS total_lessons,
              COUNT(lp.lesson_id) FILTER (WHERE lp.completed=true) AS done_lessons
       FROM mentorships ms
       JOIN users u ON ms.student_id=u.id
       JOIN enrollments e ON e.student_id=u.id
       JOIN courses c ON e.course_id=c.id
       JOIN modules m ON m.course_id=c.id
       JOIN lessons l ON l.module_id=m.id
       LEFT JOIN lesson_progress lp ON lp.lesson_id=l.id AND lp.student_id=u.id
       WHERE ms.mentor_id=$1 AND ms.is_active=true
       GROUP BY u.id, u.full_name, c.id, c.title
       ORDER BY u.full_name, c.title`, [mentorId]
    ),
}

module.exports.ProgressRepo = ProgressRepo


// ─────────────────────────────────────────────────────────────
// src/repositories/certificate.repo.js
const CertificateRepo = {
  create: (studentId, courseId, certNumber) =>
    db.queryOne(
      `INSERT INTO certificates (student_id, course_id, cert_number)
       VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING *`,
      [studentId, courseId, certNumber]
    ),

  findByStudent: (studentId) =>
    db.queryAll(
      `SELECT cert.*, c.title AS course_title, cat.name AS category_name
       FROM certificates cert
       JOIN courses c ON cert.course_id=c.id
       LEFT JOIN categories cat ON c.category_id=cat.id
       WHERE cert.student_id=$1 AND cert.status='issued'
       ORDER BY cert.issued_at DESC`, [studentId]
    ),

  findByCourseAndStudent: (studentId, courseId) =>
    db.queryOne(
      'SELECT * FROM certificates WHERE student_id=$1 AND course_id=$2',
      [studentId, courseId]
    ),

  findAll: ({ limit = 100, offset = 0 } = {}) =>
    db.queryAll(
      `SELECT cert.*, u.full_name AS student_name, c.title AS course_title
       FROM certificates cert
       JOIN users u ON cert.student_id=u.id
       JOIN courses c ON cert.course_id=c.id
       ORDER BY cert.issued_at DESC
       LIMIT $1 OFFSET $2`, [limit, offset]
    ),

  count: () =>
    db.queryOne('SELECT COUNT(*)::int AS total FROM certificates WHERE status=$1', ['issued']),
}

module.exports.CertificateRepo = CertificateRepo


// ─────────────────────────────────────────────────────────────
// src/repositories/message.repo.js
const MessageRepo = {
  create: (senderId, receiverId, content, type = 'text', fileUrl = null) =>
    db.queryOne(
      `INSERT INTO messages (sender_id, receiver_id, content, type, file_url)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [senderId, receiverId, content, type, fileUrl]
    ),

  getConversation: (userA, userB, { limit = 50, offset = 0 } = {}) =>
    db.queryAll(
      `SELECT m.*, u.full_name AS sender_name
       FROM messages m JOIN users u ON m.sender_id=u.id
       WHERE (m.sender_id=$1 AND m.receiver_id=$2)
          OR (m.sender_id=$2 AND m.receiver_id=$1)
       ORDER BY m.sent_at DESC
       LIMIT $3 OFFSET $4`,
      [userA, userB, limit, offset]
    ),

  getInbox: (userId) =>
    db.queryAll(
      `SELECT DISTINCT ON (other_id)
         other_id,
         other_name,
         last_message,
         last_sent_at,
         unread_count
       FROM (
         SELECT
           CASE WHEN m.sender_id=$1 THEN m.receiver_id ELSE m.sender_id END AS other_id,
           CASE WHEN m.sender_id=$1 THEN ru.full_name   ELSE su.full_name END AS other_name,
           m.content AS last_message,
           m.sent_at AS last_sent_at,
           COUNT(*) FILTER (WHERE m.receiver_id=$1 AND NOT m.is_read) AS unread_count
         FROM messages m
         JOIN users su ON m.sender_id=su.id
         JOIN users ru ON m.receiver_id=ru.id
         WHERE m.sender_id=$1 OR m.receiver_id=$1
         GROUP BY other_id, other_name, m.content, m.sent_at
       ) t
       ORDER BY other_id, last_sent_at DESC`,
      [userId]
    ),

  markRead: (senderId, receiverId) =>
    db.query(
      'UPDATE messages SET is_read=true WHERE sender_id=$1 AND receiver_id=$2 AND is_read=false',
      [senderId, receiverId]
    ),

  countUnread: (userId) =>
    db.queryOne(
      'SELECT COUNT(*)::int AS total FROM messages WHERE receiver_id=$1 AND is_read=false',
      [userId]
    ),
}

module.exports.MessageRepo = MessageRepo

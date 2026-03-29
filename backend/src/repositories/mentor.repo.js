// src/repositories/mentor.repo.js
const db = require('../db/QueryHelper')

const MentorRepo = {
  findById: (id) =>
    db.queryOne(
      `SELECT u.id, u.full_name, u.email, u.country, u.avatar_url, u.status,
              m.expertise, m.years_exp, m.biography, m.mentor_status,
              m.rating, m.total_reviews, m.max_students,
              m.cv_url, m.certificate_url, m.proof_url, m.approved_at
       FROM users u JOIN mentors m ON u.id = m.id
       WHERE u.id = $1`, [id]
    ),

  upsert: (id, { expertise, yearsExp, biography, cvUrl, certificateUrl, proofUrl }) =>
    db.queryOne(
      `INSERT INTO mentors (id, expertise, years_exp, biography, cv_url, certificate_url, proof_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE
         SET expertise=$2, years_exp=$3, biography=$4,
             cv_url=COALESCE($5,cv_url),
             certificate_url=COALESCE($6,certificate_url),
             proof_url=COALESCE($7,proof_url),
             updated_at=NOW()
       RETURNING *`,
      [id, expertise, yearsExp, biography, cvUrl, certificateUrl, proofUrl]
    ),

  approve: (id, adminId) =>
    db.queryOne(
      `UPDATE mentors SET mentor_status='approved', approved_by=$1, approved_at=NOW()
       WHERE id=$2 RETURNING *`, [adminId, id]
    ),

  reject: (id, adminId) =>
    db.queryOne(
      `UPDATE mentors SET mentor_status='rejected', approved_by=$1, approved_at=NOW()
       WHERE id=$2 RETURNING *`, [adminId, id]
    ),

  listApproved: ({ limit = 50, offset = 0 } = {}) =>
    db.queryAll(
      `SELECT u.id, u.full_name, u.email, u.country, u.avatar_url,
              m.expertise, m.years_exp, m.biography, m.rating, m.total_reviews, m.max_students,
              (SELECT COUNT(*) FROM mentorships ms WHERE ms.mentor_id=u.id AND ms.is_active) AS current_students
       FROM users u JOIN mentors m ON u.id = m.id
       WHERE m.mentor_status='approved' AND u.status='active'
       ORDER BY m.rating DESC, m.total_reviews DESC
       LIMIT $1 OFFSET $2`, [limit, offset]
    ),

  listPending: () =>
    db.queryAll(
      `SELECT u.id, u.full_name, u.email, u.country,
              m.expertise, m.years_exp, m.biography,
              m.cv_url, m.certificate_url, m.proof_url, m.mentor_status, u.created_at
       FROM users u JOIN mentors m ON u.id = m.id
       WHERE m.mentor_status='pending'
       ORDER BY u.created_at ASC`
    ),

  updateProfile: (id, { expertise, yearsExp, biography, maxStudents }) =>
    db.queryOne(
      `UPDATE mentors SET
         expertise    = COALESCE($1, expertise),
         years_exp    = COALESCE($2, years_exp),
         biography    = COALESCE($3, biography),
         max_students = COALESCE($4, max_students),
         updated_at   = NOW()
       WHERE id=$5 RETURNING *`,
      [expertise, yearsExp, biography, maxStudents, id]
    ),
}

module.exports = MentorRepo

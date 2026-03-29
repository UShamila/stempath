// src/repositories/student.repo.js
const db = require('../db/QueryHelper')

const StudentRepo = {
  findById: (id) =>
    db.queryOne(
      `SELECT u.id, u.full_name, u.email, u.country, u.status, u.created_at,
              s.education_level, s.stem_interest, s.bio
       FROM users u JOIN students s ON u.id = s.id
       WHERE u.id = $1`, [id]
    ),

  upsert: (id, { educationLevel, stemInterest, bio }) =>
    db.queryOne(
      `INSERT INTO students (id, education_level, stem_interest, bio)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (id) DO UPDATE
         SET education_level=$2, stem_interest=$3, bio=$4, updated_at=NOW()
       RETURNING *`,
      [id, educationLevel, stemInterest, bio]
    ),

  listAll: ({ limit = 50, offset = 0 } = {}) =>
    db.queryAll(
      `SELECT u.id, u.full_name, u.email, u.country, u.status,
              s.education_level, s.stem_interest, u.created_at
       FROM users u JOIN students s ON u.id = s.id
       WHERE u.status != 'banned'
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`, [limit, offset]
    ),
}

module.exports = StudentRepo

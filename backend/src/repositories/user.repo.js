// src/repositories/user.repo.js
const db = require('../db/QueryHelper')

const UserRepo = {
  findById: (id) =>
    db.queryOne('SELECT * FROM users WHERE id = $1', [id]),

  findByEmail: (email) =>
    db.queryOne('SELECT * FROM users WHERE email = $1', [email]),

  create: ({ fullName, email, passwordHash, role, country }) =>
    db.queryOne(
      `INSERT INTO users (full_name, email, password_hash, role, country)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [fullName, email, passwordHash, role, country || null]
    ),

  updateStatus: (id, status) =>
    db.queryOne('UPDATE users SET status=$1 WHERE id=$2 RETURNING *', [status, id]),

  updateProfile: (id, { fullName, country, avatarUrl, darkMode }) =>
    db.queryOne(
      `UPDATE users SET
         full_name  = COALESCE($1, full_name),
         country    = COALESCE($2, country),
         avatar_url = COALESCE($3, avatar_url),
         dark_mode  = COALESCE($4, dark_mode)
       WHERE id = $5 RETURNING id, full_name, email, role, country, avatar_url, dark_mode`,
      [fullName, country, avatarUrl, darkMode, id]
    ),

  updatePassword: (id, passwordHash) =>
    db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [passwordHash, id]),

  listAll: ({ role, status, limit = 50, offset = 0 } = {}) => {
    const conditions = []
    const params     = []
    let pi = 1
    if (role)   { conditions.push(`role = $${pi++}`);   params.push(role) }
    if (status) { conditions.push(`status = $${pi++}`); params.push(status) }
    params.push(limit, offset)
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    return db.queryAll(
      `SELECT id, full_name, email, role, status, country, created_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT $${pi} OFFSET $${pi + 1}`,
      params
    )
  },

  countAll: ({ role, status } = {}) => {
    const conditions = []
    const params = []
    let pi = 1
    if (role)   { conditions.push(`role = $${pi++}`);   params.push(role) }
    if (status) { conditions.push(`status = $${pi++}`); params.push(status) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    return db.queryOne(`SELECT COUNT(*)::int AS total FROM users ${where}`, params)
  },

  delete: (id) =>
    db.query('DELETE FROM users WHERE id = $1', [id]),
}

module.exports = UserRepo

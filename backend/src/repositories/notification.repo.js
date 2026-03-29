// src/repositories/notification.repo.js
const db = require('../db/QueryHelper')

const NotifRepo = {
  create: (userId, type, title, body = null, refId = null) =>
    db.queryOne(
      `INSERT INTO notifications (user_id, type, title, body, ref_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, type, title, body, refId]
    ),

  getForUser: (userId, { limit = 30, offset = 0 } = {}) =>
    db.queryAll(
      `SELECT * FROM notifications WHERE user_id=$1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    ),

  markRead: (id, userId) =>
    db.query(
      'UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2',
      [id, userId]
    ),

  markAllRead: (userId) =>
    db.query('UPDATE notifications SET is_read=true WHERE user_id=$1', [userId]),

  countUnread: (userId) =>
    db.queryOne(
      'SELECT COUNT(*)::int AS total FROM notifications WHERE user_id=$1 AND is_read=false',
      [userId]
    ),

  delete: (id, userId) =>
    db.query('DELETE FROM notifications WHERE id=$1 AND user_id=$2', [id, userId]),
}

module.exports = NotifRepo

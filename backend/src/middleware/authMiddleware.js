// src/middleware/authMiddleware.js
const { verifyJWT } = require('../utils/generateJWT')
const db = require('../db/QueryHelper')

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ error: 'Missing or invalid Authorization header' })

    const token = header.split(' ')[1]
    const payload = verifyJWT(token)

    // Fetch fresh user to ensure they haven't been banned/deleted since token was issued
    const user = await db.queryOne(
      'SELECT id, full_name, email, role, status FROM users WHERE id = $1',
      [payload.id]
    )
    if (!user)          return res.status(401).json({ error: 'User not found' })
    if (user.status === 'banned')   return res.status(403).json({ error: 'Account suspended' })
    if (user.status === 'inactive') return res.status(403).json({ error: 'Account inactive' })

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Token expired' })
    return res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = { authenticate }

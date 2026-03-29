// src/middleware/roleMiddleware.js

/** authorize(...roles) – pass one or more allowed roles */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ error: 'Not authenticated' })
  if (!roles.includes(req.user.role))
    return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` })
  next()
}

module.exports = { authorize }

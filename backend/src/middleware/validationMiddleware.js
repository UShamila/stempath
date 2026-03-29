// src/middleware/validationMiddleware.js
const { validationResult } = require('express-validator')

/** Run after express-validator chains; sends 422 if any errors */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() })
  next()
}

module.exports = { validate }

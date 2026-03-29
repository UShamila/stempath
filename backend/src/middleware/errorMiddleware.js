export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'Resource already exists.' })
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGN') {
    return res.status(400).json({ error: 'Invalid reference.' })
  }

  res.status(500).json({ error: 'Internal server error.' })
}

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    next()
  }
}
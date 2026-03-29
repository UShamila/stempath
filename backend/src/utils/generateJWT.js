// src/utils/generateJWT.js
const jwt = require('jsonwebtoken')

const generateJWT = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

const verifyJWT = (token) =>
  jwt.verify(token, process.env.JWT_SECRET)

module.exports = { generateJWT, verifyJWT }

// src/utils/fileUpload.js
const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

const UPLOAD_DIR   = path.join(__dirname, '../../uploads')
const MAX_SIZE_MB   = parseInt(process.env.MAX_FILE_SIZE_MB || '10')
const ALLOWED_MIME  = ['application/pdf','image/jpeg','image/png','image/webp']

// Ensure subdirs exist
;['cv','certificates','proofs','avatars'].forEach((dir) => {
  fs.mkdirSync(path.join(UPLOAD_DIR, dir), { recursive: true })
})

const storage = (subfolder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) =>
      cb(null, path.join(UPLOAD_DIR, subfolder)),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      cb(null, `${unique}${path.extname(file.originalname)}`)
    },
  })

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true)
  else cb(new Error(`Unsupported file type: ${file.mimetype}`), false)
}

const limits = { fileSize: MAX_SIZE_MB * 1024 * 1024 }

const uploadCV          = multer({ storage: storage('cv'),           fileFilter, limits })
const uploadCertificate = multer({ storage: storage('certificates'), fileFilter, limits })
const uploadProof       = multer({ storage: storage('proofs'),       fileFilter, limits })
const uploadAvatar      = multer({ storage: storage('avatars'),      fileFilter, limits })

/** Multi-field upload for mentor registration */
const uploadMentorDocs = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const map = { cv: 'cv', certificate: 'certificates', proof: 'proofs' }
      cb(null, path.join(UPLOAD_DIR, map[file.fieldname] || 'cv'))
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      cb(null, `${unique}${path.extname(file.originalname)}`)
    },
  }),
  fileFilter,
  limits,
}).fields([
  { name: 'cv',          maxCount: 1 },
  { name: 'certificate', maxCount: 1 },
  { name: 'proof',       maxCount: 1 },
])

module.exports = { uploadCV, uploadCertificate, uploadProof, uploadAvatar, uploadMentorDocs }

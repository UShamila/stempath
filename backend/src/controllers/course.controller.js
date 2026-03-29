// src/controllers/course.controller.js
const CourseRepo = require('../repositories/repos')   // CourseRepo is the default export
const db = require('../db/QueryHelper')

// GET /api/courses
const getCourses = async (req, res) => {
  try {
    const { categoryId, difficulty, limit = 50, offset = 0 } = req.query
    const courses = await CourseRepo.listPublished({ categoryId, difficulty, limit: parseInt(limit), offset: parseInt(offset) })
    res.json(courses)
  } catch (err) {
    console.error('getCourses:', err)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
}

// GET /api/courses/categories
const getCourseCategoriesHandler = async (req, res) => {
  try {
    const cats = await CourseRepo.getCategories()
    res.json(cats)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
}

// GET /api/courses/all – admin
const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseRepo.listAll()
    res.json(courses)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
}

// GET /api/courses/:idOrSlug
const getCourse = async (req, res) => {
  try {
    const { idOrSlug } = req.params
    const isUUID = /^[0-9a-f-]{36}$/i.test(idOrSlug)
    const course = isUUID ? await CourseRepo.findById(idOrSlug) : await CourseRepo.findBySlug(idOrSlug)
    if (!course) return res.status(404).json({ error: 'Course not found' })
    const modules = await CourseRepo.getModulesWithLessons(course.id)
    res.json({ ...course, modules })
  } catch (err) {
    console.error('getCourse:', err)
    res.status(500).json({ error: 'Failed to fetch course' })
  }
}

// POST /api/courses – admin
const createCourse = async (req, res) => {
  try {
    const { title, description, categoryId, difficulty, durationHrs, status } = req.body
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const thumbnailUrl = req.file?.path ?? null
    const course = await CourseRepo.create({ title, slug, description, categoryId, difficulty, durationHrs, thumbnailUrl, createdBy: req.user.id, status: status || 'draft' })
    res.status(201).json(course)
  } catch (err) {
    console.error('createCourse:', err)
    if (err.code === '23505') return res.status(409).json({ error: 'Course with this title already exists' })
    res.status(500).json({ error: 'Failed to create course' })
  }
}

// PATCH /api/courses/:id – admin
const updateCourse = async (req, res) => {
  try {
    const updated = await CourseRepo.update(req.params.id, req.body)
    if (!updated) return res.status(404).json({ error: 'Course not found' })
    res.json(updated)
  } catch (err) {
    console.error('updateCourse:', err)
    res.status(500).json({ error: 'Failed to update course' })
  }
}

// DELETE /api/courses/:id – admin
const deleteCourseHandler = async (req, res) => {
  try {
    await CourseRepo.delete(req.params.id)
    res.json({ message: 'Course deleted' })
  } catch (err) {
    console.error('deleteCourse:', err)
    res.status(500).json({ error: 'Failed to delete course' })
  }
}

// POST /api/courses/:id/enroll – student
const enroll = async (req, res) => {
  try {
    const { id: courseId } = req.params
    const studentId = req.user.id
    const course = await CourseRepo.findById(courseId)
    if (!course) return res.status(404).json({ error: 'Course not found' })
    const existing = await CourseRepo.getEnrollment(studentId, courseId)
    if (existing) return res.status(409).json({ error: 'Already enrolled in this course' })
    const enrollment = await CourseRepo.enrollStudent(studentId, courseId)
    res.status(201).json({ message: 'Enrolled successfully', enrollment })
  } catch (err) {
    console.error('enroll:', err)
    res.status(500).json({ error: 'Failed to enroll' })
  }
}

// GET /api/courses/my-courses – student
const getMyCourses = async (req, res) => {
  try {
    const courses = await CourseRepo.getStudentCourses(req.user.id)
    res.json(courses)
  } catch (err) {
    console.error('getMyCourses:', err)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
}

// GET /api/modules?courseId=...
const getModules = async (req, res) => {
  try {
    const { courseId } = req.query
    if (!courseId) return res.status(400).json({ error: 'courseId required' })
    const modules = await CourseRepo.getModules(courseId)
    res.json(modules)
  } catch (err) {
    console.error('getModules:', err)
    res.status(500).json({ error: 'Failed to fetch modules' })
  }
}

// GET /api/lessons?moduleId=...
const getLessons = async (req, res) => {
  try {
    const { moduleId } = req.query
    if (!moduleId) return res.status(400).json({ error: 'moduleId required' })
    const lessons = await CourseRepo.getLessons(moduleId)
    res.json(lessons)
  } catch (err) {
    console.error('getLessons:', err)
    res.status(500).json({ error: 'Failed to fetch lessons' })
  }
}

module.exports = { getCourses, getCourseCategoriesHandler, getAllCourses, getCourse, createCourse, updateCourse, deleteCourseHandler, enroll, getMyCourses, getModules, getLessons }

// Course Repository
// Database operations for courses

const { query } = require('../db/connection');

class CourseRepository {
  async createCourse(courseData) {
    try {
      const { name, description, category, level, duration, lesson_count } = courseData;
      const result = await query(
        `INSERT INTO courses (name, description, category, level, duration, lesson_count)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, description, category, level, duration, lesson_count]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to create course: ' + error.message);
    }
  }

  async getAllCourses() {
    try {
      const result = await query(
        'SELECT * FROM courses WHERE is_active = true ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch courses: ' + error.message);
    }
  }

  async getCourseById(courseId) {
    try {
      const result = await query(
        'SELECT * FROM courses WHERE id = $1',
        [courseId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Failed to fetch course: ' + error.message);
    }
  }

  async enrollStudent(studentId, courseId) {
    try {
      const result = await query(
        'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
        [studentId, courseId]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to enroll student: ' + error.message);
    }
  }

  async getStudentEnrollments(studentId) {
    try {
      const result = await query(
        `SELECT c.*, e.id as enrollment_id, e.progress_percentage, e.enrolled_at, e.completed_at
         FROM courses c
         JOIN enrollments e ON c.id = e.course_id
         WHERE e.student_id = $1`,
        [studentId]
      );
      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch enrollments: ' + error.message);
    }
  }

  async getLessonsByCourseId(courseId) {
    try {
      const result = await query(
        'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_position ASC',
        [courseId]
      );
      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch lessons: ' + error.message);
    }
  }
}

module.exports = new CourseRepository();

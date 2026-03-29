// Admin Controller
// Handles admin operations

const pool = require('../db/connection');

class AdminController {
  async getDashboard(req, res) {
    try {
      const userQuery = `
        SELECT
          COUNT(*) AS total_users,
          COUNT(CASE WHEN role = 'student' THEN 1 END) AS total_students,
          COUNT(CASE WHEN role = 'mentor' THEN 1 END) AS total_mentors,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) AS total_admins
        FROM users
      `;
      const userResult = await pool.query(userQuery);
      const userAnalytics = userResult.rows[0];

      const courseQuery = `SELECT COUNT(*) AS total_courses FROM courses`;
      const courseResult = await pool.query(courseQuery);
      const totalCourses = courseResult.rows[0].total_courses;

      const mentorshipQuery = `
        SELECT
          COUNT(*) AS total_mentorships,
          COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_mentorships,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_requests
        FROM mentorship_requests
      `;
      const mentorshipResult = await pool.query(mentorshipQuery);
      const mentorshipAnalytics = mentorshipResult.rows[0];

      const pendingMentorsQuery = `
        SELECT COUNT(*) AS pending_mentors FROM mentors WHERE approval_status = 'pending'
      `;
      const pendingMentorsResult = await pool.query(pendingMentorsQuery);
      const pendingMentors = pendingMentorsResult.rows[0].pending_mentors;

      res.status(200).json({
        success: true,
        data: {
          userAnalytics: {
            totalUsers: Number(userAnalytics.total_users),
            totalStudents: Number(userAnalytics.total_students),
            totalMentors: Number(userAnalytics.total_mentors),
            totalAdmins: Number(userAnalytics.total_admins)
          },
          learningAnalytics: {
            totalCourses: Number(totalCourses),
            courseCompletionRate: 0,
            mostPopularCourses: []
          },
          mentorshipAnalytics: {
            totalMentorships: Number(mentorshipAnalytics.total_mentorships),
            activeMentorships: Number(mentorshipAnalytics.active_mentorships),
            pendingRequests: Number(mentorshipAnalytics.pending_requests),
            pendingMentorApprovals: Number(pendingMentors)
          }
        }
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const { role, status } = req.query;

      let query = `
        SELECT u.id, u.email, u.role, u.created_at,
          COALESCE(s.full_name, m.full_name, 'Admin') AS full_name,
          m.approval_status AS mentor_status
        FROM users u
        LEFT JOIN students s ON s.user_id = u.id
        LEFT JOIN mentors m ON m.user_id = u.id
      `;

      const conditions = [];
      const values = [];

      if (role) {
        conditions.push(`u.role = $${conditions.length + 1}`);
        values.push(role);
      }

      if (status && role === 'mentor') {
        conditions.push(`m.approval_status = $${conditions.length + 1}`);
        values.push(status);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY u.created_at DESC';

      const result = await pool.query(query, values);

      res.status(200).json({
        success: true,
        users: result.rows
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getCourses(req, res) {
    try {
      const query = `
        SELECT c.id, c.name, c.description, c.category, c.level, c.duration,
          c.lesson_count, c.is_active, c.created_at, c.updated_at,
          u.full_name AS created_by_name,
          COUNT(e.id) AS enrolled_count
        FROM courses c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN enrollments e ON e.course_id = c.id
        GROUP BY c.id, u.full_name
        ORDER BY c.created_at DESC
      `;
      const result = await pool.query(query);
      res.status(200).json({ success: true, courses: result.rows });
    } catch (error) {
      console.error('Get courses error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createCourse(req, res) {
    try {
      const { name, description, category, level, duration, lesson_count } = req.body;
      const createdBy = req.user.id;
      const query = `
        INSERT INTO courses (name, description, category, level, duration, lesson_count, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const result = await pool.query(query, [name, description, category, level, duration, lesson_count, createdBy]);
      res.status(201).json({ success: true, message: 'Course created successfully', course: result.rows[0] });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateCourse(req, res) {
    try {
      const { courseId } = req.params;
      const { name, description, category, level, duration, lesson_count } = req.body;
      const query = `
        UPDATE courses
        SET name = $1, description = $2, category = $3, level = $4, duration = $5, lesson_count = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `;
      const result = await pool.query(query, [name, description, category, level, duration, lesson_count, courseId]);
      if (!result.rows.length) return res.status(404).json({ success: false, message: 'Course not found' });
      res.status(200).json({ success: true, message: 'Course updated successfully', course: result.rows[0] });
    } catch (error) {
      console.error('Update course error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteCourse(req, res) {
    try {
      const { courseId } = req.params;
      const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [courseId]);
      if (!result.rows.length) return res.status(404).json({ success: false, message: 'Course not found' });
      res.status(200).json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Delete course error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPendingMentors(req, res) {
    try {
      const query = `
        SELECT m.id, m.user_id, m.full_name, m.expertise, m.years_experience, m.biography, m.approval_status,
          u.email, u.created_at
        FROM mentors m
        JOIN users u ON u.id = m.user_id
        WHERE m.approval_status = 'pending'
        ORDER BY m.created_at DESC
      `;
      const result = await pool.query(query);
      res.status(200).json({ success: true, mentors: result.rows });
    } catch (error) {
      console.error('Get pending mentors error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async approveMentor(req, res) {
    try {
      const { mentorId } = req.params;
      const result = await pool.query(
        `UPDATE mentors SET approval_status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [mentorId]
      );
      if (!result.rows.length) return res.status(404).json({ success: false, message: 'Mentor not found' });
      res.status(200).json({ success: true, message: 'Mentor approved successfully' });
    } catch (error) {
      console.error('Approve mentor error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async rejectMentor(req, res) {
    try {
      const { mentorId } = req.params;
      const result = await pool.query(
        `UPDATE mentors SET approval_status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [mentorId]
      );
      if (!result.rows.length) return res.status(404).json({ success: false, message: 'Mentor not found' });
      res.status(200).json({ success: true, message: 'Mentor application rejected successfully' });
    } catch (error) {
      console.error('Reject mentor error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AdminController();

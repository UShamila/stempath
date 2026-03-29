// Student Controller
// Handles student-specific operations

const studentRepository = require('../repositories/student.repo');
const courseRepository = require('../repositories/course.repo');
const mentorRepository = require('../repositories/mentor.repo');

class StudentController {
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;
      
      // Fetch student profile
      const student = await studentRepository.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // Fetch student's courses
      const courses = await studentRepository.getStudentCourses(student.id);
      
      // Fetch student's certificates
      const certificates = await studentRepository.getStudentCertificates(student.id);
      
      // Calculate progress statistics
      const completedCourses = courses.filter(c => c.completed_at).length;
      const inProgressCourses = courses.filter(c => !c.completed_at).length;
      const avgProgress = courses.length > 0 
        ? Math.round(courses.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / courses.length)
        : 0;
      
      res.status(200).json({
        success: true,
        message: 'Student dashboard retrieved',
        data: {
          student,
          coursesInProgress: inProgressCourses,
          completedCourses,
          averageProgress: avgProgress,
          certificatesEarned: certificates.length,
          recentCourses: courses.slice(0, 5),
          certificates: certificates.slice(0, 5)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async browseMentors(req, res) {
    try {
      // Fetch approved mentors
      const mentors = await mentorRepository.getApprovedMentors();
      
      res.status(200).json({
        success: true,
        message: 'Available mentors retrieved',
        data: mentors
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async requestMentorship(req, res) {
    try {
      const { mentorId } = req.body;
      const userId = req.user.id;

      // Get student profile
      const student = await studentRepository.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // TODO: Create mentorship request in database
      // For now, return success message
      res.status(201).json({
        success: true,
        message: 'Mentorship request sent to mentor'
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMyCourses(req, res) {
    try {
      const userId = req.user.id;
      
      // Get student profile
      const student = await studentRepository.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // Fetch all courses for this student
      const courses = await studentRepository.getStudentCourses(student.id);
      
      res.status(200).json({
        success: true,
        data: courses
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getCertificates(req, res) {
    try {
      const userId = req.user.id;
      
      // Get student profile
      const student = await studentRepository.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // Fetch all certificates for this student
      const certificates = await studentRepository.getStudentCertificates(student.id);
      
      res.status(200).json({
        success: true,
        data: certificates
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getProgress(req, res) {
    try {
      const userId = req.user.id;
      
      // Get student profile
      const student = await studentRepository.getStudentByUserId(userId);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      // Fetch student's courses
      const courses = await studentRepository.getStudentCourses(student.id);
      
      // Calculate detailed progress
      const progress = {
        totalCourses: courses.length,
        completedCourses: courses.filter(c => c.completed_at).length,
        inProgressCourses: courses.filter(c => !c.completed_at).length,
        averageProgress: courses.length > 0 
          ? Math.round(courses.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / courses.length)
          : 0,
        courseDetails: courses.map(c => ({
          id: c.id,
          name: c.name,
          progress: c.progress_percentage,
          completed: !!c.completed_at
        }))
      };
      
      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new StudentController();

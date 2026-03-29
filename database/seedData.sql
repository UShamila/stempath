-- ═══════════════════════════════════════════════════════════
--  STEMPath Seed Data
--  Passwords are all:  password123  (bcrypt hashed)
-- ═══════════════════════════════════════════════════════════

-- ── CATEGORIES ───────────────────────────────────────────────
INSERT INTO categories (name, slug, color) VALUES
  ('Web Development',    'web-development',    '#00E5B0'),
  ('Backend Engineering','backend-engineering', '#38BDF8'),
  ('Data Science',       'data-science',        '#FFB547'),
  ('Cybersecurity',      'cybersecurity',        '#F472B6'),
  ('AI & Machine Learning','ai-ml',             '#A78BFA'),
  ('Mobile Development', 'mobile-development',  '#34D399'),
  ('Cloud & DevOps',     'cloud-devops',         '#60A5FA');

-- ── ADMIN USER ───────────────────────────────────────────────
INSERT INTO users (id, full_name, email, password_hash, role, status, country) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'STEMPath Admin', 'admin@stempath.io',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uJkG',
   'admin', 'active', 'Rwanda');

-- ── MENTOR USERS ─────────────────────────────────────────────
INSERT INTO users (id, full_name, email, password_hash, role, status, country) VALUES
  ('00000000-0000-0000-0000-000000000010',
   'Dr. Amara Diallo', 'amara@stempath.io',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uJkG',
   'mentor', 'active', 'Senegal'),

  ('00000000-0000-0000-0000-000000000011',
   'Fatima Al-Rashid', 'fatima@stempath.io',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uJkG',
   'mentor', 'active', 'Morocco'),

  ('00000000-0000-0000-0000-000000000012',
   'Chioma Okafor', 'chioma@stempath.io',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uJkG',
   'mentor', 'active', 'Nigeria'),

  ('00000000-0000-0000-0000-000000000013',
   'Yewande Adeyemi', 'yewande@stempath.io',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uJkG',
   'mentor', 'active', 'Nigeria');

INSERT INTO mentors (id, expertise, years_exp, biography, mentor_status, rating, total_reviews, max_students) VALUES
  ('00000000-0000-0000-0000-000000000010',
   'Backend & Systems', 10,
   '10+ years building large-scale distributed systems at Google. Passionate about helping women break into tech.',
   'approved', 4.9, 48, 15),

  ('00000000-0000-0000-0000-000000000011',
   'AI & Machine Learning', 8,
   'Kaggle Grandmaster. Research background in NLP. Helping students build solid ML foundations.',
   'approved', 4.8, 35, 12),

  ('00000000-0000-0000-0000-000000000012',
   'Cybersecurity', 9,
   'CEH certified. Built security programs at Fortune 500 companies. Mentor of the year 2023.',
   'approved', 5.0, 22, 10),

  ('00000000-0000-0000-0000-000000000013',
   'Web Development', 7,
   'Led frontend teams at 2 unicorn startups. Passionate about accessible, beautiful web design.',
   'approved', 4.9, 61, 20);

-- ── STUDENT USERS ────────────────────────────────────────────
INSERT INTO users (id, full_name, email, password_hash, role, status, country) VALUES
  ('00000000-0000-0000-0000-000000000020',
   'Amina Konate', 'amina@example.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uJkG',
   'student', 'active', 'Senegal'),

  ('00000000-0000-0000-0000-000000000021',
   'Grace Mensah', 'grace@example.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uJkG',
   'student', 'active', 'Ghana'),

  ('00000000-0000-0000-0000-000000000022',
   'Ngozi Eze', 'ngozi@example.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uJkG',
   'student', 'active', 'Nigeria');

INSERT INTO students (id, education_level, stem_interest, bio) VALUES
  ('00000000-0000-0000-0000-000000000020', 'Undergraduate',  'Backend Engineering', 'Aspiring backend developer from Dakar.'),
  ('00000000-0000-0000-0000-000000000021', 'Graduate',       'Data Science',         'Studying data science to help African businesses.'),
  ('00000000-0000-0000-0000-000000000022', 'Bootcamp Graduate','Web Development',    'Self-taught web dev looking to go pro.');

-- ── COURSES ──────────────────────────────────────────────────
INSERT INTO courses (id, title, slug, description, category_id, difficulty, duration_hrs, status, created_by) VALUES
  ('10000000-0000-0000-0000-000000000001',
   'HTML & CSS Foundations', 'html-css-foundations',
   'Master the building blocks of the web. Learn semantic HTML, modern CSS, Flexbox, Grid, and responsive design.',
   1, 'beginner', 20, 'published', '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000002',
   'JavaScript Essentials', 'javascript-essentials',
   'From variables to async/await — a complete JS foundation for aspiring developers.',
   1, 'beginner', 30, 'published', '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000003',
   'Node.js Mastery', 'nodejs-mastery',
   'Build fast, scalable server-side apps using Node.js. File system, streams, events, and more.',
   2, 'intermediate', 25, 'published', '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000004',
   'Express.js & REST APIs', 'expressjs-rest-apis',
   'Design and build production-grade REST APIs with Express, middleware, and best practices.',
   2, 'intermediate', 20, 'published', '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000005',
   'SQL & Database Design', 'sql-database-design',
   'Learn PostgreSQL from scratch — queries, joins, indexes, normalization, and schema design.',
   2, 'beginner', 22, 'published', '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000006',
   'Python Fundamentals', 'python-fundamentals',
   'Write clean, efficient Python code. Perfect first step for data science and AI paths.',
   3, 'beginner', 18, 'published', '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000007',
   'Machine Learning Basics', 'machine-learning-basics',
   'Understand supervised, unsupervised learning, model evaluation, and scikit-learn.',
   5, 'intermediate', 35, 'published', '00000000-0000-0000-0000-000000000001'),

  ('10000000-0000-0000-0000-000000000008',
   'Cybersecurity Fundamentals', 'cybersecurity-fundamentals',
   'Network security, cryptography, ethical hacking concepts, and common attack vectors.',
   4, 'beginner', 28, 'published', '00000000-0000-0000-0000-000000000001');

-- ── ENROLLMENTS ──────────────────────────────────────────────
INSERT INTO enrollments (student_id, course_id) VALUES
  ('00000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000007'),
  ('00000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000002');

-- ── MENTORSHIPS ──────────────────────────────────────────────
INSERT INTO mentorships (student_id, mentor_id) VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000011'),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000013');

-- ── FORUM POSTS ──────────────────────────────────────────────
INSERT INTO forum_posts (author_id, title, body, tag, likes) VALUES
  ('00000000-0000-0000-0000-000000000020',
   'How do I understand async/await in JavaScript?',
   'I keep getting confused between callbacks, promises and async/await. Can someone explain the difference with a clear example?',
   'JavaScript', 34),
  ('00000000-0000-0000-0000-000000000021',
   'Tips for passing the SQL certification quiz?',
   'I have been studying SQL for 3 weeks and taking the certification quiz soon. Any tips on joins and subqueries?',
   'Databases', 27),
  ('00000000-0000-0000-0000-000000000022',
   'My first React project — feedback welcome!',
   'I just finished my first React project — a task manager app. Here is the GitHub link. Any feedback from mentors or peers would be great!',
   'Web Dev', 58);

-- ═══════════════════════════════════════════════════════════
--  STEMPath Database Schema
--  PostgreSQL 14+
-- ═══════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUMS ────────────────────────────────────────────────────
CREATE TYPE user_role        AS ENUM ('student','mentor','admin');
CREATE TYPE user_status      AS ENUM ('active','inactive','banned','pending');
CREATE TYPE mentor_status    AS ENUM ('pending','approved','rejected');
CREATE TYPE request_status   AS ENUM ('pending','accepted','rejected');
CREATE TYPE course_status    AS ENUM ('draft','published','archived');
CREATE TYPE difficulty       AS ENUM ('beginner','intermediate','advanced');
CREATE TYPE cert_status      AS ENUM ('issued','revoked');
CREATE TYPE notif_type       AS ENUM ('mentor_request','request_accepted','request_rejected','new_message','course_complete','cert_issued','mentor_approved','general');
CREATE TYPE message_type     AS ENUM ('text','resource','file');

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     VARCHAR(120)  NOT NULL,
  email         VARCHAR(200)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          user_role     NOT NULL DEFAULT 'student',
  status        user_status   NOT NULL DEFAULT 'active',
  avatar_url    TEXT,
  country       VARCHAR(80),
  dark_mode     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ── STUDENTS ─────────────────────────────────────────────────
CREATE TABLE students (
  id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  education_level VARCHAR(80),
  stem_interest   VARCHAR(120),
  bio             TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── MENTORS ──────────────────────────────────────────────────
CREATE TABLE mentors (
  id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  expertise       VARCHAR(120)  NOT NULL,
  years_exp       SMALLINT      NOT NULL DEFAULT 0,
  biography       TEXT,
  mentor_status   mentor_status NOT NULL DEFAULT 'pending',
  rating          NUMERIC(3,2)  DEFAULT 0,
  total_reviews   INTEGER       DEFAULT 0,
  max_students    SMALLINT      DEFAULT 10,
  cv_url          TEXT,
  certificate_url TEXT,
  proof_url       TEXT,
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mentors_status  ON mentors(mentor_status);
CREATE INDEX idx_mentors_rating  ON mentors(rating DESC);

-- ── MENTORSHIP REQUESTS ──────────────────────────────────────
CREATE TABLE mentorship_requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      request_status NOT NULL DEFAULT 'pending',
  message     TEXT,
  responded_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, mentor_id)
);

CREATE INDEX idx_mr_mentor  ON mentorship_requests(mentor_id, status);
CREATE INDEX idx_mr_student ON mentorship_requests(student_id);

-- ── MENTORSHIP (active relationships) ───────────────────────
CREATE TABLE mentorships (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at    TIMESTAMPTZ,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(student_id, mentor_id)
);

CREATE INDEX idx_ments_mentor  ON mentorships(mentor_id, is_active);
CREATE INDEX idx_ments_student ON mentorships(student_id, is_active);

-- ── COURSE CATEGORIES ────────────────────────────────────────
CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(80) NOT NULL UNIQUE,
  slug  VARCHAR(80) NOT NULL UNIQUE,
  color VARCHAR(20) DEFAULT '#00E5B0'
);

-- ── COURSES ──────────────────────────────────────────────────
CREATE TABLE courses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         VARCHAR(200)  NOT NULL,
  slug          VARCHAR(200)  NOT NULL UNIQUE,
  description   TEXT,
  category_id   INTEGER REFERENCES categories(id),
  difficulty    difficulty    NOT NULL DEFAULT 'beginner',
  duration_hrs  SMALLINT,
  thumbnail_url TEXT,
  status        course_status NOT NULL DEFAULT 'draft',
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_status   ON courses(status);
CREATE INDEX idx_courses_category ON courses(category_id);

-- ── COURSE MODULES ───────────────────────────────────────────
CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  order_index SMALLINT     NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── LESSONS ──────────────────────────────────────────────────
CREATE TYPE lesson_type AS ENUM ('video','reading','exercise','quiz');

CREATE TABLE lessons (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id    UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  type         lesson_type  NOT NULL DEFAULT 'video',
  content      TEXT,                        -- markdown / embed URL
  video_url    TEXT,
  duration_min SMALLINT,
  order_index  SMALLINT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── QUIZ QUESTIONS ───────────────────────────────────────────
CREATE TABLE quiz_questions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL,               -- ["A","B","C","D"]
  answer_idx  SMALLINT NOT NULL,            -- 0-based index
  explanation TEXT,
  order_index SMALLINT NOT NULL
);

-- ── ENROLLMENTS ──────────────────────────────────────────────
CREATE TABLE enrollments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_enroll_student ON enrollments(student_id);
CREATE INDEX idx_enroll_course  ON enrollments(course_id);

-- ── LESSON PROGRESS ──────────────────────────────────────────
CREATE TABLE lesson_progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN     NOT NULL DEFAULT FALSE,
  score        SMALLINT,                    -- quiz score 0-100
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

CREATE INDEX idx_lp_student ON lesson_progress(student_id);

-- ── CERTIFICATES ─────────────────────────────────────────────
CREATE TABLE certificates (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  cert_number  VARCHAR(40) NOT NULL UNIQUE,
  status       cert_status NOT NULL DEFAULT 'issued',
  issued_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_certs_student ON certificates(student_id);

-- ── MESSAGES ─────────────────────────────────────────────────
CREATE TABLE messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content      TEXT         NOT NULL,
  type         message_type NOT NULL DEFAULT 'text',
  file_url     TEXT,
  is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
  sent_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_msg_sender   ON messages(sender_id);
CREATE INDEX idx_msg_receiver ON messages(receiver_id, is_read);
CREATE INDEX idx_msg_conv     ON messages(LEAST(sender_id,receiver_id), GREATEST(sender_id,receiver_id));

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       notif_type NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  ref_id     UUID,                           -- related entity id
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id, is_read, created_at DESC);

-- ── MENTOR REVIEWS ───────────────────────────────────────────
CREATE TABLE mentor_reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id, student_id)
);

-- ── FORUM POSTS ──────────────────────────────────────────────
CREATE TABLE forum_posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(300) NOT NULL,
  body        TEXT         NOT NULL,
  tag         VARCHAR(60),
  likes       INTEGER      NOT NULL DEFAULT 0,
  is_pinned   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fp_author  ON forum_posts(author_id);
CREATE INDEX idx_fp_tag     ON forum_posts(tag);
CREATE INDEX idx_fp_created ON forum_posts(created_at DESC);

-- ── FORUM REPLIES ────────────────────────────────────────────
CREATE TABLE forum_replies (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id   UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body      TEXT NOT NULL,
  likes     INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fr_post ON forum_replies(post_id, created_at);

-- ── AUTO-UPDATE updated_at TRIGGER ───────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_courses_updated  BEFORE UPDATE ON courses  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_fp_updated       BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RATING RECALC TRIGGER ────────────────────────────────────
CREATE OR REPLACE FUNCTION recalc_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mentors
  SET rating = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM mentor_reviews WHERE mentor_id = NEW.mentor_id),
      total_reviews = (SELECT COUNT(*) FROM mentor_reviews WHERE mentor_id = NEW.mentor_id)
  WHERE id = NEW.mentor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mentor_rating
AFTER INSERT OR UPDATE OR DELETE ON mentor_reviews
FOR EACH ROW EXECUTE FUNCTION recalc_mentor_rating();

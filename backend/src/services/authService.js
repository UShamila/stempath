// src/services/authService.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db/connection"); // use connection helper


// Register student
// Accepts either snake_case or camelCase fields from the caller.  The
// front‑end currently sends camelCase values so we normalise here.
exports.registerStudent = async (data) => {
  const {
    email,
    password,
    // support both styles
    full_name,
    fullName,
    education_level,
    educationLevel,
    country,
    stemInterests
  } = data;

  const nameToUse = full_name || fullName || null;
  const eduToUse = education_level || educationLevel || null;

  if (!email || !password || !nameToUse) {
    throw new Error('Missing required registration fields');
  }

  // hash password
  const password_hash = await bcrypt.hash(password, 10);

  // insert user
  const userResult = await db.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1,$2,'student')
     RETURNING id`,
    [email, password_hash]
  );

  const userId = userResult.rows[0].id;

  // insert student; include stemInterests if provided
  const insertColumns = ['user_id', 'full_name', 'education_level', 'country'];
  const insertValues = [userId, nameToUse, eduToUse, country];
  let placeholderIdx = 5;

  if (stemInterests) {
    insertColumns.push('stem_interests');
    insertValues.push(stemInterests);
    placeholderIdx = 6;
  }

  const placeholders = insertColumns.map((_, i) => `$${i + 1}`).join(',');

  await db.query(
    `INSERT INTO students (${insertColumns.join(',')})
     VALUES (${placeholders})`,
    insertValues
  );

  return { message: "Student registered successfully" };
};

// Login
// now takes an additional `role` argument so callers can assert the
// user is signing in with the expected role.  The returned object
// includes the user record (sans password hash) so the front‑end can
// persist it in the auth context.
exports.login = async (email, password, role) => {
  const result = await db.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  // make sure the requested role matches the stored role
  if (role && user.role !== role) {
    throw new Error("Invalid role or unauthorized");
  }

  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // only expose non-sensitive fields in the user object
  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  return { token, user: safeUser };
};

// Register mentor
exports.registerMentor = async (data) => {
  const {
    email,
    password,
    fullName,
    expertise,
    years_experience,
    biography,
    files
  } = data;

  if (!email || !password || !fullName || !expertise) {
    throw new Error('Missing required registration fields');
  }

  // hash password
  const password_hash = await bcrypt.hash(password, 10);

  try {
    // insert user with mentor role
    const userResult = await db.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1,$2,'mentor')
       RETURNING id`,
      [email, password_hash]
    );

    const userId = userResult.rows[0].id;

    // insert mentor record
    const mentorResult = await db.query(
      `INSERT INTO mentors (user_id, full_name, expertise, years_experience, biography, approval_status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, full_name, expertise`,
      [userId, fullName, expertise, years_experience || null, biography || null]
    );

    // TODO: Handle file uploads for documents if files are provided
    // For now, we store the mentor record and files can be handled separately

    return {
      mentor: mentorResult.rows[0],
      message: "Mentor registration successful. Awaiting admin approval."
    };
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};
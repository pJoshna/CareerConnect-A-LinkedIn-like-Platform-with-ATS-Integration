const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 5000;

// Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite DB
const db = new sqlite3.Database('./jobs.db', (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database.');
  }
});

// Create tables if they don't exist
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT,
  fullname TEXT,
  college TEXT,
  percentage REAL,
  intermarks REAL,
  tenthmarks REAL,
  passout_year INTEGER,
  resume_path TEXT,
  ats_score INTEGER DEFAULT 0
);`;

const createJobsTable = `
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  skills TEXT,
  recruiter_id INTEGER,
  FOREIGN KEY(recruiter_id) REFERENCES users(id)
);`;

const createApplicationsTable = `
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  job_id INTEGER,
  status TEXT DEFAULT 'pending',
  ats_score INTEGER,
  verified INTEGER DEFAULT 0,
  FOREIGN KEY(student_id) REFERENCES users(id),
  FOREIGN KEY(job_id) REFERENCES jobs(id)
);`;

const createInterviewsTable = `
CREATE TABLE IF NOT EXISTS interviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  job_id INTEGER,
  interview_date TEXT,
  FOREIGN KEY(student_id) REFERENCES users(id),
  FOREIGN KEY(job_id) REFERENCES jobs(id)
);`;

db.serialize(() => {
  db.run(createUsersTable);
  db.run(createJobsTable);
  db.run(createApplicationsTable);
  db.run(createInterviewsTable);
});

// === API ROUTES ===

// Signup route
app.post('/signup', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'All fields required: username, password, role' });
  }
  const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
  db.run(sql, [username, password, role], function (err) {
    if (err) {
      return res.status(400).json({ error: 'Username already exists or other DB error' });
    }
    res.json({ id: this.lastID, username, role });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const sql = `SELECT id, username, role FROM users WHERE username = ? AND password = ?`;
  db.get(sql, [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful', user: row });
  });
});

// Post a new job
app.post('/post-job', (req, res) => {
  const { title, description, skills, recruiter_id } = req.body;
  if (!title || !description || !skills || !recruiter_id) {
    return res.status(400).json({ error: 'All fields required' });
  }
  const sql = `INSERT INTO jobs (title, description, skills, recruiter_id) VALUES (?, ?, ?, ?)`;
  db.run(sql, [title, description, skills, recruiter_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Job posted successfully', jobId: this.lastID });
  });
});

// Get jobs by recruiter
app.get('/my-jobs/:recruiter_id', (req, res) => {
  const { recruiter_id } = req.params;
  db.all('SELECT * FROM jobs WHERE recruiter_id = ?', [recruiter_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get all jobs or filter by skill query param
app.get('/jobs', (req, res) => {
  const { skill } = req.query;
  if (skill) {
    db.all('SELECT * FROM jobs WHERE skills LIKE ?', [`%${skill}%`], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    db.all('SELECT * FROM jobs', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

// Apply to a job
app.post('/apply', (req, res) => {
  const { student_id, job_id } = req.body;
  if (!student_id || !job_id) {
    return res.status(400).json({ error: 'student_id and job_id required' });
  }

  // Get ATS score from user profile
  db.get('SELECT ats_score FROM users WHERE id = ?', [student_id], (err, user) => {
    if (err) return res.status(500).json({ error: 'DB error fetching ATS score' });
    if (!user) return res.status(404).json({ error: 'Student not found' });

    // Insert application with ats_score
    const sql = `INSERT INTO applications (student_id, job_id, ats_score) VALUES (?, ?, ?)`;
    db.run(sql, [student_id, job_id, user.ats_score], function (err) {
      if (err) {
        return res.status(400).json({ error: 'Already applied or DB error' });
      }
      res.json({ message: 'Application submitted successfully', applicationId: this.lastID });
    });
  });
});

// Get applicants for a job (student basic info)
app.get('/job/:jobId/applicants', (req, res) => {
  const { jobId } = req.params;
  const sql = `
    SELECT u.id, u.username, u.fullname, u.college, u.ats_score, a.status, a.verified
    FROM applications a
    JOIN users u ON a.student_id = u.id
    WHERE a.job_id = ?`;
  db.all(sql, [jobId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get all applications for recruiter's jobs with student details and ATS score
app.get('/applications/:recruiterId', (req, res) => {
  const { recruiterId } = req.params;
  const sql = `
    SELECT
      a.id AS application_id,
      a.status,
      a.verified,
      a.ats_score,
      j.title AS job_title,
      u.id AS student_id,
      u.username,
      u.fullname,
      u.college,
      u.percentage,
      u.intermarks,
      u.tenthmarks,
      u.passout_year
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    JOIN users u ON a.student_id = u.id
    WHERE j.recruiter_id = ?`;
  db.all(sql, [recruiterId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Verify application (mark as verified)
app.post('/verify-application/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  const sql = `UPDATE applications SET verified = 1 WHERE id = ?`;
  db.run(sql, [applicationId], function (err) {
    if (err) return res.status(500).json({ error: 'DB error updating verification' });
    res.json({ message: 'Application verified successfully.' });
  });
});

// Schedule interview
app.post('/schedule-interview', (req, res) => {
  const { student_id, job_id, interview_date } = req.body;
  if (!student_id || !job_id || !interview_date) {
    return res.status(400).json({ error: 'Missing required fields: student_id, job_id, interview_date' });
  }
  const sql = `INSERT INTO interviews (student_id, job_id, interview_date) VALUES (?, ?, ?)`;
  db.run(sql, [student_id, job_id, interview_date], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Interview scheduled', interviewId: this.lastID });
  });
});

// Upload or update student profile + resume + ATS scoring
app.post('/upload-resume', upload.single('resume'), (req, res) => {
  const {
    full_name,
    college_name,
    percentage,
    inter_marks,
    tenth_marks,
    passout_year,
    student_id,
  } = req.body;

  if (!student_id || !full_name || !college_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Resume file is required' });
  }

  const resumePath = req.file.path;

  // Simple ATS scoring: count keywords in resume filename (placeholder)
  const keywords = ['java', 'python', 'react', 'node', 'sql', 'javascript'];
  let atsScore = 0;
  const filename = req.file.originalname.toLowerCase();
  keywords.forEach((kw) => {
    if (filename.includes(kw)) atsScore++;
  });

  // Update users table with profile + resume info + ats_score
  const sql = `
    UPDATE users SET
      fullname = ?,
      college = ?,
      percentage = ?,
      intermarks = ?,
      tenthmarks = ?,
      passout_year = ?,
      resume_path = ?,
      ats_score = ?
    WHERE id = ?`;

  db.run(
    sql,
    [
      full_name,
      college_name,
      parseFloat(percentage),
      parseFloat(inter_marks),
      parseFloat(tenth_marks),
      parseInt(passout_year),
      resumePath,
      atsScore,
      student_id,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile and resume uploaded successfully', atsScore });
    }
  );
});
const calculateATSScore = (resumeText, jobDescription) => {
  // Simple scoring logic (improve later)
  const keywords = jobDescription.split(" ");
  let matchCount = 0;
  keywords.forEach(word => {
    if (resumeText.includes(word)) matchCount++;
  });
  return Math.round((matchCount / keywords.length) * 100);
};
app.post('/apply', upload.single('resume'), async (req, res) => {
  const { studentId, jobId, fullName, collegeName, percentage, interMarks, tenthMarks, passoutYear } = req.body;
  const resumePath = req.file.path;

  // ATS score logic here...

  try {
    // Save academic info
    await db.run(
      'INSERT INTO student_info (student_id, full_name, college_name, percentage, inter_marks, tenth_marks, passout_year, resume_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [studentId, fullName, collegeName, percentage, interMarks, tenthMarks, passoutYear, resumePath]
    );

    // Save application
    await db.run(
      'INSERT INTO applications (student_id, job_id, ats_score) VALUES (?, ?, ?)',
      [studentId, jobId, atsScore]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/recruiter/applications/:recruiterId', async (req, res) => {
  const { recruiterId } = req.params;

  try {
    const applications = await db.all(`
      SELECT 
        applications.*, 
        student_info.*, 
        jobs.title AS jobTitle 
      FROM applications
      JOIN student_info ON applications.student_id = student_info.student_id
      JOIN jobs ON applications.job_id = jobs.id
      WHERE jobs.recruiter_id = ?
    `, [recruiterId]);

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

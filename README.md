# CareerConnect 🎯

CareerConnect is a LinkedIn-like job portal built for students and recruiters. It includes features like separate dashboards, job posting, skill-based job filtering, resume upload, ATS (Applicant Tracking System) scoring, and recruiter verification — all built using **React.js**, **Node.js**, and **SQLite**.

---

## 🔍 Problem Statement

Fresh graduates often struggle to connect with genuine recruiters and real job opportunities. Recruiters, on the other hand, receive countless unqualified applications. CareerConnect bridges this gap with a student-recruiter platform that verifies recruiters, filters jobs by skills, and uses ATS scoring to shortlist candidates.

---

## ✅ Solution Highlights

- 🧑‍🎓 **Students** can:
  - Sign up, fill in academic details
  - Browse jobs based on their profile
  - Upload resume and get ATS score
  - Apply for jobs directly

- 🧑‍💼 **Recruiters** can:
  - Sign up (with email verification logic)
  - Post jobs (only if verified)
  - View applications with ATS scores
  - Schedule interviews

---

## 🛠️ Tech Stack

| Tech         | Usage                       |
|--------------|-----------------------------|
| React.js     | Frontend UI                 |
| Node.js      | Backend API                 |
| Express.js   | Server                      |
| SQLite3      | Lightweight Database        |
| Multer       | Resume upload (file handling) |
| CORS + JSON  | Middleware                  |

---

## 🔐 Authentication & Access

- Role-based routing for students and recruiters
- Conditional rendering based on user type
- Recruiters must be "verified" before posting jobs

---

## 📊 ATS (Applicant Tracking System) Scoring

- When a student uploads a resume while applying, an ATS score is **randomly generated** (mock logic)
- This simulates real-life resume analysis
- Recruiters can view this score when reviewing applications
- Ready to extend with PDF parsing + keyword match logic in future

---

## 🗂️ File Structure Overview

### 📁 client/src/

| File                   | Description |
|------------------------|-------------|
| `App.js`               | Main routes for student/recruiter dashboards |
| `Auth.js`              | Login/signup logic for both user types |
| `StudentDashboard.js`  | Student view of job listings |
| `RecruiterDashboard.js`| Recruiter view of applications |
| `JobPost.js`           | Job posting form for recruiters |
| `JobList.js`           | Filtered job listing based on skills |

### 📁 server/

| File                   | Description |
|------------------------|-------------|
| `index.js`             | Express server, routes, DB logic |
| `careerconnect.db`     | SQLite DB with all tables |
| `uploads/`             | Folder for storing uploaded resumes |

---

## 🧾 Database Schema

### `students`

| Column           | Type    |
|------------------|---------|
| id               | INTEGER |
| name, email, pwd | TEXT    |
| college, % marks | TEXT/REAL |
| passout_year     | INTEGER |

### `recruiters`

| Column   | Type    |
|----------|---------|
| id       | INTEGER |
| name, email, password | TEXT |
| status   | TEXT ('pending' or 'approved') |

### `jobs`

| Column   | Type    |
|----------|---------|
| id       | INTEGER |
| recruiter_id | INTEGER |
| title, description | TEXT |

### `applications`

| Column      | Type    |
|-------------|---------|
| id          | INTEGER |
| job_id, student_id | INTEGER |
| resume      | TEXT    |
| ats_score   | INTEGER |

---

## 💪 Challenges Faced

| Challenge | Solution |
|----------|----------|
| Role-based redirection | Used `react-router` with conditional rendering |
| ATS scoring logic | Started with mock score, planned real PDF parsing in future |
| Recruiter verification | Used email domain matching to auto-approve certain domains |
| Resume file handling | Used `multer` to securely upload and store resumes |
| SQLite concurrency | Used serialized transactions in Node.js to ensure safe writes |

---

## 🚀 Future Improvements

- 🔍 Real ATS score using resume parsing + job keyword match
- 📧 Recruiter email verification via token link
- 📅 Interview scheduling with calendar integration
- 📈 Dashboard stats for recruiters and students

---

## 🧑‍💻 Author

**CareerConnect** was developed by Joshna Palleboina as a full-stack capstone project to solve real-world job search challenges for freshers and recruiters.

---

## 📄 License

This project is licensed under the MIT License.

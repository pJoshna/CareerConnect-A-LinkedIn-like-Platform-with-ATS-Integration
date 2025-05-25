import React, { useState } from 'react';

export default function StudentDashboard({ user }) {
  const [searchSkill, setSearchSkill] = useState('');
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');

  // Resume + Academic Details
  const [fullName, setFullName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [percentage, setPercentage] = useState('');
  const [interMarks, setInterMarks] = useState('');
  const [tenthMarks, setTenthMarks] = useState('');
  const [passoutYear, setPassoutYear] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [atsScore, setAtsScore] = useState(null);

  const handleSearch = () => {
    fetch(`http://localhost:5000/jobs?skill=${encodeURIComponent(searchSkill)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setMessage(`❌ ${data.error}`);
        else {
          setJobs(data);
          setMessage('');
        }
      })
      .catch(() => setMessage('❌ Failed to fetch jobs.'));
  };

  const handleApply = (jobId) => {
    fetch('http://localhost:5000/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: user.id, job_id: jobId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setMessage(`❌ ${data.error}`);
        else setMessage(`✅ ${data.message}`);
      })
      .catch(() => setMessage('❌ Failed to apply for job.'));
  };

  const handleResumeUpload = e => {
    e.preventDefault();

    if (!resumeFile) {
      setMessage('❌ Please select a resume file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('student_id', user.id);
    formData.append('full_name', fullName);
    formData.append('college_name', collegeName);
    formData.append('percentage', percentage);
    formData.append('inter_marks', interMarks);
    formData.append('tenth_marks', tenthMarks);
    formData.append('passout_year', passoutYear);

    fetch('http://localhost:5000/upload-resume', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setMessage(`❌ ${data.error}`);
        else {
          setMessage(`✅ ${data.message}`);
          setAtsScore(data.ats_score);
        }
      })
      .catch(() => setMessage('❌ Failed to upload resume.'));
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto' }}>
      <h2>Student Dashboard</h2>

      {/* Skill Search */}
      <input
        type="text"
        placeholder="Search by skill (e.g., React)"
        value={searchSkill}
        onChange={e => setSearchSkill(e.target.value)}
      />
      <button onClick={handleSearch}>Search Jobs</button>

      <p style={{ color: message.startsWith('❌') ? 'red' : 'green' }}>{message}</p>

      <ul>
        {jobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          jobs.map(job => (
            <li key={job.id} style={{ marginBottom: '15px' }}>
              <strong>{job.title}</strong><br />
              {job.description}<br />
              <em>Skills: {job.skills}</em><br />
              <button onClick={() => handleApply(job.id)}>Apply</button>
            </li>
          ))
        )}
      </ul>

      {/* Resume Upload Form */}
      <h3>Upload Resume & Academic Info</h3>
      <form onSubmit={handleResumeUpload} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        /><br />
        <input
          type="text"
          placeholder="College Name"
          value={collegeName}
          onChange={e => setCollegeName(e.target.value)}
          required
        /><br />
        <input
          type="number"
          placeholder="Percentage"
          value={percentage}
          onChange={e => setPercentage(e.target.value)}
          required
          min="0"
          max="100"
          step="0.01"
        /><br />
        <input
          type="number"
          placeholder="Inter Marks"
          value={interMarks}
          onChange={e => setInterMarks(e.target.value)}
          required
          min="0"
          max="100"
          step="0.01"
        /><br />
        <input
          type="number"
          placeholder="10th Marks"
          value={tenthMarks}
          onChange={e => setTenthMarks(e.target.value)}
          required
          min="0"
          max="100"
          step="0.01"
        /><br />
        <input
          type="number"
          placeholder="Passout Year"
          value={passoutYear}
          onChange={e => setPassoutYear(e.target.value)}
          required
          min="1900"
          max={new Date().getFullYear() + 10}
        /><br />
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={e => setResumeFile(e.target.files[0])}
          required
        /><br /><br />
        <button type="submit">Upload Resume</button>
      </form>

      {atsScore !== null && (
        <p style={{ color: 'blue' }}>🧠 Your ATS Score: {atsScore}/100</p>
      )}
    </div>
  );
}

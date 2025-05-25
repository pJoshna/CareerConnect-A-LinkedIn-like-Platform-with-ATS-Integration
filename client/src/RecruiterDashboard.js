import React, { useState } from "react";

function JobCard({ job, studentId }) {
  const [showForm, setShowForm] = useState(false);
  const [resume, setResume] = useState(null);
  const [academicInfo, setAcademicInfo] = useState({
    fullname: '',
    college: '',
    percentage: '',
    intermarks: '',
    tenthmarks: '',
    passout_year: ''
  });

  const handleApply = () => {
    setShowForm(true);
  };

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleAcademicChange = (e) => {
    setAcademicInfo({ ...academicInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("resume", resume);
    formData.append("studentId", studentId);
    formData.append("jobId", job.id);
    Object.entries(academicInfo).forEach(([key, val]) => {
      formData.append(key, val);
    });

    const res = await fetch("http://localhost:5000/apply", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      alert("Application sent!");
      setShowForm(false);
    } else {
      alert("Application failed: " + data.error);
    }
  };

  return (
    <div>
      <h3>{job.title}</h3>
      <button onClick={handleApply}>Apply</button>

      {showForm && (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <h4>Upload Resume & Academic Info</h4>
          <input type="file" accept=".pdf" onChange={handleResumeChange} required /><br />
          <input name="fullname" placeholder="Full Name" onChange={handleAcademicChange} required />
          <input name="college" placeholder="College" onChange={handleAcademicChange} required />
          <input name="percentage" placeholder="Percentage" onChange={handleAcademicChange} required />
          <input name="intermarks" placeholder="Intermediate Marks" onChange={handleAcademicChange} required />
          <input name="tenthmarks" placeholder="10th Marks" onChange={handleAcademicChange} required />
          <input name="passout_year" placeholder="Passout Year" onChange={handleAcademicChange} required />
          <button type="submit">Submit Application</button>
        </form>
      )}
    </div>
  );
}

export default JobCard;

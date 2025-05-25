import React, { useState } from 'react';

export default function JobPost({ user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = e => {
  e.preventDefault();

  const payload = { username, password };
  if (!isLogin) {
    payload.role = role;
  }

  const url = isLogin ? 'http://localhost:5000/login' : 'http://localhost:5000/signup';

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage(isLogin ? 'Login successful!' : 'Signup successful!');
        if (isLogin) {
          onLogin(data.user);  // Send user to App.js
        }
        setUsername('');
        setPassword('');
        setRole('');
      }
    });
};

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Post a Job</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        /><br /><br />
        <textarea
          placeholder="Job Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        /><br /><br />
        <input
          type="text"
          placeholder="Skills (comma separated)"
          value={skills}
          onChange={e => setSkills(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Post Job</button>
      </form>
      <p style={{ color: 'green' }}>{message}</p>
    </div>
  );
}

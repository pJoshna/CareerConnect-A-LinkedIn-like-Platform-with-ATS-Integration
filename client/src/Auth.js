import React, { useState } from 'react';
import './Auth.css';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
  };

  const handleSubmit = e => {
    e.preventDefault();
    const url = isLogin ? 'http://localhost:5000/login' : 'http://localhost:5000/signup';
    const payload = isLogin ? { username, password } : { username, password, role };

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
            onLogin(data.user);
          }
          setUsername('');
          setPassword('');
          setRole('');
        }
      });
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {!isLogin && (
          <select value={role} onChange={e => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="recruiter">Recruiter</option>
          </select>
        )}

        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>

      <p className="message">{message}</p>

      <p>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
        <button className="switch-button" onClick={toggleMode}>
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
}

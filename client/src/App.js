import React, { useState } from 'react';
import Auth from './Auth';
import StudentDashboard from './StudentDashboard';
import RecruiterDashboard from './RecruiterDashboard';

function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Auth onLogin={setUser} />;

  if (user.role === 'student') return <StudentDashboard user={user} />;
  if (user.role === 'recruiter') return <RecruiterDashboard user={user} />;

  return <div>Unknown role</div>;
}

export default App;

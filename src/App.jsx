import React, { useState, useEffect } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('auth_user') || '');

  // Auth Form State Inputs
  const [formUser, setFormUser] = useState('');
  const [formPass, setFormPass] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  // Helper utility to attach secure authorization headers to outbound fetch sequences
  const secureFetch = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    return fetch(`${API_URL}${endpoint}`, { ...options, headers });
  };

  const fetchTasks = async () => {
    if (!token) return;
    const res = await secureFetch('/tasks');
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    } else if (res.status === 403 || res.status === 401) {
      handleLogout();
    }
  };

  useEffect(() => { fetchTasks(); }, [token]);

  // Auth Operations
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const route = isRegistering ? '/auth/register' : '/auth/login';
    const res = await fetch(`${API_URL}${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: formUser, password: formPass })
    });
    const data = await res.json();

    if (!res.ok) return alert(data.error || "Authentication operation failure.");

    if (isRegistering) {
      alert("Registration success! Logging in now...");
      setIsRegistering(false);
    } else {
      setToken(data.token);
      setUsername(data.username);
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('auth_user', data.username);
    }
    setFormUser(''); setFormPass('');
  };

  const handleLogout = () => {
    setToken(''); setUsername(''); setTasks([]);
    localStorage.removeItem('jwt_token'); localStorage.removeItem('auth_user');
  };

  const handleAddTask = async () => {
    if (!inputText.trim()) return;
    const res = await secureFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify({ text: inputText.trim() })
    });
    if (res.ok) { setInputText(''); fetchTasks(); }
  };

  // --- LOGIN PANEL TEMPLATE LAYOUT ---
  if (!token) {
    return (
      <div style={{ fontFamily: 'sans-serif', maxWidth: '350px', margin: '100px auto', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#1e293b' }}>{isRegistering ? 'Create Account' : 'TaskForge Secure Gateway'}</h2>
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" placeholder="Username" value={formUser} onChange={(e) => setFormUser(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
          <input type="password" placeholder="Password" value={formPass} onChange={(e) => setFormPass(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
          <button type="submit" style={{ padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {isRegistering ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '15px' }}>
          {isRegistering ? 'Have an account?' : 'New here?'}
          <span onClick={() => setIsRegistering(!isRegistering)} style={{ color: '#4f46e5', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' }}>
            {isRegistering ? 'Log In' : 'Create Account'}
          </span>
        </p>
      </div>
    );
  }

  // --- SECURE TASK BOARD WORKSPACE TEMPLATE ---
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '450px', margin: '50px auto', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '14px', color: '#64748b' }}>👤 Authenticated: <strong>{username}</strong></span>
        <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Log Out</button>
      </div>
      <h1 style={{ textAlign: 'center', color: '#1e293b', marginTop: 0 }}>TaskForge Workspace</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} placeholder="Enter a secure private task..." style={{ flex: 1, padding: '10px', border: '2px solid #e2e8f0', borderRadius: '6px' }} />
        <button onClick={handleAddTask} style={{ padding: '10px 15px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
      </div>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li key={task._id} style={{ background: '#f8fafc', padding: '15px', marginBottom: '10px', borderRadius: '6px', borderLeft: '4px solid #4f46e5' }}>{task.text}</li>
        ))}
      </ul>
    </div>
  );
}
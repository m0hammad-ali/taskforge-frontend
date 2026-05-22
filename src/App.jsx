import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [notifications, setNotifications] = useState([]);

  const API_URL = 'http://localhost:5000/api/tasks';

  const triggerToast = (msg) => {
    const newToast = { id: Date.now(), text: msg };
    setNotifications(prev => [...prev, newToast]);
    setTimeout(() => { setNotifications(prev => prev.filter(t => t.id !== newToast.id)); }, 2000);
  };

  useEffect(() => {
    const bootstrapData = async () => {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTasks(data);
    };
    bootstrapData();

    socket.on('task_created', (newTask) => {
      setTasks(prev => [...prev, newTask]);
      triggerToast(`Global Sync: "${newTask.text}" created!`);
    });

    socket.on('task_deleted', (deletedId) => {
      setTasks(prev => prev.filter(t => t._id !== deletedId));
      triggerToast("Global Sync: A task element was wiped.");
    });

    return () => {
      socket.off('task_created');
      socket.off('task_deleted');
    };
  }, []);

  const handleAddTask = async () => {
    if (!inputText.trim()) return;
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText.trim() })
    });
    setInputText('');
  };

  const handleDeleteTask = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '450px', margin: '50px auto', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#1e293b' }}>TaskForge Live Stream</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Type on any device..."
          style={{ flex: 1, padding: '10px', border: '2px solid #e2e8f0', borderRadius: '6px' }}
        />
        <button onClick={handleAddTask} style={{ padding: '10px 15px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Broadcast</button>
      </div>

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li key={task._id} style={{ background: '#f8fafc', padding: '15px', marginBottom: '10px', borderRadius: '6px', borderLeft: '4px solid #0ea5e9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{task.text}</span>
            <button onClick={() => handleDeleteTask(task._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Wipe</button>
          </li>
        ))}
      </ul>

      <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.map(n => (
          <div key={n.id} style={{ background: '#0ea5e9', color: '#fff', padding: '12px 20px', borderRadius: '6px', fontWeight: 'bold' }}>{n.text}</div>
        ))}
      </div>
    </div>
  );
}
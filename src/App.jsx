import React, { useState, useEffect } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  const API_URL = 'http://localhost:5000/api/tasks';

  const triggerToast = (msg) => {
    const newToast = { id: Date.now(), text: msg };
    setNotifications(prev => [...prev, newToast]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(t => t.id !== newToast.id));
    }, 2000);
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to map server state metadata.");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      triggerToast("Error connecting to server brain.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!inputText.trim()) return alert("Task text data parameter required.");

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim() })
      });

      if (!response.ok) throw new Error("Server rejected node generation request.");

      const createdTask = await response.json();
      setTasks(prev => [...prev, createdTask]); // Synchronize local layout frame
      setInputText('');
      triggerToast(`Server stored: "${createdTask.text}"`);
    } catch (err) {
      console.error(err);
      triggerToast("Failed to dispatch task object payload.");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error("Server rejected wipe operation.");

      setTasks(prev => prev.filter(t => t.id !== id));
      triggerToast("Task deleted on server database simulation.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to run deletion payload pipeline.");
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    return t.text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '450px', margin: '50px auto', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#1e293b' }}>TaskForge Sync</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Enter a networked task..."
          style={{ flex: 1, padding: '10px', border: '2px solid #e2e8f0', borderRadius: '6px' }}
        />
        <button onClick={handleAddTask} style={{ padding: '10px 15px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Push</button>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Filter matching text..."
        style={{ width: '100%', padding: '10px', border: '2px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '15px' }}
      />

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        {['all', 'active', 'completed'].map(type => (
          <button key={type} onClick={() => setFilter(type)} style={{ flex: 1, padding: '6px', background: filter === type ? '#6366f1' : '#64748b', color: '#fff', border: 'none', borderRadius: '6px', textTransform: 'capitalize', cursor: 'pointer' }}>
            {type}
          </button>
        ))}
      </div>

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {filteredTasks.map(task => (
          <li key={task.id} style={{ background: '#f8fafc', padding: '15px', marginBottom: '10px', borderRadius: '6px', borderLeft: '4px solid #6366f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{task.text}</span>
              <button onClick={() => handleDeleteTask(task.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Wipe</button>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.map(n => (
          <div key={n.id} style={{ background: '#1e293b', color: '#fff', padding: '12px 20px', borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            {n.text}
          </div>
        ))}
      </div>
    </div>
  );
}
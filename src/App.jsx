import React, { useState, useEffect } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSorted, setIsSorted] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const API_URL = 'http://localhost:5000/api/tasks';

  const triggerToast = (msg) => {
    const newToast = { id: Date.now(), text: msg };
    setNotifications(prev => [...prev, newToast]);
    setTimeout(() => { setNotifications(prev => prev.filter(t => t.id !== newToast.id)); }, 2000);
  };

  const fetchTasks = async (useSorting = false) => {
    try {
      const url = useSorting ? `${API_URL}?sort=length` : API_URL;
      const response = await fetch(url);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      triggerToast("Error mapping backend streams.");
    }
  };

  useEffect(() => {
    fetchTasks(isSorted);
  }, [isSorted]);

  const handleAddTask = async () => {
    if (!inputText.trim()) return;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim() })
      });
      if (response.ok) {
        setInputText('');
        fetchTasks(isSorted);
        triggerToast("Task synchronized.");
      }
    } catch (err) { triggerToast("Submission failure."); }
  };

  const handleAddSubtask = async (parentId) => {
    const subText = prompt("Enter nested subtask text:");
    if (!subText?.trim()) return;
    try {
      const response = await fetch(`${API_URL}/${parentId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: subText.trim() })
      });
      if (response.ok) {
        fetchTasks(isSorted);
        triggerToast("Subtask tree node spawned.");
      }
    } catch (err) { triggerToast("Subtask assignment failed."); }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setTasks(prev => prev.filter(t => t._id !== id));
        triggerToast("Task removed.");
      }
    } catch (err) { triggerToast("Deletion failure."); }
  };

  const filteredTasks = tasks.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '450px', margin: '50px auto', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#1e293b' }}>TaskForge Logical</h1>

      <button
        onClick={() => setIsSorted(!isSorted)}
        style={{ width: '100%', padding: '10px', background: isSorted ? '#0ea5e9' : '#64748b', color: '#fff', border: 'none', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        {isSorted ? 'Sorting Mode: Server-Side QuickSort' : 'Sorting Mode: Chronological'}
      </button>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Enter a parent task..."
          style={{ flex: 1, padding: '10px', border: '2px solid #e2e8f0', borderRadius: '6px' }}
        />
        <button onClick={handleAddTask} style={{ padding: '10px 15px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Push</button>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Filter string matches..."
        style={{ width: '100%', padding: '10px', border: '2px solid #e2e8f0', borderRadius: '6px', boxSizing: 'border-box', marginBottom: '15px' }}
      />

      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {filteredTasks.map(task => (
          <li key={task._id} style={{ background: '#f8fafc', padding: '15px', marginBottom: '10px', borderRadius: '6px', borderLeft: '4px solid #6366f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{task.text}</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleAddSubtask(task._id)} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>+ Sub</button>
                <button onClick={() => handleDeleteTask(task._id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Del</button>
              </div>
            </div>

            {task.subtasks && task.subtasks.length > 0 && (
              <ul style={{ listStyleType: 'none', paddingLeft: '20px', marginTop: '10px' }}>
                {task.subtasks.map(sub => (
                  <li key={sub._id} style={{ background: '#fff', padding: '6px', marginTop: '4px', borderLeft: '2px solid #cbd5e1', fontSize: '13px' }}>
                    {sub.text}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.map(n => (
          <div key={n.id} style={{ background: '#1e293b', color: '#fff', padding: '12px 20px', borderRadius: '6px' }}>{n.text}</div>
        ))}
      </div>
    </div>
  );
}
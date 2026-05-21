import React, { useState, useEffect } from 'react';

export default function App() {
  // --- STATE STREAMS ---
  // Instead of manual localStorage.getItem, React handles it inside initialization
  const [tasks, setTasks] = useState(() => {
    return JSON.parse(localStorage.getItem('tasks_react')) || [];
  });
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [undoStack, setUndoStack] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // useEffect watches the 'tasks' state. Whenever it changes, it auto-saves to memory.
  useEffect(() => {
    localStorage.setItem('tasks_react', JSON.stringify(tasks));
  }, [tasks]);

  // --- STACK UNDO LOGIC (LIFO) ---
  const pushToUndoStack = () => {
    setUndoStack(prev => [...prev, JSON.stringify(tasks)]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) {
      triggerToast("Nothing to undo!");
      return;
    }
    const newStack = [...undoStack];
    const previousState = JSON.parse(newStack.pop());
    setUndoStack(newStack);
    setTasks(previousState);
    triggerToast("Action reverted.");
  };

  // --- QUEUE NOTIFICATION LOGIC (FIFO) ---
  const triggerToast = (msg) => {
    const newToast = { id: Date.now(), text: msg };
    setNotifications(prev => [...prev, newToast]);

    // Automatically clear the oldest notification after 2 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(t => t.id !== newToast.id));
    }, 2000);
  };

  // --- MUTATIVE ACTIONS ---
  const handleAddTask = () => {
    if (!inputText.trim()) return alert("Task cannot be empty.");
    pushToUndoStack();

    const newTask = {
      id: Date.now(),
      text: inputText.trim(),
      completed: false,
      subtasks: [] // The Tree structure nested child node array
    };

    setTasks(prev => [...prev, newTask]);
    setInputText('');
    triggerToast(`Added: "${newTask.text}"`);
  };

  const handleToggleTask = (id) => {
    pushToUndoStack();
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id) => {
    pushToUndoStack();
    setTasks(prev => prev.filter(t => t.id !== id));
    triggerToast("Task deleted.");
  };

  const handleAddSubtask = (parentId) => {
    const subText = prompt("Enter sub-task text:");
    if (!subText?.trim()) return;
    pushToUndoStack();

    setTasks(prev => prev.map(t => {
      if (t.id === parentId) {
        return {
          ...t,
          subtasks: [...t.subtasks, { id: Date.now(), text: subText.trim() }]
        };
      }
      return t;
    }));
  };

  // --- LINEAR FILTRATION SCAN ---
  const filteredTasks = tasks.filter(t => {
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    return t.text.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '450px', margin: '50px auto', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#1e293b' }}>TaskForge Workspace</h1>

      <button onClick={handleUndo} style={{ width: '100%', padding: '10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
        Undo Last Action
      </button>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Enter a new task..."
          style={{ flex: 1, padding: '10px', border: '2px solid #e2e8f0', borderRadius: '6px' }}
        />
        <button onClick={handleAddTask} style={{ padding: '10px 15px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add Task</button>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search tasks..."
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
          <li key={task.id} style={{ background: '#f8fafc', padding: '15px', marginBottom: '10px', borderRadius: '6px', borderLeft: '4px solid #6366f1', opacity: task.completed ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task.id)} style={{ marginRight: '10px', cursor: 'pointer' }} />
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.text}</span>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleAddSubtask(task.id)} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>+ Sub</button>
                <button onClick={() => handleDeleteTask(task.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Del</button>
              </div>
            </div>

            {task.subtasks.length > 0 && (
              <ul style={{ listStyleType: 'none', paddingLeft: '20px', marginTop: '10px' }}>
                {task.subtasks.map(sub => (
                  <li key={sub.id} style={{ background: '#fff', padding: '6px', marginTop: '4px', borderLeft: '2px solid #cbd5e1', fontSize: '13px' }}>
                    🔹 {sub.text}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {/* Floating Notification Toast Queue Container */}
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
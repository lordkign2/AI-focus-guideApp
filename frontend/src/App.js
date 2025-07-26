import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const initializePuter = async () => {
      try {
        // Wait for Puter.js to be available
        let attempts = 0;
        const maxAttempts = 10;
        
        while (typeof window.puter === 'undefined' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        
        if (typeof window.puter === 'undefined') {
          console.error('Puter.js failed to load after multiple attempts');
          return;
        }
        
        console.log('Puter.js loaded successfully');
        
        try {
          const user = await window.puter.auth.getUser();
          console.log('User already authenticated:', user);
          setIsAuthenticated(true);
          await loadData();
        } catch (err) {
          console.log('User not authenticated, will show sign in button');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing Puter:', error);
        setIsAuthenticated(false);
      }
    };

    initializePuter();
  }, []);

  const loadData = async () => {
    try {
      if (demoMode) {
        // Demo mode - use local storage
        const savedNotes = localStorage.getItem('ai_assistant_notes');
        const savedTasks = localStorage.getItem('ai_assistant_tasks');
        
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        }
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      } else {
        // Puter.js mode
        const savedNotes = await window.puter.kv.get('ai_assistant_notes');
        const savedTasks = await window.puter.kv.get('ai_assistant_tasks');
        
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        }
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const enterDemoMode = () => {
    setDemoMode(true);
    setIsAuthenticated(true);
    loadData();
  };

  const saveData = async (key, data) => {
    try {
      if (demoMode) {
        localStorage.setItem(key, JSON.stringify(data));
      } else {
        await window.puter.kv.set(key, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const signIn = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Puter.js authentication...');
      
      // Puter.js signIn returns a promise that resolves when authentication is complete
      await window.puter.auth.signIn();
      
      // After successful sign in, get user to confirm authentication
      const user = await window.puter.auth.getUser();
      console.log('User authenticated:', user);
      
      setIsAuthenticated(true);
      await loadData();
    } catch (error) {
      console.error('Sign in failed:', error);
      // If authentication fails, show error but don't break the app
      alert('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      content: newNote,
      createdAt: new Date().toISOString(),
      aiEnhanced: false
    };
    
    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    
    await saveData('ai_assistant_notes', updatedNotes);
    setNewNote('');
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    
    const task = {
      id: Date.now(),
      content: newTask,
      completed: false,
      createdAt: new Date().toISOString(),
      priority: 'medium'
    };
    
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    
    await saveData('ai_assistant_tasks', updatedTasks);
    setNewTask('');
  };

  const toggleTask = async (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    
    await saveData('ai_assistant_tasks', updatedTasks);
  };

  const getAiSuggestion = async () => {
    setIsLoading(true);
    try {
      const notesContext = notes.map(n => n.content).join(', ');
      const tasksContext = tasks.map(t => t.content).join(', ');
      
      const prompt = `Based on my notes: ${notesContext} and tasks: ${tasksContext}, please provide a personalized daily plan and motivation for today. Keep it concise and actionable.`;
      
      if (demoMode) {
        // Demo mode - simulate AI response
        const demoResponse = `Based on your current notes and tasks, here's your personalized plan:

🎯 Today's Focus:
• Complete your most important tasks first
• Take breaks every 45-60 minutes
• Review your progress at the end of day

💡 Motivation:
You're making great progress! Every task completed brings you closer to your goals. Stay focused and keep pushing forward!

⚡ Quick Tips:
• Prioritize tasks by importance
• Break large tasks into smaller ones
• Celebrate small wins throughout the day`;
        
        setAiSuggestion(demoResponse);
      } else {
        const response = await window.puter.ai.chat(prompt);
        setAiSuggestion(response);
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setAiSuggestion('Sorry, I couldn\'t generate suggestions right now. Please try again.');
    }
    setIsLoading(false);
  };

  const generateDailyPlan = async () => {
    setIsLoading(true);
    try {
      const incompleteTasks = tasks.filter(t => !t.completed);
      const tasksContext = incompleteTasks.map(t => t.content).join(', ');
      
      const prompt = `Create a smart daily plan for these tasks: ${tasksContext}. Include time estimates and prioritization. Make it motivating and actionable.`;
      
      if (demoMode) {
        // Demo mode - simulate AI response
        const demoResponse = `🗓️ Your Smart Daily Plan:

${incompleteTasks.length > 0 ? 
  incompleteTasks.map((task, index) => 
    `${index + 1}. ${task.content} (⏱️ 30-45 min) - ${task.priority === 'high' ? 'HIGH PRIORITY' : 'Medium Priority'}`
  ).join('\n') : 
  'No pending tasks - great job! Consider adding some goals for tomorrow.'
}

⚡ Productivity Tips:
• Start with the most challenging task
• Use the Pomodoro Technique (25 min focus + 5 min break)
• Keep your workspace organized
• Stay hydrated and take regular breaks

🎯 You've got this! Focus on one task at a time and make steady progress.`;
        
        setAiSuggestion(demoResponse);
      } else {
        const response = await window.puter.ai.chat(prompt);
        setAiSuggestion(response);
      }
    } catch (error) {
      console.error('Error generating daily plan:', error);
      setAiSuggestion('Sorry, I couldn\'t generate a daily plan right now. Please try again.');
    }
    setIsLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="hero-background mb-8"></div>
          <h1 className="text-5xl font-bold text-white mb-4 glow-text">
            AI Personal Assistant
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            Your futuristic companion for organizing life, planning days, and staying motivated
          </p>
          <div className="space-y-4">
            <button
              onClick={signIn}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 glow-button disabled:opacity-50 disabled:cursor-not-allowed block w-full"
            >
              {isLoading ? 'Initializing...' : 'Initialize Assistant'}
            </button>
            <button
              onClick={enterDemoMode}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 block w-full"
            >
              Try Demo Mode
            </button>
            <p className="text-sm text-gray-400 mt-4">
              Demo mode uses simulated AI responses for testing
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-lg border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold glow-text">AI Assistant</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-500/30 text-blue-300' 
                    : 'hover:bg-blue-500/20'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('notes')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentView === 'notes' 
                    ? 'bg-blue-500/30 text-blue-300' 
                    : 'hover:bg-blue-500/20'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setCurrentView('tasks')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  currentView === 'tasks' 
                    ? 'bg-blue-500/30 text-blue-300' 
                    : 'hover:bg-blue-500/20'
                }`}
              >
                Tasks
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4 glow-text">Welcome to Your AI Assistant</h2>
              <p className="text-xl text-blue-200">Let me help you organize your day and stay motivated!</p>
            </div>

            {/* AI Suggestions Panel */}
            <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold">AI Insights</h3>
                <div className="space-x-3">
                  <button
                    onClick={getAiSuggestion}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? 'Thinking...' : 'Get Motivation'}
                  </button>
                  <button
                    onClick={generateDailyPlan}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? 'Planning...' : 'Daily Plan'}
                  </button>
                </div>
              </div>
              {aiSuggestion && (
                <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-400/30">
                  <p className="text-blue-100 whitespace-pre-wrap">{aiSuggestion}</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
                <h4 className="text-xl font-semibold mb-2">Total Notes</h4>
                <p className="text-3xl font-bold text-blue-400">{notes.length}</p>
              </div>
              <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
                <h4 className="text-xl font-semibold mb-2">Active Tasks</h4>
                <p className="text-3xl font-bold text-purple-400">{tasks.filter(t => !t.completed).length}</p>
              </div>
              <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
                <h4 className="text-xl font-semibold mb-2">Completed</h4>
                <p className="text-3xl font-bold text-green-400">{tasks.filter(t => t.completed).length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes View */}
        {currentView === 'notes' && (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-2xl font-semibold mb-4">Add New Note</h3>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="What's on your mind?"
                  className="flex-1 bg-blue-900/30 border border-blue-500/30 rounded-lg px-4 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addNote()}
                />
                <button
                  onClick={addNote}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300"
                >
                  Add Note
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <div key={note.id} className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
                  <p className="text-blue-100 mb-2">{note.content}</p>
                  <p className="text-xs text-blue-400">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks View */}
        {currentView === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-2xl font-semibold mb-4">Add New Task</h3>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What needs to be done?"
                  className="flex-1 bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                />
                <button
                  onClick={addTask}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition-all duration-300"
                >
                  Add Task
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-black/20 backdrop-blur-lg rounded-xl p-4 border transition-all duration-300 ${
                    task.completed
                      ? 'border-green-500/30 hover:border-green-400/50'
                      : 'border-purple-500/30 hover:border-purple-400/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-purple-500 hover:border-purple-400'
                      }`}
                    >
                      {task.completed && '✓'}
                    </button>
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                      {task.content}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
import React, { useState, useEffect, useCallback } from 'react';
import { Task, Status, Priority, ColumnType } from './types';
import TaskCard from './components/TaskCard';
import CreateTaskModal from './components/CreateTaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import { PlusIcon, SearchIcon } from './components/Icons';
import { v4 as uuidv4 } from 'uuid';

// Safe UUID generator for browser env
const generateId = () => `TASK-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

const INITIAL_TASKS: Task[] = [
  {
    id: 'TASK-1001',
    title: 'Design System Audit',
    description: 'Review current colors and typography for consistency across the dashboard.',
    status: Status.IN_PROGRESS,
    priority: Priority.HIGH,
    assignee: 'Alex',
    tags: ['Design', 'UI'],
    createdAt: Date.now()
  },
  {
    id: 'TASK-1002',
    title: 'Setup React Project',
    description: 'Initialize repo with TypeScript and Tailwind.',
    status: Status.DONE,
    priority: Priority.MEDIUM,
    assignee: 'Dev',
    tags: ['DevOps'],
    createdAt: Date.now()
  }
];

const COLUMNS: ColumnType[] = [
  { id: Status.TODO, title: 'To Do' },
  { id: Status.IN_PROGRESS, title: 'In Progress' },
  { id: Status.REVIEW, title: 'Review' },
  { id: Status.DONE, title: 'Done' }
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropColumn, setActiveDropColumn] = useState<Status | null>(null);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Handlers
  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: generateId(),
      title: taskData.title || 'Untitled',
      description: taskData.description || '',
      status: taskData.status || Status.TODO,
      priority: taskData.priority || Priority.MEDIUM,
      assignee: taskData.assignee,
      tags: taskData.tags || [],
      createdAt: Date.now()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleBulkCreate = (newTasks: Partial<Task>[]) => {
    const processedTasks = newTasks.map(t => ({
      id: generateId(),
      title: t.title || 'Untitled',
      description: t.description || '',
      status: Status.TODO,
      priority: t.priority || Priority.MEDIUM,
      assignee: t.assignee,
      tags: t.tags || [],
      createdAt: Date.now()
    }));
    setTasks(prev => [...prev, ...processedTasks]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleMoveTask = (taskId: string, direction: 'left' | 'right') => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      const currentIndex = COLUMNS.findIndex(c => c.id === task.status);
      let newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      
      // Bounds check
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= COLUMNS.length) newIndex = COLUMNS.length - 1;

      return { ...task, status: COLUMNS[newIndex].id };
    }));
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    setActiveDropColumn(null);
    const taskId = e.dataTransfer.getData('taskId');
    
    if (taskId) {
      setTasks(prev => {
        const task = prev.find(t => t.id === taskId);
        if (task && task.status !== status) {
          return prev.map(t => t.id === taskId ? { ...t, status } : t);
        }
        return prev;
      });
    }
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">TaskFlow AI</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none w-64"
            />
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </header>

      {/* Board Area */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-full flex p-6 gap-6 min-w-[1000px]">
          {COLUMNS.map(column => (
            <div 
              key={column.id} 
              className={`flex-1 flex flex-col min-w-[280px] rounded-xl border transition-colors duration-200 max-h-full ${
                activeDropColumn === column.id ? 'bg-indigo-50/80 border-indigo-200' : 'bg-gray-50 border-gray-200/60'
              }`}
            >
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-gray-100 sticky top-0 rounded-t-xl z-10 bg-inherit">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{column.title}</h2>
                  <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {filteredTasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
              </div>
              
              {/* Tasks Container */}
              <div 
                className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar"
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {filteredTasks
                  .filter(task => task.status === column.id)
                  .map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onMove={handleMoveTask}
                      onClick={handleTaskClick}
                      onDragStart={handleDragStart}
                    />
                  ))
                }
                {filteredTasks.filter(task => task.status === column.id).length === 0 && (
                   <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm italic pointer-events-none">
                     Drop tasks here
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTask}
        onBulkCreate={handleBulkCreate}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedTask(null); }}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default App;
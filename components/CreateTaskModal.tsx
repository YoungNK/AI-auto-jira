import React, { useState } from 'react';
import { Priority, Status, Task } from '../types';
import Modal from './Modal';
import { SparklesIcon } from './Icons';
import { generateProjectPlan } from '../services/geminiService';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Partial<Task>) => void;
  onBulkCreate: (tasks: Partial<Task>[]) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onCreate, onBulkCreate }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [loading, setLoading] = useState(false);
  
  // Manual State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [assignee, setAssignee] = useState('');

  // AI State
  const [aiGoal, setAiGoal] = useState('');
  const [aiError, setAiError] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title,
      description,
      priority,
      assignee,
      status: Status.TODO,
      createdAt: Date.now(),
      tags: []
    });
    resetForm();
    onClose();
  };

  const handleAiGenerate = async () => {
    if (!aiGoal.trim()) return;
    setLoading(true);
    setAiError('');
    
    try {
      const tasks = await generateProjectPlan(aiGoal);
      onBulkCreate(tasks);
      resetForm();
      onClose();
    } catch (err) {
      setAiError("Could not generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority(Priority.MEDIUM);
    setAssignee('');
    setAiGoal('');
    setMode('manual');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'manual' ? "Create New Task" : "AI Sprint Planner"}>
      <div className="flex mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setMode('manual')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'manual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Manual Entry
        </button>
        <button 
          onClick={() => setMode('ai')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${mode === 'ai' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <SparklesIcon className="w-4 h-4" />
          AI Assistant
        </button>
      </div>

      {mode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {Object.values(Priority).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee (Optional)</label>
              <input 
                type="text" 
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Add details..."
            />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-indigo-600" />
              Generate a Project Plan
            </h4>
            <p className="text-sm text-indigo-700">
              Describe your feature or goal (e.g., "Build a login page with Google Auth"). 
              Gemini will break it down into actionable tickets for you.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal / Feature Description</label>
            <textarea 
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value)}
              rows={4}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Create a dashboard for sales analytics with charts..."
            />
          </div>

          {aiError && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-100">
              {aiError}
            </div>
          )}

          <div className="flex justify-end pt-4">
             <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button 
              onClick={handleAiGenerate}
              disabled={!aiGoal.trim() || loading}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  Generate Plan
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreateTaskModal;
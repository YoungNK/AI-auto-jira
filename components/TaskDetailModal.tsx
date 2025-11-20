import React, { useState, useEffect } from 'react';
import { Priority, Status, Task } from '../types';
import Modal from './Modal';
import { SparklesIcon } from './Icons';
import { enhanceTaskDescription } from '../services/geminiService';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose, onUpdate, onDelete }) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [enhancing, setEnhancing] = useState(false);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onUpdate(editedTask);
      onClose();
    }
  };

  const handleDelete = () => {
    if (editedTask && window.confirm('Are you sure you want to delete this task?')) {
      onDelete(editedTask.id);
      onClose();
    }
  };

  const handleAiEnhance = async () => {
    if (!editedTask.description) return;
    setEnhancing(true);
    try {
      const enhanced = await enhanceTaskDescription(editedTask.title, editedTask.description);
      setEditedTask({ ...editedTask, description: enhanced });
    } catch (e) {
      alert('Failed to enhance description');
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editedTask.id} maxWidth="max-w-3xl">
      <div className="flex flex-col gap-6 h-full">
        {/* Title */}
        <div>
           <input 
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
            className="text-2xl font-bold text-gray-900 w-full border-none focus:ring-0 p-0 placeholder-gray-400"
            placeholder="Task Summary"
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Description</label>
                <button 
                  onClick={handleAiEnhance}
                  disabled={enhancing || !editedTask.description}
                  className="text-xs flex items-center gap-1 text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                  title="Rewrite with AI"
                >
                  {enhancing ? (
                     <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  ) : <SparklesIcon className="w-3 h-3" />}
                  Enhance
                </button>
              </div>
              <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                rows={10}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                placeholder="Add detailed description..."
              />
            </div>
          </div>

          {/* Sidebar Meta */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
              <select 
                value={editedTask.status}
                onChange={(e) => setEditedTask({...editedTask, status: e.target.value as Status})}
                className="w-full p-2 bg-gray-100 border-transparent rounded hover:bg-gray-200 text-sm font-medium text-gray-700 cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                {Object.values(Status).map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
              <select 
                value={editedTask.priority}
                onChange={(e) => setEditedTask({...editedTask, priority: e.target.value as Priority})}
                className="w-full p-2 bg-gray-100 border-transparent rounded hover:bg-gray-200 text-sm font-medium text-gray-700 cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                {Object.values(Priority).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Assignee</label>
               <input
                type="text"
                value={editedTask.assignee || ''}
                onChange={(e) => setEditedTask({...editedTask, assignee: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="Unassigned"
              />
            </div>
            
            <div className="pt-4 border-t border-gray-100">
               <button 
                type="button"
                onClick={handleDelete}
                className="w-full text-left text-sm text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
               >
                 Delete Task
               </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 gap-2 mt-auto">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
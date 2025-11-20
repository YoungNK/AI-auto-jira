import React from 'react';
import { Task, Priority, Status } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, UserIcon } from './Icons';

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, direction: 'left' | 'right') => void;
  onClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
}

const priorityColors: Record<Priority, string> = {
  [Priority.LOW]: 'bg-blue-100 text-blue-800',
  [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [Priority.HIGH]: 'bg-orange-100 text-orange-800',
  [Priority.URGENT]: 'bg-red-100 text-red-800',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onMove, onClick, onDragStart }) => {
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className="group relative bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
      onClick={() => onClick(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
          {task.title}
        </h4>
      </div>
      
      <p className="text-xs text-gray-500 line-clamp-3 mb-3">
        {task.description || "No description provided."}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        
        {task.assignee ? (
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 ring-2 ring-white" title={task.assignee}>
            {task.assignee.substring(0, 2).toUpperCase()}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 ring-2 ring-white">
            <UserIcon className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Quick Actions (Visible on Hover) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-md shadow-sm backdrop-blur-sm">
        <button 
          onClick={(e) => { e.stopPropagation(); onMove(task.id, 'left'); }}
          disabled={task.status === Status.TODO}
          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed text-gray-600"
        >
          <ChevronLeftIcon className="w-3 h-3" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onMove(task.id, 'right'); }}
          disabled={task.status === Status.DONE}
          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed text-gray-600"
        >
          <ChevronRightIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
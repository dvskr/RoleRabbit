'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Bell, CheckCircle } from 'lucide-react';
import { JobReminder } from '../../../types/jobTracker';

interface RemindersPanelProps {
  jobId: string;
  reminders: JobReminder[];
  onAddReminder: (jobId: string, reminder: Omit<JobReminder, 'id'>) => void;
  onDeleteReminder: (jobId: string, reminderId: string) => void;
  onToggleReminder: (jobId: string, reminderId: string) => void;
}

export default function RemindersPanel({
  jobId,
  reminders = [],
  onAddReminder,
  onDeleteReminder,
  onToggleReminder
}: RemindersPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as JobReminder['priority'],
    type: 'follow-up' as JobReminder['type'],
    completed: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReminder(jobId, {
      ...formData,
      id: `${Date.now()}`,
      dueDate: formData.dueDate
    });
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      type: 'follow-up',
      completed: false
    });
    setShowForm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Bell size={16} className="text-orange-600" />
          Reminders
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Plus size={14} />
          Add Reminder
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`p-3 rounded-lg ${
              reminder.completed ? 'bg-gray-100 opacity-60' : 'bg-gray-50'
            } ${!reminder.completed && isOverdue(reminder.dueDate) ? 'border-2 border-red-300' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-sm font-semibold ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {reminder.title}
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(reminder.priority)}`}>
                    {reminder.priority}
                  </span>
                  {!reminder.completed && isOverdue(reminder.dueDate) && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded">Overdue</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Due: {reminder.dueDate}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onToggleReminder(jobId, reminder.id)}
                  className={`${reminder.completed ? 'text-green-600' : 'text-gray-400'} hover:text-green-600`}
                  title={reminder.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  <CheckCircle size={14} />
                </button>
                <button
                  onClick={() => onDeleteReminder(jobId, reminder.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-700 mb-2">{reminder.description}</p>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded capitalize">
              {reminder.type}
            </span>
          </div>
        ))}
      </div>

      {/* Add Reminder Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 p-3 bg-blue-50 rounded-lg space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as JobReminder['priority'] })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as JobReminder['type'] })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="follow-up">Follow-up</option>
              <option value="deadline">Deadline</option>
              <option value="interview">Interview</option>
              <option value="application">Application</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Reminder
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}


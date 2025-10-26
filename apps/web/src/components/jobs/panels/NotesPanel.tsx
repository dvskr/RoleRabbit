'use client';

import React, { useState } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { JobNote } from '../../../types/jobTracker';

interface NotesPanelProps {
  jobId: string;
  notes: JobNote[];
  onAddNote: (jobId: string, note: Omit<JobNote, 'id'>) => void;
  onDeleteNote: (jobId: string, noteId: string) => void;
}

export default function NotesPanel({
  jobId,
  notes = [],
  onAddNote,
  onDeleteNote
}: NotesPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'research' as JobNote['category'],
    tags: [] as string[],
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNote(jobId, {
      ...formData
    } as Omit<JobNote, 'id'>);
    setFormData({
      title: '',
      content: '',
      category: 'research',
      tags: [],
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const getCategoryColor = (category: JobNote['category']) => {
    switch (category) {
      case 'research':
        return 'bg-blue-100 text-blue-800';
      case 'application':
        return 'bg-green-100 text-green-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'offer':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileText size={16} className="text-indigo-600" />
          Notes
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Plus size={14} />
          Add Note
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">{note.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(note.category)}`}>
                    {note.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{note.date}</p>
              </div>
              <button
                onClick={() => onDeleteNote(jobId, note.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-xs text-gray-700 mb-2">{note.content}</p>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Note Form */}
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
            <label className="text-xs font-medium text-gray-700 mb-1 block">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as JobNote['category'] })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="research">Research</option>
              <option value="application">Application</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={3}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  addTag(target.value);
                  target.value = '';
                }
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Note
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


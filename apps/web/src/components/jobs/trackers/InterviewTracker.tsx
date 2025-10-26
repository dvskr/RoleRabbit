'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import { InterviewNote } from '../../../types/jobTracker';

interface InterviewTrackerProps {
  jobId: string;
  notes: InterviewNote[];
  onAddNote: (jobId: string, note: Omit<InterviewNote, 'id'>) => void;
  onDeleteNote: (jobId: string, noteId: string) => void;
}

export default function InterviewTracker({
  jobId,
  notes = [],
  onAddNote,
  onDeleteNote
}: InterviewTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'technical' as InterviewNote['type'],
    date: new Date().toISOString().split('T')[0],
    interviewer: '',
    notes: '',
    questions: [''],
    feedback: '',
    rating: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNote(jobId, {
      ...formData
    } as Omit<InterviewNote, 'id'>);
    setFormData({
      type: 'technical',
      date: new Date().toISOString().split('T')[0],
      interviewer: '',
      notes: '',
      questions: [''],
      feedback: '',
      rating: 0
    });
    setShowForm(false);
  };

  const addQuestion = () => {
    setFormData({ ...formData, questions: [...formData.questions, ''] });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Interview Notes</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <Plus size={14} />
          Add Note
        </button>
      </div>

      {/* Interview Notes List */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 capitalize">{note.type}</span>
                <span className="text-xs text-gray-500">{note.date}</span>
              </div>
              {(note.rating ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < (note.rating ?? 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => onDeleteNote(jobId, note.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {note.interviewer && (
              <p className="text-xs text-gray-600 mb-1">Interviewer: {note.interviewer}</p>
            )}
            <p className="text-xs text-gray-700 mb-2">{note.notes}</p>
            {note.questions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Questions:</p>
                <ul className="list-disc list-inside text-xs text-gray-600">
                  {note.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            {note.feedback && (
              <p className="text-xs text-gray-600 mt-2 italic">{note.feedback}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add Interview Note Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 p-3 bg-blue-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as InterviewNote['type'] })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="phone">Phone</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="final">Final</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Interviewer</label>
            <input
              type="text"
              value={formData.interviewer}
              onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="Interview notes..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Questions</label>
            {formData.questions.map((q, i) => (
              <div key={i} className="flex gap-1 mb-1">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="Question asked..."
                />
                {formData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(i)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              + Add Question
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Feedback</label>
            <textarea
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              rows={2}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="Optional feedback..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Rating (1-5)</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className={`p-1 ${formData.rating >= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star size={16} className={formData.rating >= rating ? 'fill-current' : ''} />
                </button>
              ))}
            </div>
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


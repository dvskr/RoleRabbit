import React from 'react';
import { Plus, Star, MapPin } from 'lucide-react';
import { Job } from '../../types/job';

interface JobKanbanProps {
  jobs: Job[];
  favorites: string[];
  onToggleFavorite: (jobId: string) => void;
  onAddJobToColumn: (status: Job['status']) => void;
}

export default function JobKanban({
  jobs,
  favorites,
  onToggleFavorite,
  onAddJobToColumn
}: JobKanbanProps) {
  const statusColumns = [
    { status: 'applied' as const, title: 'Applied', color: 'blue' },
    { status: 'interview' as const, title: 'Interview', color: 'yellow' },
    { status: 'offer' as const, title: 'Offer', color: 'green' },
    { status: 'rejected' as const, title: 'Rejected', color: 'red' }
  ];

  return (
    <div className="w-full">
      <div className="flex gap-6 overflow-x-auto pb-4 min-w-max px-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {statusColumns.map(column => {
          const columnJobs = jobs.filter(job => job.status === column.status);
          return (
            <div key={column.status} className="flex-shrink-0 w-80">
              <div className={`bg-${column.color}-50 border border-${column.color}-200 rounded-lg p-4 h-full`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold text-${column.color}-800`}>
                    {column.title} ({columnJobs.length})
                  </h3>
                  <button 
                    onClick={() => onAddJobToColumn(column.status)}
                    className={`p-1 text-${column.color}-600 hover:bg-${column.color}-100 rounded transition-colors`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {columnJobs.map(job => (
                    <div 
                      key={job.id} 
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{job.title}</h4>
                        <button
                          onClick={() => onToggleFavorite(job.id)}
                          className={`p-1 ${
                            favorites.includes(job.id) 
                              ? 'text-yellow-500' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          <Star size={14} fill={favorites.includes(job.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      
                      <p className="text-gray-600 text-xs mb-2">{job.company}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span>{job.location}</span>
                      </div>
                      
                      {job.salary && (
                        <div className="mt-2 text-xs font-medium text-green-600">
                          {job.salary}
                        </div>
                      )}
                      
                      {job.priority && (
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.priority === 'high' ? 'bg-red-100 text-red-800' :
                            job.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

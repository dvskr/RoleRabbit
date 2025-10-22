'use client';

import React, { useState } from 'react';
import {
  Building,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  SortAsc,
  Clock,
  CheckCircle,
  TrendingUp,
  X,
  Search,
  Briefcase,
  DollarSign,
  Users,
  Star,
  FileText,
  Link,
  Phone,
  Mail,
  Globe,
  Target,
  Zap,
  Layout,
  List,
  Grid,
  Columns,
  MoreHorizontal,
  Bookmark,
  Archive,
  Tag,
  Filter as FilterIcon,
  ChevronDown,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Copy,
  Share,
  Heart,
  MessageSquare,
  Bell,
  Folder,
  FolderPlus,
  Database,
  BarChart3,
  PieChart,
  Activity,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
  salary?: string;
  description?: string;
  url?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  requirements?: string[];
  benefits?: string[];
  remote?: boolean;
  companySize?: string;
  industry?: string;
}

export default function JobTracker() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      status: 'interview',
      appliedDate: '2024-01-15',
      salary: '120k-150k',
      description: 'Looking for a senior engineer to lead our platform development team.',
      url: 'https://example.com/job1',
      notes: 'Great company culture, flexible work arrangements',
      priority: 'high',
      contact: {
        name: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1-555-0123'
      },
      requirements: ['5+ years experience', 'React, Node.js', 'Leadership skills'],
      benefits: ['Health insurance', '401k matching', 'Remote work'],
      remote: true,
      companySize: '100-500',
      industry: 'Technology'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'New York, NY',
      status: 'applied',
      appliedDate: '2024-01-20',
      salary: '100k-130k',
      description: 'Lead product strategy for our mobile application.',
      url: 'https://example.com/job2',
      priority: 'medium',
      companySize: '10-50',
      industry: 'Technology'
    },
    {
      id: '3',
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Austin, TX',
      status: 'offer',
      appliedDate: '2024-01-10',
      salary: '80k-100k',
      description: 'Create beautiful and intuitive user experiences.',
      notes: 'Received offer, considering negotiation',
      priority: 'high',
      remote: true,
      companySize: '50-100',
      industry: 'Design'
    },
    {
      id: '4',
      title: 'Full Stack Developer',
      company: 'Innovation Labs',
      location: 'Seattle, WA',
      status: 'applied',
      appliedDate: '2024-01-25',
      salary: '90k-120k',
      description: 'Build scalable web applications using modern technologies.',
      priority: 'medium',
      remote: true,
      companySize: '50-100',
      industry: 'Technology'
    },
    {
      id: '5',
      title: 'Data Scientist',
      company: 'Analytics Corp',
      location: 'Boston, MA',
      status: 'interview',
      appliedDate: '2024-01-18',
      salary: '110k-140k',
      description: 'Analyze large datasets and build machine learning models.',
      priority: 'high',
      companySize: '100-500',
      industry: 'Technology'
    },
    {
      id: '6',
      title: 'Marketing Manager',
      company: 'GrowthCo',
      location: 'Chicago, IL',
      status: 'rejected',
      appliedDate: '2024-01-12',
      salary: '70k-90k',
      description: 'Lead marketing campaigns and brand strategy.',
      priority: 'low',
      companySize: '10-50',
      industry: 'Marketing'
    },
    {
      id: '7',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Denver, CO',
      status: 'applied',
      appliedDate: '2024-01-22',
      salary: '100k-130k',
      description: 'Manage cloud infrastructure and deployment pipelines.',
      priority: 'medium',
      remote: true,
      companySize: '100-500',
      industry: 'Technology'
    },
    {
      id: '8',
      title: 'Frontend Developer',
      company: 'WebSolutions',
      location: 'Portland, OR',
      status: 'interview',
      appliedDate: '2024-01-16',
      salary: '85k-110k',
      description: 'Create responsive and interactive user interfaces.',
      priority: 'medium',
      remote: true,
      companySize: '50-100',
      industry: 'Technology'
    },
    {
      id: '9',
      title: 'Backend Developer',
      company: 'APICorp',
      location: 'Miami, FL',
      status: 'offer',
      appliedDate: '2024-01-14',
      salary: '95k-125k',
      description: 'Build robust backend services and APIs.',
      priority: 'high',
      remote: true,
      companySize: '100-500',
      industry: 'Technology'
    },
    {
      id: '10',
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      location: 'Los Angeles, CA',
      status: 'applied',
      appliedDate: '2024-01-28',
      salary: '75k-95k',
      description: 'Design user interfaces and user experiences.',
      priority: 'medium',
      remote: true,
      companySize: '10-50',
      industry: 'Design'
    }
  ]);

  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    company: '',
    location: '',
    status: 'applied',
    appliedDate: new Date().toISOString().split('T')[0],
    priority: 'medium'
  });

  const [showAddJob, setShowAddJob] = useState(false);
  const [jobFilter, setJobFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban' | 'table'>('list');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [groupBy, setGroupBy] = useState<'status' | 'company' | 'priority' | 'date'>('status');
  const [showArchived, setShowArchived] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(['High Priority', 'Remote', 'Tech', 'Startup']);

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = jobFilter === 'all' || job.status === jobFilter;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    }
    if (sortBy === 'company') {
      return a.company.localeCompare(b.company);
    }
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
    }
    return 0;
  });

  const addJob = () => {
    if (newJob.title && newJob.company) {
      const job: Job = {
        id: Date.now().toString(),
        title: newJob.title,
        company: newJob.company,
        location: newJob.location || '',
        status: newJob.status || 'applied',
        appliedDate: newJob.appliedDate || new Date().toISOString().split('T')[0],
        salary: newJob.salary,
        description: newJob.description,
        url: newJob.url,
        notes: newJob.notes,
        priority: newJob.priority || 'medium',
        contact: newJob.contact,
        requirements: newJob.requirements,
        benefits: newJob.benefits,
        remote: newJob.remote,
        companySize: newJob.companySize,
        industry: newJob.industry
      };
      setJobs([...jobs, job]);
      setNewJob({
        title: '',
        company: '',
        location: '',
        status: 'applied',
        appliedDate: new Date().toISOString().split('T')[0],
        priority: 'medium'
      });
      setShowAddJob(false);
    }
  };

  const deleteJob = (id: string) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  const updateJobStatus = (id: string, status: Job['status']) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status } : job));
  };

  const toggleJobSelection = (id: string) => {
    setSelectedJobs(prev => 
      prev.includes(id) 
        ? prev.filter(jobId => jobId !== id)
        : [...prev, id]
    );
  };

  const selectAllJobs = () => {
    setSelectedJobs(sortedJobs.map(job => job.id));
  };

  const clearSelection = () => {
    setSelectedJobs([]);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(jobId => jobId !== id)
        : [...prev, id]
    );
  };

  const bulkUpdateStatus = (status: Job['status']) => {
    setJobs(jobs.map(job => 
      selectedJobs.includes(job.id) ? { ...job, status } : job
    ));
    setSelectedJobs([]);
  };

  const bulkDelete = () => {
    setJobs(jobs.filter(job => !selectedJobs.includes(job.id)));
    setSelectedJobs([]);
  };

  const groupedJobs = () => {
    const grouped: { [key: string]: Job[] } = {};
    
    sortedJobs.forEach(job => {
      let key = '';
      switch (groupBy) {
        case 'status':
          key = job.status;
          break;
        case 'company':
          key = job.company;
          break;
        case 'priority':
          key = job.priority || 'medium';
          break;
        case 'date':
          key = new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          break;
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(job);
    });
    
    return grouped;
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interview': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offer': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderKanbanView = () => {
    const statusColumns = [
      { status: 'applied', title: 'Applied', color: 'blue' },
      { status: 'interview', title: 'Interview', color: 'yellow' },
      { status: 'offer', title: 'Offer', color: 'green' },
      { status: 'rejected', title: 'Rejected', color: 'red' }
    ];

    return (
      <div className="w-full">
        <div className="flex gap-6 overflow-x-auto pb-4 min-w-max">
          {statusColumns.map(column => {
            const columnJobs = sortedJobs.filter(job => job.status === column.status);
            return (
              <div key={column.status} className="flex-shrink-0 w-80">
                <div className={`bg-${column.color}-50 border border-${column.color}-200 rounded-lg p-4 h-full`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold text-${column.color}-800`}>
                      {column.title} ({columnJobs.length})
                    </h3>
                    <button className={`p-1 text-${column.color}-600 hover:bg-${column.color}-100 rounded`}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {columnJobs.map(job => (
                      <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{job.title}</h4>
                          <button
                            onClick={() => toggleFavorite(job.id)}
                            className={`p-1 ${favorites.includes(job.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
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
                          <div className="mt-2 text-xs font-medium text-green-600">{job.salary}</div>
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
  };

  const renderTableView = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedJobs.length === sortedJobs.length && sortedJobs.length > 0}
                    onChange={() => selectedJobs.length === sortedJobs.length ? clearSelection() : selectAllJobs()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedJobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => toggleJobSelection(job.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Building size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{job.company}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{job.location}</td>
                  <td className="px-4 py-4">
                    <select
                      value={job.status}
                      onChange={(e) => updateJobStatus(job.id, e.target.value as Job['status'])}
                      className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{job.appliedDate}</td>
                  <td className="px-4 py-4 text-sm text-green-600 font-medium">{job.salary || '-'}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(job.id)}
                        className={`p-1 ${favorites.includes(job.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                      >
                        <Star size={14} fill={favorites.includes(job.id) ? 'currentColor' : 'none'} />
                      </button>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye size={14} />
                        </a>
                      )}
                      <button className="p-1 text-gray-600 hover:bg-gray-50 rounded">
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => deleteJob(job.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGridView = () => {
    return (
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
          {sortedJobs.map(job => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedJobs.includes(job.id)}
                    onChange={() => toggleJobSelection(job.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Building size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(job.id)}
                    className={`p-1 ${favorites.includes(job.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  >
                    <Star size={16} fill={favorites.includes(job.id) ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h4>
                <p className="text-gray-600 font-medium">{job.company}</p>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                {job.priority && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(job.priority)}`}>
                    {job.priority.toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{job.location}</span>
                  {job.remote && <span className="text-blue-600">• Remote</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{job.appliedDate}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <DollarSign size={14} className="text-green-500" />
                    <span>{job.salary}</span>
                  </div>
                )}
              </div>
              
              {job.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{job.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </a>
                  )}
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => deleteJob(job.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
        <div className="space-y-4 pb-4">
        {sortedJobs.map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <input
                  type="checkbox"
                  checked={selectedJobs.includes(job.id)}
                  onChange={() => toggleJobSelection(job.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Building size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                    {job.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(job.priority)}`}>
                        {job.priority.toUpperCase()}
                      </span>
                    )}
                    <button
                      onClick={() => toggleFavorite(job.id)}
                      className={`p-1 ${favorites.includes(job.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                    >
                      <Star size={16} fill={favorites.includes(job.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">{job.company}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{job.location}</span>
                      {job.remote && <span className="text-blue-600">• Remote</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{job.appliedDate}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                        <DollarSign size={16} className="text-green-500" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>
                  
                  {job.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={job.status}
                    onChange={(e) => updateJobStatus(job.id, e.target.value as Job['status'])}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="flex items-center gap-2">
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Job Posting"
                      >
                        <Eye size={16} />
                      </a>
                    )}
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => deleteJob(job.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Modern Header - Fixed */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
              <p className="text-gray-600 text-sm">Track and manage your job search progress</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <Database size={16} className="inline mr-1" />
                {jobs.length} Applications
              </button>
              <button className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <TrendingUp size={16} className="inline mr-1" />
                {Math.round((jobs.filter(j => j.status !== 'applied').length / jobs.length) * 100)}% Response
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setShowAddJob(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              New Application
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Toolbar - Fixed */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Applications</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="company">Sort by Company</option>
                <option value="priority">Sort by Priority</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg border transition-colors text-sm ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FilterIcon size={16} className="inline mr-1" />
                Filters
              </button>
            </div>
          </div>
          
          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* Bulk Actions */}
            {selectedJobs.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-gray-600">{selectedJobs.length} selected</span>
                <select
                  onChange={(e) => bulkUpdateStatus(e.target.value as Job['status'])}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Update Status</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  onClick={bulkDelete}
                  className="px-2 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} className="inline mr-1" />
                  Delete
                </button>
                <button
                  onClick={clearSelection}
                  className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
            
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                }`}
                title="List View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                }`}
                title="Kanban View"
              >
                <Columns size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                }`}
                title="Table View"
              >
                <Layout size={16} />
              </button>
            </div>
            
            {/* Group By */}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="status">Group by Status</option>
              <option value="company">Group by Company</option>
              <option value="priority">Group by Priority</option>
              <option value="date">Group by Date</option>
            </select>
          </div>
        </div>
        
        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remote</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">All</option>
                  <option value="true">Remote Only</option>
                  <option value="false">On-site Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Any Salary</option>
                  <option value="0-50000">$0 - $50k</option>
                  <option value="50000-100000">$50k - $100k</option>
                  <option value="100000-150000">$100k - $150k</option>
                  <option value="150000+">$150k+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">All Tags</option>
                  {tags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-auto p-6">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Applications</p>
                <p className="text-2xl font-bold text-blue-900">{jobs.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Interviews</p>
                <p className="text-2xl font-bold text-green-900">{jobs.filter(j => j.status === 'interview').length}</p>
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Offers</p>
                <p className="text-2xl font-bold text-purple-900">{jobs.filter(j => j.status === 'offer').length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Response Rate</p>
                <p className="text-2xl font-bold text-orange-900">
                  {jobs.length > 0 ? Math.round((jobs.filter(j => j.status !== 'applied').length / jobs.length) * 100) : 0}%
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Views */}
        {viewMode === 'kanban' && renderKanbanView()}
        {viewMode === 'table' && renderTableView()}
        {viewMode === 'grid' && renderGridView()}
        {viewMode === 'list' && renderListView()}
        
        {sortedJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">Start tracking your job applications to stay organized</p>
            <button
              onClick={() => setShowAddJob(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Your First Application
            </button>
          </div>
        )}
      </div>

      {/* Add Job Modal */}
      {showAddJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Application</h3>
              <button
                onClick={() => setShowAddJob(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={newJob.title || ''}
                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input
                    type="text"
                    value={newJob.company || ''}
                    onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., TechCorp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newJob.location || ''}
                    onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={newJob.appliedDate || ''}
                    onChange={(e) => setNewJob({...newJob, appliedDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={newJob.salary || ''}
                    onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 100k-130k"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newJob.priority || 'medium'}
                    onChange={(e) => setNewJob({...newJob, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                <textarea
                  value={newJob.description || ''}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Brief description of the role..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job URL</label>
                <input
                  type="url"
                  value={newJob.url || ''}
                  onChange={(e) => setNewJob({...newJob, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://company.com/job-posting"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newJob.notes || ''}
                  onChange={(e) => setNewJob({...newJob, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newJob.remote || false}
                    onChange={(e) => setNewJob({...newJob, remote: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Remote Position</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddJob(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addJob}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Add Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
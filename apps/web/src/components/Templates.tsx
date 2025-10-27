'use client';

import React, { useState, useMemo } from 'react';
import { logger } from '../utils/logger';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Download,
  Eye,
  Crown,
  Clock,
  Users,
  Award,
  Zap,
  ChevronDown,
  X,
  Heart,
  Share2,
  Bookmark,
  CheckCircle,
  Sparkles,
  Palette,
  Layout,
  Target,
  TrendingUp,
  Globe,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Settings,
  FileText,
  Image,
  Video,
  File,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Upload,
  Cloud,
  Folder,
  XCircle
} from 'lucide-react';
import { resumeTemplates, templateCategories, getTemplatesByCategory, searchTemplates } from '../data/templates';

interface TemplatesProps {
  onAddToEditor?: (templateId: string) => void;
  addedTemplates?: string[];
  onRemoveTemplate?: (templateId: string) => void;
}

export default function Templates({ onAddToEditor, addedTemplates = [], onRemoveTemplate }: TemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'name'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedLayout, setSelectedLayout] = useState('all');
  const [selectedColorScheme, setSelectedColorScheme] = useState('all');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templatesPerPage] = useState(12);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [addedTemplateId, setAddedTemplateId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSource, setUploadSource] = useState<'cloud' | 'system'>('cloud');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewResume, setPreviewResume] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    let templates = resumeTemplates;

    // Search filter
    if (searchQuery) {
      templates = searchTemplates(searchQuery);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      templates = templates.filter(t => t.difficulty === selectedDifficulty);
    }

    // Layout filter
    if (selectedLayout !== 'all') {
      templates = templates.filter(t => t.layout === selectedLayout);
    }

    // Color scheme filter
    if (selectedColorScheme !== 'all') {
      templates = templates.filter(t => t.colorScheme === selectedColorScheme);
    }

    // Premium/Free filter
    if (showPremiumOnly) {
      templates = templates.filter(t => t.isPremium);
    }
    if (showFreeOnly) {
      templates = templates.filter(t => !t.isPremium);
    }

    // Sort templates
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return templates;
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedLayout, selectedColorScheme, showPremiumOnly, showFreeOnly, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);
  const startIndex = (currentPage - 1) * templatesPerPage;
  const endIndex = startIndex + templatesPerPage;
  const currentTemplates = filteredTemplates.slice(startIndex, endIndex);
  
  // Separate added and not-added templates
  const addedTemplatesList = filteredTemplates.filter(t => addedTemplates.includes(t.id));
  const notAddedTemplates = filteredTemplates.filter(t => !addedTemplates.includes(t.id));

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ats': return <Target size={16} />;
      case 'creative': return <Palette size={16} />;
      case 'modern': return <Zap size={16} />;
      case 'classic': return <Award size={16} />;
      case 'executive': return <Crown size={16} />;
      case 'minimal': return <Layout size={16} />;
      case 'academic': return <Users size={16} />;
      case 'technical': return <Globe size={16} />;
      case 'startup': return <TrendingUp size={16} />;
      case 'freelance': return <Heart size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    // Here you would integrate with the resume editor
    logger.debug('Selected template:', templateId);
    setShowTemplateSelector(false);
  };

  const handlePreviewTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowPreviewModal(true);
  };

  const handleUseTemplate = (templateId: string) => {
    logger.debug('Adding template to editor:', templateId);
    
    // Call the callback to add template to editor
    if (onAddToEditor) {
      onAddToEditor(templateId);
    }
    
    // Set animation state
    setAddedTemplateId(templateId);
    
    // Show success animation for 2 seconds
    setTimeout(() => {
      setAddedTemplateId(null);
    }, 2000);
    
    // Don't close the modal
  };

  const handleDownloadTemplate = () => {
    if (!currentSelectedTemplate) return;
    logger.debug('Downloading template:', currentSelectedTemplate.name);
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${currentSelectedTemplate.name} - Resume Template</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .template-info { border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
    .template-info h1 { color: #4CAF50; margin: 0; }
    .section { margin-bottom: 25px; }
    .section h2 { color: #2196F3; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .features { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .feature { background: #e3f2fd; color: #1976D2; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
    .specs { background: #f5f5f5; padding: 20px; border-radius: 8px; }
    .spec-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="template-info">
    <h1>${currentSelectedTemplate.name}</h1>
    <p>${currentSelectedTemplate.description}</p>
  </div>
  
  <div class="section">
    <h2>Template Features</h2>
    <div class="features">
      ${currentSelectedTemplate.features.map(feature => `<span class="feature">${feature}</span>`).join('')}
    </div>
  </div>
  
  <div class="section">
    <h2>Template Specifications</h2>
    <div class="specs">
      <div class="spec-row">
        <span><strong>Category:</strong></span>
        <span>${currentSelectedTemplate.category}</span>
      </div>
      <div class="spec-row">
        <span><strong>Difficulty:</strong></span>
        <span>${currentSelectedTemplate.difficulty}</span>
      </div>
      <div class="spec-row">
        <span><strong>Layout:</strong></span>
        <span>${currentSelectedTemplate.layout}</span>
      </div>
      <div class="spec-row">
        <span><strong>Color Scheme:</strong></span>
        <span>${currentSelectedTemplate.colorScheme}</span>
      </div>
      <div class="spec-row">
        <span><strong>Rating:</strong></span>
        <span>${currentSelectedTemplate.rating} / 5.0</span>
      </div>
      <div class="spec-row">
        <span><strong>Downloads:</strong></span>
        <span>${(currentSelectedTemplate.downloads / 1000).toFixed(0)}k</span>
      </div>
    </div>
  </div>
  
  <div class="section">
    <h2>Compatible Industries</h2>
    <div class="features">
      ${currentSelectedTemplate.industry.map(ind => `<span class="feature">${ind}</span>`).join('')}
    </div>
  </div>
  
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.85em; color: #999;">
    <p>Template from RoleReady - Your Complete Job Search Platform</p>
    <p>Created: ${currentSelectedTemplate.createdAt} | Updated: ${currentSelectedTemplate.updatedAt}</p>
  </div>
</body>
</html>
    `.trim();

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSelectedTemplate.name.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareTemplate = () => {
    if (!currentSelectedTemplate) return;
    logger.debug('Sharing template:', currentSelectedTemplate.name);
    
    if (navigator.share) {
      navigator.share({
        title: currentSelectedTemplate.name,
        text: currentSelectedTemplate.description,
        url: window.location.href
      }).catch(err => logger.debug('Share failed:', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${currentSelectedTemplate.name} - ${currentSelectedTemplate.description}`);
      alert('Template link copied to clipboard!');
    }
  };

  const currentSelectedTemplate = selectedTemplate 
    ? resumeTemplates.find(t => t.id === selectedTemplate) 
    : null;

  const generateSampleResumePreview = (template: any): React.ReactNode => {
    if (!template) return null;

    const sampleData = {
      name: 'John Anderson',
      title: 'Senior Software Engineer',
      email: 'john.anderson@email.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions.',
      experiences: [
        {
          company: 'Tech Corp',
          role: 'Senior Software Engineer',
          period: '2020 - Present',
          bullets: [
            'Led development of microservices architecture handling 10M+ requests',
            'Mentored team of 5 junior developers',
            'Reduced deployment time by 40%'
          ]
        },
        {
          company: 'StartUpCo',
          role: 'Software Engineer',
          period: '2018 - 2020',
          bullets: [
            'Built RESTful APIs serving 5M+ users',
            'Implemented CI/CD pipelines',
            'Collaborated with product team'
          ]
        }
      ],
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL'],
      education: {
        degree: 'B.S. Computer Science',
        school: 'University of California',
        year: '2018'
      }
  };

  return (
      <div className="bg-white p-6 shadow-lg">
        {template.layout === 'single-column' && (
          <div className="space-y-4">
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold mb-1">{sampleData.name}</h1>
              <p className="text-blue-600 font-semibold">{sampleData.title}</p>
              <p className="text-sm text-gray-600 mt-2">
                {sampleData.email} | {sampleData.phone} | {sampleData.location}
              </p>
            </div>
            
            <div>
              <h2 className="font-semibold text-lg mb-2 border-b pb-1">Professional Summary</h2>
              <p className="text-sm text-gray-700">{sampleData.summary}</p>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-2 border-b pb-1">Experience</h2>
              {sampleData.experiences.map((exp, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-semibold">{exp.role}</p>
                      <p className="text-blue-600 text-sm">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-600">{exp.period}</span>
                  </div>
                  <ul className="list-disc list-inside text-sm space-y-1 text-gray-700 ml-2">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-2 border-b pb-1">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {sampleData.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-2 border-b pb-1">Education</h2>
              <p className="font-semibold">{sampleData.education.degree}</p>
              <p className="text-sm text-gray-700">{sampleData.education.school} - {sampleData.education.year}</p>
            </div>
          </div>
        )}

        {template.layout === 'two-column' && (
          <div className="flex gap-6">
            <div className="w-1/3 bg-gray-100 p-4">
              <h1 className="text-xl font-bold mb-2">{sampleData.name}</h1>
              <p className="text-sm mb-3">{sampleData.title}</p>
              
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2 border-b pb-1">Contact</h3>
                <p className="text-xs mb-1">{sampleData.email}</p>
                <p className="text-xs mb-1">{sampleData.phone}</p>
                <p className="text-xs">{sampleData.location}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2 border-b pb-1">Skills</h3>
                <div className="space-y-1">
                  {sampleData.skills.map((skill, i) => (
                    <p key={i} className="text-xs">{skill}</p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 border-b pb-1">Education</h3>
                <p className="text-xs font-semibold">{sampleData.education.degree}</p>
                <p className="text-xs">{sampleData.education.school}</p>
                <p className="text-xs">{sampleData.education.year}</p>
              </div>
            </div>

            <div className="w-2/3 space-y-4">
              <div>
                <h2 className="font-semibold text-lg mb-2 border-b pb-1">Summary</h2>
                <p className="text-sm text-gray-700">{sampleData.summary}</p>
              </div>

              <div>
                <h2 className="font-semibold text-lg mb-2 border-b pb-1">Experience</h2>
                {sampleData.experiences.map((exp, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-semibold text-sm">{exp.role}</p>
                        <p className="text-blue-600 text-xs">{exp.company}</p>
                      </div>
                      <span className="text-xs text-gray-600">{exp.period}</span>
                    </div>
                    <ul className="list-disc list-inside text-xs space-y-1 text-gray-700 ml-2">
                      {exp.bullets.map((bullet, j) => (
                        <li key={j}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {template.layout === 'hybrid' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
              <h1 className="text-3xl font-bold mb-2">{sampleData.name}</h1>
              <p className="text-lg mb-3">{sampleData.title}</p>
              <p className="text-sm">{sampleData.email} | {sampleData.phone} | {sampleData.location}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <div className="mb-4">
                  <h2 className="font-semibold text-lg mb-2">Professional Summary</h2>
                  <p className="text-sm text-gray-700">{sampleData.summary}</p>
                </div>

                <div>
                  <h2 className="font-semibold text-lg mb-2">Experience</h2>
                  {sampleData.experiences.map((exp, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-semibold text-sm">{exp.role}</p>
                          <p className="text-blue-600 text-xs">{exp.company}</p>
                        </div>
                        <span className="text-xs text-gray-600">{exp.period}</span>
                      </div>
                      <ul className="list-disc list-inside text-xs space-y-1 text-gray-700 ml-2">
                        {exp.bullets.map((bullet, j) => (
                          <li key={j}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Skills</h3>
                  <div className="space-y-1">
                    {sampleData.skills.map((skill, i) => (
                      <p key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">{skill}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Education</h3>
                  <p className="text-xs font-semibold">{sampleData.education.degree}</p>
                  <p className="text-xs">{sampleData.education.school}</p>
                  <p className="text-xs">{sampleData.education.year}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        {/* Search and Filters */}
        <div className="flex items-center gap-2 mb-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Rated</option>
            <option value="name">A-Z</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center border border-gray-300 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg border transition-colors text-sm ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} className="inline mr-1" />
            Filters
          </button>
          
          {/* Refresh Button */}
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm border border-gray-300"
          >
            <RefreshCw size={14} className="inline mr-1" />
            Refresh
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-1 rounded-lg whitespace-nowrap transition-colors text-xs ${
              selectedCategory === 'all' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({resumeTemplates.length})
          </button>
          {templateCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-2 py-1 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 text-xs ${
                selectedCategory === category.id 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {getCategoryIcon(category.id)}
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Layout</label>
                <select
                  value={selectedLayout}
                  onChange={(e) => setSelectedLayout(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Layouts</option>
                  <option value="single-column">Single Column</option>
                  <option value="two-column">Two Column</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={selectedColorScheme}
                  onChange={(e) => setSelectedColorScheme(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Colors</option>
                  <option value="monochrome">Monochrome</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                  <option value="orange">Orange</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showFreeOnly}
                      onChange={(e) => setShowFreeOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-1.5 text-xs text-gray-700">Free Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showPremiumOnly}
                      onChange={(e) => setShowPremiumOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-1.5 text-xs text-gray-700">Premium Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-2 force-scrollbar" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: '#d1d5db #f3f4f6'
      }}>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-600">Total</p>
                <p className="text-sm font-bold text-gray-900">{resumeTemplates.length}</p>
              </div>
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={12} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Free</p>
                <p className="text-lg font-bold text-gray-900">{resumeTemplates.filter(t => !t.isPremium).length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Unlock size={16} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Premium</p>
                <p className="text-lg font-bold text-gray-900">{resumeTemplates.filter(t => t.isPremium).length}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Crown size={16} className="text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Downloads</p>
                <p className="text-lg font-bold text-gray-900">
                  {(resumeTemplates.reduce((sum, t) => sum + t.downloads, 0) / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download size={16} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Added Templates Section */}
        {addedTemplatesList.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-600" />
              <h2 className="text-base font-bold text-gray-900">Added Templates ({addedTemplatesList.length}/10)</h2>
              <div className="h-1 flex-1 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {addedTemplatesList.map(template => (
                <div key={template.id} className="bg-white border-2 border-green-300 rounded-lg overflow-hidden shadow-md group flex flex-col h-full">
                  {/* Template Preview */}
                  <div className="relative h-32 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
                    {/* Mini Resume Preview */}
                    <div className="w-20 h-28 bg-white rounded-lg shadow-xl border border-gray-300 transform rotate-1 group-hover:rotate-0 transition-transform duration-300">
                      <div className="p-1.5 h-full flex flex-col space-y-0.5">
                        {/* Name/Header Bar */}
                        <div className={`h-2 rounded ${
                          template.colorScheme === 'blue' ? 'bg-blue-600' :
                          template.colorScheme === 'green' ? 'bg-green-600' :
                          template.colorScheme === 'monochrome' ? 'bg-gray-700' :
                          'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}></div>
                        
                        {/* Contact Line */}
                        <div className="h-1 bg-gray-200 rounded w-10/12"></div>
                        
                        {/* Summary Section */}
                        <div className="space-y-0.5">
                          <div className={`h-1 rounded w-8 ${
                            template.colorScheme === 'blue' ? 'bg-blue-500' :
                            template.colorScheme === 'green' ? 'bg-green-500' :
                            template.colorScheme === 'monochrome' ? 'bg-gray-600' :
                            'bg-purple-400'
                          }`}></div>
                          <div className="h-1 bg-gray-100 rounded w-full"></div>
                          <div className="h-1 bg-gray-100 rounded w-5/6"></div>
                        </div>
                        
                        {/* Experience Section */}
                        <div className="space-y-0.5">
                          <div className={`h-1 rounded w-7 ${
                            template.colorScheme === 'blue' ? 'bg-blue-500' :
                            template.colorScheme === 'green' ? 'bg-green-500' :
                            template.colorScheme === 'monochrome' ? 'bg-gray-600' :
                            'bg-purple-400'
                          }`}></div>
                          <div className="h-1 bg-gray-100 rounded w-full"></div>
                          <div className="h-1 bg-gray-100 rounded w-4/5"></div>
                        </div>
                        
                        {/* Bullet Points */}
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="h-1 bg-gray-100 rounded flex-1"></div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="h-1 bg-gray-100 rounded flex-1"></div>
                        </div>
                        
                        {/* Skills Tags */}
                        <div className="flex gap-1">
                          <div className="h-1 bg-gray-100 rounded flex-1"></div>
                          <div className="h-1 bg-gray-100 rounded flex-1"></div>
                        </div>
                      </div>
                    </div>
                    {template.isPremium && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Crown size={10} />
                        Premium
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(template.id);
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          favorites.includes(template.id) 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/80 text-gray-600 hover:bg-white'
                        }`}
                      >
                        <Heart size={14} fill={favorites.includes(template.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="absolute -top-1 -right-1 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle size={12} />
                      Added
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-xs leading-tight">{template.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                        <Star size={10} className="text-yellow-400 fill-current" />
                        <span className="font-medium">{template.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2 flex-1">{template.description}</p>
                    
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-semibold">
                        {template.layout}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Download size={10} />
                        <span className="font-medium">{(template.downloads / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewTemplate(template.id);
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Preview
                        </button>
                        {onRemoveTemplate && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveTemplate(template.id);
                            }}
                            className="px-2.5 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                          >
                            <X size={12} />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Templates Section */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
            {currentTemplates.map(template => (
              <div key={template.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 group flex flex-col h-full">
                {/* Template Preview */}
                <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden group cursor-pointer"
                     onClick={() => handlePreviewTemplate(template.id)}>
                  {/* Mini Resume Preview - Enhanced */}
                  <div className="w-20 h-28 bg-white rounded-lg shadow-xl border border-gray-300 transform rotate-1 group-hover:rotate-0 transition-transform duration-300">
                    <div className="p-1.5 h-full flex flex-col space-y-0.5">
                      {/* Name/Header Bar */}
                      <div className={`h-2 rounded ${
                        template.colorScheme === 'blue' ? 'bg-blue-600' :
                        template.colorScheme === 'green' ? 'bg-green-600' :
                        template.colorScheme === 'monochrome' ? 'bg-gray-700' :
                        'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}></div>
                      
                      {/* Contact Line */}
                      <div className="h-1 bg-gray-200 rounded w-10/12"></div>
                      
                      {/* Summary Section */}
                      <div className="space-y-0.5">
                        <div className={`h-1 rounded w-8 ${
                          template.colorScheme === 'blue' ? 'bg-blue-500' :
                          template.colorScheme === 'green' ? 'bg-green-500' :
                          template.colorScheme === 'monochrome' ? 'bg-gray-600' :
                          'bg-purple-400'
                        }`}></div>
                        <div className="h-1 bg-gray-100 rounded w-full"></div>
                        <div className="h-1 bg-gray-100 rounded w-5/6"></div>
                      </div>
                      
                      {/* Experience Section */}
                      <div className="space-y-0.5">
                        <div className={`h-1 rounded w-7 ${
                          template.colorScheme === 'blue' ? 'bg-blue-500' :
                          template.colorScheme === 'green' ? 'bg-green-500' :
                          template.colorScheme === 'monochrome' ? 'bg-gray-600' :
                          'bg-purple-400'
                        }`}></div>
                        <div className="h-1 bg-gray-100 rounded w-full"></div>
                        <div className="h-1 bg-gray-100 rounded w-4/5"></div>
                      </div>
                      
                      {/* Bullet Points */}
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="h-1 bg-gray-100 rounded flex-1"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="h-1 bg-gray-100 rounded flex-1"></div>
                      </div>
                      
                      {/* Skills Tags */}
                      <div className="flex gap-1">
                        <div className="h-1 bg-gray-100 rounded flex-1"></div>
                        <div className="h-1 bg-gray-100 rounded flex-1"></div>
                      </div>
                    </div>
                  </div>
                  {template.isPremium && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Crown size={10} />
                      Premium
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className={`p-2 rounded-full transition-colors ${
                        favorites.includes(template.id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/80 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <Heart size={14} fill={favorites.includes(template.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handlePreviewTemplate(template.id)}
                      className="p-2 bg-white/80 text-gray-600 hover:bg-white rounded-full transition-colors"
                      title="Preview"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{template.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
                      <Star size={12} className="text-yellow-400 fill-current" />
                      <span className="font-medium">{template.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{template.description}</p>
                  
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                      {template.layout}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Download size={12} />
                      <span className="font-medium">{(template.downloads / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!addedTemplates.includes(template.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template.id);
                          }}
                          className={`px-3 py-2 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 relative overflow-hidden ${
                            addedTemplateId === template.id
                              ? 'bg-green-500 shadow-lg scale-105'
                              : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          {addedTemplateId === template.id ? (
                            <>
                              <CheckCircle size={14} className="animate-bounce" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              Add
                            </>
                          )}
                        </button>
                      )}
                      {addedTemplates.includes(template.id) && (
                        <div className="px-3 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg flex items-center gap-1.5">
                          <CheckCircle size={14} />
                          <span>Already Added</span>
                        </div>
                      )}
                      <button
                        onClick={() => handlePreviewTemplate(template.id)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Preview Template"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Added Templates List View */}
            {addedTemplatesList.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-green-600" />
                  <h2 className="text-lg font-bold text-gray-900">Added Templates to Resume Editor ({addedTemplatesList.length}/10)</h2>
                  <div className="h-1 flex-1 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-4">
                  {addedTemplatesList.map(template => (
                    <div key={template.id} className="bg-white border-2 border-green-300 rounded-lg p-4 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-start gap-4">
                        {/* Template Preview */}
                        <div className="relative w-20 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <div className="w-16 h-20 bg-white rounded shadow-lg border border-gray-200 transform rotate-1">
                            <div className="p-1.5 h-full flex flex-col space-y-0.5">
                              {/* Name/Header Bar */}
                              <div className={`h-1.5 rounded ${
                                template.colorScheme === 'blue' ? 'bg-blue-600' :
                                template.colorScheme === 'green' ? 'bg-green-600' :
                                template.colorScheme === 'monochrome' ? 'bg-gray-700' :
                                'bg-gradient-to-r from-purple-500 to-pink-500'
                              }`}></div>
                              
                              {/* Contact Line */}
                              <div className="h-0.5 bg-gray-200 rounded w-10/12"></div>
                              
                              {/* Summary Section */}
                              <div className="space-y-0.5">
                                <div className={`h-0.5 rounded w-6 ${
                                  template.colorScheme === 'blue' ? 'bg-blue-500' :
                                  template.colorScheme === 'green' ? 'bg-green-500' :
                                  template.colorScheme === 'monochrome' ? 'bg-gray-600' :
                                  'bg-purple-400'
                                }`}></div>
                                <div className="h-0.5 bg-gray-100 rounded w-full"></div>
                              </div>
                              
                              {/* Experience Section */}
                              <div className="space-y-0.5">
                                <div className={`h-0.5 rounded w-5 ${
                                  template.colorScheme === 'blue' ? 'bg-blue-500' :
                                  template.colorScheme === 'green' ? 'bg-green-500' :
                                  template.colorScheme === 'monochrome' ? 'bg-gray-600' :
                                  'bg-purple-400'
                                }`}></div>
                                <div className="h-0.5 bg-gray-100 rounded w-full"></div>
                              </div>
                              
                              {/* Bullet Point */}
                              <div className="flex items-center gap-0.5">
                                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                                <div className="h-0.5 bg-gray-100 rounded flex-1"></div>
                              </div>
                              
                              {/* Skills Tags */}
                              <div className="flex gap-0.5">
                                <div className="h-0.5 bg-gray-100 rounded flex-1"></div>
                                <div className="h-0.5 bg-gray-100 rounded flex-1"></div>
                              </div>
                            </div>
                          </div>
                          <div className="absolute -top-1 -right-1 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <CheckCircle size={12} />
                            Added
                          </div>
                        </div>

                        {/* Template Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{template.name}</h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => toggleFavorite(template.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  favorites.includes(template.id)
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-400 hover:bg-gray-100'
                                }`}
                              >
                                <Heart size={14} fill={favorites.includes(template.id) ? 'currentColor' : 'none'} />
                              </button>
                              <button
                                onClick={() => handlePreviewTemplate(template.id)}
                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Preview"
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Star size={12} className="text-yellow-400 fill-current" />
                              <span className="font-medium">{template.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Download size={12} />
                              <span className="font-medium">{(template.downloads / 1000).toFixed(0)}k</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock size={12} />
                              <span>{template.createdAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(template.difficulty)}`}>
                              {template.difficulty}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                              {template.layout}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                              {template.colorScheme}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              {template.features.slice(0, 3).map(feature => (
                                <span key={feature} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                  {feature}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePreviewTemplate(template.id)}
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                Preview
                              </button>
                              {onRemoveTemplate && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveTemplate(template.id);
                                  }}
                                  className="px-3 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                                >
                                  <X size={14} />
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Templates List View */}
            <div className="space-y-4 pb-8">
            {currentTemplates.map(template => (
              <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                <div className="flex items-start gap-4">
                  {/* Template Preview - Enhanced Mini Resume */}
                  <div className="relative w-20 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <div className="w-16 h-20 bg-white rounded shadow-lg border border-gray-200 transform rotate-1">
                      <div className="p-1.5 h-full flex flex-col space-y-0.5">
                        {/* Name/Header Bar */}
                        <div className={`h-1.5 rounded ${
                          template.colorScheme === 'blue' ? 'bg-blue-600' :
                          template.colorScheme === 'green' ? 'bg-green-600' :
                          template.colorScheme === 'monochrome' ? 'bg-gray-700' :
                          'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}></div>
                        
                        {/* Contact Line */}
                        <div className="h-0.5 bg-gray-200 rounded w-10/12"></div>
                        
                        {/* Summary Section */}
                        <div className="space-y-0.5">
                          <div className={`h-0.5 rounded w-6 ${
                            template.colorScheme === 'blue' ? 'bg-blue-500' :
                            template.colorScheme === 'green' ? 'bg-green-500' :
                            template.colorScheme === 'monochrome' ? 'bg-gray-600' :
                            'bg-purple-400'
                          }`}></div>
                          <div className="h-0.5 bg-gray-100 rounded w-full"></div>
                        </div>
                        
                        {/* Experience Section */}
                        <div className="space-y-0.5">
                          <div className={`h-0.5 rounded w-5 ${
                            template.colorScheme === 'blue' ? 'bg-blue-500' :
                            template.colorScheme === 'green' ? 'bg-green-500' :
                            template.colorScheme === 'monochrome' ? 'bg-gray-600' :
                            'bg-purple-400'
                          }`}></div>
                          <div className="h-0.5 bg-gray-100 rounded w-full"></div>
                        </div>
                        
                        {/* Bullet Point */}
                        <div className="flex items-center gap-0.5">
                          <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                          <div className="h-0.5 bg-gray-100 rounded flex-1"></div>
                        </div>
                        
                        {/* Skills Tags */}
                        <div className="flex gap-0.5">
                          <div className="h-0.5 bg-gray-100 rounded flex-1"></div>
                          <div className="h-0.5 bg-gray-100 rounded flex-1"></div>
                        </div>
                      </div>
                    </div>
                    {template.isPremium && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Crown size={10} />
                        Premium
                      </div>
                    )}
                  </div>

                  {/* Template Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleFavorite(template.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            favorites.includes(template.id) 
                              ? 'bg-red-50 text-red-600' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <Heart size={14} fill={favorites.includes(template.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button 
                          onClick={() => handlePreviewTemplate(template.id)}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star size={12} className="text-yellow-400 fill-current" />
                        <span className="font-medium">{template.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Download size={12} />
                        <span className="font-medium">{(template.downloads / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock size={12} />
                        <span>{template.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        {template.layout}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        {template.colorScheme}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {template.features.slice(0, 3).map(feature => (
                          <span key={feature} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {feature}
                          </span>
                        ))}
                      </div>
                            <div className="flex items-center gap-2">
                        {!addedTemplates.includes(template.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseTemplate(template.id);
                            }}
                            className={`px-3 py-2 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 relative overflow-hidden ${
                              addedTemplateId === template.id
                                ? 'bg-green-500 shadow-lg scale-105'
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            {addedTemplateId === template.id ? (
                              <>
                                <CheckCircle size={14} className="animate-bounce" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                Add
                              </>
                            )}
                          </button>
                        )}
                        {addedTemplates.includes(template.id) && (
                          <div className="px-3 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg flex items-center gap-1.5">
                            <CheckCircle size={14} />
                            <span>Already Added</span>
                          </div>
                        )}
                        <button
                          onClick={() => handlePreviewTemplate(template.id)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Preview Template"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-6 mb-4 gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors text-sm ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No templates found</h3>
            <p className="text-gray-600 mb-3 text-sm">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedLayout('all');
                setSelectedColorScheme('all');
                setShowPremiumOnly(false);
                setShowFreeOnly(false);
              }}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {showPreviewModal && currentSelectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <Layout size={24} className="text-gray-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentSelectedTemplate.name}</h2>
                  <p className="text-sm text-gray-600">{currentSelectedTemplate.description}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Template Preview Image */}
            <div className="mb-6 bg-gray-100 rounded-lg p-8">
              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-8 min-h-[600px] overflow-hidden">
                <div className="transform scale-75 origin-top-left">
                  {generateSampleResumePreview(currentSelectedTemplate)}
                </div>
              </div>
            </div>

            {/* Template Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {currentSelectedTemplate.features.map(feature => (
                    <span key={feature} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Specifications</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(currentSelectedTemplate.difficulty)}`}>
                      {currentSelectedTemplate.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Layout:</span>
                    <span className="font-medium text-gray-900">{currentSelectedTemplate.layout}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Color Scheme:</span>
                    <span className="font-medium text-gray-900 capitalize">{currentSelectedTemplate.colorScheme}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="font-medium text-gray-900">{currentSelectedTemplate.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(currentSelectedTemplate.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.includes(currentSelectedTemplate.id)
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <Heart size={20} fill={favorites.includes(currentSelectedTemplate.id) ? 'currentColor' : 'none'} />
                </button>
                <button 
                  onClick={handleShareTemplate}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 size={20} />
                </button>
                <button 
                  onClick={handleDownloadTemplate}
                  className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download size={20} />
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center gap-2"
                >
                  <Upload size={18} />
                  Upload & Apply
                </button>
                <button
                  onClick={() => handleUseTemplate(currentSelectedTemplate.id)}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden"
                >
                  {addedTemplateId === currentSelectedTemplate?.id ? (
                    <span className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                      <CheckCircle size={18} className="text-green-200" />
                      Added!
                    </span>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add to Editor
                    </>
                  )}
                  {addedTemplateId === currentSelectedTemplate?.id && (
                    <span className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse"></span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Apply Template Modal */}
      {showUploadModal && currentSelectedTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Upload & Apply Template</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              {!uploadedFile ? (
                /* Upload Area */
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Upload Your Resume</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedFile(file);
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <Folder size={48} className="mb-4 text-gray-400" />
                        <p className="text-gray-600 mb-2">Drop file here or click to browse</p>
                        <span className="text-sm text-gray-500">Supports: PDF, DOC, DOCX</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadedFile(null);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                /* Preview Area */
                <>
                  <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File size={24} className="text-green-600" />
                      <div>
                        <p className="font-semibold">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-600">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <XCircle size={20} className="text-red-600" />
                    </button>
                  </div>

                  {/* Preview of Resume with Template */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Preview with Template</h3>
                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-lg">
                      <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-lg">
                        {generateSampleResumePreview(currentSelectedTemplate)}
                      </div>
                    </div>
                  </div>

                  {/* Download Options */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-3">Download Format</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          logger.debug('Downloading as PDF with template:', currentSelectedTemplate.id);
                          alert('PDF download will be generated with template applied!');
                        }}
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all flex flex-col items-center gap-2"
                      >
                        <FileText size={32} className="text-red-600" />
                        <p className="font-semibold">Download as PDF</p>
                        <p className="text-sm text-gray-600">Portable format</p>
                      </button>
                      <button
                        onClick={() => {
                          logger.debug('Downloading as DOC with template:', currentSelectedTemplate.id);
                          alert('Word document will be generated with template applied!');
                        }}
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
                      >
                        <FileText size={32} className="text-blue-600" />
                        <p className="font-semibold">Download as Word</p>
                        <p className="text-sm text-gray-600">Editable format</p>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadedFile(null);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
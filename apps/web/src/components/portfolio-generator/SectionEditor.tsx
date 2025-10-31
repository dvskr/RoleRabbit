'use client';

import React, { useState } from 'react';
import { X, Save, Image, Plus, Trash2 } from 'lucide-react';
import { Section } from '../../types/portfolio';

interface SectionEditorProps {
  section: Section;
  onSave: (section: Section) => void;
  onClose: () => void;
  portfolioData?: any;
}

export default function SectionEditor({ section, onSave, onClose, portfolioData }: SectionEditorProps) {
  const [editedSection, setEditedSection] = useState<Section>({ ...section });

  const updateConfig = (updates: any) => {
    setEditedSection(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }));
  };

  const handleSave = () => {
    onSave(editedSection);
    onClose();
  };

  const renderEditor = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                type="text"
                value={editedSection.config.headline || ''}
                onChange={(e) => updateConfig({ headline: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Welcome to My Portfolio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subheading</label>
              <textarea
                value={editedSection.config.subheading || ''}
                onChange={(e) => updateConfig({ subheading: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows={3}
                placeholder="A passionate developer creating amazing solutions"
              />
            </div>
            <div>
              <label htmlFor="primary-cta-text" className="block text-sm font-medium text-gray-700 mb-2">Primary CTA Text</label>
              <input
                id="primary-cta-text"
                type="text"
                value={editedSection.config.ctaText || 'Contact Me'}
                onChange={(e) => updateConfig({ ctaText: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                aria-label="Primary CTA Text"
              />
            </div>
            <div>
              <label htmlFor="secondary-cta-text" className="block text-sm font-medium text-gray-700 mb-2">Secondary CTA Text</label>
              <input
                id="secondary-cta-text"
                type="text"
                value={editedSection.config.secondaryCta || 'View Resume'}
                onChange={(e) => updateConfig({ secondaryCta: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                aria-label="Secondary CTA Text"
              />
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={editedSection.config.title || ''}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="About Me"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={editedSection.config.description || ''}
                onChange={(e) => updateConfig({ description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows={6}
                placeholder="Tell your story..."
              />
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                type="text"
                value={editedSection.config.title || ''}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Work Experience"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Items</label>
              <div className="space-y-3">
                {(editedSection.config.items || []).map((item: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <input
                        type="text"
                        value={item.position || ''}
                        onChange={(e) => {
                          const newItems = [...(editedSection.config.items || [])];
                          newItems[index] = { ...newItems[index], position: e.target.value };
                          updateConfig({ items: newItems });
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Position"
                      />
                      <input
                        type="text"
                        value={item.company || ''}
                        onChange={(e) => {
                          const newItems = [...(editedSection.config.items || [])];
                          newItems[index] = { ...newItems[index], company: e.target.value };
                          updateConfig({ items: newItems });
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Company"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <input
                        type="text"
                        value={item.date || ''}
                        onChange={(e) => {
                          const newItems = [...(editedSection.config.items || [])];
                          newItems[index] = { ...newItems[index], date: e.target.value };
                          updateConfig({ items: newItems });
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="2020 - Present"
                      />
                      <input
                        type="text"
                        value={item.location || ''}
                        onChange={(e) => {
                          const newItems = [...(editedSection.config.items || [])];
                          newItems[index] = { ...newItems[index], location: e.target.value };
                          updateConfig({ items: newItems });
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Location"
                      />
                    </div>
                    <textarea
                      value={item.description || ''}
                      onChange={(e) => {
                        const newItems = [...(editedSection.config.items || [])];
                        newItems[index] = { ...newItems[index], description: e.target.value };
                        updateConfig({ items: newItems });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Job description..."
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    updateConfig({
                      items: [...(editedSection.config.items || []), { position: '', company: '', date: '', description: '' }]
                    });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Experience
                </button>
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                type="text"
                value={editedSection.config.title || ''}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Featured Projects"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Projects</label>
              <div className="space-y-3">
                {(editedSection.config.items || []).map((project: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <input
                        type="text"
                        value={project.name || ''}
                        onChange={(e) => {
                          const newItems = [...(editedSection.config.items || [])];
                          newItems[index] = { ...newItems[index], name: e.target.value };
                          updateConfig({ items: newItems });
                        }}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2"
                        placeholder="Project Name"
                      />
                      <button
                        onClick={() => {
                          const newItems = (editedSection.config.items || []).filter((_: any, i: number) => i !== index);
                          updateConfig({ items: newItems });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label={`Remove project ${index + 1}`}
                        title="Remove project"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <textarea
                      value={project.description || ''}
                      onChange={(e) => {
                        const newItems = [...(editedSection.config.items || [])];
                        newItems[index] = { ...newItems[index], description: e.target.value };
                        updateConfig({ items: newItems });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                      rows={2}
                      placeholder="Project description..."
                    />
                    <input
                      type="text"
                      value={project.url || ''}
                      onChange={(e) => {
                        const newItems = [...(editedSection.config.items || [])];
                        newItems[index] = { ...newItems[index], url: e.target.value };
                        updateConfig({ items: newItems });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Project URL (optional)"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    updateConfig({
                      items: [...(editedSection.config.items || []), { name: '', description: '', url: '' }]
                    });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Project
                </button>
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                type="text"
                value={editedSection.config.title || ''}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Technical Skills"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {(editedSection.config.items || []).map((skill: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    <span>{skill}</span>
                    <button
                      onClick={() => {
                        const newSkills = (editedSection.config.items || []).filter((_: string, i: number) => i !== index);
                        updateConfig({ items: newSkills });
                      }}
                      className="text-blue-700 hover:text-red-600"
                      aria-label={`Remove skill ${skill}`}
                      title="Remove skill"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a skill and press Enter"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        updateConfig({ items: [...(editedSection.config.items || []), value] });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                type="text"
                value={editedSection.config.title || ''}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Education"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Education Items</label>
              <div className="space-y-3">
                {(editedSection.config.items || []).map((edu: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => {
                          const newItems = [...(editedSection.config.items || [])];
                          newItems[index] = { ...newItems[index], degree: e.target.value };
                          updateConfig({ items: newItems });
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Degree"
                      />
                      <input
                        type="text"
                        value={edu.institution || ''}
                        onChange={(e) => {
                          const newItems = [...(editedSection.config.items || [])];
                          newItems[index] = { ...newItems[index], institution: e.target.value };
                          updateConfig({ items: newItems });
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Institution"
                      />
                    </div>
                    <input
                      type="text"
                      value={edu.year || ''}
                      onChange={(e) => {
                        const newItems = [...(editedSection.config.items || [])];
                        newItems[index] = { ...newItems[index], year: e.target.value };
                        updateConfig({ items: newItems });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="2020"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    updateConfig({
                      items: [...(editedSection.config.items || []), { degree: '', institution: '', year: '' }]
                    });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Education
                </button>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                type="text"
                value={editedSection.config.title || ''}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Get In Touch"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={editedSection.config.email || ''}
                onChange={(e) => updateConfig({ email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
              <div className="space-y-2">
                {(editedSection.config.socialLinks || []).map((link: any, index: number) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={link.label || ''}
                      onChange={(e) => {
                        const newLinks = [...(editedSection.config.socialLinks || [])];
                        newLinks[index] = { ...newLinks[index], label: e.target.value };
                        updateConfig({ socialLinks: newLinks });
                      }}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="LinkedIn"
                    />
                    <input
                      type="text"
                      value={link.url || ''}
                      onChange={(e) => {
                        const newLinks = [...(editedSection.config.socialLinks || [])];
                        newLinks[index] = { ...newLinks[index], url: e.target.value };
                        updateConfig({ socialLinks: newLinks });
                      }}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="https://"
                    />
                    <button
                      onClick={() => {
                        const newLinks = (editedSection.config.socialLinks || []).filter((_: any, i: number) => i !== index);
                        updateConfig({ socialLinks: newLinks });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      aria-label={`Remove social link ${index + 1}`}
                      title="Remove social link"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    updateConfig({
                      socialLinks: [...(editedSection.config.socialLinks || []), { label: '', url: '' }]
                    });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Social Link
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>No editor available for this section type</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Edit {section.title}</h2>
            <p className="text-blue-100 text-sm">Customize your section content</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close section editor"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderEditor()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useId, useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import type { Section, SectionConfig, SectionItem } from '../../types/portfolio';

interface SectionEditorProps {
  section: Section;
  onSave: (section: Section) => void;
  onClose: () => void;
}

export default function SectionEditor({ section, onSave, onClose }: SectionEditorProps) {
  const [editedSection, setEditedSection] = useState<Section>({ ...section });
  const idPrefix = useId();

  const updateConfig = (updates: Partial<SectionConfig>) => {
    setEditedSection((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }));
  };

  const getItems = (): SectionItem[] =>
    Array.isArray(editedSection.config.items) ? [...editedSection.config.items] : [];

  const updateItem = (index: number, itemUpdates: SectionItem) => {
    const items = getItems();
    const current = items[index] || {};
    items[index] = { ...current, ...itemUpdates };
    updateConfig({ items });
  };

  const removeItem = (index: number) => {
    const items = getItems().filter((_, itemIndex) => itemIndex !== index);
    updateConfig({ items });
  };

  const getStringValue = (value: unknown): string => (typeof value === 'string' ? value : '');

  const getSkillItems = (): string[] => {
    if (!Array.isArray(editedSection.config.items)) {
      return [];
    }

    return editedSection.config.items.map((item) => (typeof item === 'string' ? item : String(item ?? '')));
  };

  const getSocialLinks = (): SectionItem[] =>
    Array.isArray(editedSection.config.socialLinks) ? [...editedSection.config.socialLinks] : [];

  const updateSocialLink = (index: number, updates: SectionItem) => {
    const links = getSocialLinks();
    const current = links[index] || {};
    links[index] = { ...current, ...updates };
    updateConfig({ socialLinks: links });
  };

  const removeSocialLink = (index: number) => {
    const links = getSocialLinks().filter((_, linkIndex) => linkIndex !== index);
    updateConfig({ socialLinks: links });
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
              <label htmlFor={`${idPrefix}-hero-headline`} className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
              <input
                id={`${idPrefix}-hero-headline`}
                type="text"
                value={editedSection.config.headline || ''}
                onChange={(e) => updateConfig({ headline: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Welcome to My Portfolio"
              />
            </div>
            <div>
              <label htmlFor={`${idPrefix}-hero-subheading`} className="block text-sm font-medium text-gray-700 mb-2">Subheading</label>
              <textarea
                id={`${idPrefix}-hero-subheading`}
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
        const experienceItems = getItems();
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor={`${idPrefix}-experience-title`} className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
              <input
                id={`${idPrefix}-experience-title`}
                type="text"
                value={editedSection.config.title || ''}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Work Experience"
              />
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">Experience Items</p>
              <div className="space-y-3">
                {experienceItems.map((item, index) => {
                  const positionId = `${idPrefix}-experience-position-${index}`;
                  const companyId = `${idPrefix}-experience-company-${index}`;
                  const dateId = `${idPrefix}-experience-date-${index}`;
                  const locationId = `${idPrefix}-experience-location-${index}`;
                  const descriptionId = `${idPrefix}-experience-description-${index}`;

                  return (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <input
                          id={positionId}
                          type="text"
                          value={getStringValue((item as Record<string, unknown>).position)}
                          onChange={(e) => updateItem(index, { position: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Position"
                        />
                        <input
                          id={companyId}
                          type="text"
                          value={getStringValue((item as Record<string, unknown>).company)}
                          onChange={(e) => updateItem(index, { company: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Company"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <input
                          id={dateId}
                          type="text"
                          value={getStringValue((item as Record<string, unknown>).date)}
                          onChange={(e) => updateItem(index, { date: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="2020 - Present"
                        />
                        <input
                          id={locationId}
                          type="text"
                          value={getStringValue((item as Record<string, unknown>).location)}
                          onChange={(e) => updateItem(index, { location: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Location"
                        />
                      </div>
                      <textarea
                        id={descriptionId}
                        value={getStringValue((item as Record<string, unknown>).description)}
                        onChange={(e) => updateItem(index, { description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Job description..."
                      />
                      <button
                        onClick={() => removeItem(index)}
                        className="mt-3 text-sm text-red-600 hover:text-red-700"
                        type="button"
                      >
                        Remove experience
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={() => {
                    const newItems = [...experienceItems, { position: '', company: '', date: '', description: '' } as SectionItem];
                    updateConfig({ items: newItems });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                  type="button"
                >
                  <Plus size={18} />
                  Add Experience
                </button>
              </div>
            </div>
          </div>
        );

      case 'projects':
        const projectItems = getItems();
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
                {projectItems.map((item, index) => {
                  const project = item as Record<string, unknown>;
                  const nameId = `${idPrefix}-project-name-${index}`;
                  const descriptionId = `${idPrefix}-project-description-${index}`;
                  const urlId = `${idPrefix}-project-url-${index}`;

                  return (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <input
                        id={nameId}
                        type="text"
                        value={getStringValue(project.name)}
                        onChange={(e) => updateItem(index, { name: e.target.value })}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2"
                        placeholder="Project Name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          removeItem(index);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label={`Remove project ${index + 1}`}
                        title="Remove project"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <textarea
                      id={descriptionId}
                      value={getStringValue(project.description)}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                      rows={2}
                      placeholder="Project description..."
                    />
                    <input
                      id={urlId}
                      type="text"
                      value={getStringValue(project.url)}
                      onChange={(e) => updateItem(index, { url: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Project URL (optional)"
                    />
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    updateConfig({
                      items: [...projectItems, { name: '', description: '', url: '' }]
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
        const skillItems = getSkillItems();
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
                {skillItems.map((skill, index) => (
                  <div key={`${skill}-${index}`} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newSkills = skillItems.filter((_, i) => i !== index);
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
                        updateConfig({ items: [...skillItems, value] });
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
        const educationItems = getItems();
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
                {educationItems.map((item, index) => {
                  const education = item as Record<string, unknown>;
                  const degreeId = `${idPrefix}-education-degree-${index}`;
                  const institutionId = `${idPrefix}-education-institution-${index}`;
                  const yearId = `${idPrefix}-education-year-${index}`;

                  return (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <input
                        id={degreeId}
                        type="text"
                        value={getStringValue(education.degree)}
                        onChange={(e) => updateItem(index, { degree: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Degree"
                      />
                      <input
                        id={institutionId}
                        type="text"
                        value={getStringValue(education.institution)}
                        onChange={(e) => updateItem(index, { institution: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Institution"
                      />
                    </div>
                    <input
                      id={yearId}
                      type="text"
                      value={getStringValue(education.year)}
                      onChange={(e) => updateItem(index, { year: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="2020"
                    />
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    updateConfig({
                      items: [...educationItems, { degree: '', institution: '', year: '' }]
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
        const socialLinks = getSocialLinks();
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
                {socialLinks.map((link, index) => {
                  const linkData = link as Record<string, unknown>;
                  const labelId = `${idPrefix}-social-label-${index}`;
                  const urlId = `${idPrefix}-social-url-${index}`;

                  return (
                    <div key={index} className="flex gap-2">
                    <input
                      id={labelId}
                      type="text"
                      value={getStringValue(linkData.label)}
                      onChange={(e) => updateSocialLink(index, { label: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="LinkedIn"
                    />
                    <input
                      id={urlId}
                      type="text"
                      value={getStringValue(linkData.url)}
                      onChange={(e) => updateSocialLink(index, { url: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="https://"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        removeSocialLink(index);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      aria-label={`Remove social link ${index + 1}`}
                      title="Remove social link"
                    >
                      <Trash2 size={18} />
                    </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    updateConfig({
                      socialLinks: [...socialLinks, { label: '', url: '' }]
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


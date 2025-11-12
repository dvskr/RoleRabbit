'use client';

import React, { useEffect, useState } from 'react';
import { Award, Globe, Trash2, Edit2, X, Plus, GraduationCap, ArrowLeft } from 'lucide-react';
import { UserData, Skill, Certification, Education } from '../types/profile';
import {
  sanitizeSkills,
  sanitizeCertifications,
  sanitizeLanguages,
  sanitizeEducation,
  normalizeToArray
} from '../utils/dataSanitizer';
import { useTheme } from '../../../contexts/ThemeContext';
import FormField from '../components/FormField';
import { TagSection } from '../components/TagSection';

interface SkillsTabProps {
  userData: UserData;
  isEditing: boolean;
  onUserDataChange: (data: Partial<UserData>) => void;
}

export default function SkillsTab({
  userData,
  isEditing,
  onUserDataChange
}: SkillsTabProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isEditing) {
      setEditingSkillId(null);
      setEditingCertId(null);
      setEditingEducationId(null);
    }
  }, [isEditing]);
  
  // Use sanitizeSkills directly - it handles normalization internally
  const sanitizedSkills = sanitizeSkills(userData.skills, { keepDrafts: true });

  const addSkill = (skillNameOrList: string) => {
    // Support comma-separated skills: "Python, JavaScript, React" or single skill: "Python"
    const skillNames = skillNameOrList
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (skillNames.length === 0) return;
    
    // Add all skills that don't already exist (case-insensitive)
    const newSkills: Skill[] = [];
    const existingSkillNames = new Set(sanitizedSkills.map(s => s.name.toLowerCase()));
    
    skillNames.forEach(skillName => {
      if (!existingSkillNames.has(skillName.toLowerCase())) {
        newSkills.push({
          name: skillName,
          verified: false
        });
        existingSkillNames.add(skillName.toLowerCase()); // Prevent duplicates in the same batch
      }
    });
    
    if (newSkills.length > 0) {
      onUserDataChange({ skills: sanitizeSkills([...sanitizedSkills, ...newSkills], { keepDrafts: true }) });
    }
  };

  const updateSkill = (index: number, updates: Partial<Skill>) => {
    const updated = sanitizedSkills.map((skill, i) =>
      i === index ? { ...skill, ...updates } : skill
    );
    onUserDataChange({ skills: sanitizeSkills(updated, { keepDrafts: true }) });
  };

  const removeSkill = (index: number) => {
    const updatedSkills = sanitizedSkills.filter((_, i) => i !== index);
    onUserDataChange({ skills: sanitizeSkills(updatedSkills, { keepDrafts: true }) });
    // Reset editing state if the removed skill was being edited
    if (editingSkillId === index) {
      setEditingSkillId(null);
    } else if (editingSkillId !== null && editingSkillId > index) {
      // Adjust editing index if a skill before the edited one was removed
      setEditingSkillId(editingSkillId - 1);
    }
  };

  // Use sanitizeCertifications directly - it handles normalization internally
  const certifications: Certification[] = sanitizeCertifications(userData.certifications, { keepDrafts: true });
  
  const addCertification = () => {
    const cert: Certification = {
      id: `temp-cert-${Date.now()}-${Math.random()}`,
      name: '',
      issuer: '',
      date: '', // Optional - allow blank
      verified: false
    };
    onUserDataChange({ certifications: [...certifications, cert] });
    setEditingCertId(certifications.length);
  };

  const updateCertification = (index: number, updates: Partial<Certification>) => {
    const updated = certifications.map((cert, i) => 
      i === index ? { ...cert, ...updates } : cert
    );
    onUserDataChange({ certifications: updated });
  };

  const removeCertification = (index: number) => {
    onUserDataChange({ certifications: certifications.filter((_, i) => i !== index) });
    setEditingCertId(null);
  };

  // Use sanitizeLanguages directly - it handles normalization internally
  const languages = sanitizeLanguages(userData.languages, { keepDrafts: true });
  
  const addLanguage = (langNameOrList: string) => {
    // Support comma-separated languages: "English, Spanish, French" or single language: "English"
    const langNames = langNameOrList
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (langNames.length === 0) return;
    
    // Add all languages that don't already exist (case-insensitive)
    const newLanguages: any[] = [];
    const existingLangNames = new Set(languages.map(l => l.name.toLowerCase()));
    
    langNames.forEach(langName => {
      if (!existingLangNames.has(langName.toLowerCase())) {
        newLanguages.push({
          name: langName,
          proficiency: 'Native' // Keep for data structure, but won't display
        });
        existingLangNames.add(langName.toLowerCase()); // Prevent duplicates in the same batch
      }
    });
    
    if (newLanguages.length > 0) {
      onUserDataChange({ languages: [...languages, ...newLanguages] });
    }
  };

  const updateLanguage = (index: number, updates: Partial<{ name: string; proficiency: string }>) => {
    const updated = languages.map((lang, i) => 
      i === index ? { ...lang, ...updates } : lang
    );
    onUserDataChange({ languages: updated });
  };

  const removeLanguage = (index: number) => {
    onUserDataChange({ languages: languages.filter((_, i) => i !== index) });
  };


  // Use sanitizeEducation directly - it handles normalization internally
  const education = sanitizeEducation(userData.education, { keepDrafts: true });

  useEffect(() => {
    if (!isEditing && editingEducationId) {
      setEditingEducationId(null);
    }
  }, [isEditing, editingEducationId]);

  useEffect(() => {
    if (editingEducationId && !education.some((edu) => edu.id === editingEducationId)) {
      setEditingEducationId(null);
    }
  }, [education, editingEducationId]);

  const addEducation = () => {
    const newId = `temp-edu-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const newEducation: Education = {
      id: newId,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      honors: '',
      location: '',
      description: '',
    };
    onUserDataChange({ education: [...education, newEducation] });
    setEditingEducationId(newId);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    const updated = education.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu));
    onUserDataChange({ education: updated });
  };

  const removeEducation = (id: string) => {
    const updated = education.filter((edu) => edu.id !== id);
    onUserDataChange({ education: updated });
    if (editingEducationId === id) {
      setEditingEducationId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-8">

        {/* Technical Skills */}
        <TagSection
          title="Technical Skills"
          items={sanitizedSkills}
          isEditing={isEditing}
          colors={colors}
          onAdd={addSkill}
          onRemove={removeSkill}
          inputId="add-skill-input"
          inputPlaceholder="Add skills (comma-separated: Python, JavaScript, React or single: Python)"
          emptyIcon={Award}
          emptyMessage="No skills added yet"
          emptyHint="Add your first skill to get started"
        />

        {/* Certifications */}
        <div
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg bg-theme-card-bg border border-theme-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-theme-primary-text">
              Certifications
            </h3>
            {isEditing && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addCertification();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-primary-blue text-white"
              >
                <Plus size={16} />
                Add Certification
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {certifications.map((cert, index) => {
              const isEditingCert = isEditing && editingCertId === index;
              // Use cert.id if available, otherwise fallback to index (for new certs)
              // This ensures unique IDs even when certs are reordered
              const certId = cert.id || `temp-cert-${index}`;
              
              return (
                <div
                  key={certId}
                  className="p-5 rounded-xl transition-all bg-theme-card-bg border border-theme-border"
                >
                  {isEditingCert ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Award size={18} className="text-theme-warning" />
                          <h4 className="font-semibold text-theme-primary-text">Edit Certification</h4>
                        </div>
                        <button
                          onClick={() => setEditingCertId(null)}
                          className="p-1 rounded text-theme-secondary-text"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          id={`cert-${certId}-name`}
                          name={`cert-${certId}-name`}
                          label="Certification Name"
                          value={cert.name}
                          onChange={(value) => updateCertification(index, { name: value })}
                          disabled={false}
                          placeholder="e.g., AWS Certified Solutions Architect"
                        />
                        <FormField
                          id={`cert-${certId}-issuer`}
                          name={`cert-${certId}-issuer`}
                          label="Issuing Organization"
                          value={cert.issuer}
                          onChange={(value) => updateCertification(index, { issuer: value })}
                          disabled={false}
                          placeholder="e.g., Amazon Web Services"
                        />
                        <FormField
                          id={`cert-${certId}-date`}
                          name={`cert-${certId}-date`}
                          label="Issue Date (Optional)"
                          type="date"
                          value={cert.date || ''}
                          onChange={(value) => updateCertification(index, { date: value || null })}
                          disabled={false}
                        />
                        <FormField
                          id={`cert-${certId}-expiry-date`}
                          name={`cert-${certId}-expiry-date`}
                          label="Expiry Date (Optional)"
                          type="date"
                          value={cert.expiryDate || ''}
                          onChange={(value) => updateCertification(index, { expiryDate: value || null })}
                          disabled={false}
                        />
                        <FormField
                          id={`cert-${certId}-credential-url`}
                          name={`cert-${certId}-credential-url`}
                          label="Credential URL (Optional)"
                          type="url"
                          value={cert.credentialUrl || ''}
                          onChange={(value) => updateCertification(index, { credentialUrl: value || null })}
                          disabled={false}
                          placeholder="https://credential-url.com"
                          className="md:col-span-2"
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingCertId(null);
                          }}
                          className="flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-theme-input-bg text-theme-secondary-text border border-theme-border"
                        >
                          <ArrowLeft size={14} />
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeCertification(index);
                          }}
                          className="px-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-theme-error text-white"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                      <p className="text-xs mt-2 pt-2 border-t text-theme-secondary-text border-theme-border">
                        Changes will be saved when you click "Save" in the header
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div
                        className="p-2 rounded-lg flex-shrink-0 bg-theme-input-bg border border-theme-border"
                      >
                        <Award size={20} className="text-theme-primary-text" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1 text-theme-primary-text">
                              {cert.name || 'Untitled Certification'}
                            </h4>
                            <p className="text-sm mb-2 text-theme-secondary-text">
                              {cert.issuer || 'Issuer not specified'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs text-theme-tertiary-text">
                                Issued: {cert.date || 'Not specified'}
                              </span>
                              {cert.expiryDate && (
                                <span className="text-xs text-theme-tertiary-text">
                                  Expires: {cert.expiryDate}
                                </span>
                              )}
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs hover:underline flex items-center gap-1 text-theme-primary-blue"
                                >
                                  View Credential
                                </a>
                              )}
                            </div>
                          </div>
                          {isEditing && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => setEditingCertId(index)}
                                className="p-2 rounded-lg transition-colors text-theme-primary-blue hover:bg-theme-badge-info-bg"
                                aria-label="Edit certification"
                                title="Edit certification"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => removeCertification(index)}
                                className="p-2 rounded-lg transition-colors text-theme-error hover:bg-theme-badge-error-bg"
                                aria-label="Remove certification"
                                title="Remove certification"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {certifications.length === 0 && (
              <div className="text-center py-8 text-theme-tertiary-text">
                <Award size={48} className="mx-auto mb-4 text-theme-tertiary-text opacity-50" />
                <p>No certifications added yet</p>
                {isEditing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addCertification();
                    }}
                    className="mt-4 px-6 py-3 rounded-xl bg-theme-primary-blue text-white"
                  >
                    <Plus size={16} className="inline mr-2" />
                    Add Your First Certification
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Languages */}
        <TagSection
          title="Languages"
          items={languages}
          isEditing={isEditing}
          colors={colors}
          onAdd={addLanguage}
          onRemove={removeLanguage}
          inputId="add-language-input"
          inputPlaceholder="Add languages (comma-separated: English, Spanish, French or single: English)"
          emptyIcon={Globe}
          emptyMessage="No languages added yet"
          emptyHint="Add your first language to get started"
        />

        {/* Education */}
        <div
          className="backdrop-blur-sm rounded-2xl p-8 shadow-lg bg-theme-card-bg border border-theme-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-theme-primary-text">
              Education
            </h3>
            {isEditing && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addEducation();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-primary-blue text-white hover:opacity-90"
              >
                <Plus size={16} />
                Add Education
              </button>
            )}
          </div>

          {education.length === 0 ? (
            <div className="text-center py-8 text-theme-tertiary-text">
              <GraduationCap size={48} className="mx-auto mb-4 text-theme-tertiary-text opacity-50" />
              <p>No education entries added yet</p>
              {isEditing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addEducation();
                  }}
                  className="mt-4 px-6 py-3 rounded-xl bg-theme-primary-blue text-white hover:opacity-90"
                >
                  <Plus size={16} className="inline mr-2" />
                  Add Your First Education
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {education.map((edu, index) => {
                const entryId = edu.id || `edu-${index}`;
                const isEditingEducation = isEditing && editingEducationId === entryId;
                const degreeField = [edu.degree, edu.field].filter((value) => value && value.length > 0).join(' • ');
                const dateRange = [edu.startDate, edu.endDate]
                  .filter((value) => value && value.length > 0)
                  .join(' - ');

                return (
                  <div
                    key={entryId}
                    className={`p-6 rounded-xl transition-all bg-theme-card-bg border ${
                      isEditingEducation ? 'border-theme-primary-blue' : 'border-theme-border'
                    }`}
                  >
                    {isEditingEducation ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            id={`education-${entryId}-institution`}
                            name={`education-${entryId}-institution`}
                            label="Institution"
                            value={edu.institution || ''}
                            onChange={(value) => updateEducation(entryId, { institution: value })}
                            disabled={false}
                            placeholder="e.g., Stanford University"
                          />
                          <FormField
                            id={`education-${entryId}-location`}
                            name={`education-${entryId}-location`}
                            label="Location (Optional)"
                            value={edu.location || ''}
                            onChange={(value) => updateEducation(entryId, { location: value })}
                            disabled={false}
                            placeholder="e.g., Stanford, CA"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            id={`education-${entryId}-degree`}
                            name={`education-${entryId}-degree`}
                            label="Degree"
                            value={edu.degree || ''}
                            onChange={(value) => updateEducation(entryId, { degree: value })}
                            disabled={false}
                            placeholder="e.g., Bachelor of Science"
                          />
                          <FormField
                            id={`education-${entryId}-field`}
                            name={`education-${entryId}-field`}
                            label="Field of Study"
                            value={edu.field || ''}
                            onChange={(value) => updateEducation(entryId, { field: value })}
                            disabled={false}
                            placeholder="e.g., Computer Science"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            id={`education-${entryId}-start`}
                            name={`education-${entryId}-start`}
                            label="Start Date"
                            value={edu.startDate || ''}
                            onChange={(value) => updateEducation(entryId, { startDate: value })}
                            disabled={false}
                            placeholder="e.g., 2015-09 or Sep 2015"
                          />
                          <FormField
                            id={`education-${entryId}-end`}
                            name={`education-${entryId}-end`}
                            label="End Date"
                            value={edu.endDate || ''}
                            onChange={(value) => updateEducation(entryId, { endDate: value })}
                            disabled={false}
                            placeholder="e.g., 2019-05 or Present"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            id={`education-${entryId}-gpa`}
                            name={`education-${entryId}-gpa`}
                            label="GPA (Optional)"
                            value={edu.gpa || ''}
                            onChange={(value) => updateEducation(entryId, { gpa: value })}
                            disabled={false}
                            placeholder="e.g., 3.8"
                          />
                          <FormField
                            id={`education-${entryId}-honors`}
                            name={`education-${entryId}-honors`}
                            label="Honors & Awards (Optional)"
                            value={edu.honors || ''}
                            onChange={(value) => updateEducation(entryId, { honors: value })}
                            disabled={false}
                            placeholder="e.g., Summa Cum Laude"
                          />
                        </div>

                        <FormField
                          id={`education-${entryId}-description`}
                          name={`education-${entryId}-description`}
                          label="Description (Optional)"
                          type="textarea"
                          value={edu.description || ''}
                          onChange={(value) => updateEducation(entryId, { description: value })}
                          disabled={false}
                          placeholder="Key courses, achievements, activities..."
                          rows={4}
                          autoResize={true}
                          allowBullets={true}
                        />

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeEducation(entryId);
                            }}
                            className="px-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-theme-error text-white"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                        <p className="text-xs mt-2 pt-2 border-t text-theme-secondary-text border-theme-border">
                          Changes will be saved when you click "Save" in the header
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-3">
                          <div>
                            <h4 className="font-semibold text-theme-primary-text">
                              {edu.institution || 'Institution not specified'}
                            </h4>
                            <p className="text-sm text-theme-secondary-text">
                              {degreeField || 'Degree information not provided'}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-theme-tertiary-text">
                            <span>
                              {dateRange || 'Dates not specified'}
                            </span>
                            {edu.location && (
                              <span>Location: {edu.location}</span>
                            )}
                            {edu.gpa && (
                              <span>GPA: {edu.gpa}</span>
                            )}
                            {edu.honors && (
                              <span>Honors: {edu.honors}</span>
                            )}
                          </div>
                          {edu.description && (
                            <p className="text-sm text-theme-secondary-text">
                              {edu.description}
                            </p>
                          )}
                        </div>
                        {isEditing && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingEducationId(entryId)}
                              className="p-2 rounded-lg transition-colors text-theme-primary-blue hover:bg-theme-badge-info-bg"
                              aria-label="Edit education"
                              title="Edit education"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeEducation(entryId)}
                              className="p-2 rounded-lg transition-colors text-theme-error hover:bg-theme-badge-error-bg"
                              aria-label="Remove education"
                              title="Remove education"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

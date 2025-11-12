'use client';

import React, { useMemo } from 'react';
import { Eye, Sparkles, GripVertical, Plus, X, Trash2 } from 'lucide-react';
import { ResumeData, ExperienceItem, CustomField } from '../../types/resume';
import { useTheme } from '../../contexts/ThemeContext';

const sanitize = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/\s+/g, ' ').trim();
};

const toArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.keys(record)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => record[key]);
  }
  return [value];
};

const environmentDelimiter = /[,\n\r•·\u2022]+/;

const normalizeBullets = (value: unknown): string[] => {
  const raw = toArray(value).flatMap(toArray).map((entry) => (typeof entry === 'string' ? entry : String(entry ?? '')));
  const hasBlank = raw.some((entry) => entry === '' || entry === null || entry === undefined);
  const sanitized = raw.map(sanitize).filter((entry) => entry.length > 0);
  if (hasBlank) {
    sanitized.push('');
  }
  if (sanitized.length === 0) {
    sanitized.push('');
  }
  return sanitized;
};

const normalizeEnvironment = (value: unknown): string[] => {
  const baseEntries = toArray(value).flatMap((entry) =>
    Array.isArray(entry) ? entry : [entry]
  );

  const expanded = baseEntries.flatMap((entry) =>
    typeof entry === 'string' ? entry.split(environmentDelimiter) : [entry]
  );

  const hasBlank = expanded.some((entry) => entry === '' || entry === null || entry === undefined);

  const sanitized = expanded
    .map((entry) => (typeof entry === 'string' ? sanitize(entry) : String(entry ?? '')))
    .filter((entry) => entry.length > 0);

  const unique = Array.from(new Set(sanitized));

  if (hasBlank) {
    unique.push('');
  }

  if (unique.length === 0) {
    unique.push('');
  }

  return unique;
};

const normalizeCustomFields = (value: unknown): CustomField[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((field): field is CustomField => !!field);
};

const normalizeExperienceArray = (value: unknown): ExperienceItem[] => {
  const raw = toArray(value);
  return raw
    .map((entry, index) => {
      const candidate = entry as Partial<ExperienceItem>;
      const rawId = candidate?.id;
      const id =
        typeof rawId === 'number'
          ? rawId
          : Number(rawId) || Date.now() + index;

      const bullets = normalizeBullets(candidate?.bullets ?? candidate?.responsibilities);
      const environment = normalizeEnvironment(candidate?.environment);

      return {
        id,
        company: sanitize(candidate?.company),
        position: sanitize(candidate?.position),
        period: sanitize(candidate?.period),
        endPeriod: sanitize(candidate?.endPeriod),
        location: sanitize(candidate?.location),
        bullets: bullets.length ? bullets : [''],
        environment,
        customFields: normalizeCustomFields(candidate?.customFields),
      } as ExperienceItem;
    })
    .filter(Boolean);
};

interface ExperienceSectionProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  sectionVisibility: Record<string, boolean>;
  onHideSection: (section: string) => void;
  onOpenAIGenerateModal: (section: string) => void;
}

const ExperienceSection = React.memo(function ExperienceSection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection,
  onOpenAIGenerateModal,
}: ExperienceSectionProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const experiences = useMemo(
    () => normalizeExperienceArray(resumeData.experience),
    [resumeData.experience]
  );

  const updateExperiences = (updater: (current: ExperienceItem[]) => ExperienceItem[]) => {
    setResumeData((prev) => {
      const current = normalizeExperienceArray(prev.experience);
      return { ...prev, experience: updater(current) };
    });
  };

  const handleAddExperience = () => {
    updateExperiences((current) => [
      ...current,
      {
        id: Date.now(),
        company: '',
        position: '',
        period: '',
        endPeriod: '',
        location: '',
        bullets: [''],
        environment: [],
        customFields: [],
      },
    ]);
  };

  const handleUpdateExperience = (id: number, updates: Partial<ExperienceItem>) => {
    updateExperiences((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteExperience = (id: number) => {
    updateExperiences((current) => current.filter((item) => item.id !== id));
  };

  const handleAddBullet = (id: number) => {
    updateExperiences((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, bullets: [...item.bullets, ''] }
          : item
      )
    );
  };

  const handleUpdateBullet = (id: number, index: number, value: string) => {
    updateExperiences((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const bullets = [...item.bullets];
        bullets[index] = value;
        return { ...item, bullets };
      })
    );
  };

  const handleDeleteBullet = (id: number, index: number) => {
    updateExperiences((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const bullets = item.bullets.filter((_, i) => i !== index);
        return { ...item, bullets: bullets.length ? bullets : [''] };
      })
    );
  };

  const handleAddEnvironment = (id: number) => {
    updateExperiences((current) =>
      current.map((item) =>
        item.id === id ? { ...item, environment: [...item.environment, ''] } : item
      )
    );
  };

  const handleUpdateEnvironment = (id: number, index: number, value: string) => {
    updateExperiences((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const environment = [...item.environment];
        environment[index] = value;
        return { ...item, environment };
      })
    );
  };

  const handleDeleteEnvironment = (id: number, index: number) => {
    updateExperiences((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const environment = item.environment.filter((_, i) => i !== index);
        return { ...item, environment };
      })
    );
  };

  const handleAddCustomField = (id: number) => {
    updateExperiences((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              customFields: [
                ...(item.customFields || []),
                { id: `custom-${Date.now()}`, name: 'Custom Field', value: '' },
              ],
            }
          : item
      )
    );
  };

  const handleUpdateCustomField = (id: number, fieldId: string, value: string) => {
    updateExperiences((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const customFields = (item.customFields || []).map((field) =>
          field.id === fieldId ? { ...field, value } : field
        );
        return { ...item, customFields };
      })
    );
  };

  const handleDeleteCustomField = (id: number, fieldId: string) => {
    updateExperiences((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const customFields = (item.customFields || []).filter((field) => field.id !== fieldId);
        return { ...item, customFields };
      })
    );
  };

  return (
    <div className="mb-4 p-1 sm:p-2 lg:p-4" style={{ contentVisibility: 'auto' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="cursor-move" style={{ color: colors.tertiaryText }} />
          <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: colors.primaryText }}>
            EXPERIENCE
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddExperience}
            className="flex items-center gap-2 font-semibold px-4 py-2 rounded-xl transition-colors"
            style={{ color: colors.primaryBlue }}
          >
            <Plus size={18} />
            Add
          </button>
          <button
            onClick={() => onHideSection('experience')}
            className="p-2 rounded-xl transition-colors"
            title={sectionVisibility.experience ? 'Hide experience section' : 'Show experience section'}
          >
            <Eye size={18} style={{ color: sectionVisibility.experience ? colors.secondaryText : colors.tertiaryText }} />
          </button>
        </div>
      </div>

      {experiences.length === 0 ? (
        <div
          className="text-center py-12 border-2 border-dashed rounded-2xl transition-all"
          style={{ border: `2px dashed ${colors.border}`, background: colors.inputBackground }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}
          >
            <Plus size={32} className="text-white" />
          </div>
          <p className="mb-4 font-semibold" style={{ color: colors.secondaryText }}>
            No experience added yet
          </p>
          <button
            onClick={handleAddExperience}
            className="px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold transition-all"
            style={{
              background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})`,
              color: 'white',
            }}
          >
            <Plus size={18} />
            Add Experience
          </button>
        </div>
      ) : (
        experiences.map((exp) => (
          <div
            key={exp.id}
            className="mb-6 group p-3 sm:p-4 lg:p-6 border-2 rounded-2xl transition-all"
            style={{ background: colors.cardBackground, border: `2px solid ${colors.border}` }}
          >
            <div className="flex items-start gap-3 mb-4">
              <GripVertical size={18} className="cursor-move mt-2 flex-shrink-0" style={{ color: colors.tertiaryText }} />
              <div className="flex-1 space-y-3 min-w-0">
                <input
                  className="font-bold text-xs border-2 outline-none rounded-lg px-2 py-1.5 w-full transition-all"
                  style={{ background: colors.inputBackground, border: `2px solid ${colors.border}`, color: colors.primaryText }}
                  value={exp.company}
                  onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                  placeholder="Company Name"
                />

                <div className="flex items-center gap-2 text-sm" style={{ color: colors.secondaryText }}>
                  <input
                    className="border-2 outline-none rounded-lg px-2 py-1.5 text-xs font-medium flex-1 min-w-0 transition-all"
                    style={{ background: colors.inputBackground, border: `2px solid ${colors.border}`, color: colors.primaryText }}
                    value={exp.period}
                    onChange={(e) => handleUpdateExperience(exp.id, { period: e.target.value })}
                    placeholder="Start Date"
                  />
                  <span className="font-bold flex-shrink-0" style={{ color: colors.tertiaryText }}>
                    →
                  </span>
                  <input
                    className="border-2 outline-none rounded-lg px-2 py-1.5 text-xs font-medium flex-1 min-w-0 transition-all"
                    style={{ background: colors.inputBackground, border: `2px solid ${colors.border}`, color: colors.primaryText }}
                    value={exp.endPeriod}
                    onChange={(e) => handleUpdateExperience(exp.id, { endPeriod: e.target.value })}
                    placeholder="End Date"
                  />
                </div>

                <input
                  className="text-xs border-2 outline-none rounded-lg px-2 py-1.5 w-full transition-all"
                  style={{ background: colors.inputBackground, border: `2px solid ${colors.border}`, color: colors.secondaryText }}
                  value={exp.location}
                  onChange={(e) => handleUpdateExperience(exp.id, { location: e.target.value })}
                  placeholder="Location"
                />

                <input
                  className="font-semibold text-xs border-2 outline-none rounded-lg px-2 py-1.5 w-full transition-all"
                  style={{ background: colors.inputBackground, border: `2px solid ${colors.border}`, color: colors.primaryText }}
                  value={exp.position}
                  onChange={(e) => handleUpdateExperience(exp.id, { position: e.target.value })}
                  placeholder="Job Title"
                />

                {(exp.customFields || []).map((field) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      className="flex-1 text-xs border-2 outline-none rounded-lg px-2 py-1.5 min-w-0 transition-all"
                      style={{ background: colors.inputBackground, border: `2px solid ${colors.border}`, color: colors.secondaryText }}
                      value={field.value || ''}
                      onChange={(e) => handleUpdateCustomField(exp.id, field.id, e.target.value)}
                      placeholder={field.name}
                    />
                    <button
                      onClick={() => handleDeleteCustomField(exp.id, field.id)}
                      className="p-1 rounded-lg transition-colors"
                      style={{ color: colors.errorRed }}
                      title="Delete field"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => handleAddCustomField(exp.id)}
                  className="text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  style={{ color: colors.primaryBlue }}
                >
                  <Plus size={12} />
                  Add Field
                </button>
              </div>

              <button
                onClick={() => handleDeleteExperience(exp.id)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all"
                style={{ color: colors.errorRed }}
                title="Delete experience"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="ml-6 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold" style={{ color: colors.secondaryText }}>
                  Responsibilities
                </h4>
                <button
                  onClick={() => handleAddBullet(exp.id)}
                  className="text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  style={{ color: colors.primaryBlue }}
                >
                  <Plus size={12} />
                  Add Responsibility
                </button>
              </div>

              {exp.bullets.map((bullet, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="mt-1 flex-shrink-0 text-xs" style={{ color: colors.tertiaryText }}>
                    •
                  </span>
                  <input
                    className="flex-1 text-xs border-2 outline-none rounded-lg px-2 py-1.5 min-w-0 transition-all"
                    style={{ background: colors.inputBackground, border: `2px solid ${colors.border}`, color: colors.primaryText }}
                    value={bullet}
                    onChange={(e) => handleUpdateBullet(exp.id, index, e.target.value)}
                    placeholder="Describe your responsibility..."
                  />
                  <button
                    onClick={() => handleDeleteBullet(exp.id, index)}
                    className="p-1 rounded-lg transition-colors flex-shrink-0"
                    style={{ color: colors.errorRed }}
                    title="Delete bullet"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="ml-6 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold" style={{ color: colors.secondaryText }}>
                  Technologies
                </h4>
                <button
                  onClick={() => handleAddEnvironment(exp.id)}
                  className="text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  style={{ color: colors.primaryBlue }}
                >
                  <Plus size={12} />
                  Add Tech
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {exp.environment.map((tech, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
                    style={{ background: colors.inputBackground, border: `1px solid ${colors.border}` }}
                  >
                    <input
                      type="text"
                      className="text-xs bg-transparent border-none outline-none"
                      style={{ color: colors.primaryText, width: `${Math.max(tech.length * 7 + 24, 60)}px` }}
                      value={tech}
                      onChange={(e) => handleUpdateEnvironment(exp.id, index, e.target.value)}
                      placeholder="Technology"
                    />
                    <button
                      onClick={() => handleDeleteEnvironment(exp.id, index)}
                      className="transition-colors flex-shrink-0"
                      style={{ color: colors.tertiaryText }}
                      title="Remove technology"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}

      <div className="flex justify-end mt-3">
        <button
          onClick={() => onOpenAIGenerateModal('experience')}
          className="text-sm flex items-center gap-2 font-semibold px-3 py-2 rounded-lg transition-colors"
          style={{ color: colors.badgePurpleText }}
        >
          <Sparkles size={16} />
          AI Generate
        </button>
      </div>
    </div>
  );
});

export default ExperienceSection;

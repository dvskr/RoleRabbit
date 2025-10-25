import React from 'react';
import { Eye, GripVertical, Plus, X, Trash2 } from 'lucide-react';
import { ResumeData, CertificationItem, CustomField } from '../../types/resume';

interface CertificationsSectionProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  sectionVisibility: { [key: string]: boolean };
  onHideSection: (section: string) => void;
}

export default function CertificationsSection({
  resumeData,
  setResumeData,
  sectionVisibility,
  onHideSection
}: CertificationsSectionProps) {
  const addCertification = () => {
    const newCertification: CertificationItem = {
      id: Date.now(),
      name: '',
      issuer: '',
      link: '',
      skills: [],
      customFields: []
    };
    setResumeData((prev: ResumeData) => ({ ...prev, certifications: [...prev.certifications, newCertification] }));
  };

  const updateCertification = (id: number, updates: Partial<CertificationItem>) => {
    const updatedCertifications = resumeData.certifications.map((item) => 
      item.id === id ? { ...item, ...updates } : item
    );
    setResumeData({...resumeData, certifications: updatedCertifications});
  };

  const deleteCertification = (id: number) => {
    const updatedCertifications = resumeData.certifications.filter(item => item.id !== id);
    setResumeData({...resumeData, certifications: updatedCertifications});
  };

  const addCustomFieldToCertification = (certId: number, field: CustomField) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    const currentFields = cert.customFields || [];
    updateCertification(certId, { customFields: [...currentFields, field] });
  };

  const updateCustomFieldInCertification = (certId: number, fieldId: string, value: string) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    const currentFields = cert.customFields || [];
    const updatedFields = currentFields.map(f => f.id === fieldId ? { ...f, value } : f);
    updateCertification(certId, { customFields: updatedFields });
  };

  const deleteCustomFieldFromCertification = (certId: number, fieldId: string) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    const currentFields = cert.customFields || [];
    const updatedFields = currentFields.filter(f => f.id !== fieldId);
    updateCertification(certId, { customFields: updatedFields });
  };

  const addSkill = (certId: number) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    updateCertification(certId, { skills: [...cert.skills, ''] });
  };

  const updateSkill = (certId: number, skillIndex: number, value: string) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    const updatedSkills = [...cert.skills];
    updatedSkills[skillIndex] = value;
    updateCertification(certId, { skills: updatedSkills });
  };

  const deleteSkill = (certId: number, skillIndex: number) => {
    const cert = resumeData.certifications.find(c => c.id === certId)!;
    const updatedSkills = cert.skills.filter((_, index) => index !== skillIndex);
    updateCertification(certId, { skills: updatedSkills });
  };

  return (
    <div className="mb-8 p-1 sm:p-2 lg:p-4">
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GripVertical size={18} className="text-gray-400 cursor-move" />
          <h3 className="text-lg font-bold text-black uppercase tracking-wide">
            CERTIFICATIONS
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={addCertification}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50"
          >
            <Plus size={18} />
            Add
          </button>
          <button 
            onClick={() => onHideSection('certifications')}
            className="p-2 hover:bg-gray-100 rounded-xl"
            title={sectionVisibility.certifications ? "Hide certifications section" : "Show certifications section"}
          >
            <Eye size={18} className={sectionVisibility.certifications ? "text-gray-600" : "text-gray-400"} />
          </button>
        </div>
      </div>

      {resumeData.certifications.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Plus size={32} className="text-white" />
          </div>
          <p className="text-gray-600 mb-4 font-semibold">No certifications added yet</p>
          <button 
            onClick={addCertification}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 inline-flex items-center gap-2 font-bold"
          >
            <Plus size={18} />
            Add Certification
          </button>
        </div>
      )}

      {resumeData.certifications.map((cert) => (
        <div key={cert.id} className="mb-6 group p-3 sm:p-4 lg:p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10  duration-300 bg-white max-w-full overflow-hidden">
          <div className="flex items-start gap-3 mb-4">
            <GripVertical size={18} className="text-gray-400 cursor-move mt-2" />
            <div className="flex-1 space-y-3">
              <input
                className="font-bold text-sm text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl px-2 sm:px-4 py-2 w-full  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                value={cert.name}
                onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                placeholder="Certification Name"
              />
              <input
                className="font-semibold text-sm text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl px-2 sm:px-4 py-2 w-full  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                value={cert.issuer}
                onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                placeholder="Issuing Organization"
              />
              <input
                className="text-sm text-blue-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-4 py-2 w-full  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                value={cert.link}
                onChange={(e) => updateCertification(cert.id, { link: e.target.value })}
                placeholder="Certification Link/URL"
              />
              
              {/* Custom Fields */}
              {(cert.customFields || []).map((field) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    className="flex-1 text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-2 sm:px-3 py-2  min-w-0 max-w-full break-words overflow-wrap-anywhere"
                    value={field.value || ''}
                    onChange={(e) => updateCustomFieldInCertification(cert.id, field.id, e.target.value)}
                    placeholder={field.name}
                  />
                  <button
                    onClick={() => deleteCustomFieldFromCertification(cert.id, field.id)}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete field"
                  >
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                </div>
              ))}
              
              {/* Add Custom Field Button */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const newField: CustomField = {
                      id: `custom-${Date.now()}`,
                      name: 'Custom Field',
                      value: ''
                    };
                    addCustomFieldToCertification(cert.id, newField);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add Field
                </button>
              </div>
            </div>
            <button
              onClick={() => deleteCertification(cert.id)}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-xl "
              title="Delete certification"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>

          {/* Skills */}
          <div className="ml-6 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Skills Covered</h4>
              <button
                onClick={() => addSkill(cert.id)}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 flex items-center gap-1"
              >
                <Plus size={12} />
                Add Skill
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {cert.skills.map((skill, skillIndex) => (
                <div key={skillIndex} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                  <input
                    className="text-xs text-gray-700 bg-transparent border-none outline-none min-w-0 max-w-full break-words overflow-wrap-anywhere"
                    value={skill}
                    onChange={(e) => updateSkill(cert.id, skillIndex, e.target.value)}
                    placeholder="Skill"
                  />
                  <button
                    onClick={() => deleteSkill(cert.id, skillIndex)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

/**
 * Custom hook for managing portfolio projects state
 */

import { useState } from 'react';
import { Project } from '../../types/profile';
import { DEFAULT_PROJECT_FORM } from '../constants';

export interface ProjectFormState {
  title: string;
  description: string;
  technologies: string[];
  date: string;
  link?: string;
  github?: string;
}

interface UsePortfolioProjectsProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

export const usePortfolioProjects = ({ projects, onProjectsChange }: UsePortfolioProjectsProps) => {
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [tempProject, setTempProject] = useState<ProjectFormState>(DEFAULT_PROJECT_FORM);
  const [newTech, setNewTech] = useState('');

  const addTechnology = () => {
    if (newTech.trim()) {
      setTempProject({ ...tempProject, technologies: [...tempProject.technologies, newTech.trim()] });
      setNewTech('');
    }
  };

  const removeTechnology = (index: number) => {
    setTempProject({ ...tempProject, technologies: tempProject.technologies.filter((_, i) => i !== index) });
  };

  const handleAddProject = () => {
    if (tempProject.title.trim()) {
      const newProjects = [...projects, {
        title: tempProject.title,
        description: tempProject.description,
        technologies: tempProject.technologies,
        date: tempProject.date,
        link: tempProject.link,
        github: tempProject.github
      }];
      onProjectsChange(newProjects);
      setTempProject(DEFAULT_PROJECT_FORM);
      setShowAddProjectModal(false);
    }
  };

  const handleEditProject = (index: number) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = {
      title: tempProject.title,
      description: tempProject.description,
      technologies: tempProject.technologies,
      date: tempProject.date,
      link: tempProject.link,
      github: tempProject.github
    };
    onProjectsChange(updatedProjects);
    setEditingProjectIndex(null);
  };

  const handleDeleteProject = (index: number) => {
    const filteredProjects = projects.filter((_, i) => i !== index);
    onProjectsChange(filteredProjects);
  };

  const startEditingProject = (index: number, project: Project) => {
    setTempProject({
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      date: project.date,
      link: project.link,
      github: project.github
    });
    setEditingProjectIndex(index);
  };

  const cancelEditingProject = () => {
    setEditingProjectIndex(null);
    setTempProject(DEFAULT_PROJECT_FORM);
    setNewTech('');
  };

  return {
    editingProjectIndex,
    showAddProjectModal,
    tempProject,
    newTech,
    setEditingProjectIndex,
    setShowAddProjectModal,
    setTempProject,
    setNewTech,
    addTechnology,
    removeTechnology,
    handleAddProject,
    handleEditProject,
    handleDeleteProject,
    startEditingProject,
    cancelEditingProject
  };
};

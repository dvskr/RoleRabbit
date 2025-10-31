/**
 * Custom hook for managing portfolio achievements state
 */

import { useState } from 'react';
import { Achievement } from '../../types/profile';
import { DEFAULT_ACHIEVEMENT_FORM } from '../constants';

export interface AchievementFormState {
  type: string;
  title: string;
  description: string;
  date: string;
  link?: string;
}

interface UsePortfolioAchievementsProps {
  achievements: Achievement[];
  onAchievementsChange: (achievements: Achievement[]) => void;
}

export const usePortfolioAchievements = ({ achievements, onAchievementsChange }: UsePortfolioAchievementsProps) => {
  const [editingAchievementIndex, setEditingAchievementIndex] = useState<number | null>(null);
  const [showAddAchievementModal, setShowAddAchievementModal] = useState(false);
  const [tempAchievement, setTempAchievement] = useState<AchievementFormState>(DEFAULT_ACHIEVEMENT_FORM);

  const handleAddAchievement = () => {
    if (tempAchievement.title.trim()) {
      const newAchievements = [...achievements, {
        type: tempAchievement.type as Achievement['type'],
        title: tempAchievement.title,
        description: tempAchievement.description,
        date: tempAchievement.date,
        link: tempAchievement.link
      }];
      onAchievementsChange(newAchievements);
      setTempAchievement(DEFAULT_ACHIEVEMENT_FORM);
      setShowAddAchievementModal(false);
    }
  };

  const handleEditAchievement = (index: number) => {
    const updatedAchievements = [...achievements];
    updatedAchievements[index] = {
      type: tempAchievement.type as Achievement['type'],
      title: tempAchievement.title,
      description: tempAchievement.description,
      date: tempAchievement.date,
      link: tempAchievement.link
    };
    onAchievementsChange(updatedAchievements);
    setEditingAchievementIndex(null);
  };

  const handleDeleteAchievement = (index: number) => {
    const filteredAchievements = achievements.filter((_, i) => i !== index);
    onAchievementsChange(filteredAchievements);
  };

  const startEditingAchievement = (index: number, achievement: Achievement) => {
    setTempAchievement({
      type: achievement.type,
      title: achievement.title,
      description: achievement.description,
      date: achievement.date,
      link: achievement.link
    });
    setEditingAchievementIndex(index);
  };

  const cancelEditingAchievement = () => {
    setEditingAchievementIndex(null);
    setTempAchievement(DEFAULT_ACHIEVEMENT_FORM);
  };

  return {
    editingAchievementIndex,
    showAddAchievementModal,
    tempAchievement,
    setEditingAchievementIndex,
    setShowAddAchievementModal,
    setTempAchievement,
    handleAddAchievement,
    handleEditAchievement,
    handleDeleteAchievement,
    startEditingAchievement,
    cancelEditingAchievement
  };
};

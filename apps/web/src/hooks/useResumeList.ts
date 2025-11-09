import { useBaseResumes } from './useBaseResumes';

export const useResumeList = (options: any = {}) => {
  return useBaseResumes({ onActiveChange: options.onResumeSwitched });
};


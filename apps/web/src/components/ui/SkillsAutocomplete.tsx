import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

// Common skills database (200+ popular skills)
const COMMON_SKILLS = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'Swift',
  'Kotlin', 'PHP', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'PowerShell', 'Dart', 'Elixir',
  
  // Frontend
  'React', 'Angular', 'Vue.js', 'Next.js', 'Svelte', 'HTML', 'CSS', 'SASS', 'Tailwind CSS',
  'Bootstrap', 'Material-UI', 'Redux', 'MobX', 'Webpack', 'Vite', 'jQuery', 'D3.js',
  
  // Backend
  'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Ruby on Rails',
  'ASP.NET', 'Laravel', 'Symfony', 'NestJS', 'GraphQL', 'REST API', 'gRPC', 'WebSockets',
  
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB',
  'SQLite', 'Oracle', 'SQL Server', 'Firebase', 'Supabase', 'Neo4j', 'CouchDB',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
  'Terraform', 'Ansible', 'CircleCI', 'Travis CI', 'Nginx', 'Apache', 'Linux', 'Ubuntu',
  
  // Data Science & ML
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Keras', 'OpenCV', 'NLTK',
  'Jupyter', 'Apache Spark', 'Hadoop', 'Tableau', 'Power BI', 'Data Analysis', 'Machine Learning',
  
  // Mobile
  'React Native', 'Flutter', 'iOS Development', 'Android Development', 'SwiftUI', 'Jetpack Compose',
  
  // Testing
  'Jest', 'Mocha', 'Cypress', 'Selenium', 'Playwright', 'JUnit', 'PyTest', 'Testing Library',
  
  // Tools & Methodologies
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Agile', 'Scrum', 'Kanban',
  'CI/CD', 'Microservices', 'RESTful APIs', 'API Design', 'System Design', 'OOP', 'Functional Programming',
  
  // Soft Skills
  'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Project Management',
  'Critical Thinking', 'Time Management', 'Mentoring', 'Public Speaking', 'Technical Writing',
  
  // Other
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Sketch', 'InVision', 'Zeplin',
  'Postman', 'Insomnia', 'VS Code', 'IntelliJ IDEA', 'Eclipse', 'Vim', 'Emacs',
].sort();

interface SkillsAutocompleteProps {
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  maxSkills?: number;
  placeholder?: string;
  className?: string;
}

const SkillsAutocomplete: React.FC<SkillsAutocompleteProps> = ({
  skills,
  onAddSkill,
  onRemoveSkill,
  maxSkills = 50,
  placeholder = 'Add a skill...',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const filtered = COMMON_SKILLS.filter(
        (skill) =>
          skill.toLowerCase().includes(inputValue.toLowerCase()) &&
          !skills.includes(skill)
      ).slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, skills]);

  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim()) && skills.length < maxSkills) {
      onAddSkill(skill.trim());
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleAddSkill(suggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        handleAddSkill(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Skills Display */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
          >
            {skill}
            <button
              onClick={() => onRemoveSkill(skill)}
              className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${skill}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>

      {/* Input with Autocomplete */}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setShowSuggestions(true)}
            placeholder={placeholder}
            disabled={skills.length >= maxSkills}
            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add skill"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
          />
          <button
            onClick={() => inputValue && handleAddSkill(inputValue)}
            disabled={!inputValue.trim() || skills.length >= maxSkills}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add skill"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            role="listbox"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => handleAddSkill(suggestion)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-900 dark:text-white'
                }`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Counter */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {skills.length} / {maxSkills} skills added
      </p>
    </div>
  );
};

export default SkillsAutocomplete;



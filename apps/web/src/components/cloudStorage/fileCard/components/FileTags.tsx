/**
 * FileTags - Display file tags
 */

import React from 'react';
import { Tag } from 'lucide-react';

interface FileTagsProps {
  tags: string[];
  colors: any;
  maxVisible?: number;
}

export const FileTags: React.FC<FileTagsProps> = ({
  tags,
  colors,
  maxVisible = 3,
}) => {
  // Handle undefined/null tags
  if (!tags || !Array.isArray(tags) || tags.length === 0) return null;

  return (
    <div className="mb-2">
      <div className="flex flex-wrap gap-0.5">
        {tags.slice(0, maxVisible).map((tag, index) => (
          <span 
            key={index} 
            className="inline-flex items-center px-2 py-1 text-xs rounded-lg"
            style={{
              background: colors.inputBackground,
              color: colors.primaryText,
            }}
          >
            <Tag size={10} className="mr-1" />
            {tag}
          </span>
        ))}
        {tags.length > maxVisible && (
          <span 
            className="text-xs px-2 py-1"
            style={{ color: colors.secondaryText }}
          >
            +{tags.length - maxVisible} more
          </span>
        )}
      </div>
    </div>
  );
};


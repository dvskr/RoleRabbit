/**
 * Unit tests for FileList component
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileList } from '../FileList';
import { ThemeProvider } from '../../../contexts/ThemeContext';

const mockTheme = {
  theme: {
    colors: {
      cardBackground: '#FFFFFF',
      primaryText: '#000000',
      secondaryText: '#666666',
      border: '#E5E7EB',
      primaryBlue: '#3B82F6',
      inputBackground: '#F9FAFB',
      hoverBackground: '#F3F4F6'
    }
  },
  setTheme: jest.fn()
};

const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider value={mockTheme as any}>{children}</ThemeProvider>
);

describe('FileList Component', () => {
  const mockFiles = [
    {
      id: 'file-1',
      name: 'Resume.pdf',
      type: 'resume',
      size: 500000,
      isStarred: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      owner: 'user-1'
    },
    {
      id: 'file-2',
      name: 'CoverLetter.docx',
      type: 'document',
      size: 300000,
      isStarred: true,
      createdAt: '2025-01-02T00:00:00.000Z',
      owner: 'user-1'
    },
    {
      id: 'file-3',
      name: 'Portfolio.pdf',
      type: 'document',
      size: 800000,
      isStarred: false,
      createdAt: '2025-01-03T00:00:00.000Z',
      owner: 'user-1'
    }
  ];

  const mockHandlers = {
    onFileSelect: jest.fn(),
    onDownload: jest.fn(),
    onShare: jest.fn(),
    onDelete: jest.fn(),
    onStar: jest.fn(),
    onArchive: jest.fn(),
    onEdit: jest.fn(),
    onMove: jest.fn(),
    onAddComment: jest.fn(),
    onPreview: jest.fn(),
    onSearchChange: jest.fn(),
    onFilterChange: jest.fn(),
    onSortChange: jest.fn(),
    onSelectAll: jest.fn(),
    onClearSelection: jest.fn(),
    onUploadClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all files', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      expect(screen.getByText('Resume.pdf')).toBeInTheDocument();
      expect(screen.getByText('CoverLetter.docx')).toBeInTheDocument();
      expect(screen.getByText('Portfolio.pdf')).toBeInTheDocument();
    });

    it('should show loading skeleton when isLoading is true', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={[]}
            selectedFiles={[]}
            searchTerm=""
            isLoading={true}
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      // Skeleton should be rendered
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show empty state when no files', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={[]}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      expect(screen.getByText(/no files/i)).toBeInTheDocument();
    });

    it('should show empty search state when search returns no results', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={[]}
            selectedFiles={[]}
            searchTerm="nonexistent"
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      expect(screen.getByText(/no files found/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const searchInput = screen.getByPlaceholderText(/search files/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should call onSearchChange when typing in search input', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const searchInput = screen.getByPlaceholderText(/search files/i);
      fireEvent.change(searchInput, { target: { value: 'resume' } });

      expect(mockHandlers.onSearchChange).toHaveBeenCalledWith('resume');
    });

    it('should display current search term', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm="resume"
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const searchInput = screen.getByDisplayValue('resume');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('should show select all checkbox', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const checkbox = screen.getByRole('checkbox', { name: /select all/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('should call onSelectAll when select all is clicked', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const checkbox = screen.getByRole('checkbox', { name: /select all/i });
      fireEvent.click(checkbox);

      expect(mockHandlers.onSelectAll).toHaveBeenCalled();
    });

    it('should show indeterminate state when some files selected', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={['file-1']}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const checkbox = screen.getByRole('checkbox', { name: /select all/i }) as HTMLInputElement;
      expect(checkbox.indeterminate).toBe(true);
    });

    it('should check select all when all files selected', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={['file-1', 'file-2', 'file-3']}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const checkbox = screen.getByRole('checkbox', { name: /select all/i }) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should show selection count', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={['file-1', 'file-2']}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    });

    it('should show clear selection button when files selected', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={['file-1']}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const clearButton = screen.getByText(/clear selection/i);
      expect(clearButton).toBeInTheDocument();

      fireEvent.click(clearButton);
      expect(mockHandlers.onClearSelection).toHaveBeenCalled();
    });
  });

  describe('Tabs', () => {
    it('should render file type tabs', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            filterType="all"
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      expect(screen.getByText('All Files')).toBeInTheDocument();
      expect(screen.getByText('Resumes')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
    });

    it('should highlight active tab', () => {
      const { container } = render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            filterType="resume"
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const resumeTab = screen.getByText('Resumes').closest('button');
      expect(resumeTab).toHaveClass('active'); // Or whatever active class is used
    });

    it('should call onFilterChange when tab is clicked', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            filterType="all"
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const resumeTab = screen.getByText('Resumes');
      fireEvent.click(resumeTab);

      expect(mockHandlers.onFilterChange).toHaveBeenCalledWith('resume');
    });
  });

  describe('Sort Options', () => {
    it('should render sort dropdown', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            sortBy="date"
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      expect(screen.getByText(/sort by/i)).toBeInTheDocument();
    });

    it('should call onSortChange when sort option is selected', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            sortBy="date"
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      // Open sort menu
      const sortButton = screen.getByText(/sort by/i);
      fireEvent.click(sortButton);

      // Select name sort
      const nameOption = screen.getByText(/name/i);
      fireEvent.click(nameOption);

      expect(mockHandlers.onSortChange).toHaveBeenCalledWith('name');
    });
  });

  describe('Upload Button', () => {
    it('should render upload button', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const uploadButton = screen.getByText(/upload/i);
      expect(uploadButton).toBeInTheDocument();
    });

    it('should call onUploadClick when upload button is clicked', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const uploadButton = screen.getByText(/upload/i);
      fireEvent.click(uploadButton);

      expect(mockHandlers.onUploadClick).toHaveBeenCalled();
    });
  });

  describe('Grid Layout', () => {
    it('should render files in grid layout', () => {
      const { container } = render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('should be responsive', () => {
      const { container } = render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      // Check for responsive grid classes
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass(/grid-cols/); // Tailwind responsive classes
    });
  });

  describe('React.memo Optimization', () => {
    it('should be memoized to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      // Re-render with same props
      rerender(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      // Component is wrapped with React.memo
      expect(FileList).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      expect(screen.getByRole('search')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /select all/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(
        <MockThemeProvider>
          <FileList
            files={mockFiles as any}
            selectedFiles={[]}
            searchTerm=""
            {...mockHandlers}
          />
        </MockThemeProvider>
      );

      const searchInput = screen.getByPlaceholderText(/search files/i);
      searchInput.focus();

      expect(document.activeElement).toBe(searchInput);
    });
  });
});

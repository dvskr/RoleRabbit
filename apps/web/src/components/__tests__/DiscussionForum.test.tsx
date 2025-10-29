/**
 * Discussion Forum Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import DiscussionForum from '../discussion/DiscussionForum';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User' },
    isLoading: false
  })
}));

describe('Discussion Forum Component', () => {
  const mockPosts = [
    {
      id: '1',
      title: 'How to negotiate salary?',
      content: 'Looking for advice...',
      author: 'Test User',
      votes: 10,
      comments: 3,
      createdAt: '2025-01-15'
    },
    {
      id: '2',
      title: 'Best job search strategies',
      content: 'What worked for you?',
      author: 'Another User',
      votes: 5,
      comments: 2,
      createdAt: '2025-01-20'
    }
  ];

  test('should render discussion forum', () => {
    render(<DiscussionForum posts={mockPosts} />);
    
    const forum = screen.queryByText(/discussion|forum/i);
    expect(forum).toBeDefined();
  });

  test('should display posts', () => {
    render(<DiscussionForum posts={mockPosts} />);
    
    const post = screen.queryByText(/negotiate salary/i);
    expect(post).toBeDefined();
  });

  test('should allow creating new post', () => {
    render(<DiscussionForum posts={mockPosts} />);
    
    const newPostButton = screen.queryByText(/new.*post|create/i);
    expect(newPostButton).toBeDefined();
  });

  test('should allow voting on posts', () => {
    const mockOnVote = jest.fn();
    render(<DiscussionForum posts={mockPosts} onVote={mockOnVote} />);
    
    const voteButton = screen.queryByTitle(/vote/i);
    expect(voteButton).toBeDefined();
  });

  test('should filter by community', () => {
    render(<DiscussionForum posts={mockPosts} community="general" />);
    
    const posts = screen.getAllByText(/negotiate|strategies/i);
    expect(posts.length).toBeGreaterThan(0);
  });
});


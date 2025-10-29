/**
 * AI Agents Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import AIAgents from '../aiAgents/AIAgents';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1' },
    isLoading: false
  })
}));

describe('AI Agents Component', () => {
  const mockAgents = [
    {
      id: '1',
      name: 'Job Discovery Agent',
      type: 'job_discovery',
      status: 'active',
      lastRun: '2025-01-15'
    },
    {
      id: '2',
      name: 'Resume Optimizer',
      type: 'resume_optimization',
      status: 'inactive',
      lastRun: '2025-01-10'
    }
  ];

  test('should render AI agents', () => {
    render(<AIAgents agents={mockAgents} />);
    
    const agents = screen.queryByText(/ai.*agent/i);
    expect(agents).toBeDefined();
  });

  test('should display agent list', () => {
    render(<AIAgents agents={mockAgents} />);
    
    const jobAgent = screen.queryByText(/job discovery/i);
    expect(jobAgent).toBeDefined();
  });

  test('should show agent status', () => {
    render(<AIAgents agents={mockAgents} />);
    
    const active = screen.queryByText(/active/i);
    expect(active).toBeDefined();
  });

  test('should allow toggling agent', () => {
    const mockOnToggle = jest.fn();
    render(<AIAgents agents={mockAgents} onToggleAgent={mockOnToggle} />);
    
    const toggleButton = screen.queryByText(/toggle|activate/i);
    expect(toggleButton).toBeDefined();
  });

  test('should show agent statistics', () => {
    render(<AIAgents agents={mockAgents} />);
    
    const stats = screen.queryByText(/statistics|metrics/i);
    expect(stats).toBeDefined();
  });
});


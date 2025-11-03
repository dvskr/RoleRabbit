import { render, screen } from '@testing-library/react';
import StorageHeader from '../StorageHeader';

const baseProps = {
  storageInfo: {
    used: 5,
    limit: 10,
    percentage: 50,
    usedBytes: 5 * 1024 * 1024 * 1024,
    limitBytes: 10 * 1024 * 1024 * 1024
  },
  onUpload: jest.fn(),
  onRefresh: jest.fn()
};

describe('StorageHeader', () => {
  it('renders storage usage correctly', () => {
    render(<StorageHeader {...baseProps} />);
    expect(screen.getByTestId('storage-header')).toBeInTheDocument();
    expect(screen.getByText(/5.00 GB/)).toBeInTheDocument();
    expect(screen.getByText(/10.00 GB/)).toBeInTheDocument();
    expect(screen.getByText(/50.0%/)).toBeInTheDocument();
    expect(screen.getByTestId('storage-upload-button')).toBeInTheDocument();
    expect(screen.getByTestId('storage-refresh-button')).toBeInTheDocument();
  });
});



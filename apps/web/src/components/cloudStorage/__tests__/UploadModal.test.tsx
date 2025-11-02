import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadModal from '../UploadModal';

const baseProps = {
  isOpen: true,
  onClose: jest.fn(),
  activeFolderId: 'folder-123'
};

describe('UploadModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation message when upload is attempted without file', async () => {
    const onUpload = jest.fn();
    render(<UploadModal {...baseProps} onUpload={onUpload} />);

    fireEvent.click(screen.getByTestId('storage-upload-submit'));

    expect(await screen.findByText(/please choose a file/i)).toBeInTheDocument();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('submits selected file with metadata', async () => {
    const onUpload = jest.fn().mockResolvedValue(undefined);
    render(<UploadModal {...baseProps} onUpload={onUpload} />);

    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByTestId('storage-file-input') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    const nameInput = screen.getByPlaceholderText('Enter file name');
    fireEvent.change(nameInput, { target: { value: 'Updated Resume' } });

    fireEvent.click(screen.getByTestId('storage-upload-submit'));

    await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
    const payload = onUpload.mock.calls[0][0];
    expect(payload.file).toBe(file);
    expect(payload.displayName).toBe('Updated Resume');
    expect(payload.folderId).toBe('folder-123');
    expect(payload.type).toBe('resume');
  });

  it('displays error message when upload fails', async () => {
    const onUpload = jest.fn().mockRejectedValue(new Error('Storage quota exceeded'));
    render(<UploadModal {...baseProps} onUpload={onUpload} />);

    const file = new File(['data'], 'portfolio.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const fileInput = screen.getByTestId('storage-file-input') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByTestId('storage-upload-submit'));

    expect(await screen.findByTestId('storage-upload-error')).toHaveTextContent('Storage quota exceeded');
  });
});



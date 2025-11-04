import { renderHook, act } from '@testing-library/react';
import { useFileOperations } from '../useFileOperations';
import apiService from '../../../../services/apiService';

jest.mock('../../../../services/apiService', () => ({
  uploadStorageFile: jest.fn(),
  downloadCloudFile: jest.fn(),
  deleteCloudFile: jest.fn(),
  restoreCloudFile: jest.fn(),
  permanentlyDeleteCloudFile: jest.fn(),
  updateCloudFile: jest.fn(),
  getCloudFiles: jest.fn().mockResolvedValue({ files: [] })
}));

describe('useFileOperations', () => {
  const defaultPayload = {
    file: new File(['resume'], 'resume.pdf', { type: 'application/pdf' }),
    displayName: 'Resume',
    type: 'resume',
    isPublic: false,
    folderId: 'folder-1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

afterEach(() => {
  jest.restoreAllMocks();
});

  it('uploads file and updates local state and storage info', async () => {
    const onStorageUpdate = jest.fn();
    (apiService.uploadStorageFile as jest.Mock).mockResolvedValue({
      success: true,
      file: { id: 'file-1', name: 'Resume', size: '1 MB', downloadCount: 0 },
      storage: { usedBytes: 1024, limitBytes: 1024 * 1024, percentage: 0.1 }
    });

    const { result } = renderHook(() => useFileOperations({ onStorageUpdate }));

    await act(async () => {
      await result.current.handleUploadFile(defaultPayload);
    });

    expect(apiService.uploadStorageFile).toHaveBeenCalledTimes(1);
    expect(result.current.files).toHaveLength(1);
    expect(onStorageUpdate).toHaveBeenCalledWith({ usedBytes: 1024, limitBytes: 1024 * 1024, percentage: 0.1 });
  });

  it('propagates quota errors and forwards storage info from error payload', async () => {
    const onStorageUpdate = jest.fn();
    const quotaError: any = new Error('Storage quota exceeded');
    quotaError.storage = { usedBytes: 1024 * 1024, limitBytes: 1024 * 1024, percentage: 100 };
    (apiService.uploadStorageFile as jest.Mock).mockRejectedValueOnce(quotaError);

    const { result } = renderHook(() => useFileOperations({ onStorageUpdate }));

    await expect(async () => {
      await result.current.handleUploadFile(defaultPayload);
    }).rejects.toThrow('Storage quota exceeded');

    expect(onStorageUpdate).toHaveBeenCalledWith(quotaError.storage);
  });

  it('downloads a file and increments download count', async () => {
    (apiService.downloadCloudFile as jest.Mock).mockResolvedValue(new Blob(['data'], { type: 'text/plain' }));

    const linkMock = {
      click: jest.fn(),
      setAttribute: jest.fn(),
      style: {}
    } as unknown as HTMLAnchorElement;

    jest.spyOn(document, 'createElement').mockReturnValueOnce(linkMock);
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => linkMock);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => linkMock);
    const objectUrlSpy = jest.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob://url');
    const revokeSpy = jest.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

    const { result } = renderHook(() => useFileOperations());

    act(() => {
      result.current.setFiles([{ id: 'file-1', name: 'Resume', size: '1 MB', downloadCount: 1, fileName: 'resume.txt', contentType: 'text/plain' } as any]);
    });

    await act(async () => {
      await result.current.handleDownloadFile(result.current.files[0]);
    });

    expect(apiService.downloadCloudFile).toHaveBeenCalledWith('file-1');
    expect(linkMock.click).toHaveBeenCalled();
    expect(objectUrlSpy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalled();
    expect(result.current.files[0].downloadCount).toBe(2);
  });
});



import { downloadTextFile } from '../download';

describe('downloadTextFile', () => {
  const originalCreateElement = document.createElement;
  const originalBodyAppend = document.body.appendChild;
  const originalBodyRemove = document.body.removeChild;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    document.createElement = jest.fn(() => ({
      setAttribute: jest.fn(),
      click: jest.fn()
    })) as unknown as typeof document.createElement;
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    URL.createObjectURL = jest.fn(() => 'blob://test');
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    document.body.appendChild = originalBodyAppend;
    document.body.removeChild = originalBodyRemove;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('creates a blob and triggers download', () => {
    downloadTextFile('hello', 'test.txt');

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
    const link = (document.body.appendChild as jest.Mock).mock.calls[0][0];
    expect(link.download).toBe('test.txt');
    expect(link.click).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(link);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob://test');
  });

  it('silently handles errors', () => {
    document.createElement = jest.fn(() => {
      throw new Error('fail');
    }) as unknown as typeof document.createElement;

    expect(() => downloadTextFile('hello', 'test.txt')).not.toThrow();
  });
});

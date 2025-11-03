import { localStorage as storage, sessionStorage } from '../storage';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    reset: () => {
      store = {};
      mockLocalStorage.getItem.mockClear();
      mockLocalStorage.setItem.mockClear();
      mockLocalStorage.removeItem.mockClear();
      mockLocalStorage.clear.mockClear();
    }
  };
})();

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    reset: () => {
      store = {};
      mockSessionStorage.getItem.mockClear();
      mockSessionStorage.setItem.mockClear();
      mockSessionStorage.removeItem.mockClear();
      mockSessionStorage.clear.mockClear();
    }
  };
})();

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    configurable: true
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    configurable: true
  });
});

beforeEach(() => {
  mockLocalStorage.reset();
  mockSessionStorage.reset();
});

describe('localStorage utility', () => {
  it('stores and retrieves JSON values safely', () => {
    storage.set('key', { a: 1 });
    expect(storage.get<{ a: number }>('key')).toEqual({ a: 1 });
  });

  it('returns null when parsing fails', () => {
    mockLocalStorage.setItem('broken', '{not:json');
    expect(storage.get('broken')).toBeNull();
  });

  it('removes and clears keys', () => {
    storage.set('key', 'value');
    storage.remove('key');
    expect(storage.get('key')).toBeNull();
    storage.set('other', 'value');
    storage.clear();
    expect(storage.get('other')).toBeNull();
  });
});

describe('sessionStorage utility', () => {
  it('handles basic get/set/remove operations', () => {
    sessionStorage.set('foo', 123);
    expect(sessionStorage.get<number>('foo')).toBe(123);
    sessionStorage.remove('foo');
    expect(sessionStorage.get('foo')).toBeNull();
  });
});



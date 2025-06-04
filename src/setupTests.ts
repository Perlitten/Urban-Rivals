// Jest setup file for testing environment
import '@testing-library/jest-dom';

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  }
};

Object.defineProperty(window, 'chrome', {
  value: mockChrome,
  writable: true
});

// Mock Web Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  
  constructor(url: string) {}
  
  postMessage(data: any) {
    // Mock post message
  }
  
  terminate() {
    // Mock terminate
  }
}

Object.defineProperty(window, 'Worker', {
  value: MockWorker,
  writable: true
});

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn()
};

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
});

// Global console warning suppression for tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args: any[]) => {
    // Suppress specific warnings during tests
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('React.createElement') ||
       args[0].includes('styled-components'))
    ) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  },
  writable: true
}); 
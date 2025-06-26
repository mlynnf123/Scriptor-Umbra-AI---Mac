// Test setup file
// This file runs before all tests

// Mock electron APIs
global.window = {
  electronAPI: {
    apiKeys: {
      get: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue(true)
    },
    preferences: {
      get: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue(true)
    },
    conversations: {
      get: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockResolvedValue(true)
    }
  }
};

// Mock DOM elements
global.document = {
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  createElement: jest.fn(),
  addEventListener: jest.fn(),
  readyState: 'complete'
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Setup fetch mock
global.fetch = jest.fn();

// Setup localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;


import handleFetchError from '../src/handleFetchError';

describe('handleFetchError', () => {
  const createMockResponse = (overrides: Partial<Response> = {}): Response => ({
    ok: false,
    status: 500,
    url: 'https://api.example.com/test',
    clone: jest.fn().mockReturnThis(),
    json: jest.fn(),
    text: jest.fn(),
    ...overrides
  } as any);

  it('should throw error with JSON error message', async () => {
    const mockResponse = createMockResponse({
      status: 400,
      clone: jest.fn().mockReturnValue({
        json: jest.fn().mockResolvedValue({ error: 'Bad request' }),
        text: jest.fn()
      })
    });

    await expect(handleFetchError(mockResponse)).rejects.toThrow('Bad request');
  });

  it('should throw error with text content when JSON parsing fails', async () => {
    const mockResponse = createMockResponse({
      status: 500,
      clone: jest.fn().mockReturnValue({
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        text: jest.fn().mockResolvedValue('Internal server error')
      })
    });

    await expect(handleFetchError(mockResponse)).rejects.toThrow('Internal server error');
  });

  it('should limit error message length', async () => {
    const longMessage = 'A'.repeat(200);
    const mockResponse = createMockResponse({
      status: 500,
      clone: jest.fn().mockReturnValue({
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        text: jest.fn().mockResolvedValue(longMessage)
      })
    });

    await expect(handleFetchError(mockResponse, { maxErrorMessageLength: 50 }))
      .rejects.toThrow('A'.repeat(50));
  });

  it('should include verbose error information', async () => {
    const mockResponse = createMockResponse({
      status: 404,
      url: 'https://api.example.com/not-found',
      clone: jest.fn().mockReturnValue({
        json: jest.fn().mockResolvedValue({ error: 'Not found' }),
        text: jest.fn()
      })
    });

    await expect(handleFetchError(mockResponse, {
      method: 'GET',
      verbose: true
    })).rejects.toThrow('GET https://api.example.com/not-found (404): Not found');
  });

  it('should include method in verbose error', async () => {
    const mockResponse = createMockResponse({
      status: 422,
      url: 'https://api.example.com/users',
      clone: jest.fn().mockReturnValue({
        json: jest.fn().mockResolvedValue({ error: 'Validation failed' }),
        text: jest.fn()
      })
    });

    await expect(handleFetchError(mockResponse, {
      method: 'POST',
      verbose: true
    })).rejects.toThrow('POST https://api.example.com/users (422): Validation failed');
  });

  it('should attach status code to error', async () => {
    const mockResponse = createMockResponse({
      status: 403,
      clone: jest.fn().mockReturnValue({
        json: jest.fn().mockResolvedValue({ error: 'Forbidden' }),
        text: jest.fn()
      })
    });

    try {
      await handleFetchError(mockResponse);
    } catch (error: any) {
      expect(error.status).toBe(403);
      expect(error.message).toBe('Forbidden');
    }
  });

  it('should handle empty error response', async () => {
    const mockResponse = createMockResponse({
      status: 500,
      clone: jest.fn().mockReturnValue({
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        text: jest.fn().mockResolvedValue('')
      })
    });

    await expect(handleFetchError(mockResponse)).rejects.toThrow('');
  });

  it('should use default method when not provided', async () => {
    const mockResponse = createMockResponse({
      status: 404,
      url: 'https://api.example.com/test',
      clone: jest.fn().mockReturnValue({
        json: jest.fn().mockResolvedValue({ error: 'Not found' }),
        text: jest.fn()
      })
    });

    await expect(handleFetchError(mockResponse, { verbose: true }))
      .rejects.toThrow(' https://api.example.com/test (404): Not found');
  });

  it('should handle different HTTP status codes', async () => {
    const testCases = [
      { status: 400, message: 'Bad Request' },
      { status: 401, message: 'Unauthorized' },
      { status: 403, message: 'Forbidden' },
      { status: 404, message: 'Not Found' },
      { status: 500, message: 'Internal Server Error' },
      { status: 503, message: 'Service Unavailable' }
    ];

    for (const testCase of testCases) {
      const mockResponse = createMockResponse({
        status: testCase.status,
        clone: jest.fn().mockReturnValue({
          json: jest.fn().mockResolvedValue({ error: testCase.message }),
          text: jest.fn()
        })
      });

      try {
        await handleFetchError(mockResponse);
      } catch (error: any) {
        expect(error.status).toBe(testCase.status);
        expect(error.message).toBe(testCase.message);
      }
    }
  });
});
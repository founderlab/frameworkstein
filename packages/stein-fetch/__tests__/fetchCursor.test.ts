import { FetchCursor } from '../src/fetchCursor';
import handleFetchError from '../src/handleFetchError';

// Mock cross-fetch
jest.mock('cross-fetch');
jest.mock('../src/handleFetchError');

const mockFetch = require('cross-fetch') as jest.MockedFunction<typeof fetch>;
const mockHandleFetchError = handleFetchError as jest.MockedFunction<typeof handleFetchError>;

describe('FetchCursor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a FetchCursor with default options', () => {
      const cursor = new FetchCursor('/test');
      expect(cursor.url()).toBe('/test');
    });

    it('should create a FetchCursor with custom options', () => {
      const cursor = new FetchCursor('/test', {
        method: 'POST',
        headers: { 'Custom-Header': 'value' },
        urlRoot: 'https://api.example.com'
      });
      expect(cursor.url()).toBe('https://api.example.com/test');
    });
  });

  describe('setHeaders', () => {
    it('should set headers', () => {
      const cursor = new FetchCursor('/test');
      const headers = { 'Authorization': 'Bearer token' };

      cursor.setHeaders(headers);
      const fetchOptions = cursor.fetchOptions();

      expect(fetchOptions.headers).toEqual(headers);
    });

    it('should return the cursor for chaining', () => {
      const cursor = new FetchCursor('/test');
      const result = cursor.setHeaders({ 'Content-Type': 'application/json' });

      expect(result).toBe(cursor);
    });
  });

  describe('addHeaders', () => {
    it('should add headers to existing headers', () => {
      const cursor = new FetchCursor('/test');
      cursor.setHeaders({ 'Authorization': 'Bearer token' });
      cursor.addHeaders({ 'Content-Type': 'application/json' });

      const fetchOptions = cursor.fetchOptions();

      expect(fetchOptions.headers).toEqual({
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json'
      });
    });

    it('should return the cursor for chaining', () => {
      const cursor = new FetchCursor('/test');
      const result = cursor.addHeaders({ 'X-Custom': 'value' });

      expect(result).toBe(cursor);
    });
  });

  describe('setQuery', () => {
    it('should set query as string', () => {
      const cursor = new FetchCursor('/test');
      cursor.setQuery('param1=value1&param2=value2');

      expect(cursor.url()).toBe('/test?param1=value1&param2=value2');
    });

    it('should set query as object', () => {
      const cursor = new FetchCursor('/test');
      cursor.setQuery({ param1: 'value1', param2: 'value2' });

      expect(cursor.url()).toBe('/test?param1=value1&param2=value2');
    });

    it('should return the cursor for chaining', () => {
      const cursor = new FetchCursor('/test');
      const result = cursor.setQuery({ param: 'value' });

      expect(result).toBe(cursor);
    });
  });

  describe('addQuery', () => {
    it('should add query parameters to existing query', () => {
      const cursor = new FetchCursor('/test');
      cursor.setQuery({ param1: 'value1' });
      cursor.addQuery({ param2: 'value2' });

      expect(cursor.url()).toBe('/test?param1=value1&param2=value2');
    });

    it('should return the cursor for chaining', () => {
      const cursor = new FetchCursor('/test');
      const result = cursor.addQuery({ param: 'value' });

      expect(result).toBe(cursor);
    });
  });

  describe('setUrlRoot', () => {
    it('should set the URL root', () => {
      const cursor = new FetchCursor('/test');
      cursor.setUrlRoot('https://api.example.com');

      expect(cursor.url()).toBe('https://api.example.com/test');
    });

    it('should return the cursor for chaining', () => {
      const cursor = new FetchCursor('/test');
      const result = cursor.setUrlRoot('https://api.example.com');

      expect(result).toBe(cursor);
    });
  });

  describe('url', () => {
    it('should construct URL with path only', () => {
      const cursor = new FetchCursor('/test');
      expect(cursor.url()).toBe('/test');
    });

    it('should construct URL with urlRoot and path', () => {
      const cursor = new FetchCursor('/test', { urlRoot: 'https://api.example.com' });
      expect(cursor.url()).toBe('https://api.example.com/test');
    });

    it('should construct URL with query parameters', () => {
      const cursor = new FetchCursor('/test');
      cursor.setQuery({ param1: 'value1', param2: 'value2' });
      expect(cursor.url()).toBe('/test?param1=value1&param2=value2');
    });

    it('should handle complex query parameters', () => {
      const cursor = new FetchCursor('/test');
      cursor.setQuery({
        array: [1, 2, 3],
        nested: { key: 'value' },
        encoded: 'hello world'
      });
      const url = cursor.url();
      expect(url).toContain('/test?');
      expect(url).toContain('array');
      expect(url).toContain('nested');
      expect(url).toContain('encoded');
    });
  });

  describe('fetchOptions', () => {
    it('should return basic fetch options', () => {
      const cursor = new FetchCursor('/test');
      const options = cursor.fetchOptions();

      expect(options.method).toBe('GET');
      expect(options.headers).toEqual({});
    });

    it('should include custom method', () => {
      const cursor = new FetchCursor('/test', { method: 'POST' });
      const options = cursor.fetchOptions();

      expect(options.method).toBe('POST');
    });

    it('should include body as string', () => {
      const cursor = new FetchCursor('/test', { body: 'raw body' });
      const options = cursor.fetchOptions();

      expect(options.body).toBe('raw body');
    });

    it('should serialize body as JSON', () => {
      const cursor = new FetchCursor('/test', { body: { key: 'value' } });
      const options = cursor.fetchOptions();

      expect(options.body).toBe('{"key":"value"}');
    });
  });

  describe('toJSON', () => {
    it('should fetch and return JSON for successful response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const cursor = new FetchCursor('/test');
      const result = await cursor.toJSON();

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith('/test', expect.objectContaining({
        method: 'GET'
      }));
    });

    it('should handle fetch errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        url: '/test'
      };
      mockFetch.mockResolvedValue(mockResponse as any);
      mockHandleFetchError.mockRejectedValue(new Error('Not found'));

      const cursor = new FetchCursor('/test');

      await expect(cursor.toJSON()).rejects.toThrow('Not found');
      expect(mockHandleFetchError).toHaveBeenCalledWith(mockResponse, {
        maxErrorMessageLength: 100,
        method: 'GET'
      });
    });
  });

  describe('toJS', () => {
    it('should alias toJSON', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const cursor = new FetchCursor('/test');
      const result = await cursor.toJS();

      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('fluent interface chaining', () => {
    it('should allow method chaining', () => {
      const cursor = new FetchCursor('/test')
        .setUrlRoot('https://api.example.com')
        .setHeaders({ 'Authorization': 'Bearer token' })
        .addHeaders({ 'Content-Type': 'application/json' })
        .setQuery({ param1: 'value1' })
        .addQuery({ param2: 'value2' });

      expect(cursor.url()).toBe('https://api.example.com/test?param1=value1&param2=value2');

      const options = cursor.fetchOptions();
      expect(options.headers).toEqual({
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json'
      });
    });
  });
});
import fetch, { handleFetchError } from '../src/index';
import { FetchCursor } from '../src/fetchCursor';
import originalHandleFetchError from '../src/handleFetchError';

describe('stein-fetch module exports', () => {
  it('should export fetch as default', () => {
    expect(typeof fetch).toBe('function');
    expect(fetch).toBeDefined();
  });

  it('should export handleFetchError as named export', () => {
    expect(typeof handleFetchError).toBe('function');
    expect(handleFetchError).toBe(originalHandleFetchError);
  });

  it('should create FetchCursor instance when calling default export', () => {
    const cursor = fetch('/test');
    expect(cursor).toBeInstanceOf(FetchCursor);
  });

  it('should pass options to FetchCursor constructor', () => {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      urlRoot: 'https://api.example.com'
    };

    const cursor = fetch('/test', options);
    expect(cursor.url()).toBe('https://api.example.com/test');

    const fetchOptions = cursor.fetchOptions();
    expect(fetchOptions.method).toBe('POST');
    expect(fetchOptions.headers).toEqual({ 'Content-Type': 'application/json' });
  });
});
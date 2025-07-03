import _ from 'lodash';
import fetch from 'cross-fetch';
import qs from 'qs';
import handleFetchError from './handleFetchError';


interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | object;
  maxErrorMessageLength?: number;
  query?: string | Record<string, any>;
  urlRoot?: string;
}

interface DefaultOptions {
  method: string;
  headers: Record<string, string>;
}

const defaults: DefaultOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
};

export class FetchCursor {
  private options: FetchOptions;
  private _maxErrorMessageLength: number;
  private _query?: string | Record<string, any>;
  private _urlRoot: string;
  private _headers: Record<string, string>;
  private _body?: string | object;
  private _path: string;

  constructor(path: string, options: FetchOptions = {}) {
    this.options = { ...defaults, ...options };
    this._maxErrorMessageLength = options.maxErrorMessageLength || 100;
    this._query = options.query;
    this._urlRoot = options.urlRoot || '';
    this._headers = options.headers || {};
    this._body = options.body;
    this._path = path;
  }

  setHeaders = (headers: Record<string, string>): FetchCursor => {
    this._headers = headers;
    return this;
  };

  addHeaders = (headers: Record<string, string>): FetchCursor => {
    this._headers = { ...this._headers, ...headers };
    return this;
  };

  setQuery = (query: string | Record<string, any>): FetchCursor => {
    this._query = query;
    return this;
  };

  addQuery = (query: Record<string, any>): FetchCursor => {
    this._query = { ...(this._query as Record<string, any>) || {}, ...query };
    return this;
  };

  setUrlRoot = (urlRoot: string): FetchCursor => {
    this._urlRoot = urlRoot;
    return this;
  };

  url = (): string => {
    let url = `${this._urlRoot}${this._path}`;
    const query = this._query;
    if (query) {
      if (_.isString(query)) url += `?${query}`;
      else if (_.isObject(query)) url += `?${qs.stringify(query)}`;
    }
    return url;
  };

  fetchOptions = (): RequestInit => {
    const opts: RequestInit = {
      method: this.options.method,
      headers: this._headers,
    };
    if (this._body) {
      opts.body = _.isString(this._body) ? this._body : JSON.stringify(this._body);
    }
    return opts;
  };

  toJSON = async (): Promise<any> => {
    const fetchOptions = this.fetchOptions();
    const res = await fetch(this.url(), fetchOptions);
    if (!res.ok) {
      return handleFetchError(res, {
        maxErrorMessageLength: this._maxErrorMessageLength,
        method: fetchOptions.method,
      });
    }

    return res.json();
  };

  toJS = async (): Promise<any> => this.toJSON();
}

export default function createFetchCursor(path: string, options?: FetchOptions): FetchCursor {
  return new FetchCursor(path, options);
}

import type { AuthResponse, BookDetail, BookSummary, Entry, Invitation, User } from './types';

// Empty in development (the Vite proxy forwards /api). In production this is the URL of the backend.
const API_URL: string = import.meta.env.VITE_API_URL ?? '';
const TOKEN_KEY = 'wt_token';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let token: string | null = localStorage.getItem(TOKEN_KEY);
let onUnauthorized: (() => void) | null = null;

export function hasToken(): boolean {
  return token !== null;
}

export function setToken(newToken: string | null): void {
  token = newToken;
  if (newToken === null) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, newToken);
  }
}

// The auth context registers a function here, so an expired token logs the user out everywhere.
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Er ging iets mis. Probeer het opnieuw.';
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token !== null) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Geen verbinding met de server. Probeer het zo nog eens.');
  }

  if (!response.ok) {
    if (response.status === 401 && token !== null) {
      onUnauthorized?.();
    }
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

// The backend answers errors with { "message": "..." }.
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }
  } catch {
    // no JSON body
  }
  return response.status === 401
    ? 'Je bent uitgelogd. Log opnieuw in.'
    : 'Er ging iets mis. Probeer het opnieuw.';
}

// Sends a harmless request so a sleeping server starts waking up
// while the visitor is still reading or typing.
export function wakeServer(): void {
  fetch(API_URL + '/api/push/public-key').catch(() => {
    // Only a head start; nothing depends on the answer.
  });
}

export const api = {
  register: (username: string, email: string, password: string) =>
    request<AuthResponse>('POST', '/api/auth/register', { username, email, password }),

  login: (username: string, password: string) =>
    request<AuthResponse>('POST', '/api/auth/login', { username, password }),

  me: () => request<User>('GET', '/api/auth/me'),

  getBookshelf: () => request<BookSummary[]>('GET', '/api/books'),

  createBook: (title: string, coverColor: string) =>
    request<BookSummary>('POST', '/api/books', { title, coverColor }),

  getBook: (id: number) => request<BookDetail>('GET', `/api/books/${id}`),

  writeEntry: (bookId: number, text: string) =>
    request<Entry>('POST', `/api/books/${bookId}/entries`, { text }),

  finishBook: (bookId: number) => request<void>('POST', `/api/books/${bookId}/finish`),

  createInvitation: (bookId: number) =>
    request<Invitation>('POST', `/api/books/${bookId}/invitations`),

  getInvitation: (code: string) =>
    request<Invitation>('GET', `/api/invitations/${encodeURIComponent(code)}`),

  acceptInvitation: (code: string) =>
    request<Invitation>('POST', `/api/invitations/${encodeURIComponent(code)}/accept`),

  declineInvitation: (code: string) =>
    request<void>('POST', `/api/invitations/${encodeURIComponent(code)}/decline`),

  getPushKey: () => request<{ publicKey: string }>('GET', '/api/push/public-key'),

  subscribePush: (endpoint: string, p256dh: string, auth: string) =>
    request<void>('POST', '/api/push/subscriptions', { endpoint, p256dh, auth }),

  unsubscribePush: (endpoint: string) => request<void>('POST', '/api/push/unsubscribe', { endpoint }),
};

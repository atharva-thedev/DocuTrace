/**
 * In-Memory Token Store for Access Tokens
 * 
 * SECURITY STANDARD: Access tokens are stored exclusively in module memory.
 * Never store access tokens in localStorage, sessionStorage, or client-accessible cookies,
 * eliminating XSS token exfiltration attack vectors.
 */

let _accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => _accessToken,
  set: (token: string): void => {
    _accessToken = token;
  },
  clear: (): void => {
    _accessToken = null;
  },
};

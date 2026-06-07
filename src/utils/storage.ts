
const TOKEN_KEY = 'port_management_token';
const USER_KEY = 'port_management_user';

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const setUser = <T = unknown>(user: T): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = <T = unknown>(): T | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr) as T;
    } catch {
      return null;
    }
  }
  return null;
};

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const clearStorage = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const setSessionStorage = (key: string, value: unknown): void => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getSessionStorage = <T = unknown>(key: string): T | null => {
  const valueStr = sessionStorage.getItem(key);
  if (valueStr) {
    try {
      return JSON.parse(valueStr) as T;
    } catch {
      return null;
    }
  }
  return null;
};

export const removeSessionStorage = (key: string): void => {
  sessionStorage.removeItem(key);
};

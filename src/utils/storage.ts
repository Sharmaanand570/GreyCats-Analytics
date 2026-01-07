

export const StorageKey = {
  ANALYTICS_TOKEN: "ANALYTICS_TOKEN_KEY_",
} as const;

export type StorageKeyType = typeof StorageKey[keyof typeof StorageKey];


export const setAuthToken = (key: StorageKeyType, value: string): void => {
  localStorage.setItem(key, value);
};


export const isAuthenticated = (key: StorageKeyType): boolean => {
  const token = localStorage.getItem(key);
  return token !== null;
}


export const getAuthToken = (key: StorageKeyType): string | null => {
  return localStorage.getItem(key);
}

export const removeAuthToken = (key: StorageKeyType): void => {
  localStorage.removeItem(key);
}
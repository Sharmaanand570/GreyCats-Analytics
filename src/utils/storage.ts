

export enum StorageKey {
  ANALYTICS_TOKEN = "ANALYTICS_TOKEN_KEY_",
}


export const setAuthToken = (key:StorageKey.ANALYTICS_TOKEN, value: string): void => {
  localStorage.setItem(key, value);
};  


export const getAuthToken = (key: StorageKey.ANALYTICS_TOKEN): string | null => {
  return localStorage.getItem(key);
}

export const removeAuthToken = (key: StorageKey.ANALYTICS_TOKEN): void => {
  localStorage.removeItem(key);
}
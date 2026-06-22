/**
 * AsyncStorage Service with Fallback
 * Type-safe storage implementation using AsyncStorage with memory fallback
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Type definitions for storage operations
 */
export type StorageValue = string | number | boolean | object | null;
export type StorageKey = string;
export type StorageMode = 'async-storage' | 'memory-fallback';

// Storage mode and fallback storage
let storageMode: StorageMode = 'async-storage';
const fallbackStorage: Record<string, string> = {};

/**
 * Initialize storage and detect mode
 */
const initializeStorage = async (): Promise<void> => {
  try {
    // Test if AsyncStorage is available
    await AsyncStorage.setItem('__test__', 'test');
    const testValue = await AsyncStorage.getItem('__test__');

    if (testValue === 'test') {
      storageMode = 'async-storage';
      // Clean up test key
      await AsyncStorage.removeItem('__test__');
    } else {
      throw new Error('AsyncStorage test failed');
    }
  } catch (error) {
    storageMode = 'memory-fallback';
    console.warn('⚠️ AsyncStorage not available, using in-memory fallback');
  }
};

// Initialize storage immediately
initializeStorage();

/**
 * Generic storage helper to set a value with JSON serialization
 */
export const setStorage = async <T>(key: string, value: T): Promise<boolean> => {
  try {
    const jsonString = JSON.stringify(value);

    if (storageMode === 'async-storage') {
      await AsyncStorage.setItem(key, jsonString);
    } else {
      fallbackStorage[key] = jsonString;
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error setting storage for key "${key}":`, errorMessage);
    return false;
  }
};

/**
 * Generic storage helper to get a value with JSON deserialization
 */
export const getStorage = async <T>(key: string): Promise<T | undefined> => {
  try {
    let value: string | null | undefined;

    if (storageMode === 'async-storage') {
      value = await AsyncStorage.getItem(key);
    } else {
      value = fallbackStorage[key];
    }

    if (value === null || value === undefined) {
      return undefined;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error getting storage for key "${key}":`, errorMessage);
    return undefined;
  }
};

/**
 * Storage helper to remove a value
 */
export const removeStorage = async (key: string): Promise<boolean> => {
  try {
    if (storageMode === 'async-storage') {
      await AsyncStorage.removeItem(key);
    } else {
      delete fallbackStorage[key];
    }
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error removing storage for key "${key}":`, errorMessage);
    return false;
  }
};

/**
 * Check if a key exists in storage
 */
export const hasStorage = async (key: string): Promise<boolean> => {
  try {
    let value: string | null | undefined;

    if (storageMode === 'async-storage') {
      value = await AsyncStorage.getItem(key);
    } else {
      value = fallbackStorage[key];
    }

    return value !== null && value !== undefined;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error checking storage for key "${key}":`, errorMessage);
    return false;
  }
};

/**
 * Clear all storage data
 */
export const clearStorage = async (): Promise<boolean> => {
  try {
    if (storageMode === 'async-storage') {
      await AsyncStorage.clear();
    } else {
      // Clear all keys from fallback storage
      Object.keys(fallbackStorage).forEach(key => {
        delete fallbackStorage[key];
      });
    }
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error clearing storage:', errorMessage);
    return false;
  }
};

/**
 * Get all keys from storage
 */
export const getAllStorageKeys = async (): Promise<string[]> => {
  try {
    if (storageMode === 'async-storage') {
      return await AsyncStorage.getAllKeys();
    } else {
      return Object.keys(fallbackStorage);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting all storage keys:', errorMessage);
    return [];
  }
};

/**
 * Generic storage helper with default value
 */
export const getStorageWithDefault = async <T>(
  key: string,
  defaultValue: T
): Promise<T> => {
  const value = await getStorage<T>(key);
  return value !== undefined ? value : defaultValue;
};

/**
 * Multi-get values for multiple keys
 */
export const multiGetStorage = async <T>(
  keys: string[]
): Promise<Record<string, T | undefined>> => {
  try {
    const result: Record<string, T | undefined> = {};

    for (const key of keys) {
      try {
        let value: string | null | undefined;

        if (storageMode === 'async-storage') {
          value = await AsyncStorage.getItem(key);
        } else {
          value = fallbackStorage[key];
        }

        if (value !== null && value !== undefined) {
          result[key] = JSON.parse(value) as T;
        } else {
          result[key] = undefined;
        }
      } catch {
        result[key] = undefined;
      }
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error multi-getting storage:', errorMessage);
    return {};
  }
};

/**
 * Multi-set values for multiple key-value pairs
 */
export const multiSetStorage = async <T>(
  keyValuePairs: Record<string, T>
): Promise<boolean> => {
  try {
    const entries = Object.entries(keyValuePairs);

    for (const [key, value] of entries) {
      const jsonString = JSON.stringify(value);

      if (storageMode === 'async-storage') {
        await AsyncStorage.setItem(key, jsonString);
      } else {
        fallbackStorage[key] = jsonString;
      }
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error multi-setting storage:', errorMessage);
    return false;
  }
};

/**
 * Multi-remove values for multiple keys
 */
export const multiRemoveStorage = async (keys: string[]): Promise<boolean> => {
  try {
    for (const key of keys) {
      if (storageMode === 'async-storage') {
        await AsyncStorage.removeItem(key);
      } else {
        delete fallbackStorage[key];
      }
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error multi-removing storage:', errorMessage);
    return false;
  }
};

/**
 * Get current storage mode
 */
export const getStorageMode = (): StorageMode => {
  return storageMode;
};

/**
 * Check if using fallback storage
 */
export const isUsingFallback = (): boolean => {
  return storageMode === 'memory-fallback';
};

/**
 * Get storage info for debugging
 */
export const getStorageInfo = async (): Promise<{
  mode: StorageMode;
  totalKeys: number;
  approximateSize: number;
}> => {
  try {
    let keys: string[] = [];
    let totalSize = 0;

    if (storageMode === 'async-storage') {
      keys = await AsyncStorage.getAllKeys();

      // Estimate size
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    } else {
      keys = Object.keys(fallbackStorage);

      // Estimate size for fallback
      for (const key of keys) {
        const value = fallbackStorage[key];
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }

    return {
      mode: storageMode,
      totalKeys: keys.length,
      approximateSize: totalSize,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting storage info:', errorMessage);
    return {
      mode: storageMode,
      totalKeys: 0,
      approximateSize: 0,
    };
  }
};

/**
 * Export storage instance for direct access if needed
 */
export { AsyncStorage as storage };

/**
 * Storage utility functions
 */
export const storageUtils = {
  /**
   * Migrate data from old keys to new keys
   */
  migrateKey: async <T>(oldKey: string, newKey: string): Promise<boolean> => {
    try {
      const value = await getStorage<T>(oldKey);
      if (value !== undefined) {
        await setStorage(newKey, value);
        await removeStorage(oldKey);
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error migrating key from "${oldKey}" to "${newKey}":`, errorMessage);
      return false;
    }
  },

  /**
   * Backup storage data
   */
  backup: async (): Promise<string> => {
    try {
      let keys: string[] = [];

      if (storageMode === 'async-storage') {
        keys = await AsyncStorage.getAllKeys();
      } else {
        keys = Object.keys(fallbackStorage);
      }

      const backupData: Record<string, string> = {};

      // Get all values
      for (const key of keys) {
        let value: string | null | undefined;

        if (storageMode === 'async-storage') {
          value = await AsyncStorage.getItem(key);
        } else {
          value = fallbackStorage[key];
        }

        if (value !== null && value !== undefined) {
          backupData[key] = value;
        }
      }

      return JSON.stringify(backupData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error backing up storage:', errorMessage);
      return '';
    }
  },

  /**
   * Clear all data except specific keys
   */
  clearExcept: async (exceptKeys: string[]): Promise<boolean> => {
    try {
      let allKeys: string[] = [];

      if (storageMode === 'async-storage') {
        allKeys = await AsyncStorage.getAllKeys();
      } else {
        allKeys = Object.keys(fallbackStorage);
      }

      const keysToRemove = allKeys.filter(key => !exceptKeys.includes(key));

      if (keysToRemove.length > 0) {
        for (const key of keysToRemove) {
          if (storageMode === 'async-storage') {
            await AsyncStorage.removeItem(key);
          } else {
            delete fallbackStorage[key];
          }
        }
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error clearing storage except keys:', errorMessage);
      return false;
    }
  },
};

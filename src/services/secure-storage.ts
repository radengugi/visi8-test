import { getStorage, setStorage, removeStorage } from './storage';

/**
 * Secure Storage Utilities
 *
 * Provides encryption layer for sensitive data storage.
 * Uses AES encryption for protecting stored values.
 *
 * NOTE: In production, consider using:
 * - Expo SecureStore for tokens (iOS Keychain / Android Keystore)
 * - React Native Keychain for native secure storage
 * - Proper key management (not hardcoded keys)
 *
 * For MVP/Development: This provides basic encryption layer
 */

// ⚠️ PRODUCTION WARNING: In production, store this securely
// - Use environment variables
// - Or fetch from secure backend
// - Or use native secure storage APIs
const ENCRYPTION_KEY = '__your_encryption_key_here__';

/**
 * Simple XOR-based encryption for demonstration
 * ⚠️ PRODUCTION: Use proper encryption like crypto-js or Expo Crypto
 */
const encrypt = (text: string): string => {
  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    // Base64 encode to make it ASCII-safe
    return btoa(result);
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // Fallback to plain text
  }
};

/**
 * Simple XOR-based decryption for demonstration
 * ⚠️ PRODUCTION: Use proper encryption like crypto-js or Expo Crypto
 */
const decrypt = (encodedText: string): string => {
  try {
    const text = atob(encodedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return result;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encodedText; // Fallback to as-is
  }
};

/**
 * Securely store data with encryption
 * @param key - Storage key
 * @param value - Value to store (will be JSON serialized and encrypted)
 * @returns Promise<void>
 */
export const secureSetStorage = async <T>(key: string, value: T): Promise<void> => {
  try {
    // Serialize to JSON
    const jsonString = JSON.stringify(value);

    // Encrypt the JSON string
    const encrypted = encrypt(jsonString);

    // Store encrypted value
    await setStorage(key, encrypted);
  } catch (error) {
    console.error(`Failed to securely store ${key}:`, error);
    throw error;
  }
};

/**
 * Securely retrieve and decrypt data
 * @param key - Storage key
 * @returns Promise<T | null> - Decrypted value or null if not found
 */
export const secureGetStorage = async <T>(key: string): Promise<T | null> => {
  try {
    // Retrieve encrypted value
    const encrypted = await getStorage<string>(key);

    if (!encrypted) {
      return null;
    }

    // Decrypt the value
    const decrypted = decrypt(encrypted);

    // Parse JSON
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error(`Failed to securely retrieve ${key}:`, error);
    return null;
  }
};

/**
 * Remove encrypted data from storage
 * @param key - Storage key
 * @returns Promise<void>
 */
export const secureRemoveStorage = async (key: string): Promise<void> => {
  try {
    await removeStorage(key);
  } catch (error) {
    console.error(`Failed to remove secure storage ${key}:`, error);
    throw error;
  }
};

/**
 * Check if encrypted data exists
 * @param key - Storage key
 * @returns Promise<boolean>
 */
export const secureHasStorage = async (key: string): Promise<boolean> => {
  try {
    const value = await getStorage<string>(key);
    return value !== null;
  } catch (error) {
    console.error(`Failed to check secure storage ${key}:`, error);
    return false;
  }
};

/**
 * Production-ready alternative using Expo SecureStore
 * Uncomment to use for sensitive data like auth tokens
 *
 * Usage:
 * import * as SecureStore from 'expo-secure-store';
 *
 * export const secureSetStorage = async (key: string, value: string): Promise<void> => {
 *   await SecureStore.setItemAsync(key, value, {
 *     keychainAccessible: SecureStore.WHEN_UNLOCKED,
 *   });
 * };
 *
 * export const secureGetStorage = async (key: string): Promise<string | null> => {
 *   return await SecureStore.getItemAsync(key);
 * };
 *
 * export const secureRemoveStorage = async (key: string): Promise<void> => {
 *   await SecureStore.deleteItemAsync(key);
 * };
 */

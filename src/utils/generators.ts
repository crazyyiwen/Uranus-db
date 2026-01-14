import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique identifier
 */
export function generateUid(): string {
  return uuidv4();
}

/**
 * Generate a timestamp-based ID
 */
export function generateTimestampId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * UUID Utility
 * Generates unique identifiers for tasks
 */

/**
 * Generates a simple UUID v4-like identifier
 * @returns {string} A unique identifier
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

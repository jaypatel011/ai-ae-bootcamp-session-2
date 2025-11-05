/**
 * UUID utility tests
 */

import { generateUUID } from '../../utils/uuid';

describe('uuid', () => {
  test('generates a UUID', () => {
    const uuid = generateUUID();
    expect(uuid).toBeTruthy();
    expect(typeof uuid).toBe('string');
  });

  test('generates unique UUIDs', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });

  test('generates UUID with correct format', () => {
    const uuid = generateUUID();
    // Check format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(uuid)).toBe(true);
  });

  test('generates multiple unique UUIDs', () => {
    const uuids = new Set();
    for (let i = 0; i < 100; i++) {
      uuids.add(generateUUID());
    }
    expect(uuids.size).toBe(100);
  });
});

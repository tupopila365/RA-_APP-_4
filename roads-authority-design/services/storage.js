/**
 * In-memory storage so the app runs without expo-secure-store.
 * Data does not persist across app restarts. For production, consider
 * installing expo-secure-store in the project where you run Expo and using it here.
 */
const memory = new Map();

export async function getItem(key) {
  return memory.get(key) ?? null;
}

export async function setItem(key, value) {
  memory.set(key, value);
}

export async function removeItem(key) {
  memory.delete(key);
}

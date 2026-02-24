import * as storage from './storage';

const DEVICE_ID_KEY = 'ra_design_device_id';

function generateDeviceId() {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).substring(2, 15);
  return `${t}-${r}`;
}

export async function getOrCreateDeviceId() {
  try {
    let deviceId = await storage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateDeviceId();
      await storage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (e) {
    return generateDeviceId();
  }
}

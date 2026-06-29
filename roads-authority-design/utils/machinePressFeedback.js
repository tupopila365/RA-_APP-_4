import { Platform, Vibration } from 'react-native';

export function triggerMachinePressFeedback() {
  if (Platform.OS === 'android') {
    Vibration.vibrate(8);
  } else {
    Vibration.vibrate();
  }
}

export function triggerMachineSubmitFeedback() {
  Vibration.vibrate([0, 35, 40, 70]);
}

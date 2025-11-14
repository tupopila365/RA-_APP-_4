import { useColorScheme } from 'react-native';
import { RATheme } from '../theme/colors';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = RATheme[isDark ? 'dark' : 'light'];

  return {
    colors,
    isDark,
    colorScheme,
  };
}

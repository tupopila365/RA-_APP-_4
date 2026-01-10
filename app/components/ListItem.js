import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RATheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { IconContainer } from './IconContainer';

export function ListItem({
  title,
  subtitle,
  icon,
  iconName,
  iconColor,
  onPress,
  rightElement,
  showChevron = false,
  type = 'action', // 'action', 'toggle', 'info'
  toggleValue,
  onToggle,
  disabled = false,
  style,
  containerStyle,
}) {
  const colorScheme = useColorScheme();
  const colors = RATheme[colorScheme === 'dark' ? 'dark' : 'light'];
  const styles = getStyles(colors);

  const isClickable = type === 'action' && onPress && !disabled;
  const isToggle = type === 'toggle';

  const content = (
    <View style={[styles.item, containerStyle]}>
      {(icon || iconName) && (
        <IconContainer
          icon={icon}
          iconName={iconName}
          color={iconColor || colors.primary}
          size={40}
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {isToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={toggleValue ? colors.secondary : colors.textSecondary}
          disabled={disabled}
        />
      )}
      {rightElement && (typeof rightElement === 'string' ? <Text style={styles.rightText}>{rightElement}</Text> : rightElement)}
      {showChevron && !isToggle && !rightElement && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </View>
  );

  if (isClickable) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
        style={[styles.touchable, style]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.wrapper, style]}>{content}</View>;
}

const getStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: colors.card,
    },
    touchable: {
      backgroundColor: colors.card,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    content: {
      flex: 1,
      marginLeft: spacing.md,
    },
    title: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs / 2,
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    rightText: {
      ...typography.body,
      color: colors.text,
      marginLeft: spacing.sm,
    },
  });














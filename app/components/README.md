# UI Components Library

This document describes the standardized UI components created to ensure consistent UI/UX throughout the Roads Authority application.

## Components Overview

### FormInput
A standardized text input component for forms with consistent styling and error handling.

**Props:**
- `value` (string): Input value
- `onChangeText` (function): Callback when text changes
- `placeholder` (string): Placeholder text
- `label` (string, optional): Label above the input
- `error` (string, optional): Error message to display
- `multiline` (boolean): Enable multiline input
- `textArea` (boolean): Large text area mode
- `keyboardType` (string): Keyboard type (numeric, email, etc.)
- `disabled` (boolean): Disable the input

**Example:**
```jsx
<FormInput
  label="Road Name"
  value={roadName}
  onChangeText={setRoadName}
  placeholder="Enter road name"
  error={roadNameError}
/>
```

### Badge
A standardized badge component for displaying status, categories, or labels.

**Props:**
- `label` (string): Badge text
- `variant` (string): 'default' | 'success' | 'error' | 'warning' | 'info'
- `color` (string, optional): Custom color
- `backgroundColor` (string, optional): Custom background color
- `textColor` (string, optional): Custom text color
- `size` (string): 'small' | 'medium' | 'large'

**Example:**
```jsx
<Badge label="Open" variant="success" size="small" />
<Badge label={category} variant="info" />
```

### SectionTitle
A consistent section header component.

**Props:**
- `title` (string): Section title
- `subtitle` (string, optional): Subtitle text

**Example:**
```jsx
<SectionTitle title="Settings" subtitle="Manage your preferences" />
```

### ListItem
A standardized list item component for settings screens and lists.

**Props:**
- `title` (string): Item title
- `subtitle` (string, optional): Item subtitle
- `icon` (element, optional): Custom icon element
- `iconName` (string, optional): Ionicons icon name
- `iconColor` (string, optional): Icon color
- `onPress` (function, optional): Press handler
- `type` (string): 'action' | 'toggle' | 'info'
- `toggleValue` (boolean, optional): Toggle value
- `onToggle` (function, optional): Toggle handler
- `showChevron` (boolean): Show chevron icon
- `disabled` (boolean): Disable interaction

**Example:**
```jsx
<ListItem
  title="Dark Mode"
  subtitle="Switch between themes"
  iconName="moon-outline"
  type="toggle"
  toggleValue={darkMode}
  onToggle={setDarkMode}
/>
```

### IconContainer
A standardized icon container with background.

**Props:**
- `icon` (element, optional): Custom icon element
- `iconName` (string, optional): Ionicons icon name
- `color` (string): Icon color
- `backgroundColor` (string, optional): Background color
- `size` (number): Container size (default: 40)

**Example:**
```jsx
<IconContainer iconName="settings" color={colors.primary} size={40} />
```

### Button (Enhanced)
Enhanced button component with more variants and better icon support.

**Props:**
- `label` (string): Button text
- `onPress` (function): Press handler
- `variant` (string): 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
- `size` (string): 'small' | 'medium' | 'large'
- `icon` (element, optional): Custom icon
- `iconName` (string, optional): Ionicons icon name
- `iconPosition` (string): 'left' | 'right'
- `loading` (boolean): Show loading state
- `disabled` (boolean): Disable button
- `fullWidth` (boolean): Full width button

**Example:**
```jsx
<Button
  label="Submit"
  onPress={handleSubmit}
  iconName="checkmark-circle"
  size="large"
  fullWidth
  loading={isSubmitting}
/>
```

### Card (Enhanced)
Enhanced card component with variant support.

**Props:**
- `children` (element): Card content
- `onPress` (function, optional): Make card pressable
- `variant` (string): 'default' | 'elevated' | 'outlined' | 'flat'
- `padding` (string): 'none' | 'small' | 'medium' | 'large'

**Example:**
```jsx
<Card variant="elevated" padding="medium">
  <Text>Card content</Text>
</Card>
```

## Migration Guide

### Replacing Custom TextInput
**Before:**
```jsx
<TextInput
  style={styles.input}
  placeholder="Enter text"
  value={value}
  onChangeText={setValue}
/>
```

**After:**
```jsx
<FormInput
  value={value}
  onChangeText={setValue}
  placeholder="Enter text"
  label="Field Label"
/>
```

### Replacing Custom Badges
**Before:**
```jsx
<View style={[styles.badge, { backgroundColor: color + '20' }]}>
  <Text style={[styles.badgeText, { color }]}>{label}</Text>
</View>
```

**After:**
```jsx
<Badge label={label} variant="info" size="small" />
```

### Replacing Custom Buttons
**Before:**
```jsx
<TouchableOpacity style={styles.button} onPress={handlePress}>
  <Text style={styles.buttonText}>Submit</Text>
</TouchableOpacity>
```

**After:**
```jsx
<Button label="Submit" onPress={handlePress} />
```

### Replacing Custom List Items
**Before:**
```jsx
<TouchableOpacity style={styles.listItem}>
  <View style={styles.iconContainer}>
    <Ionicons name="icon" />
  </View>
  <View style={styles.content}>
    <Text style={styles.title}>Title</Text>
    <Text style={styles.subtitle}>Subtitle</Text>
  </View>
  <Ionicons name="chevron-forward" />
</TouchableOpacity>
```

**After:**
```jsx
<ListItem
  title="Title"
  subtitle="Subtitle"
  iconName="icon"
  onPress={handlePress}
  showChevron
/>
```

## Usage Best Practices

1. **Always use components from the library** instead of creating custom styled components
2. **Use consistent spacing** from the theme spacing values
3. **Use theme colors** instead of hardcoded colors
4. **Follow the variant naming** (primary, secondary, etc.) for consistency
5. **Use appropriate sizes** (small, medium, large) for different contexts
6. **Always provide accessibility props** when available

## Theme Integration

All components automatically respect the app's theme (light/dark mode) through the `useColorScheme` hook and `RATheme` configuration.

























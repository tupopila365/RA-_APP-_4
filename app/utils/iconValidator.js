// Icon Validator Utility
import { Ionicons } from '@expo/vector-icons';

// List of commonly used valid Ionicons
export const VALID_ICONS = {
  // Navigation
  home: 'home',
  homeOutline: 'home-outline',
  settings: 'settings',
  settingsOutline: 'settings-outline',
  
  // Communication
  chatbubbles: 'chatbubbles',
  chatbubblesOutline: 'chatbubbles-outline',
  notifications: 'notifications',
  notificationsOutline: 'notifications-outline',
  
  // Content
  newspaper: 'newspaper',
  newspaperOutline: 'newspaper-outline',
  document: 'document',
  documentOutline: 'document-outline',
  
  // Actions
  add: 'add',
  addOutline: 'add-outline',
  close: 'close',
  closeOutline: 'close-outline',
  refresh: 'refresh',
  refreshOutline: 'refresh-outline',
  
  // Arrows
  chevronForward: 'chevron-forward',
  chevronBack: 'chevron-back',
  chevronDown: 'chevron-down',
  chevronUp: 'chevron-up',
  
  // Status
  checkmark: 'checkmark',
  checkmarkCircle: 'checkmark-circle',
  alert: 'alert',
  alertCircle: 'alert-circle',
  
  // Maps & Location
  map: 'map',
  mapOutline: 'map-outline',
  location: 'location',
  locationOutline: 'location-outline',
  
  // Vehicles
  car: 'car',
  carOutline: 'car-outline',
  
  // Common UI
  search: 'search',
  searchOutline: 'search-outline',
  filter: 'filter',
  filterOutline: 'filter-outline',
  menu: 'menu',
  menuOutline: 'menu-outline',
};

// Validate if an icon name exists
export function validateIcon(iconName) {
  return Object.values(VALID_ICONS).includes(iconName);
}

// Get a safe icon name (fallback to default if invalid)
export function getSafeIconName(iconName, fallback = 'ellipse-outline') {
  return validateIcon(iconName) ? iconName : fallback;
}

// Enhanced Icon component with validation
export function SafeIcon({ name, size = 24, color = '#000', style, ...props }) {
  const safeName = getSafeIconName(name);
  
  if (safeName !== name) {
    console.warn(`Invalid icon name: ${name}, using fallback: ${safeName}`);
  }
  
  return (
    <Ionicons 
      name={safeName} 
      size={size} 
      color={color} 
      style={style}
      {...props}
    />
  );
}

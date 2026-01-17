// Shared map styling to keep map-based screens visually consistent
export const mapStyleLight = [
  { elementType: 'geometry', stylers: [{ color: '#F7F8FA' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#374151' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#D1D5DB' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#D7DEE7' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#C0C8D5' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#A9B4C4' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', stylers: [{ color: '#CDEAFE' }] },
];

export const mapStyleDark = [
  { elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#E5E7EB' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1F2937' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1F2937' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#475569' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', stylers: [{ color: '#0EA5E9' }] },
];

export const getSharedMapStyle = (isDark = false) => (isDark ? mapStyleDark : mapStyleLight);

export const getSharedMapOptions = (isDark = false) => ({
  mapType: 'standard',
  customMapStyle: getSharedMapStyle(isDark),
  showsBuildings: true,
  showsPointsOfInterest: false,
  toolbarEnabled: false,
  loadingEnabled: true,
});


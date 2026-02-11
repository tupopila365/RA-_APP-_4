/**
 * RoadworkMap — thin wrapper around MapComponent for backward compatibility
 * Use MapComponent directly for new code.
 */
import MapComponent, { MAP_MODES } from './MapComponent';

export function RoadworkMap({
  region,
  onRegionChange,
  onPress,
  roadworks = [],
  selectedLocation = null,
  onMarkerDragEnd,
  showRoadworks = true,
  showSelectedMarker = true,
  markerTitle = 'Selected Location',
  markerDescription = 'Drag to adjust',
  style,
  children,
}) {
  return (
    <MapComponent
      mode={onMarkerDragEnd || onPress ? MAP_MODES.SELECT : MAP_MODES.VIEW}
      initialRegion={region}
      onRegionChange={onRegionChange}
      onPress={onPress}
      roadworks={roadworks}
      selectedLocation={selectedLocation}
      onMarkerDragEnd={onMarkerDragEnd}
      showRoadworks={showRoadworks}
      showSelectedMarker={showSelectedMarker}
      markerTitle={markerTitle}
      markerDescription={markerDescription}
      style={style}
    >
      {children}
    </MapComponent>
  );
}

export { MAP_MODES, MARKER_TYPES } from './MapComponent';
export default RoadworkMap;

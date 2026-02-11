/**
 * RoadsMap — re-exports MapComponent for backward compatibility
 * Use MapComponent directly for new code.
 */
import MapComponent, { MAP_MODES, MARKER_TYPES } from './MapComponent';

// MapPrimitives for custom map children
export { MapPrimitives } from './MapComponent';

export { MAP_MODES, MARKER_TYPES };
export default MapComponent;

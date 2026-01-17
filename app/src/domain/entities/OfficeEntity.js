/**
 * Office Entity
 * 
 * Domain model representing a Roads Authority office/location.
 */
export class OfficeEntity {
  /**
   * @param {Object} props - Office properties
   * @param {string} props.id - Unique identifier
   * @param {string} props.name - Office name
   * @param {string} props.address - Physical address
   * @param {string} props.region - Region/area
   * @param {Object} props.coordinates - GPS coordinates
   * @param {number} props.coordinates.latitude - Latitude
   * @param {number} props.coordinates.longitude - Longitude
   * @param {string} [props.contactNumber] - Contact phone number
   * @param {string} [props.email] - Contact email
   * @param {Array<string>} [props.services] - Services offered
   * @param {Object} [props.operatingHours] - Operating hours grouped by day type
   * @param {Array<string>} [props.closedDays] - Regularly closed days
   * @param {Array<Object>} [props.specialHours] - Special days with custom hours/closures
   * @param {Date} [props.createdAt] - Creation date
   * @param {Date} [props.updatedAt] - Last update date
   */
  constructor({
    id,
    name,
    address,
    region,
    coordinates,
    contactNumber = null,
    email = null,
    services = [],
    operatingHours = null,
    closedDays = [],
    specialHours = [],
    createdAt = null,
    updatedAt = null,
  }) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.region = region;
    this.coordinates = coordinates;
    this.contactNumber = contactNumber;
    this.email = email;
    this.services = services;
    this.operatingHours = operatingHours;
    this.closedDays = closedDays;
    this.specialHours = specialHours;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Check if office has contact number
   * @returns {boolean}
   */
  hasContactNumber() {
    return this.contactNumber !== null && this.contactNumber !== '';
  }

  /**
   * Check if office has email
   * @returns {boolean}
   */
  hasEmail() {
    return this.email !== null && this.email !== '';
  }

  /**
   * Check if office has valid coordinates
   * @returns {boolean}
   */
  hasCoordinates() {
    return (
      this.coordinates &&
      typeof this.coordinates.latitude === 'number' &&
      typeof this.coordinates.longitude === 'number' &&
      !isNaN(this.coordinates.latitude) &&
      !isNaN(this.coordinates.longitude)
    );
  }

  /**
   * Get formatted address with region
   * @returns {string}
   */
  getFullAddress() {
    return `${this.address}, ${this.region}`;
  }

  /**
   * Get Google Maps URL
   * @returns {string|null}
   */
  getGoogleMapsUrl() {
    if (!this.hasCoordinates()) {
      return null;
    }
    const { latitude, longitude } = this.coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  /**
   * Get distance from a point (in kilometers)
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {number|null} Distance in km or null if no coordinates
   */
  getDistanceFrom(lat, lng) {
    if (!this.hasCoordinates()) {
      return null;
    }

    const R = 6371; // Earth's radius in km
    const dLat = this._toRad(lat - this.coordinates.latitude);
    const dLon = this._toRad(lng - this.coordinates.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._toRad(this.coordinates.latitude)) *
      Math.cos(this._toRad(lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @private
   */
  _toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Create a copy with updated properties
   * @param {Object} updates - Properties to update
   * @returns {OfficeEntity}
   */
  copyWith(updates) {
    return new OfficeEntity({
      id: this.id,
      name: this.name,
      address: this.address,
      region: this.region,
      coordinates: this.coordinates,
      contactNumber: this.contactNumber,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...updates,
    });
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      region: this.region,
      coordinates: this.coordinates,
      contactNumber: this.contactNumber,
      email: this.email,
      services: this.services,
      operatingHours: this.operatingHours,
      closedDays: this.closedDays,
      specialHours: this.specialHours,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

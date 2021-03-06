import { PATTERNS } from './patterns.js';

export class DecimalDegrees {
  /**
   * Constructs DecimalDegrees Object
   *
   * @param coords - object containing lat and lng keys
   *
   * @remarks
   * This can take in machine or user input and will normalize it to floating point numbers.
   *
   * @returns DecimalDegrees object containing latitude and logitude
   *
   */
  constructor(coords) {
    this.lat;
    this.lng;

    const errors = this.validate(coords);
    if (errors.length > 0) {
      throw new Error(errors);
    }
    const normalizedCoords = this.normalize(coords);
    this.lat = normalizedCoords.lat;
    this.lng = normalizedCoords.lng;

    return this;
  };

  /**
   * Validates coordinates against known good patterns
   *
   * @param coords - object containing lat and lng keys
   *
   * @returns an array
   *
   */
  validate(coords) {
    let errors = [];
    if (!PATTERNS.ddLat.test(coords.lat)) {
      errors.push('Invalid Latitude');
    }
    if (!PATTERNS.ddLng.test(coords.lng)) {
      errors.push('Invalid Longitude');
    }
    return errors;
  };

  /**
   * Normalizes Decimal Degrees
   *
   * @param coords - object containing lat and lng keys
   *
   * @returns normalized coordinates
   *
   */
  normalize(coords) {
    const nCoords = {};
    for (let key in coords) {
      // If South or West direction, the result should be inverted.
      const invert = /[SsWw]/.test(coords[key]) ? -1 : 1;
      nCoords[key] = parseFloat(String(coords[key]).replace(/[^\d\.-]+/g,'')) * invert;
    }
    return nCoords;
  }

  /**
   * Converts Decimal Degrees to Universal Transverse Mercator
   *
   * @returns object containing UTM data
   *
   */
  toUTM() {
    const { lat, lng } = this;
    const utmdata = utm.fromLatLon(lat, lng);

    return {
      display    : utmdata.display,
      easting    : utmdata.easting,
      northing   : utmdata.northing,
      zoneLetter : utmdata.zoneLetter,
      zoneNum    : utmdata.zoneNum
    }
  };

  /**
   * Converts Decimal Degrees to Degree Minute Second
   *
   * @returns object containing DMS data
   *
   */
  toDMS() {
    // ?? = latitude
    // ?? = longitude
    const ??abs = Math.abs(this.lat);
    const ??dir = this.lat<0 ? 'S' : 'N';
    const ??deg = Math.trunc(??abs);
    const ??min = Math.trunc((??abs-??deg)*60);
    const ??sec = Math.trunc((??abs-??deg-??min/60)*3600);
    const ??abs = Math.abs(this.lng);
    const ??dir = this.lng<0 ? 'W' : 'E';
    const ??deg = Math.trunc(??abs);
    const ??min = Math.trunc((??abs-??deg)*60);
    const ??sec = Math.trunc((??abs-??deg-??min/60)*3600);

    const dmsCoordSet = {
      lat: `${??deg}?? ${(??min < 0) ? 0 : ??min}??? ${(??sec < 0) ? 0 : ??sec}??? ${??dir}`,
      lng: `${??deg}?? ${(??min < 0) ? 0 : ??min}??? ${(??sec < 0) ? 0 : ??sec}??? ${??dir}`
    };
    return dmsCoordSet;
  }

  /**
   * Converts Decimal Degrees to Degree Decimal Minutes
   *
   * @returns object containing DDM data
   *
   */
  toDDM() {
    // ?? = latitude
    // ?? = longitude
    const ??abs = Math.abs(this.lat);
    const ??dir = this.lat<0 ? 'S' : 'N';
    const ??deg = Math.trunc(??abs);
    const ??min = parseFloat(parseFloat(`${(??abs-??deg)*60}`).toFixed(5));
    const ??abs = Math.abs(this.lng);
    const ??dir = this.lng<0 ? 'W' : 'E';
    const ??deg = Math.trunc(??abs);
    const ??min = parseFloat(parseFloat(`${(??abs-??deg)*60}`).toFixed(5));

    const ddmCoordSet = {
      lat: `${??deg}?? ${(??min<0) ? 0 : ??min}??? ${??dir}`,
      lng: `${??deg}?? ${(??min<0) ? 0 : ??min}??? ${??dir}`
    };
    return ddmCoordSet;
  }

  /**
   * Converts Decimal Degrees to Military Grid Reference System
   *
   * @returns string containing MGRS data
   *
   */
  toMGRS() {
    return mgrs.forward([this.lng, this.lat], 5);
  }
};

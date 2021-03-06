  import { PATTERNS } from './patterns.js';

/*
 *
 * Military Grid Reference System Class
 * Defines MGRS object and functions related.
 *
 */
export class MilitaryGridReferenceSystem {
  /**
   * Constructs MilitaryGridReferenceSystem Object
   *
   * @param coords - object containing lat and lng keys
   *
   * @remarks
   * This can take in machine or user input and will normalize it to a DDM object.
   *
   * @returns MilitaryGridReferenceSystem object containing reference
   *
   */
  constructor(reference) {
    this.gridReference;
    const errors = this.validate(reference);
    if (errors.length > 0) {
      throw new Error(errors);
    }
    const mgrs = this.normalize(reference);
    this.gridReference = mgrs;
    return this;
  };

  /**
   * Validates reference against known good pattern
   *
   * @param coords - reference string
   *
   * @returns an array
   *
   */
  validate(reference) {
    let errors = [];
    if (!PATTERNS.mgrs.test(reference)) {
      errors.push('Invalid Military Grid Reference');
    }
    return errors;
  };

  /**
   * Normalizes Military Grid Reference System
   *
   * @param coords - reference string
   *
   * @returns normalized reference
   *
   */
  normalize(reference) {
    const mgrs = reference.replace(/\s/g,'');
    return mgrs;
  }

  /**
   * Converts to Universal Transverse Mercator
   *
   * @returns object containing UTM data
   *
   */
  toUTM() {
    const [lng, lat] = mgrs.toPoint(this.gridReference);
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
   * Converts to Decimal Degrees
   *
   * @returns object containing DD data
   *
   */
  toDD() {
    const [lng, lat] = mgrs.toPoint(this.gridReference);
    return {
      lat: parseFloat(lat.toFixed(5)),
      lng: parseFloat(lng.toFixed(5))
    }
  };

  /**
   * Converts to Degrees Minutes Seconds
   *
   * @returns object containing DMS data
   *
   */
  toDMS() {
    // ?? = latitude
    // ?? = longitude
    const ??dd = this.toDD().lat;
    const ??dd = this.toDD().lng;

    const ??abs = Math.abs(??dd);
    const ??dir = ??dd<0 ? 'S' : 'N';
    const ??deg = Math.trunc(??abs);
    const ??min = Math.trunc((??abs-??deg)*60);
    const ??sec = Math.trunc((??abs-??deg-??min/60)*3600);
    const ??abs = Math.abs(??dd);
    const ??dir = ??dd<0 ? 'W' : 'E';
    const ??deg = Math.trunc(??abs);
    const ??min = Math.trunc((??abs-??deg)*60);
    const ??sec = Math.trunc((??abs-??deg-??min/60)*3600);

    const dmsCoordSet = {
      lat: `${??deg}?? ${(??min < 0) ? 0 : ??min}??? ${(??sec < 0) ? 0 : ??sec}??? ${??dir}`,
      lng: `${??deg}?? ${(??min < 0) ? 0 : ??min}??? ${(??sec < 0) ? 0 : ??sec}??? ${??dir}`
    };
    return dmsCoordSet;
  };

  /**
   * Converts to Degrees Decimal Minutes
   *
   * @returns object containing DDM data
   *
   */
  toDDM() {
    // ?? = latitude
    // ?? = longitude
    const ??dd = this.toDD().lat;
    const ??dd = this.toDD().lng;

    const ??abs = Math.abs(??dd);
    const ??dir = ??dd<0 ? 'S' : 'N';
    const ??deg = Math.trunc(??abs);
    const ??min = parseFloat(parseFloat(`${(??abs-??deg)*60}`).toFixed(5));
    const ??abs = Math.abs(??dd);
    const ??dir = ??dd<0 ? 'W' : 'E';
    const ??deg = Math.trunc(??abs);
    const ??min = parseFloat(parseFloat(`${(??abs-??deg)*60}`).toFixed(5));

    const ddmCoordSet = {
      lat: `${??deg}?? ${(??min<0) ? 0 : ??min}??? ${??dir}`,
      lng: `${??deg}?? ${(??min<0) ? 0 : ??min}??? ${??dir}`
    };
    return ddmCoordSet;
  }

};

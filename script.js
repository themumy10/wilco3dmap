


function submit() {
    var coloredDiv = document.getElementById('coloredDiv');
    coloredDiv.setAttribute("style", "background-color: red;");
    JavascriptChannel.postMessage("helooo");
}


mapboxgl.accessToken = 'pk.eyJ1IjoibXNhaGluZ2lyYXkiLCJhIjoiY2t6OXFpbjB5MGxzNjJ1bzF4cnBsZm9rZiJ9.Q29x7rlXQlOQ2iSF61Y20Q';

let mapOriginLatitude;
let mapOriginLongitude;
let map;

let animationIndex = 0;
let animationTime = 0.0;

let rotateAltitiude;


let thresoldLat;
let thresoldLong;
var approachAnimationId = null;


const coordinates = document.getElementById('coordinates');


function resetToAirport(centerLong, centerLat,rotateAlt,targetlat,targetlong){
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5});
    rotateAltitiude = rotateAlt;
    mapOriginLatitude = centerLong;
    mapOriginLongitude = centerLat;
    thresoldLat=centerLong;
    thresoldLong=centerLat;
    try {
        updateCameraPosition([mapOriginLatitude, mapOriginLongitude], rotateAltitiude, [targetlat, targetlong]);
    } catch (error) {
        
    }
   

}
let targetLatTemp;
let targetLongTemp;
function setRunway(centerLat, centerLong, rotateAlt,thresoldLatTemp,thresoldLongTemp,targetLat,targetLong){

    mapOriginLatitude = centerLat;
    mapOriginLongitude = centerLong;
    thresoldLat=thresoldLatTemp;
    thresoldLong=thresoldLongTemp;
    rotateAltitiude = rotateAlt;
    targetLatTemp=targetLat;
    targetLongTemp=targetLong;
    try {
        updateCameraPosition([centerLat, centerLong], rotateAltitiude, [targetLat, targetLong]);
    } catch (error) {
        
    }
    
}
function setStyleOF(style){

map.setStyle(style);
}



function startAirportService(centerLong, centerLat,rotateAlt) {
    rotateAltitiude = rotateAlt;
    mapOriginLatitude = centerLong;
    mapOriginLongitude = centerLat;
    thresoldLat=centerLong;
    thresoldLong=centerLat;
    rotateAltitiude =rotateAlt;
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v11',
        center: [centerLong, centerLat],
        zoom: 4,
        pitch: 45,
        antialias: true,
        bearing: 0,
        projection: 'globe'

    });
    map.on('load', () => {
      // Set the default atmosphere style
      map.setFog({});
      });
    
    const marker = new mapboxgl.Marker({
draggable: true
})
.setLngLat([centerLong, centerLat])
.addTo(map);
    
function onDragEnd() {
    const lngLat = marker.getLngLat();
    coordinates.style.display = 'block';

  var a=new DecimalDegrees({ lat: lngLat.lat, lng: lngLat.lng });


    coordinates.innerHTML = `Longitude: ${a.toDDM().lng}  ${a.toDMS().lng} <br />Latitude: ${a.toDDM().lat}  ${a.toDMS().lat}
    <br/> UTM : ${a.toUTM().display}
    <br/> MGRS : ${a.toMGRS().toString()}
    `;
    }
     
    marker.on('dragend', onDragEnd);
marker.on('dragend', onDragEnd);
 

    
    
    map.on('load', () => {
        map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
        });
        // add the DEM source as a terrain layer with exaggerated height
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
         
        // add a sky layer that will show when the map is highly pitched
        map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 0.0],
        'sky-atmosphere-sun-intensity': 15
        }
        });
        });
    map.on('error', (c) => {
        JavascriptChannel.postMessage("map error");
        JavascriptChannel.postMessage(c.toString());
    });
    map.on('webglcontextlost', () => {
        JavascriptChannel.postMessage("context lost");
    });
    map.on('webglcontextrestored', () => {
        JavascriptChannel.postMessage("context restored");
    });
}

function updateCameraPosition(position, altitude, target) {
    const camera = map.getFreeCameraOptions();

    camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
        position,
        altitude
    );
  
    camera.lookAtPoint(target);

    map.setFreeCameraOptions(camera);
}
const lerp = (a, b, t) => {
    if (Array.isArray(a) && Array.isArray(b)) {
        const result = [];
        for (let i = 0; i < Math.min(a.length, b.length); i++)
            result[i] = a[i] * (1.0 - t) + b[i] * t;
        return result;
    } else {
        return a * (1.0 - t) + b * t;
    }
};

startAirportService(38,38,3000);
 

function approach(startLat, startLong, endLat, endLong, targetLat, targetLong, upper, lower) {


   // map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 0.1});
    
    let lastTime = 0.0
    function frame(time) {
        const current={
            duration: 15000.0,
            animate: (phase) => {
                const start = [startLat, startLong];
                const end = [endLat, endLong];
                const alt = [upper, lower];

                // interpolate camera position while keeping focus on a target lat/lng
                const position = lerp(start, end, phase);
                const altitude = lerp(alt[0], alt[1], phase);
              
                var  target = [targetLat, targetLong];

                updateCameraPosition(position,altitude, target);
            }
        }
        if (animationTime < current.duration) {
            // Normalize the duration between 0 and 1 to interpolate the animation
            const phase = animationTime / current.duration;
            current.animate(phase);
        }

        // Elasped time since last frame, in milliseconds
        const elapsed = time - lastTime;
        animationTime += elapsed;
        lastTime = time;
        approachAnimationId = window.requestAnimationFrame(frame);
        if (animationTime > current.duration) {
           animationTime = 0.0;
        }       
    }

    approachAnimationId = window.requestAnimationFrame(frame);
}

var rotateAnimationID = null;


function rotateCamera(timestamp) {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    updateCameraPosition([mapOriginLatitude, mapOriginLongitude], rotateAltitiude, [thresoldLat, thresoldLong]);
    map.rotateTo((timestamp / 100) % 360, { duration: 0 });
    // Request the next frame of the animation.

    rotateAnimationID = window.requestAnimationFrame(rotateCamera);

}
function stopApproach() {
  
   

   
    window.cancelAnimationFrame(approachAnimationId); 
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5});
}
function stopRotation() {
    window.cancelAnimationFrame(rotateAnimationID);
}


var planeAnimationID = null;
function stopPlane() {
    window.cancelAnimationFrame(planeAnimationID);
}
function animate() {
    planeAnimationID = requestAnimationFrame(animate);

}





function sayHi() {
    JavascriptChannel.postMessage("hii");

}

class DecimalDegrees {
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
      // ϕ = latitude
      // λ = longitude
      const ϕabs = Math.abs(this.lat);
      const ϕdir = this.lat<0 ? 'S' : 'N';
      const ϕdeg = Math.trunc(ϕabs);
      const ϕmin = Math.trunc((ϕabs-ϕdeg)*60);
      const ϕsec = Math.trunc((ϕabs-ϕdeg-ϕmin/60)*3600);
      const λabs = Math.abs(this.lng);
      const λdir = this.lng<0 ? 'W' : 'E';
      const λdeg = Math.trunc(λabs);
      const λmin = Math.trunc((λabs-λdeg)*60);
      const λsec = Math.trunc((λabs-λdeg-λmin/60)*3600);
  
      const dmsCoordSet = {
        lat: `${ϕdeg}° ${(ϕmin < 0) ? 0 : ϕmin}′ ${(ϕsec < 0) ? 0 : ϕsec}″ ${ϕdir}`,
        lng: `${λdeg}° ${(λmin < 0) ? 0 : λmin}′ ${(λsec < 0) ? 0 : λsec}″ ${λdir}`
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
      // ϕ = latitude
      // λ = longitude
      const ϕabs = Math.abs(this.lat);
      const ϕdir = this.lat<0 ? 'S' : 'N';
      const ϕdeg = Math.trunc(ϕabs);
      const ϕmin = parseFloat(parseFloat(`${(ϕabs-ϕdeg)*60}`).toFixed(5));
      const λabs = Math.abs(this.lng);
      const λdir = this.lng<0 ? 'W' : 'E';
      const λdeg = Math.trunc(λabs);
      const λmin = parseFloat(parseFloat(`${(λabs-λdeg)*60}`).toFixed(5));
  
      const ddmCoordSet = {
        lat: `${ϕdeg}° ${(ϕmin<0) ? 0 : ϕmin}′ ${ϕdir}`,
        lng: `${λdeg}° ${(λmin<0) ? 0 : λmin}′ ${λdir}`
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
      return forward([this.lng, this.lat], 5);
    }
  };
  const PATTERNS = {
    ddLat:  /^[\+-]?(([1-8]?\d)(\.\d{1,})?|90)\D*[NSns]?$/,
    ddLng:  /^[\+-]?((1[0-7]\d|[1-9]?\d)(\.\d{1,})?|180)\D*[EWew]?$/,
    dmsLat: /^[\+-]?(([1-8]?\d)\D+([0-5]?\d|60)\D+([0-5]?\d|60)(\.\d+)?|90\D+0\D+0)\D+[NSns]?$/,
    dmsLng: /^[\+-]?([1-7]?\d{1,2}\D+([0-5]?\d|60)\D+([0-5]?\d|60)(\.\d+)?|180\D+0\D+0)\D+[EWew]?$/,
    ddmLat: /^[\+-]?(([1-8]?\d)\D+[1-6]?\d(\.\d{1,})?|90(\D+0)?)\D+[NSns]?$/,
    ddmLng: /^[\+-]?((1[0-7]\d|[1-9]?\d)\D+[1-6]?\d(\.\d{1,})?|180(\D+0)?)\D+[EWew]?$/,
    mgrs:   /^([1-5]?\d|60)\s?([^ABIOYZabioyz])\s?([A-Za-z]{2})\s?(\d{10}|\d{8}|\d{6}|\d{4}|\d{2}|\d{1,5}\s\d{1,5})$/,
    utm:    /^([1-6]\d|[1-9])([C-Xc-x])\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/
  };
  
   const CombinedExpressions = {
    lat: new RegExp(`^${[PATTERNS.ddLat, PATTERNS.dmsLat, PATTERNS.ddmLat].map(ptrn => ptrn.toString().replace(/^\/\^(.+?)\$\//g,'($1)')).join('|')}$`),
    lng: new RegExp(`^${[PATTERNS.ddLng, PATTERNS.dmsLng, PATTERNS.ddmLng].map(ptrn => ptrn.toString().replace(/^\/\^(.+?)\$\//g,'($1)')).join('|')}$`)
  }
  


const utm = {
    K0           : 0.9996,
    E            : 0.00669438,
    E2           : null,
    E3           : null,
    E_P2         : null,
    SQRT_E       : null,
    _E           : null,
    _E2          : null,
    _E3          : null,
    _E4          : null,
    _E5          : null,
    M1           : null,
    M2           : null,
    M3           : null,
    M4           : null,
    P2           : null,
    P3           : null,
    P4           : null,
    P5           : null,
    R            : 6378137,
    ZONE_LETTERS : 'CDEFGHJKLMNPQRSTUVWXX',
    initVars: () => {
      utm.E2     = Math.pow(utm.E, 2);
      utm.E3     = Math.pow(utm.E, 3);
      utm.E_P2   = utm.E / (1 - utm.E);
      utm.SQRT_E = Math.sqrt(1 - utm.E);
      utm._E     = (1 - utm.SQRT_E) / (1 + utm.SQRT_E);
      utm._E2    = Math.pow(utm._E, 2);
      utm._E3    = Math.pow(utm._E, 3);
      utm._E4    = Math.pow(utm._E, 4);
      utm._E5    = Math.pow(utm._E, 5);
      utm.M1     = 1 - utm.E  / 4 - 3 * utm.E2 / 64 -  5 * utm.E3 /  256;
      utm.M2     = 3 * utm.E  / 8 + 3 * utm.E2 / 32 + 45 * utm.E3 / 1024;
      utm.M3     = 15 * utm.E2 /  256 + 45 * utm.E3 / 1024;
      utm.M4     = 35 * utm.E3 / 3072;
      utm.P2     = 3 /   2 * utm._E  -  27 /  32 * utm._E3 + 269 / 512 * utm._E5;
      utm.P3     =   21 /  16 * utm._E2 -  55 /  32 * utm._E4;
      utm.P4     =  151 /  96 * utm._E3 - 417 / 128 * utm._E5;
      utm.P5     = 1097 / 512 * utm._E4;
    },
    // UTM to Latitude / Longitude
    toLatLon: (easting, northing, zoneNum, zoneLetter, northern, strict) => {
      strict = strict !== undefined ? strict : true;
  
      if (!zoneLetter && northern === undefined) {
        throw new Error('either zoneLetter or northern needs to be set');
      } else if (zoneLetter && northern !== undefined) {
        throw new Error('set either zoneLetter or northern, but not both');
      }
  
      if (strict) {
        if (easting < 100000 || 1000000 <= easting) {
          throw new RangeError('easting out of range (must be between 100 000 m and 999 999 m)');
        }
        if (northing < 0 || northing > 10000000) {
          throw new RangeError('northing out of range (must be between 0 m and 10 000 000 m)');
        }
      }
      if (zoneNum < 1 || zoneNum > 60) {
        throw new RangeError('zone number out of range (must be between 1 and 60)');
      }
      if (zoneLetter) {
        zoneLetter = zoneLetter.toUpperCase();
        if (zoneLetter.length !== 1 || utm.ZONE_LETTERS.indexOf(zoneLetter) === -1) {
          throw new RangeError('zone letter out of range (must be between C and X)');
        }
        northern = zoneLetter >= 'N';
      }
  
      const x = easting - 500000;
      const y = northing;
  
      if (!northern) y -= 1e7;
  
      const m = y / utm.K0;
      const mu = m / (utm.R * utm.M1);
  
      const pRad = mu +
                   utm.P2 * Math.sin(2 * mu) +
                   utm.P3 * Math.sin(4 * mu) +
                   utm.P4 * Math.sin(6 * mu) +
                   utm.P5 * Math.sin(8 * mu);
  
      const pSin  = Math.sin(pRad);
      const pSin2 = Math.pow(pSin, 2);
  
      const pCos = Math.cos(pRad);
  
      const pTan  = Math.tan(pRad);
      const pTan2 = Math.pow(pTan, 2);
      const pTan4 = Math.pow(pTan, 4);
  
      const epSin     = 1 - utm.E * pSin2;
      const epSinSqrt = Math.sqrt(epSin);
  
      const n = utm.R / epSinSqrt;
      const r = (1 - utm.E) / epSin;
  
      const c  = utm._E * pCos * pCos;
      const c2 = c * c;
  
      const d  = x / (n * utm.K0);
      const d2 = Math.pow(d, 2);
      const d3 = Math.pow(d, 3);
      const d4 = Math.pow(d, 4);
      const d5 = Math.pow(d, 5);
      const d6 = Math.pow(d, 6);
  
      const latitude = pRad - (pTan / r) *
                      (d2 / 2 -
                       d4 / 24 *
                       (5 + 3 * pTan2 + 10 * c - 4 * c2 - 9 * utm.E_P2)) +
                       d6 / 720 *
                       (61 + 90 * pTan2 + 298 * c + 45 * pTan4 - 252 * utm.E_P2 - 3 * c2);
      const longitude = (d -
                         d3 / 6 *
                         (1 + 2 * pTan2 + c) +
                         d5 / 120 *
                         (5 - 2 * c + 28 * pTan2 - 3 * c2 + 8 * utm.E_P2 + 24 * pTan4)) / pCos;
  
      return {
        latitude:  utm.toDegrees(latitude),
        longitude: utm.toDegrees(longitude) + utm.zoneNumberToCentralLongitude(zoneNum)
      };
    },
    // Latitude / Longitude to UTM
    fromLatLon: (latitude, longitude, forceZoneNum) => {
      if (latitude > 84 || latitude < -80) {
        throw new RangeError('latitude out of range (must be between 80 deg S and 84 deg N)');
      }
      if (longitude > 180 || longitude < -180) {
        throw new RangeError('longitude out of range (must be between 180 deg W and 180 deg E)');
      }
  
      const latRad = utm.toRadians(latitude);
      const latSin = Math.sin(latRad);
      const latCos = Math.cos(latRad);
  
      const latTan  = Math.tan(latRad);
      const latTan2 = Math.pow(latTan, 2);
      const latTan4 = Math.pow(latTan, 4);
  
      let zoneNum;
  
      if (forceZoneNum === undefined) {
        zoneNum = utm.latLonToZoneNumber(latitude, longitude);
      } else {
        zoneNum = forceZoneNum;
      }
  
      const zoneLetter = utm.latitudeToZoneLetter(latitude);
  
      const lonRad        = utm.toRadians(longitude);
      const centralLon    = utm.zoneNumberToCentralLongitude(zoneNum);
      const centralLonRad = utm.toRadians(centralLon);
  
      const n = utm.R / Math.sqrt(1 - utm.E * latSin * latSin);
      const c = utm.E_P2 * latCos * latCos;
  
      const a  = latCos * (lonRad - centralLonRad);
      const a2 = Math.pow(a, 2);
      const a3 = Math.pow(a, 3);
      const a4 = Math.pow(a, 4);
      const a5 = Math.pow(a, 5);
      const a6 = Math.pow(a, 6);
  
      const m = utm.R * (utm.M1 * latRad -
                     utm.M2 * Math.sin(2 * latRad) +
                     utm.M3 * Math.sin(4 * latRad) -
                     utm.M4 * Math.sin(6 * latRad));
      const easting = utm.K0 * n *
                      (a +
                       a3 / 6 * (1 - latTan2 + c) +
                       a5 / 120 * (5 - 18 * latTan2 + latTan4 + 72 * c - 58 * utm.E_P2)) + 500000;
      const northing = utm.K0 *
                       (m + n * latTan *
                       (a2 / 2 +
                        a4 / 24 * (5 - latTan2 + 9 * c + 4 * c * c) +
                        a6 / 720 * (61 - 58 * latTan2 + latTan4 + 600 * c - 330 * utm.E_P2)));
      if (latitude < 0) northing += 1e7;
  
      return {
        easting: easting,
        northing: northing,
        zoneNum: zoneNum,
        zoneLetter: zoneLetter,
        display: `${zoneNum}${zoneLetter} ${parseFloat(easting.toFixed(2))} ${parseFloat(northing.toFixed(2))}`
      };
    },
    // Latitude to Zone Letter
    latitudeToZoneLetter: latitude => {
      if (-80 <= latitude && latitude <= 84) {
        return utm.ZONE_LETTERS[Math.floor((latitude + 80) / 8)];
      } else {
        return null;
      }
    },
    // Latitude / Longitude to Zone Number
    latLonToZoneNumber: (latitude, longitude) => {
      if (56 <= latitude && latitude < 64 && 3 <= longitude && longitude < 12) return 32;
  
      if (72 <= latitude && latitude <= 84 && longitude >= 0) {
        if (longitude <  9) return 31;
        if (longitude < 21) return 33;
        if (longitude < 33) return 35;
        if (longitude < 42) return 37;
      }
  
      return Math.floor((longitude + 180) / 6) + 1;
    },
    // Zone Number ot Central Latitude
    zoneNumberToCentralLongitude: zoneNum => {
      return (zoneNum - 1) * 6 - 180 + 3;
    },
    // Radians to Degrees
    toDegrees: rad => {
      return rad / Math.PI * 180;
    },
    // Degrees to Radians
    toRadians: deg => {
      return deg * Math.PI / 180;
    }
  };
  utm.initVars();
  
  



/**
 * UTM zones are grouped, and assigned to one of a group of 6
 * sets.
 *
 * {int} @private
 */
var NUM_100K_SETS = 6;

/**
 * The column letters (for easting) of the lower left value, per
 * set.
 *
 * {string} @private
 */
var SET_ORIGIN_COLUMN_LETTERS = 'AJSAJS';

/**
 * The row letters (for northing) of the lower left value, per
 * set.
 *
 * {string} @private
 */
var SET_ORIGIN_ROW_LETTERS = 'AFAFAF';

var A = 65; // A
var I = 73; // I
var O = 79; // O
var V = 86; // V
var Z = 90; // Z
var mgrs = {
  forward: forward,
  inverse: inverse,
  toPoint: toPoint
};
/**
 * Conversion of lat/lon to MGRS.
 *
 * @param {object} ll Object literal with lat and lon properties on a
 *     WGS84 ellipsoid.
 * @param {int} accuracy Accuracy in digits (5 for 1 m, 4 for 10 m, 3 for
 *      100 m, 2 for 1000 m or 1 for 10000 m). Optional, default is 5.
 * @return {string} the MGRS string for the given location and accuracy.
 */
function forward(ll, accuracy) {
  accuracy = accuracy || 5; // default accuracy 1m
  return encode(LLtoUTM({
    lat: ll[1],
    lon: ll[0]
  }), accuracy);
}

/**
 * Conversion of MGRS to lat/lon.
 *
 * @param {string} mgrs MGRS string.
 * @return {array} An array with left (longitude), bottom (latitude), right
 *     (longitude) and top (latitude) values in WGS84, representing the
 *     bounding box for the provided MGRS reference.
 */
function inverse(mgrs) {
  var bbox = UTMtoLL(decode(mgrs.toUpperCase()));
  if (bbox.lat && bbox.lon) {
    return [bbox.lon, bbox.lat, bbox.lon, bbox.lat];
  }
  return [bbox.left, bbox.bottom, bbox.right, bbox.top];
}

function toPoint(mgrs) {
  var bbox = UTMtoLL(decode(mgrs.toUpperCase()));
  if (bbox.lat && bbox.lon) {
    return [bbox.lon, bbox.lat];
  }
  return [(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2];
}
/**
 * Conversion from degrees to radians.
 *
 * @private
 * @param {number} deg the angle in degrees.
 * @return {number} the angle in radians.
 */
function degToRad(deg) {
  return (deg * (Math.PI / 180.0));
}

/**
 * Conversion from radians to degrees.
 *
 * @private
 * @param {number} rad the angle in radians.
 * @return {number} the angle in degrees.
 */
function radToDeg(rad) {
  return (180.0 * (rad / Math.PI));
}

/**
 * Converts a set of Longitude and Latitude co-ordinates to UTM
 * using the WGS84 ellipsoid.
 *
 * @private
 * @param {object} ll Object literal with lat and lon properties
 *     representing the WGS84 coordinate to be converted.
 * @return {object} Object literal containing the UTM value with easting,
 *     northing, zoneNumber and zoneLetter properties, and an optional
 *     accuracy property in digits. Returns null if the conversion failed.
 */
function LLtoUTM(ll) {
  var Lat = ll.lat;
  var Long = ll.lon;
  var a = 6378137.0; //ellip.radius;
  var eccSquared = 0.00669438; //ellip.eccsq;
  var k0 = 0.9996;
  var LongOrigin;
  var eccPrimeSquared;
  var N, T, C, A, M;
  var LatRad = degToRad(Lat);
  var LongRad = degToRad(Long);
  var LongOriginRad;
  var ZoneNumber;
  // (int)
  ZoneNumber = Math.floor((Long + 180) / 6) + 1;

  //Make sure the longitude 180.00 is in Zone 60
  if (Long === 180) {
    ZoneNumber = 60;
  }

  // Special zone for Norway
  if (Lat >= 56.0 && Lat < 64.0 && Long >= 3.0 && Long < 12.0) {
    ZoneNumber = 32;
  }

  // Special zones for Svalbard
  if (Lat >= 72.0 && Lat < 84.0) {
    if (Long >= 0.0 && Long < 9.0) {
      ZoneNumber = 31;
    }
    else if (Long >= 9.0 && Long < 21.0) {
      ZoneNumber = 33;
    }
    else if (Long >= 21.0 && Long < 33.0) {
      ZoneNumber = 35;
    }
    else if (Long >= 33.0 && Long < 42.0) {
      ZoneNumber = 37;
    }
  }

  LongOrigin = (ZoneNumber - 1) * 6 - 180 + 3; //+3 puts origin
  // in middle of
  // zone
  LongOriginRad = degToRad(LongOrigin);

  eccPrimeSquared = (eccSquared) / (1 - eccSquared);

  N = a / Math.sqrt(1 - eccSquared * Math.sin(LatRad) * Math.sin(LatRad));
  T = Math.tan(LatRad) * Math.tan(LatRad);
  C = eccPrimeSquared * Math.cos(LatRad) * Math.cos(LatRad);
  A = Math.cos(LatRad) * (LongRad - LongOriginRad);

  M = a * ((1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256) * LatRad - (3 * eccSquared / 8 + 3 * eccSquared * eccSquared / 32 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(2 * LatRad) + (15 * eccSquared * eccSquared / 256 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(4 * LatRad) - (35 * eccSquared * eccSquared * eccSquared / 3072) * Math.sin(6 * LatRad));

  var UTMEasting = (k0 * N * (A + (1 - T + C) * A * A * A / 6.0 + (5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) * A * A * A * A * A / 120.0) + 500000.0);

  var UTMNorthing = (k0 * (M + N * Math.tan(LatRad) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24.0 + (61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSquared) * A * A * A * A * A * A / 720.0)));
  if (Lat < 0.0) {
    UTMNorthing += 10000000.0; //10000000 meter offset for
    // southern hemisphere
  }

  return {
    northing: Math.round(UTMNorthing),
    easting: Math.round(UTMEasting),
    zoneNumber: ZoneNumber,
    zoneLetter: getLetterDesignator(Lat)
  };
}

/**
 * Converts UTM coords to lat/long, using the WGS84 ellipsoid. This is a convenience
 * class where the Zone can be specified as a single string eg."60N" which
 * is then broken down into the ZoneNumber and ZoneLetter.
 *
 * @private
 * @param {object} utm An object literal with northing, easting, zoneNumber
 *     and zoneLetter properties. If an optional accuracy property is
 *     provided (in meters), a bounding box will be returned instead of
 *     latitude and longitude.
 * @return {object} An object literal containing either lat and lon values
 *     (if no accuracy was provided), or top, right, bottom and left values
 *     for the bounding box calculated according to the provided accuracy.
 *     Returns null if the conversion failed.
 */
function UTMtoLL(utm) {

  var UTMNorthing = utm.northing;
  var UTMEasting = utm.easting;
  var zoneLetter = utm.zoneLetter;
  var zoneNumber = utm.zoneNumber;
  // check the ZoneNummber is valid
  if (zoneNumber < 0 || zoneNumber > 60) {
    return null;
  }

  var k0 = 0.9996;
  var a = 6378137.0; //ellip.radius;
  var eccSquared = 0.00669438; //ellip.eccsq;
  var eccPrimeSquared;
  var e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  var N1, T1, C1, R1, D, M;
  var LongOrigin;
  var mu, phi1Rad;

  // remove 500,000 meter offset for longitude
  var x = UTMEasting - 500000.0;
  var y = UTMNorthing;

  // We must know somehow if we are in the Northern or Southern
  // hemisphere, this is the only time we use the letter So even
  // if the Zone letter isn't exactly correct it should indicate
  // the hemisphere correctly
  if (zoneLetter < 'N') {
    y -= 10000000.0; // remove 10,000,000 meter offset used
    // for southern hemisphere
  }

  // There are 60 zones with zone 1 being at West -180 to -174
  LongOrigin = (zoneNumber - 1) * 6 - 180 + 3; // +3 puts origin
  // in middle of
  // zone

  eccPrimeSquared = (eccSquared) / (1 - eccSquared);

  M = y / k0;
  mu = M / (a * (1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256));

  phi1Rad = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);
  // double phi1 = ProjMath.radToDeg(phi1Rad);

  N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  R1 = a * (1 - eccSquared) / Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  D = x / (N1 * k0);

  var lat = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) * D * D * D * D / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * eccPrimeSquared - 3 * C1 * C1) * D * D * D * D * D * D / 720);
  lat = radToDeg(lat);

  var lon = (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * eccPrimeSquared + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1Rad);
  lon = LongOrigin + radToDeg(lon);

  var result;
  if (utm.accuracy) {
    var topRight = UTMtoLL({
      northing: utm.northing + utm.accuracy,
      easting: utm.easting + utm.accuracy,
      zoneLetter: utm.zoneLetter,
      zoneNumber: utm.zoneNumber
    });
    result = {
      top: topRight.lat,
      right: topRight.lon,
      bottom: lat,
      left: lon
    };
  }
  else {
    result = {
      lat: lat,
      lon: lon
    };
  }
  return result;
}

/**
 * Calculates the MGRS letter designator for the given latitude.
 *
 * @private
 * @param {number} lat The latitude in WGS84 to get the letter designator
 *     for.
 * @return {char} The letter designator.
 */
function getLetterDesignator(lat) {
  //This is here as an error flag to show that the Latitude is
  //outside MGRS limits
  var LetterDesignator = 'Z';

  if ((84 >= lat) && (lat >= 72)) {
    LetterDesignator = 'X';
  }
  else if ((72 > lat) && (lat >= 64)) {
    LetterDesignator = 'W';
  }
  else if ((64 > lat) && (lat >= 56)) {
    LetterDesignator = 'V';
  }
  else if ((56 > lat) && (lat >= 48)) {
    LetterDesignator = 'U';
  }
  else if ((48 > lat) && (lat >= 40)) {
    LetterDesignator = 'T';
  }
  else if ((40 > lat) && (lat >= 32)) {
    LetterDesignator = 'S';
  }
  else if ((32 > lat) && (lat >= 24)) {
    LetterDesignator = 'R';
  }
  else if ((24 > lat) && (lat >= 16)) {
    LetterDesignator = 'Q';
  }
  else if ((16 > lat) && (lat >= 8)) {
    LetterDesignator = 'P';
  }
  else if ((8 > lat) && (lat >= 0)) {
    LetterDesignator = 'N';
  }
  else if ((0 > lat) && (lat >= -8)) {
    LetterDesignator = 'M';
  }
  else if ((-8 > lat) && (lat >= -16)) {
    LetterDesignator = 'L';
  }
  else if ((-16 > lat) && (lat >= -24)) {
    LetterDesignator = 'K';
  }
  else if ((-24 > lat) && (lat >= -32)) {
    LetterDesignator = 'J';
  }
  else if ((-32 > lat) && (lat >= -40)) {
    LetterDesignator = 'H';
  }
  else if ((-40 > lat) && (lat >= -48)) {
    LetterDesignator = 'G';
  }
  else if ((-48 > lat) && (lat >= -56)) {
    LetterDesignator = 'F';
  }
  else if ((-56 > lat) && (lat >= -64)) {
    LetterDesignator = 'E';
  }
  else if ((-64 > lat) && (lat >= -72)) {
    LetterDesignator = 'D';
  }
  else if ((-72 > lat) && (lat >= -80)) {
    LetterDesignator = 'C';
  }
  return LetterDesignator;
}

/**
 * Encodes a UTM location as MGRS string.
 *
 * @private
 * @param {object} utm An object literal with easting, northing,
 *     zoneLetter, zoneNumber
 * @param {number} accuracy Accuracy in digits (1-5).
 * @return {string} MGRS string for the given UTM location.
 */
function encode(utm, accuracy) {
  // prepend with leading zeroes
  var seasting = "00000" + utm.easting,
    snorthing = "00000" + utm.northing;

  return utm.zoneNumber + utm.zoneLetter + get100kID(utm.easting, utm.northing, utm.zoneNumber) + seasting.substr(seasting.length - 5, accuracy) + snorthing.substr(snorthing.length - 5, accuracy);
}

/**
 * Get the two letter 100k designator for a given UTM easting,
 * northing and zone number value.
 *
 * @private
 * @param {number} easting
 * @param {number} northing
 * @param {number} zoneNumber
 * @return the two letter 100k designator for the given UTM location.
 */
function get100kID(easting, northing, zoneNumber) {
  var setParm = get100kSetForZone(zoneNumber);
  var setColumn = Math.floor(easting / 100000);
  var setRow = Math.floor(northing / 100000) % 20;
  return getLetter100kID(setColumn, setRow, setParm);
}

/**
 * Given a UTM zone number, figure out the MGRS 100K set it is in.
 *
 * @private
 * @param {number} i An UTM zone number.
 * @return {number} the 100k set the UTM zone is in.
 */
function get100kSetForZone(i) {
  var setParm = i % NUM_100K_SETS;
  if (setParm === 0) {
    setParm = NUM_100K_SETS;
  }

  return setParm;
}

/**
 * Get the two-letter MGRS 100k designator given information
 * translated from the UTM northing, easting and zone number.
 *
 * @private
 * @param {number} column the column index as it relates to the MGRS
 *        100k set spreadsheet, created from the UTM easting.
 *        Values are 1-8.
 * @param {number} row the row index as it relates to the MGRS 100k set
 *        spreadsheet, created from the UTM northing value. Values
 *        are from 0-19.
 * @param {number} parm the set block, as it relates to the MGRS 100k set
 *        spreadsheet, created from the UTM zone. Values are from
 *        1-60.
 * @return two letter MGRS 100k code.
 */
function getLetter100kID(column, row, parm) {
  // colOrigin and rowOrigin are the letters at the origin of the set
  var index = parm - 1;
  var colOrigin = SET_ORIGIN_COLUMN_LETTERS.charCodeAt(index);
  var rowOrigin = SET_ORIGIN_ROW_LETTERS.charCodeAt(index);

  // colInt and rowInt are the letters to build to return
  var colInt = colOrigin + column - 1;
  var rowInt = rowOrigin + row;
  var rollover = false;

  if (colInt > Z) {
    colInt = colInt - Z + A - 1;
    rollover = true;
  }

  if (colInt === I || (colOrigin < I && colInt > I) || ((colInt > I || colOrigin < I) && rollover)) {
    colInt++;
  }

  if (colInt === O || (colOrigin < O && colInt > O) || ((colInt > O || colOrigin < O) && rollover)) {
    colInt++;

    if (colInt === I) {
      colInt++;
    }
  }

  if (colInt > Z) {
    colInt = colInt - Z + A - 1;
  }

  if (rowInt > V) {
    rowInt = rowInt - V + A - 1;
    rollover = true;
  }
  else {
    rollover = false;
  }

  if (((rowInt === I) || ((rowOrigin < I) && (rowInt > I))) || (((rowInt > I) || (rowOrigin < I)) && rollover)) {
    rowInt++;
  }

  if (((rowInt === O) || ((rowOrigin < O) && (rowInt > O))) || (((rowInt > O) || (rowOrigin < O)) && rollover)) {
    rowInt++;

    if (rowInt === I) {
      rowInt++;
    }
  }

  if (rowInt > V) {
    rowInt = rowInt - V + A - 1;
  }

  var twoLetter = String.fromCharCode(colInt) + String.fromCharCode(rowInt);
  return twoLetter;
}

/**
 * Decode the UTM parameters from a MGRS string.
 *
 * @private
 * @param {string} mgrsString an UPPERCASE coordinate string is expected.
 * @return {object} An object literal with easting, northing, zoneLetter,
 *     zoneNumber and accuracy (in meters) properties.
 */
function decode(mgrsString) {

  if (mgrsString && mgrsString.length === 0) {
    throw ("MGRSPoint coverting from nothing");
  }

  var length = mgrsString.length;

  var hunK = null;
  var sb = "";
  var testChar;
  var i = 0;

  // get Zone number
  while (!(/[A-Z]/).test(testChar = mgrsString.charAt(i))) {
    if (i >= 2) {
      throw ("MGRSPoint bad conversion from: " + mgrsString);
    }
    sb += testChar;
    i++;
  }

  var zoneNumber = parseInt(sb, 10);

  if (i === 0 || i + 3 > length) {
    // A good MGRS string has to be 4-5 digits long,
    // ##AAA/#AAA at least.
    throw ("MGRSPoint bad conversion from: " + mgrsString);
  }

  var zoneLetter = mgrsString.charAt(i++);

  // Should we check the zone letter here? Why not.
  if (zoneLetter <= 'A' || zoneLetter === 'B' || zoneLetter === 'Y' || zoneLetter >= 'Z' || zoneLetter === 'I' || zoneLetter === 'O') {
    throw ("MGRSPoint zone letter " + zoneLetter + " not handled: " + mgrsString);
  }

  hunK = mgrsString.substring(i, i += 2);

  var set = get100kSetForZone(zoneNumber);

  var east100k = getEastingFromChar(hunK.charAt(0), set);
  var north100k = getNorthingFromChar(hunK.charAt(1), set);

  // We have a bug where the northing may be 2000000 too low.
  // How
  // do we know when to roll over?

  while (north100k < getMinNorthing(zoneLetter)) {
    north100k += 2000000;
  }

  // calculate the char index for easting/northing separator
  var remainder = length - i;

  if (remainder % 2 !== 0) {
    throw ("MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters" + mgrsString);
  }

  var sep = remainder / 2;

  var sepEasting = 0.0;
  var sepNorthing = 0.0;
  var accuracyBonus, sepEastingString, sepNorthingString, easting, northing;
  if (sep > 0) {
    accuracyBonus = 100000.0 / Math.pow(10, sep);
    sepEastingString = mgrsString.substring(i, i + sep);
    sepEasting = parseFloat(sepEastingString) * accuracyBonus;
    sepNorthingString = mgrsString.substring(i + sep);
    sepNorthing = parseFloat(sepNorthingString) * accuracyBonus;
  }

  easting = sepEasting + east100k;
  northing = sepNorthing + north100k;

  return {
    easting: easting,
    northing: northing,
    zoneLetter: zoneLetter,
    zoneNumber: zoneNumber,
    accuracy: accuracyBonus
  };
}

/**
 * Given the first letter from a two-letter MGRS 100k zone, and given the
 * MGRS table set for the zone number, figure out the easting value that
 * should be added to the other, secondary easting value.
 *
 * @private
 * @param {char} e The first letter from a two-letter MGRS 100´k zone.
 * @param {number} set The MGRS table set for the zone number.
 * @return {number} The easting value for the given letter and set.
 */
function getEastingFromChar(e, set) {
  // colOrigin is the letter at the origin of the set for the
  // column
  var curCol = SET_ORIGIN_COLUMN_LETTERS.charCodeAt(set - 1);
  var eastingValue = 100000.0;
  var rewindMarker = false;

  while (curCol !== e.charCodeAt(0)) {
    curCol++;
    if (curCol === I) {
      curCol++;
    }
    if (curCol === O) {
      curCol++;
    }
    if (curCol > Z) {
      if (rewindMarker) {
        throw ("Bad character: " + e);
      }
      curCol = A;
      rewindMarker = true;
    }
    eastingValue += 100000.0;
  }

  return eastingValue;
}

/**
 * Given the second letter from a two-letter MGRS 100k zone, and given the
 * MGRS table set for the zone number, figure out the northing value that
 * should be added to the other, secondary northing value. You have to
 * remember that Northings are determined from the equator, and the vertical
 * cycle of letters mean a 2000000 additional northing meters. This happens
 * approx. every 18 degrees of latitude. This method does *NOT* count any
 * additional northings. You have to figure out how many 2000000 meters need
 * to be added for the zone letter of the MGRS coordinate.
 *
 * @private
 * @param {char} n Second letter of the MGRS 100k zone
 * @param {number} set The MGRS table set number, which is dependent on the
 *     UTM zone number.
 * @return {number} The northing value for the given letter and set.
 */
function getNorthingFromChar(n, set) {

  if (n > 'V') {
    throw ("MGRSPoint given invalid Northing " + n);
  }

  // rowOrigin is the letter at the origin of the set for the
  // column
  var curRow = SET_ORIGIN_ROW_LETTERS.charCodeAt(set - 1);
  var northingValue = 0.0;
  var rewindMarker = false;

  while (curRow !== n.charCodeAt(0)) {
    curRow++;
    if (curRow === I) {
      curRow++;
    }
    if (curRow === O) {
      curRow++;
    }
    // fixing a bug making whole application hang in this loop
    // when 'n' is a wrong character
    if (curRow > V) {
      if (rewindMarker) { // making sure that this loop ends
        throw ("Bad character: " + n);
      }
      curRow = A;
      rewindMarker = true;
    }
    northingValue += 100000.0;
  }

  return northingValue;
}

/**
 * The function getMinNorthing returns the minimum northing value of a MGRS
 * zone.
 *
 * Ported from Geotrans' c Lattitude_Band_Value structure table.
 *
 * @private
 * @param {char} zoneLetter The MGRS zone to get the min northing for.
 * @return {number}
 */
function getMinNorthing(zoneLetter) {
  var northing;
  switch (zoneLetter) {
  case 'C':
    northing = 1100000.0;
    break;
  case 'D':
    northing = 2000000.0;
    break;
  case 'E':
    northing = 2800000.0;
    break;
  case 'F':
    northing = 3700000.0;
    break;
  case 'G':
    northing = 4600000.0;
    break;
  case 'H':
    northing = 5500000.0;
    break;
  case 'J':
    northing = 6400000.0;
    break;
  case 'K':
    northing = 7300000.0;
    break;
  case 'L':
    northing = 8200000.0;
    break;
  case 'M':
    northing = 9100000.0;
    break;
  case 'N':
    northing = 0.0;
    break;
  case 'P':
    northing = 800000.0;
    break;
  case 'Q':
    northing = 1700000.0;
    break;
  case 'R':
    northing = 2600000.0;
    break;
  case 'S':
    northing = 3500000.0;
    break;
  case 'T':
    northing = 4400000.0;
    break;
  case 'U':
    northing = 5300000.0;
    break;
  case 'V':
    northing = 6200000.0;
    break;
  case 'W':
    northing = 7000000.0;
    break;
  case 'X':
    northing = 7900000.0;
    break;
  default:
    northing = -1.0;
  }
  if (northing >= 0.0) {
    return northing;
  }
  else {
    throw ("Invalid zone letter: " + zoneLetter);
  }

}


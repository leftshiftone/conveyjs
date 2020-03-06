/**
 * Function returns the user's navigator media device and enables it
 * if available.
 *
 * @returns Promise<MediaStream>
 */

export function getUserVideoMedia() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia({video: true})
    } else {
        return null;
    }
}

/**
 * Tries to determine the user's location by using navigator geolocation.
 *
 * @returns google.maps.LatLng if successful otherwise logs an error.
 */
export function getGeoLocation() {
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    } else {
        Error("GeoLocation of browser is not available!");
    }
}

function geoSuccess(position: { coords: { latitude: number; longitude: number; }; } ) {
    return new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
}

function geoError( err: { code: number; } ) {
    switch (err.code) {
        case 1:
            Error( "The user denied the request for location information." );
            break;
        case 2:
            Error( "Your location information is unavailable." );
            break;
        case 3:
            Error( "The request to get your location timed out." );
            break;
        default:
            Error( "An unknown error occurred while requesting your location." );
    }
}

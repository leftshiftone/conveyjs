
export function getUserVideoMedia() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia({video: true})
    } else {
        return null;
    }
}

/**
 * Returns the latitude and longitude determined by the used Browser if available.
 */
export function getGeoLocation() {
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(function (position) {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            return pos;
        }, function (err) {
            Error("Error during geo location determination: " + err.message );
        });
    } else {
        Error("Browser geo location feature not available");
    }
}



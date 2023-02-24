/**
 * method to select points such that points will be at least 150 meters apart
 * @param {*} possible_points: lat, lon pairs of points
 * @param {*} center: lat, lon of start point
 * @param {*} n: number of points to select
 * @returns 
 */
function select_points(possible_points, center, n) {
    var points = {}

    const MIN_DISTANCE_POINTS = 0.25
    const MIN_DISTANCE_CENTER = 0.15

    // shuffle points
    possible_points = shuffle(possible_points)

    let cords = []
    possible_points.forEach(element => {
        if (coordinate_distance(element, center) > MIN_DISTANCE_CENTER) {
            let add = true
            cords.forEach(other_point => {
                if (coordinate_distance(element, other_point) < MIN_DISTANCE_POINTS) {
                    add = false
                    return
                }
            })
            if (add) {
                cords.push(element)

                if (cords.length == n) {
                    return
                }
            }
        }
    });

    points.cords = cords

    // call power up assignment function

    // call point function

    return points
}

/**
 * Method to shuffle an array.
 * Based on the Fisher-Yates Shuffle
 * yoinked from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param {*} array: Input to be shuffled
 * @returns: shuffled array
 */
function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}
/**
 * Calculates the distance of two coordinates in km
 * @param {*} coord1 
 * @param {*} coord2 
 * @returns distance in km
 */
function coordinate_distance(coord1, coord2) {

    var lat1 = coord1[0];
    var lon1 = coord1[1];
    var lat2 = coord2[0];
    var lon2 = coord2[1];

    var earthRadiusKm = 6371;

    var dLat = degreesToRadians(lat2 - lat1);
    var dLon = degreesToRadians(lon2 - lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

module.exports = {
    select_points
}
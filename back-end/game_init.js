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

    // initially filled with fixed points
    let cords = [
        [50.8098855, 8.7676658134],
        [50.810114, 8.763962],
        [50.81488, 8.76937],
        [50.818978, 8.774321],
        [50.808599, 8.775464],
        [50.79495, 8.763088],
        [50.802945, 8.763742],
        [50.812704, 8.772497],
        [50.808952, 8.770518],
        [50.7979, 8.753464],
        [50.803728, 8.772433],
        [50.802121, 8.785388],
        [50.814975, 8.788553]
    ]
    possible_points.every(element => {
        if (coordinate_distance(element, center) > MIN_DISTANCE_CENTER) {
            let add = true
            cords.every(other_point => {
                if (coordinate_distance(element, other_point) < MIN_DISTANCE_POINTS) {
                    add = false
                    return false
                }
                return true
            })
            if (add) {
                cords.push(element)

                if (cords.length == n) {
                    return false
                }
            }
        }
        return true
    });

    points.cords = cords

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

function assign_scores(game_state) {
    let scores = []

    game_state.points.cords.forEach(element => {
        // something with distances
        scores.push(Math.floor(Math.random() * 1000) + 100)
    })

    return scores
}

function assign_power_ups(game_state) {
    let power_ups = []

    game_state.points.cords.forEach(element => {
        let ups = []

        // power up 1
        if (Math.random() < 0.6) {
            ups.push(1)
        }

        // power up 2
        if (Math.random() < 0.1) {
            ups.push(2)
        }

        // power up 3
        if (Math.random() < 0.4) {
            ups.push(3)
        }

        // power up 4
        if (Math.random() < 0.05) {
            ups.push(4)
        }

        power_ups.push(ups)
    })

    return power_ups
}

module.exports = {
    select_points,
    assign_scores,
    assign_power_ups
}
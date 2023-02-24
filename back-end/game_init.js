/**
 * method to select points such that points will be at least 150 meters apart
 * @param {*} possible_points: lat, lon pairs of points
 * @param {*} n: number of points to select
 * @returns 
 */
function select_points(possible_points, n) {
    var points = {}

    // filler
    let cords = shuffle(possible_points).slice(0, n)

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

module.exports = {
    select_points
}
var socket = io({ transports: ['websocket', 'polling'] });


// init map
var map = L.map('map').setView([50.80843714789987, 8.772417038548456], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// init marker icons
// https://leafletjs.com/examples/custom-icons/
var green = L.icon({
    iconUrl: 'front-end/assets/green.png',

    iconSize: [32, 32], // size of the icon
    iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -16] // point from which the popup should open relative to the iconAnchor
});

var gray = L.icon({
    iconUrl: 'front-end/assets/gray.png',

    iconSize: [32, 32], // size of the icon
    iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -16] // point from which the popup should open relative to the iconAnchor
});

var red = L.icon({
    iconUrl: 'front-end/assets/red.png',

    iconSize: [32, 32], // size of the icon
    iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -16] // point from which the popup should open relative to the iconAnchor
});

var blue = L.icon({
    iconUrl: 'front-end/assets/blue.png',

    iconSize: [32, 32], // size of the icon
    iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -16] // point from which the popup should open relative to the iconAnchor
});

var markers = L.layerGroup();

// request current game state from server and apply to map
socket.emit('get_game_state')

socket.on('receive_game_state', (game_state) => {
    markers.clearLayers();

    console.log(game_state)

    for (let i = 0; i < game_state.num_points; i++) {
        // point structure:
        //  cords: lat, log
        //  claimed: Team name or None
        //  points: integer number of points the point awards
        //  power_ups: name of power-up or none
        let marker = L.marker([game_state.points.cords[i][0], game_state.points.cords[i][1]], { icon: get_icon(game_state.points.claimed[i]) })

        // attach claim pop-up if not yet claimed
        if (game_state.points.claimed[i] == 0) {
            marker.bindPopup(`<b>Points:</b>${game_state.points.scores[i]}<br>
                <b>Power-Ups:</b>${game_state.points.power_ups[i]}<br>
                <button onclick="claim_point(${i}, 1)">Claim Red</button><button onclick="claim_point(${i}, 2)">Claim Blue</button><button onclick="claim_point(${i}, 3)">Claim Green</button>`)
        }

        markers.addLayer(marker)
    };

    map.addLayer(markers)
})

function get_icon(team) {
    if (team == 0) {
        return gray
    }
    if (team == 1) {
        return red
    }
    if (team == 2) {
        return blue
    }
    if (team == 3) {
        return green
    }

}

function claim_point(point_id, team) {
    console.log(`Claim ${point_id} for team ${team}`)
    socket.emit('claim_point', [point_id, team])
}
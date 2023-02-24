var socket = io({transports: ['websocket', 'polling']});


// init map
var map = L.map('map').setView([50.80843714789987, 8.772417038548456], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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
        //  power_up: name of power-up or none
        markers.addLayer(L.marker([game_state.points.cords[i][0], game_state.points.cords[i][1]]))
    };

    map.addLayer(markers)
})
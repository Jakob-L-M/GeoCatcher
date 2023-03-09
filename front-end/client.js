var socket = io({ transports: ['websocket', 'polling'] });

const user_id = window.location.search.slice(4)

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

// dict to save information about users locally
var users = {}

// request current game state from server and apply to map
// using auth token
socket.emit('auth', user_id)

// event emmited on a fresh reload
socket.on('receive_game_state', (game_state) => {
    markers.clearLayers();

    console.log(game_state)

    // build markers
    update_markers(game_state.num_points, game_state.points)

    // build header
    update_header(game_state.header)
    update_time(game_state.header.time_left)

    getLocation()

})

socket.on('user_info', (d) => {
    users = {...d}
    console.log(users)
    for (u in users) {
        users[u]['marker'] = L.marker([0,0]).addTo(map)
    }
})

socket.on('receive_header', (header) => {
    update_header(header)
});

socket.on('receive_markers', (d) => {
    let num_points = d[0]
    let points = d[1]

    update_markers(num_points, points)
});

socket.on('user_positions', (d) => {
    for (u in d) {
        users[u]['marker'].setLatLng(new L.LatLng(d[u][0], d[u][1]))
    }
})

function update_markers(num_points, points) {
    for (let i = 0; i < num_points; i++) {
        // point structure:
        //  cords: lat, log
        //  claimed: Team name or None
        //  points: integer number of points the point awards
        //  power_ups: name of power-up or none
        let marker = L.marker([points.cords[i][0], points.cords[i][1]], { icon: get_icon(points.claimed[i]) })

        // attach claim pop-up if not yet claimed
        if (points.claimed[i] == 0) {
            marker.bindPopup(`<b>Points:</b>${points.scores[i]}<br>
                <b>Power-Ups:</b>${points.power_ups[i]}<br>
                <button onclick="claim_point(${i}, 1)">Claim Red</button><button onclick="claim_point(${i}, 2)">Claim Blue</button><button onclick="claim_point(${i}, 3)">Claim Green</button>`)
        }

        markers.addLayer(marker)
    };

    map.addLayer(markers)
}

function update_header(header) {
    document.getElementById('player_num').textContent = header.players
    document.getElementById('left_num').textContent = header.unclaimed
    document.getElementById('claimed_num').textContent = header.claimed
}

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

const delay = ms => new Promise(_ => setTimeout(_, ms));
async function update_time(time) {
    if (time == 0) {
        //game ended
    } else {
        time -= 1
        var hours = Math.floor(time / 3600);
        var minutes = Math.floor((time - (hours * 3600)) / 60);
        var seconds = time - (hours * 3600) - (minutes * 60);

        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }

        document.getElementById('time_num').textContent = '' + hours + ':' + minutes + ':' + seconds;
        await delay(1000)
        update_time(time)
    }
}

function getLocation() {
    console.log('getting position')
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition)
        navigator.geolocation.watchPosition(showPosition);
    } else {
        console.log('ASDASD')
        socket.emit('update_location', "Geolocation is not supported by this browser.");
    }
}
function showPosition(position) {
    console.log('sending position', position)
    socket.emit('update_location', [position.coords.latitude, position.coords.longitude, position.coords.accuracy]);
}
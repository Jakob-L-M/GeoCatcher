const http = require('http');
const express = require('express');
const cors = require('cors');
var fs = require('fs');
var game_init = require('./back-end/game_init.js');

const app = express();

//app.use(express.static(`${__dirname}`));
app.use(cors());

var game_state = {};

// constant parameters
const CITY = 'Marburg';
const NUMBER_OF_POINTS = 60 // number of positions to pick
var claimed_points = 0
var GAME_TIME = 18000 //total game time in seconds

var USERS = JSON.parse(fs.readFileSync('./data/users.json', 'ascii'))
var TEAMS = JSON.parse(fs.readFileSync('./data/teams.json', 'ascii'))

for (t in TEAMS) {
    for (ind in TEAMS[t]['users']) {
        USERS[TEAMS[t]['users'][ind]]['team'] = t
    }
}

let c = 0
var compressed_ids = {}

for (u in USERS) {
    USERS[u]['location'] = [0.0, 0.0] // last known lat, lon position
    USERS[u]['path'] = [] // list of timestamp, location tuples representing their path
    compressed_ids[u] = c++
}

console.log(USERS)
console.log(compressed_ids)


app.get('/', (req, res) => {
    if (req.url.length > 5) {
        var id = ""
        try {
            id = `${req.url.slice(start = 5)}`
        } catch {
            console.log('Invalid user connection')
            res.sendFile(`${__dirname}/front-end/denied.html`)
        } finally {
            if (USERS[id] != undefined) {
                res.sendFile(`${__dirname}/front-end/index.html`)
            } else {
                console.log('Invalid user connection')
                res.sendFile(`${__dirname}/front-end/denied.html`)
            }
        }
    }
})

app.get('/front-end/*', (req, res) => {
    res.sendFile(`${__dirname}${req.url}`)
})

// fix data request
app.get('/data/*', (req, res) => {
    res.sendFile(`${__dirname}/front-end/denied.html`)
})

const server = http.createServer(app).listen(5050, function () {
    console.log("[INIT] Server listening on port 5050");

    // read-in city file
    var locations
    fs.readFile(`./data/${CITY}.json`, 'utf8', function (err, data) {
        if (err) throw err;
        data = JSON.parse(data);
        locations = data.points

        console.log('[INIT] Preparing game state')

        game_state.num_points = NUMBER_OF_POINTS

        // Select points
        game_state.points = game_init.select_points(locations, data.center, NUMBER_OF_POINTS)

        // Assign scores and power-ups
        game_state.points.scores = game_init.assign_scores(game_state)
        game_state.points.power_ups = game_init.assign_power_ups(game_state)


        // set all points as unclaimed
        game_state.points.claimed = Array(NUMBER_OF_POINTS).fill(0)

        // init stats for the header bar
        game_state.header = { 'time_left': GAME_TIME, 'claimed': 0, 'unclaimed': NUMBER_OF_POINTS.valueOf(), 'players': 0 }

        // decrease time continuously
        decrease_time_left()
        console.log(`[INIT] Game started at ${new Date().toTimeString()}`);

    });
});

const io = require('socket.io')(server)

io.sockets.on('connection', (socket) => {

    // check auth
    socket.on('auth', (auth) => {
        if (USERS[auth] === undefined) {
            return
        } else {
            console.log(`[INFO] ${USERS[auth]} connected`)
            var socket_id = auth
            socket.emit('receive_game_state', game_state)
            socket.emit('user_info', send_user_info())

            // check team membership
            game_state.header.players += 1
            io.emit('receive_header', game_state.header)


            // send info about user locations
            io.emit('user_positions', send_user_positions(false, [USERS[auth]['team']]))

            socket.on('disconnect', () => {

                console.log(`[INFO] ${USERS[auth]} disconnected`)
                game_state.header.players -= 1
                io.emit('receive_header', game_state.header)

            });

            socket.on('claim_point', (d) => {
                let point_id = d[0]
                let team = d[1]

                console.log(`[INFO] ${USERS[socket_id]} claimed point ${point_id}`)
                game_state.points.claimed[point_id] = team

                game_state.header.claimed += 1
                game_state.header.unclaimed -= 1
                //Todo:
                // update team points and power-ups

                // send an update to all players
                io.emit('receive_header', game_state.header)
                io.emit('receive_markers', [game_state.num_points, game_state.points])



            })

            socket.on('update_location', (d) => {
                // let lat = d['coords']['latitude']
                // let lon = d.coords.longitude
                // let acc = d.coords.accuracy
                let timestamp = Math.floor(Date.now() / 1000)

                let acc = d[2]
                let lon = d[0]
                let lat = d[1]

                if (acc > 40) return

                USERS[auth]['location'] = [lon, lat]

                let path = USERS[auth]['path']
                if (path.length == 0) {
                    path.push([timestamp, lon, lat])
                } else if (timestamp - path[path.length - 1][0] > 20) {
                    // last update is at least 20 seconds old
                    // only add if the location changed
                    // I assume a change will always be seen in lon AND lat
                    if (path[path.length - 1][0] != lon) {
                        path.push([timestamp, lon, lat])
                    } else {
                        return
                    }
                } else {
                    return
                }
                console.log(`[INFO] new location for ${USERS[auth].name}: ${lon, lat} ${timestamp}`)
                io.emit('user_positions', send_user_positions([USERS[auth]['team']]))
            })
        }

    })

})

server.on('error', (err) => {
    console.error(err);
})


// async await witch craft
const delay = ms => new Promise(_ => setTimeout(_, ms));

async function decrease_time_left() {
    if (game_state.header.time_left == 0) {
        // stop game
    } else {
        game_state.header.time_left -= 1
        await delay(1000)
        decrease_time_left();
    }
}

function send_user_positions(all = false, teams=[]) {
    result = {}

    // if all users are requested.
    // usually an admin only event
    if (all) {
        for (u in USERS) {
            result[compressed_ids[u]] = USERS[u]['location']
        }
        return result
    }

    // return all teams requested.
    // is either only your own team or all teams (power-up)
    teams.forEach(team => {
        TEAMS[team]['users'].forEach(u =>  {
            result[compressed_ids[u]] = USERS[u]['location']
        })
    })

    return result
}

function send_user_info() {
    result = {}
    for (team in TEAMS) {
        TEAMS[team]['users'].forEach(u => {
            result[compressed_ids[u]] = {'name': USERS[u]['name'], 'team': USERS[u]['team']}
        })
    }
    return result
}
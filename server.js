const http = require('http');
const express = require('express');
const cors = require('cors');
var fs = require('fs');
var game_init = require('./back-end/game_init.js')

const app = express();

var game_state = {};

// constant parameters
const CITY = 'Marburg';
const NUMBER_OF_TEAMS = 2;
const NUMBER_OF_POINTS = 100;

app.use(express.static(`${__dirname}`));
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/front-end/index.html`)
})

app.get('/front-end/*', (req, res) => {
    res.sendFile(`${__dirname}${req.url}`)
})

const server = http.createServer(app).listen(5050, function() {
    console.log("Express server listening on port 5050");
    
    // read-in city file
    var locations
    fs.readFile(`./data/${CITY}.json`, 'utf8', function(err, data) {
        if (err) throw err;
        data = JSON.parse(data);
        locations = data.points
    
        console.log('Preparing game state')

        game_state.num_points = NUMBER_OF_POINTS
        
        // Select points
        game_state.points = game_init.select_points(locations, data.center, NUMBER_OF_POINTS)

        // Assign scores and power-ups
    
        // init teams
    
        console.log('Ready');
    
    });
});

const io = require('socket.io')(server)

io.sockets.on('connection', (socket) => {

    console.log(`new connection`)

    socket.on('disconnect', () => {
        
        console.log(`disconnected`)

    });

    socket.on('get_game_state', () => {
        console.log('game state request')
        socket.emit('receive_game_state', game_state)
    })
})

server.on('error', (err) => {
    console.error(err);
})
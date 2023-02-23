const http = require('http');
const express = require('express');
const cors = require('cors');
var fs = require('fs');

const app = express();

//json of locations
var locations;
const city = 'Marburg'

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
    fs.readFile(`./data/${city}.json`, 'utf8', function(err, data) {
        if (err) throw err;
        locations = JSON.parse(data);
    });
    console.log('Ready');
});
const io = require('socket.io')(server)

io.sockets.on('connection', (socket) => {

    console.log(`new connection`)

    socket.on('disconnect', () => {
        
        console.log(`disconnected`)

    });
})

server.on('error', (err) => {
    console.error(err);
})
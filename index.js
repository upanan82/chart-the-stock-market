'use strict';

var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    request = require('request'),
    bodyParser = require('body-parser'),
    stocks = ['AAPL,Apple Inc', 'MSFT,Microsoft Corp'];

app.use(express.static(__dirname + '/app'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.render('index');
});

// Search stock
app.post('/search', function(req, res) {
    for (var i = 0; i < stocks.length; i++) {
        var arg = stocks[i].split(',')[1];
        if (stocks[i].split(',')[0] == req.body.val.toUpperCase() || arg.toLowerCase() == req.body.val.toLowerCase()) {
            res.end('');
            return false;
        }
    }
    var url = 'http://dev.markitondemand.com/api/v2/Lookup/json?input=' + req.body.val;
    request.get({
        url: url,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    }, function (e, r, b) {
        if (b.length && b) {
            for (var i = 0; i < b.length; i++)
                if (b[i].Symbol == req.body.val.toUpperCase() || b[i].Name.toLowerCase() == req.body.val.toLowerCase()) {
                    res.end(b[i].Symbol + ',' + b[i].Name);
                    return false;
                }
            res.end('error');
        }
        else res.end('error');
    });
});

// Data stock
app.get('/Data', function(req, res) {
    var obj = {  
        Normalized: false,
        NumberOfDays: 3650,
        DataPeriod: "Day",
        Elements: [{Symbol: req.query.symbol, Type: "price", Params: ["ohlc"]}]
    };
    var url = 'http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=' + JSON.stringify(obj);
    request.get({
        url: url,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    }, function (e, r, b) {
        res.json(b);
    }); 
});

io.on('connection', function(socket) {
    socket.send(JSON.stringify({type: 'history', data: stocks}));
    socket.on('chat message', function(msg) {
        stocks.push(msg);
        socket.emit('chat message', msg);
    });
    socket.on('remove message', function(msg) {
        for (var j = 0; j < stocks.length; j++)
      	    if(stocks[j].split(',')[0] === msg) {
      		    stocks.splice(j, 1);
      		    break;
      	    }
        socket.emit('remove message', msg);
    });
});

// Listen port
server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});
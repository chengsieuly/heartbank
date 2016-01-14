var express 	= require('express'),
	mongoose 	= require('mongoose'),
	bodyParser 	= require('body-parser'),
	cookieParser= require('cookie-parser'),
	url			= require('url'),
	config 		= require('./config');
	
var app 	= express();
app.locals.moment = require('moment');	
app.locals.momentT = require('moment-timezone');
var http	= require('http').Server(app);
var io		= require('socket.io')(http);

mongoose.connect(config.database);

// Routes
var api = require('./api')(app, express);


// Middleware
app.set('views', __dirname + '/public');
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

app.use('/', api);
		
// socket.io chat
var users = [];
io.on('connection', function(socket) {
	socket.on('username', function(name) {
		users.push(name.username);
		io.emit('user log', users);
		io.emit('new user', name.username);
		socket.on('disconnect', function() {
			var pos = users.indexOf(name.username);
			if(pos >= 0) {
				users.splice(pos, 1);
			};
			io.emit('user disconnected', name.username);
			io.emit('user log', users);
		});	
		socket.on('chat message', function(e) {
			var message = {
				msg: e.message,
				user: name.username
			}
			io.emit('chat message', message);
		});
	});
});

// connect to server
http.listen(config.port);






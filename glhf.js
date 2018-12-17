var express = require('express');
var app = express();

var http = require("http");
var fs = require("fs");
var mysql = require("mysql");
var credentials = require("./credentials");
var qs = require("querystring");
var session = require('express-session');

//handlebars view engine
var handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3001);

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
	resave: false,
	saveUninitialized: false,
	secret: credentials.cookieSecret
}));

app.use (function(req, res, next) {
	res.locals.user = req.session.user; 
	next();
});

function users(req, res) {
	var conn = mysql.createConnection(credentials.connection);
	// connect to database
	conn.connect(function (err) {
		if (err) {
			console.error("ERROR: cannot connect: " + e);
			return;
		}
		// query the database
		conn.query("SELECT * FROM USERS", function (err, rows, fields) {
			// build json result object
			var outjson = {};
			if (err) {
				// query failed
				outjson.success = false;
				outjson.message = "Query failed: " + err;
			}
			else {
				// query successful
				outjson.success = true;
				outjson.message = "Query successful!";
				outjson.data = rows;
			}
			// return json object that contains the result of the query
			conn.end();
			sendResponse(req, res, outjson);
		});
	});
}

function addUser(req, res) {
	var body = "";
	req.on("data", function (data) {
		body += data;
		// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
		if (body.length > 1e6) {
			// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
			req.connection.destroy();
		}
	})
	req.on("end", function () {
		var injson = JSON.parse(body);
		var conn = mysql.createConnection(credentials.connection);
		// connect to database
		conn.connect(function (err) {
			if (err) {
				console.error("ERROR: cannot connect: " + e);
				return;
			}
			// query the database
			conn.query("INSERT INTO USERS (NAME) VALUE (?)", [injson.name], function (err, rows, fields) {
				// build json result object
				var outjson = {};
				if (err) {
					// query failed
					outjson.success = false;
					outjson.message = "Query failed: " + err;
				}
				else {
					// query successful
					outjson.success = true;
					outjson.message = "Query successful!";
				}
				// return json object that contains the result of the query
				sendResponse(req, res, outjson);
			});
			conn.end();
		});
	});
}

function verifyUser(attemptCreds, cb) {
	// Connect to the database.
	var conn = mysql.createConnection(credentials.connection);
	conn.connect(function (err) {
		if (err) {
			console.error("Error reaching MySQL: ", credentials.connection);
			return false;
		}
		conn.query("SELECT loginId, password FROM esports.USERS where loginId = (?)", attemptCreds.username, function (err, rows, fields) {
			if (rows.length === 1) {
				// user matched in SQL query, 1 result returned.
				// Return true if the password matches.
				console.log(rows[0].password === attemptCreds.password);
				if (rows[0].password === attemptCreds.password) {
					// Login success, passwords match.
					cb(true);
				} else {
					// Login failed, passwords do not match.
					cb(false);
				}
			} else {
				cb(false);
			}
		});
	});
}

function loadComments(image) {
	var conn = mysql.createConnection(credentials.connection);
	conn.connect(function (err) {
		if (err) {
			console.error("Error reaching MySQL: ", credentials.connection);
			return false;
		}
		conn.query("SELECT USERS.userId, USERS.firstName, USERS.lastName, COMMENTS.linkedImage, COMMENTS.userId FROM USERS JOIN COMMENTS ON USERS.userId = COMMENTS.userId WHERE COMMENTS.linkedImage = ?", image, function (err, rows, fields) {
			returnComments = {};
			for (var i = 0; i < rows.length; i++) {
				returnComments = rows[i];
			}
			return returnComments;
		});
	});
}


app.get('/', function (req, res) {
	res.render('home',
		{
			page: "home",
			title: "GLHF",
		}
	);
});

app.get('/about', function (req, res) {
	res.render('about',
		{
			page: "about",
			title: "About",
			isAbout:  true,
		}
	);
});

app.get('/gallery', function (req, res) {
	res.render('gallery',
		{
			page: "gallery",
			title: "Media Gallery",
			isGallery:  true,
		}
	);
});

app.get('/events', function (req, res) {
	res.render('events',
		{
			page: "events",
			title: "Events",
			isEvents: true,
		}
	);
			
});

app.get("/games", function (req, res) {
	res.render("games", {
		isGames:  true,
	}
	);
});

app.get("/mariokart", function (req, res){
	res.render("mariokart", {
		isMariokart:  true
	}
	);
});

app.get('/send_data', function (req, res) {
fs.readFile(__dirname + '/public/glhf.json', 'utf8', (err, fileContents) => {
	if (err) {
		console.error(err)
		return
	}
	try {
		data = JSON.parse(fileContents)
	} catch (err) {
		console.error(err)
	}
		res.send(data);
	});
});

// Static pages - Anything we need delivered literally.

app.use(express.static(__dirname + '/public'));

var loginCounter = 0;

app.post('/process', function (req, res) {
	if (req.xhr || req.accepts('json,html') === 'json') {
		res.send({ success: true });
		loginCounter += 1;
		req.session.user = {
			username: req.body.username,
			password: req.body.password, 
		};
		console.log("test");
		verifyUser(req.session.user, function(result) {
			if (result) {
				console.log("Successful login!");
			} else {
				console.log("Unsuccessful login attempt!");
			}
		});
	}
});

//404 page
app.use(function (req, res) {
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

//500 page
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});

app.listen(app.get('port'), function () {
	console.log('Express started on http://localhost: ' +
		app.get('port') + '; press Ctrl-C to terminate.');
});

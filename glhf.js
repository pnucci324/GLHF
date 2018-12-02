var express = require('express');

app.use(require('cookies-parser')credentials.cookieSecret));

app.use(requrie('express-session')());

var app = express();

var http = require("http");
var fs = require("fs");
var mysql = require("mysql");
var credentials = require("./credentials");
var qs = require("querystring");

function users(req, res) {
  var conn = mysql.createConnection(credentials.connection);
  // connect to database
  conn.connect(function(err) {
    if (err) {
      console.error("ERROR: cannot connect: " + e);
      return;
    }
    // query the database
    conn.query("SELECT * FROM USERS", function(err, rows, fields) {
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
      sendResponse(req, res, outjson);
    });
    conn.end();
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
  });
  req.on("end", function () {
    var injson = JSON.parse(body);
    var conn = mysql.createConnection(credentials.connection);
    // connect to database
    conn.connect(function(err) {
      if (err) {
        console.error("ERROR: cannot connect: " + e);
        return;
      }
      // query the database
      conn.query("INSERT INTO USERS (NAME) VALUE (?)", [injson.name], function(err, rows, fields) {
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

function verifyUser (loginId, password) {
	// Connect to the database.
	var conn = mysql.createConnection(credentials.connection);
	conn.connect(function(err) {
		if (err) {
			console.error("Error reaching MySQL: ", credentials.connection);
			return false;
		}
		conn.query("SELECT loginId FROM esports.USERS", function(err, rows, fields) {
			// Build JSON results as an object.
			var outjson = {};
			if (err) { // This denotes failure.
				outjson.success = false;
				outjson.message = "Query failed: " + err;
			} else {   // This denotes success.
				outjson.success = true;
				outjson.message = "Query successful.";
				outjson.data = rows;
			}
			// Return json object containing list of users.
		});
	});
}

//handlebars view engine
var handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3001);

app.get('/', function(req, res) {
	console.log(req.query);
	res.render('home', 
		{ 
			page:  "home",
			title:  "GLHF",
		}
	);
});

app.get('/about',function(req, res){
	res.render('about',
		{ 
			page:  "about",
			title:  "About",
		}
	);
});

app.get('/gallery', function(req, res) {
	res.render('gallery',
		{
			page:  "gallery",
			title:  "Media Gallery",
		}
	);
});

app.get('/events',function(req,res){
	res.render('events',{
		page:  "events",
		title:  "Upcoming Events",
		currency:{
			name: 'Good Luck Have Fun  Events',
			abbrev: 'GLHF',
},
		tours:[
			{name: 'NHL event', price: 'Nov 15' },
			{name: 'Pioneer Ambassador Game Night', price: 'Nov 27' },
			{name: 'Mario Kart Tournmanet', price: 'Nov 30' },
],
specialsUrl: '/november-events',
currencies: ['GLFH', 'RUGBY', 'Esports class'],

});

});

// add a  counter here!

// Static pages - Anything we need delivered literally.

app.use(express.static(__dirname + '/public'));

var loginCounter = 0;

app.post('/process', function(req, res){
	if(req.xhr || req.accepts('json,html')==='json'){
		res.send({ success: true });
		loginCounter += 1;
		// update session
		// create entire user object here
		// req.session.user
		// req.body.name
		// req.body.email
		// req.body.pasword
		// next();
	}
});

// If logged in, show the login count and a logout button instead of a login form. 

//404 page
app.use(function(req, res){
	res.type('text/plain');
	res.status(404);
	res.send('404 - Not Found');
});

//500 page
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost: ' +
		 app.get('port') + '; press Ctrl-C to terminate.');
});

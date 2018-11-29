var express = require('express');

var app = express();

var http = require("http");
var fs = require("fs");
var mysql = require("mysql");
var credentials = require("./credentials");
var qs = require("querystring");

http.createServer(function(req, res) {
  try {
    var path = req.url.replace(/\/?(?:\?.*)?$/, "").toLowerCase();
    if (path === "/users") {
      users(req, res);
    }
    else if (path === "/add_user") {
      addUser(req, res);
    }
    else {
      serveStaticFile(res, path);
    }
  }
  catch (e) {
    try {
      console.log("ERROR(500): " + e);
      res.writeHead(500, {"Content-Type": "text/plain; charset=utf-8"});
      res.end("500 Internal Server error");
    }
    catch (e) {
      console.log("ERROR(^^^): " + e);
    }
  }
}).listen(3000);

function serveStaticFile(res, path, contentType, responseCode) {
  if (!path) path = "/index.html";
  if (!responseCode) responseCode = 200;
  if (!contentType) {
    contentType = "application/octet-stream";
    if (path.endsWith(".html")) {
      contentType = "text/html; charset=utf-8";
    }
    else if (path.endsWith(".js")) {
      contentType = "application/javascript; charset=utf-8";
    }
    else if (path.endsWith(".json")) {
      contentType = "application/json; charset=utf-8";
    }
    else if (path.endsWith(".css")) {
      contentType = "text/css; charset=utf-8";
    }
    else if (path.endsWith(".png")) {
      contentType = "image/png";
    }
    else if (path.endsWith(".jpg")) {
      contentType = "text/jpeg";
    }
  }
  fs.readFile(__dirname + "/public" + path, function(err, data) {
    if (err) {
      res.writeHead(404, {"Content-Type": "text/plain; charset=utf-8"});
      res.end("404 Not Found");
    }
    else {
      res.writeHead(200, {"Content-Type": contentType});
      res.end(data);
    }
  });
}

function sendResponse(req, res, data) {
  res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
  res.end(JSON.stringify(data));
}

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

console.log("Server started on localhost: 3000; press Ctrl-C to terminate....");


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
currencies: [ '15', '27', '30'],

});

});

// adda  counter here!

// Static pages - Anything we need delivered literally.

app.use(express.static(__dirname + '/public'));

var loginCounter = 0;

app.post('/process', function(req, res){
	if(req.xhr || req.accepts('json,html')==='json'){
		res.send({ success: true });
		loginCounter += 1;
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

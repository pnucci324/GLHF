var express = require('express');

var app = express();

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

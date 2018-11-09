var express = require('express');

var app = express();

//handlebars view engine
var handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3001);

app.get('/', function(req, res) {
	res.render('home');
});

app.get('/about',function(req, res){
	res.render('about');
});


app.get('/gallery', function(req, res) {
	res.render('gallery');
});
app.get('/events',function(req,res){
	res.render('events',{
		currency: {
				name: 'Good Luck Have fun Events',
				abbrev: 'GLHF',
	},
	tours:[
		{ name: 'NHL event', price: 'Nov 15' },
		{ name: 'Pioneer Ambassor Game Night', price: 'Nov 27' },
		{ name: 'Mario Kart Tournament', price: 'Nov 30' }
	],
specialsUrl: '/november-dates',
currencies: [ '15', '27', '30' ],
}

});

app.get('/gallery',function(req,res){
	res.render('gallery');

});

// Static pages - Anything we need delivered literally.

app.use(express.static(__dirname + '/public'));

app.post('/process', function(req, res){
	if(req.xhr || req.accepts('json,html')==='json'){
		res.send({ success: true });
	}
});
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

"use strict";

var server = null;

function errorHandler(err, req, res, next) 
{
	res.status(500);
	//res.render('error', { error: err });
	console.error(err.stack);
}

function logErrors(err, req, res, next) 
{
	console.error(err.stack);
	next(err);
}

exports.start = function(done)
{
	var express         = require("express"),
			app             = express(),
			bodyParser      = require("body-parser"),
			methodOverride  = require("method-override"),
			views						= require("./views");

	exports.app = app;

	app.all('*', function(req, res, next) {
  		res.header("Access-Control-Allow-Origin", "*");
  		res.header("Access-Control-Allow-Headers", "X-Requested-With");
  		next();
 	});

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(methodOverride());

	app.engine('html', require('ejs').renderFile);
	app.set('view engine', 'html');

	var router = express.Router();

	router.get('', views.home);
	router.get('/proxy', views.proxy);
	
	app.use('/', router);
	app.use("/img", express.static(__dirname + "/img"));
	app.use("/css", express.static(__dirname + "/css"));
	app.use("/js", express.static(__dirname + "/js"));
	app.use("/bower_components", express.static(__dirname + "/bower_components"));


	//app.use(logErrors);
	//app.use(errorHandler);

	if(!server)
	{
		server = app.listen(3000, function()
		{			
			done && done();
		});		
	}
	else
	{
		done && done();
	}
}

exports.stop = function(done)
{
	server.close(done);
	server = null;
}

exports.start(function() { 
	console.log("Node server running on http://localhost:3000");
	console.log(new Date());
});
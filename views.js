"use strict";

var request = require('request'),
	querystring = require('querystring'),
	util = require('util'),
    async = require('async');


function home(req,res)
{
    //res.render(view, data);
    res.sendFile(__dirname +"/templates/index2.html");
}


module.exports = 
{
    home: home
}
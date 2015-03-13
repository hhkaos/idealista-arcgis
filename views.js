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

function proxy(req,res)
{
	/* 
		Thx to DavidSpriggs: 
		https://github.com/DavidSpriggs/node-proxypage 
	*/
	var url, query, query_params, full_url;

	if (req.method == 'GET') {
		url = req.url.split('?')[1];
		query = req.url.split('?')[2];
		query_params = '';
		if (typeof query !== 'undefined') {
			query_params = '?' + query;
		}
		full_url = url + query_params;
		request.get(full_url).pipe(res);
	} else if (req.method == 'POST') {
		url = req.url.split('?')[1];
		request({
			method: 'POST',
			url: url,
			form: req.body
		}).pipe(res);
	} else {
		res.jsonp({
			error: 'Http method not supported use GET or POST'
		});
	}
}

module.exports = 
{
    home: home,
    proxy: proxy

}
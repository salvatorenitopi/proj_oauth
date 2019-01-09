var express = require('express');
var sha512 = require('js-sha512');
var randomstring = require("randomstring");
var url = require('url');
var https = require("https");

var router = express.Router();
var fs = require('fs');

var config = require ('../config');



function request_data (req, res, req_query){

	var post_body = {
			"req_query": req_query,
		}

	//var https = require("https");
	var options = {
		hostname: config.oauth_resource_server_host,
		port: config.oauth_resoruce_server_port,
		path: config.oauth_resource_server_resource_path,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'access_token': req.session.access_token
		}
	};

	var post_req = https.request(options, function(post_res) {
		//console.log('Status: ' + res.statusCode);
		//console.log('Headers: ' + JSON.stringify(res.headers));
		
		post_res.setEncoding('utf8');
		post_res.on('data', function (body) {
			

			var jdata = JSON.parse(body)
			if (jdata.status == "error"){
				res.status(400);
				res.end(body);
				return;

			} else {
				
				if (jdata.valore){
					res.end( JSON.stringify({ "status": "ok", "valore":jdata.valore }) );
					return;

				} else {
					res.end( JSON.stringify({ "status": "ok" }) );
					return;
				}
			}

		});

	});

	post_req.on('error', function(e) {
		console.log(e);
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "impossibile contattare il resource server" }) );
		return;
	});

	// write data to request body
	post_req.write( JSON.stringify (post_body) );
	post_req.end();

}


// ####################################################################################################



router.get(config.end_dashboard, function(req, res){

	if (!req.session.login || !req.session.access_token || !req.session.login === "YES") {
		res.writeHead(303, { Location: config.end_login });
		res.end();
		return;
	}

	res.render('dashboard');
	
});



// ####################################################################################################

router.post(config.end_get_resource, function(req, res){
	var req_query = req.body.req_query;

	if (req_query){
		request_data (req, res, req_query);
	} else {
		post_res.status(400);
		post_res.end( JSON.stringify({ "status": "error", "message": "req_query non fornito" }) );
		return;
	}

});


module.exports = router;
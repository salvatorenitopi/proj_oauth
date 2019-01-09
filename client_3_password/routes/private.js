var express = require('express');
var sha512 = require('js-sha512');
var randomstring = require("randomstring");
var url = require('url');
var https = require("https");

var router = express.Router();
var fs = require('fs');

var config = require ('../config');


function request_refreshed_token (req, res){
	var post_body = {
			"grant_type": "refresh_token",
			"client_id": config.client_id,
			"client_secret": config.client_secret,
			"refresh_token": req.session.refresh_token
		}

	//var https = require("https");
	var options = {
		hostname: config.oauth_authorization_server_host,
		port: config.oauth_authorization_server_port,
		path: config.oauth_authorization_server_token_path,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
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
				if (jdata.access_token && jdata.refresh_token) {	// Se il token è valido
					
					req.session.access_token = jdata.access_token;
					req.session.expire = (Math.floor(jdata.expires)) + (Math.floor(Date.now() / 1000)) - (10);

					res.writeHead(303, { Location: config.end_dashboard });
					res.end();
					return;

				} else {							// Se il token non è valido
					res.end ( JSON.stringify({"status": "error", "message": "access_token o refresh_token non fornito" }) );
					return;

				}

			}

		});

	});

	post_req.on('error', function(e) {
		console.log(e);
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "impossibile contattare l'authentication server" }) );
		return;
	});

	// write data to request body
	post_req.write( JSON.stringify (post_body) );
	post_req.end();
}




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

	if (!req.session.login || !req.session.access_token || !req.session.refresh_token || !req.session.login === "YES") {
		res.writeHead(303, { Location: config.end_login });
		res.end();
		return;
	}

	var now = (Math.floor(Date.now() / 1000));
	var expired = ( now > req.session.expire ) ? true : false;	// Verifica se il token è scaduto

	if (expired){												// Se il token è scaduto ne chiedo un altro
		console.log("[i] Requested refresh_token")
		request_refreshed_token (req, res);

	} else {

		res.render('dashboard');
	}
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
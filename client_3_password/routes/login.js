var express = require('express');
var sha512 = require('js-sha512');
var randomstring = require("randomstring");
var url = require('url');
var https = require("https");

var router = express.Router();
var fs = require('fs');

var config = require ('../config');


var rnd_state = randomstring.generate(8);				// Salvataggio e refresh di state non implementato

router.get(config.end_login, function(req, res){

	if (req.session.login && req.session.access_token && req.session.refresh_token && req.session.login === "YES") {
		res.writeHead(303, { Location: config.end_dashboard });
		res.end();

	} else {

		res.render('login');

	}

});





router.post(config.end_login, function(req, res){
	var username = req.body.username;
	var password = req.body.password;

	if (!username || !password){
		res.status(400);
		res.render('error', {err_mess: 'I parametri username e password sono entrambi richiesti'});
		return;
	}

	var post_body = {
			"grant_type": "password",
			"client_id": config.client_id,
			"client_secret": config.client_secret,
			"redirect_uri": config.end_callback,
			"username": username,
			"password": password,
			"scope": config.client_scope
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
				if (jdata.message) 	res.render('error', {err_mess: 'ERRORE, l\'autorizzazione non è andata buon fire: ' + jdata.message });
				else 				res.render('error', {err_mess: 'ERRORE, l\'autorizzazione non è andata buon fine' });
				return;

			} else {
				if (jdata.access_token && jdata.refresh_token) {	// Se il token è valido
					
					req.session.login = "YES";
					req.session.access_token = jdata.access_token;
					req.session.refresh_token = jdata.refresh_token;
					req.session.expire = (Math.floor(jdata.expires)) + (Math.floor(Date.now() / 1000)) - (10);

					res.writeHead(303, { Location: config.end_dashboard });
					res.end();

				} else {							// Se il token non è valido
					res.end ( JSON.stringify({"status": "error", "message": "access_token o refresh_token non fornito" }) );

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

});




router.get(config.end_callback, function(req, res){
	// Parso la query
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	// Prendo i parametri della query
	var access_token = req.query.access_token;
	var token_type = req.query.token_type;
	var expires_in = req.query.expires_in;
	var state = req.query.state;

	if (!access_token || !token_type || !expires_in || !state ){
		res.status(400);
		res.render('error', {err_mess: 'Il server di autorizzazione non ha fornito uno o più di questi parametri: access_token, token_type, expires_in, state'});
		return;
	}

	if ( token_type != "bearer" ){
		res.status(400);
		res.render('error', {err_mess: 'Il server di autorizzazione ha fornito un token di tipo diverso (non bearer)'});
		return;
	}

	if ( state != rnd_state ){
		res.status(400);
		res.render('error', {err_mess: 'Il server di autorizzazione ha fornito uno state diverso'});
		return;
	}

	
	if (access_token && expires_in) {	// Se il token è valido
					
		req.session.login = "YES";
		req.session.access_token = access_token;
		req.session.expire = (Math.floor(expires_in)) + (Math.floor(Date.now() / 1000)) - (10);

		res.writeHead(303, { Location: config.end_dashboard });
		res.end();

	} else {							// Se il token non è valido
		res.status(400);
		res.render('error', {err_mess: 'Il token non è valido'});
		return;

	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

});


router.get(config.end_logout, function(req, res, next) {
	
	req.session.destroy();
	res.redirect(config.end_login);

});


module.exports = router;
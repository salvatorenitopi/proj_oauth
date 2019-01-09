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
		var authorize_url = config.oauth_authorization_server_authorize_end + "?client_id=" + config.client_id + "&response_type=code"
							+ "&state=" + rnd_state + "&redirect_uri=" + config.redirect_uri + "&scope=" + config.client_scope;

		res.render('login', { "authorize_url": authorize_url });
	}

});




router.get(config.end_callback, function(req, res){
	// Parso la query
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	// Prendo i parametri della query
	var code = req.query.code;
	var state = req.query.state;
	var scope = req.query.scope;

	if (!code || !state || !scope ){
		res.status(400);
		res.render('error', {err_mess: 'Il server di autorizzazione non ha fornito uno o più di questi parametri: code, state, scope'});
		return;
	}

	if ( state != rnd_state ){
		res.status(400);
		res.render('error', {err_mess: 'Il server di autorizzazione ha fornito uno state diverso'});
		return;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

	var authorize_url = config.oauth_authorization_server_token_end

	var post_body = {
			"grant_type": "authorization_code",
			"client_id": config.client_id,
			"client_secret": config.client_secret,
			"redirect_uri": config.redirect_uri,
			"code": code,									// Ottenuto dall callback
			"scope": scope 									// Ottenuta dalla callback
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

			//res.end(body);
			//return;

		});

	});

	post_req.on('error', function(e) {
		console.log(e);
		post_res.status(400);
		post_res.end( JSON.stringify({ "status": "error", "message": "impossibile contattare l'authentication server" }) );
		return;
	});

	// write data to request body
	post_req.write( JSON.stringify (post_body) );
	post_req.end();


/*
	curl --request POST \
	--url 'https://127.0.0.1:8000/oauth/token' \
	--header 'content-type: application/json' \
	--data '{ "grant_type": "refresh_token", "client_id":"prova", "scope":"basic", "client_secret":"secret", "refresh_token":"YDKVctkQSASUpJt9HgxnPTpjaYw=BCQJvG0k959ead1b3277de488b7baeec7eca05aae7c46683dae699e5eac5ddd34e496de8e0ca94cbc194e6e86e65da4b9c580e5d1a853150c5b04bb872fd97a7eebc4b27f666729a7cb74f7cfb603f1bca2ed6ad" }' \
	--insecure
*/

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

});


router.get(config.end_logout, function(req, res, next) {
	
	req.session.destroy();
	res.redirect(config.end_login);

});


module.exports = router;
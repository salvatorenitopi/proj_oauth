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
		var authorize_url = config.oauth_authorization_server_authorize_end + "?client_id=" + config.client_id + "&response_type=token"
							+ "&state=" + rnd_state + "&redirect_uri=" + config.redirect_uri + "&scope=" + config.client_scope;

		res.render('login', { "authorize_url": authorize_url });
	}

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
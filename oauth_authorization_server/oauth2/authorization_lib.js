// var express = require('express');
var sha512 = require('js-sha512');
var randomstring = require("randomstring");
var url = require('url');
var querystring = require('querystring');

//var router = express.Router();
//var fs = require('fs');

var config = require ('../config');

var oauth2_lib = require('./oauth2_lib').oauth2_lib
var oauth2 = new oauth2_lib({crypt_key: config.oauth_hmac_crypt, sign_key: config.oauth_hmac_sign})


// DATABASE  - - - - - - - - - - - - - - - - - - - 

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// - - - - - - - - - - - - - - - - - - - - - - - - 

function find_client (client_id) {
	
	db.read()	// Refresho la cache
	var q = db.get('applications')
		.find({ "client_id": client_id })
		.value()

	return q

}

function from__response_type__to__grant_type (response_type){
	switch(response_type) {
		case "code": 				return "authorization_code"; break
		case "token": 				return "implicit"; break
		case "password": 			return "password"; break
		case "client_credentials": 	return "client_credentials"; break
		default:
			return "error"; break
	}
}

function get_request_permission (scope, customizable){
	var request_permission = ""

	if (customizable == true){

		if(scope.search("basic") != -1) { request_permission += '<input type="checkbox" id="scope_basic" checked disabled/>\
				<label for="scope_basic">\
					<p><b>Accesso alle informazioni di base:</b> Username e e-mail</p>\
				</label>\
			</input><br>'
		}

		if(scope.search("read") != -1) { request_permission += '<input type="checkbox" id="scope_read" checked />\
				<label for="scope_read">\
					<p><b>Accesso in lettura alle informazioni complete:</b> Contenuti sul Resource Server</p>\
				</label>\
			</input><br>'
		}

		if(scope.search("write") != -1) { request_permission += '<input type="checkbox" id="scope_write" checked />\
				<label for="scope_write">\
					<p><b>Accesso in scrittura alle informazioni complete:</b> Contenuti sul Resource Server</p>\
				</label>\
			</input><br>'
		}

	} else {
		if(scope.search("basic") != -1) { request_permission += '<input type="checkbox" id="scope_basic" checked disabled/>\
				<label for="scope_basic">\
					<p><b>Accesso alle informazioni di base:</b> Username e e-mail</p>\
				</label>\
			</input><br>'
		}

		if(scope.search("read") != -1) { request_permission += '<input type="checkbox" id="scope_read" checked disabled/>\
				<label for="scope_read">\
					<p><b>Accesso in lettura alle informazioni complete:</b> Contenuti sul Resource Server</p>\
				</label>\
			</input><br>'
		}

		if(scope.search("write") != -1) { request_permission += '<input type="checkbox" id="scope_write" checked disabled/>\
				<label for="scope_write">\
					<p><b>Accesso in scrittura alle informazioni complete:</b> Contenuti sul Resource Server</p>\
				</label>\
			</input><br>'
		}
	}
	return request_permission
}

// ###################################################################################################

function aut_flow_1(req, res, next, app) {
	// Parso la query
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	// Prendo i parametri della query
	//var response_type = (req.query.response_type || req.body.response_type);		// Il tipo di riposta che il client si aspetta
	var client_id = (req.query.client_id || req.body.client_id);					// L'id del client
	//var client_secret = (req.query.client_secret || req.body.client_secret);		// Il secret del client
	var redirect_uri = (req.query.redirect_uri || req.body.redirect_uri);			// L'url di callback del client (non usato nel flow client_credentials)
	var scope = (req.query.scope || req.body.scope);								// scope
	var state = (req.query.state || req.body.state);								// Stringa utilizzata come nonce dal client

	if (!client_id || !redirect_uri || !scope || !state){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "sono richiesti client_id, redirect_uri, scope, state" }) );
		return;
	}

	if (! scope.includes("basic") ){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "lo scope deve essere almeno di tipo basic" }) );
		return;
	}


	// Creo il codice e lo metto nel database
	var code = randomstring.generate(8)
	var code_expire = (Math.floor(Date.now() / 1000) + 60*5); // Il codice vale per 5 minuti.

	db.read() 	// Refresho la cache		
	db.get('codes')
	.push({ 
		"code": code,
		"client_id": client_id,
		"expire": code_expire,
		"redirect_uri": redirect_uri
	})
	.write()


	var request_permission = get_request_permission (scope, true);
	var callback_url = redirect_uri + "?code=" + code + "&state=" + state + "&scope="

	res.render("authorize", {
			"customizable": true,
			"callback_url": callback_url,
			"request_permission": request_permission,
			"client_name": app['client_name']
		})

/*
curl --request GET \
	--url 'https://127.0.0.1:8000/oauth/authorize?response_type=code&client_id=prova&redirect_uri=https://provaprova.it&state=1234&scope=basic,read,write' \
	--insecure
*/

}


function aut_flow_2(req, res, next, app) {
	// Prendo i parametri della query
	//var response_type = (req.query.response_type || req.body.response_type);		// Il tipo di riposta che il client si aspetta
	var client_id = (req.query.client_id || req.body.client_id);					// L'id del client
	//var client_secret = (req.query.client_secret || req.body.client_secret);		// Il secret del client
	var redirect_uri = (req.query.redirect_uri || req.body.redirect_uri);			// L'url di callback del client (non usato nel flow client_credentials)
	var scope = (req.query.scope || req.body.scope);								// scope
	var state = (req.query.state || req.body.state);								// Stringa utilizzata come nonce dal client

	if (!client_id || !redirect_uri || !scope || !state){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "sono richiesti client_id, redirect_uri, scope, state" }) );
		return;
	}

	if (! scope.includes("basic") ){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "lo scope deve essere almeno di tipo basic" }) );
		return;
	}

	// Genero e salvo l'access token - - - - - - - - - - -

	var access_token = oauth2.generateAccessToken({ "client_id": client_id, "scope": scope  });

	if(!access_token){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "errore nella generazione dell\'access_token" }) );
		return;
	}

	db.read()	// Refresho la cache
		db.get('authorizations')
		.push({
			"auth_id": randomstring.generate(8),
			"issued_at": (Math.floor(Date.now() / 1000)),
			"expire_at": (Math.floor(Date.now() / 1000)) + config.access_token_expiration,
			"expire_in": config.access_token_expiration,
			"owner": app['owner'],
			"grant_type": "implicit",
			"client_id": client_id,
			"scope": scope,
			"access_token": access_token
		})
		.write()

	// - - - - - - - - - - - - - - - - - - - - - - - - - - -

	console.log("\033[0;35m[*] Client: " + client_id + " (token) token provided in callback uri\033[0m")

	var request_permission = get_request_permission (scope, false);
	var callback_url = redirect_uri + "?access_token=" + access_token + "&token_type=bearer&expires_in=" + config.access_token_expiration + "&state=" + state

	res.render("authorize", {
			"customizable": false,
			"callback_url": callback_url,
			"request_permission": request_permission,
			"client_name": app['client_name']
		})

}


function aut_flow_3(req, res, next, app) {

	// Nessuna autorizzazione richiesta (scope completo)

}

function aut_flow_4(req, res, next, app) {

	// Nessuna autorizzazione richiesta (scope completo)

}


module.exports = {

	authorize_fx: function  (req, res, next){
		// Parso la query
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;

		// Prendo i parametri della query
		var response_type = (req.query.response_type || req.body.response_type);		// Il tipo di riposta che il client si aspetta
		var client_id = (req.query.client_id || req.body.client_id);					// L'id del client
		//var client_secret = (req.query.client_secret || req.body.client_secret);		// Il secret del client
		//var redirect_uri = (req.query.redirect_uri || req.body.redirect_uri);			// L'url di callback del client (non usato nel flow client_credentials)
		//var scope = (req.query.scope || req.body.scope);								// scope
		//var state = (req.query.state || req.body.state);								// Stringa utilizzata come nonce dal client

		// Controllo che i parametri comuni siano stati forniti
		if (!response_type || !client_id){
			res.status(400);
			res.end( JSON.stringify({ "status": "error", "message": "sono richiesti response_type, client_id" }) );
			return;
		}

		// Controllo che sia registrata l'applicazione con id client_id
		var app = find_client(client_id)
		if (!app) {
			res.status(400);
			res.end( JSON.stringify({ "status": "error", "message": "l\'applicazione con id: " + client_id + " non è registrata" }) );
			return;
		}

		
		// Controllo che l'app sia registrata per il tipo di autenticazione richiesto
		if (app['grant_type'] != from__response_type__to__grant_type(response_type)){
			res.status(400);
			res.end( JSON.stringify({ "status": "error", "message": "l\'applicazione con id: " + client_id + " prevede un tipo di autenticazione diverso (grant_type)" }) );
			return;
		}

		console.log("\033[0;35m[*] Client: " + client_id + " requested authorization (" + response_type + ")\033[0m")

		// Scelgo flow
		switch(response_type) {
			case "code": 					aut_flow_1(req, res, next, app); break;				// flow authorization_code_grant
			case "token": 					aut_flow_2(req, res, next, app); break;				// flow implicit_grant
			//case "password": 				aut_flow_3(req, res, next, app); break;				// flow resource_owner_password_credentials_grant
			//case "client_credentials": 	aut_flow_4(req, res, next, app); break;				// flow client_credentials_grant
		}
	}

};
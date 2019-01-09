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


function find_user(username) {
	
	db.read()	// Refresho la cache
	var q = db.get('users')
		.find({ "username": username })
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

function get_request_permission (scope){
	var request_permission = ""
	if(scope.search("basic") != -1) { request_permission += //'<input type="hidden" id="scope_basic" name="scope_basic" value="true">\
		'<input type="checkbox" id="scope_basic" checked disabled/>\
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
	return request_permission
}

// ###################################################################################################


function tk_refresh(req, res, next, app) {
	console.log(req.body)
	var grant_type = (req.query.grant_type || req.body.grant_type);					// Il tipo di riposta che il client si aspetta
	var client_id = (req.query.client_id || req.body.client_id);					// L'id del client
	var client_secret = (req.query.client_secret || req.body.client_secret);		// Il secret del client
	var refresh_token = (req.query.refresh_token || req.body.refresh_token);		// Il refresh token

	if (!client_secret || !refresh_token ){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "sono richiesti client_secret, refresh_token" }) );
		return;
	}

	if (client_secret != app['client_secret']){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "il parametro client_secret non è corretto" }) );
		return;
	}

	db.read() 	// Refresho la cache															// Cerco il vecchio token
	var auth_dict = db.get('authorizations')
		.find({ "client_id": client_id, "refresh_token":refresh_token })
		.value()

	if (!auth_dict){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "impossibile trovare l'autorizzazione precedentemente concessa" }) );
		return;
	}

	var new_access_token = oauth2.refreshAccessToken (auth_dict ['access_token'], refresh_token)		// Genero un nuovo token

	if (!new_access_token) {
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "impossibile generare il nuovo access token" }) );
		return;
	
	} else {
		db.get('authorizations')																// Aggiorno il token
			.find({ "client_id": client_id, "refresh_token":refresh_token  })
			.assign({ "access_token": new_access_token })
			.write()

		res.end( JSON.stringify({ "status": "ok", "token_type":"bearer", "access_token":new_access_token, "expires":config.access_token_expiration, "refresh_token":refresh_token }) );
		return;
	}

}


function tk_flow_1(req, res, next, app) {
	// Parso la query
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	// Prendo i parametri della query
	var grant_type = (req.query.grant_type || req.body.grant_type);					// Il tipo di riposta che il client si aspetta
	var client_id = (req.query.client_id || req.body.client_id);					// L'id del client
	var client_secret = (req.query.client_secret || req.body.client_secret);		// Il secret del client
	var redirect_uri = (req.query.redirect_uri || req.body.redirect_uri);			// L'url di callback del client (non usato nel flow client_credentials)
	var code = (req.query.code || req.body.code);									// Codice per l'autenticazione
	var scope = (req.query.scope || req.body.scope);								// scope

	if (!client_id || !client_secret || !redirect_uri || !code || !scope){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "sono richiesti client_id, client_secret, redirect_uri, code, scope" }) );
		return;
	}


	if (! scope.includes("basic") ){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "lo scope deve essere almeno di tipo basic" }) );
		return;
	}

	if (client_secret != app['client_secret']){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "il parametro client_secret non è corretto" }) );
		return;
	}


	// Cerco il codice nel database - - - - - - - - - -
	db.read() 	// Refresho la cache		
	var fcode = db.get('codes')
		.find({ "client_id": client_id, "code": code, "redirect_uri":redirect_uri })
		.value()

	if(!fcode){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "parametro code non valido" }) );
		return;
	}


	// Genero e salvo l'access token - - - - - - - - -
	var access_token = oauth2.generateAccessToken({ "code":code, "client_id": client_id, "scope": scope  });
	var refresh_token = oauth2.generateRefreshToken(access_token);

	if(!access_token || !refresh_token){
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
			"grant_type": grant_type,
			"client_id": client_id,
			"scope": scope,
			"access_token": access_token,
			"refresh_token": refresh_token
		})
		.write()


	// Rimuovo il code - - - - - - - - - - - - - - - - 
	db.read() 	// Refresho la cache
	db.get('codes')
		.remove({ "client_id": client_id, "code": code })
  		.write()

	res.end( JSON.stringify({ "status": "ok", "token_type":"bearer", "access_token":access_token, "expires":config.access_token_expiration, "refresh_token":refresh_token }) );
	return;


/*
curl --request POST \
	--url 'https://127.0.0.1:8000/oauth/token' \
	--header 'content-type: application/json' \
	--data '{ "grant_type": "authorization_code", "client_id":"prova", "scope":"basic", "client_secret":"secret", "code":"kb153gqS", "redirect_uri":"https://provaprova.it", "scope":"basic" }' \
	--insecure
*/

}


function tk_flow_2(req, res, next, app) {
	// VIENE FATTO NEL aut_flow_2 IN authorization_lib.js
}


function tk_flow_3(req, res, next, app) {
	var grant_type = (req.query.grant_type || req.body.grant_type);					// Il tipo di riposta che il client si aspetta
	var client_id = (req.query.client_id || req.body.client_id);					// L'id del client
	var client_secret = (req.query.client_secret || req.body.client_secret);		// Il secret del client
	var redirect_uri = (req.query.redirect_uri || req.body.redirect_uri);			// L'url di callback del client (non usato nel flow client_credentials)	
	var username = (req.body.username || req.body.username);						// Username
	var password = (req.body.password || req.body.password);						// Password
	var scope = (req.query.scope || req.body.scope);								// scope


	if (!client_id || !client_secret || !redirect_uri || !username || !password){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "sono richiesti client_id, client_secret, redirect_uri, username, password" }) );
		return;
	}


	if (! scope.includes("basic") ){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "lo scope deve essere almeno di tipo basic" }) );
		return;
	}

	if (client_secret != app['client_secret']){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "il parametro client_secret non è corretto" }) );
		return;
	}


	// Verifico le credenziali dell'utente - - - - - - - - - - -

	var pass_hash = sha512(password);
	var user_dict = find_user(username);


	if ((user_dict) && (user_dict.username == username) && (user_dict.password == pass_hash)){

		
		// Genero e salvo l'access token - - - - - - - - - - -

		var access_token = oauth2.generateAccessToken({ "client_id": client_id, "scope": scope  });
		var refresh_token = oauth2.generateRefreshToken(access_token);

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
				"access_token": access_token,
				"refresh_token": refresh_token
			})
			.write()

		// - - - - - - - - - - - - - - - - - - - - - - - - - - -


		res.end( JSON.stringify({ "status": "ok", "token_type":"bearer", "access_token":access_token, "expires":config.access_token_expiration, "refresh_token":refresh_token }) );
		return;


	} else {
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "credenziali non corrette" }) );
		return;
	}

}


function tk_flow_4(req, res, next, app) {
	// Parso la query
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	// Prendo i parametri della query
	//var grant_type = (req.query.grant_type || req.body.grant_type);				// Il tipo di riposta che il client si aspetta
	var client_id = (req.query.client_id || req.body.client_id);					// L'id del client
	var client_secret = (req.query.client_secret || req.body.client_secret);		// Il secret del client
	var scope = (req.query.scope || req.body.scope);								// scope

	if (!client_id || !client_secret || !scope){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "sono richiesti client_id, client_secret, scope" }) );
		return;
	}


	if (! scope.includes("basic") ){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "lo scope deve essere almeno di tipo basic" }) );
		return;
	}

	if (client_secret != app['client_secret']){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "il parametro client_secret non è corretto" }) );
		return;
	}


	// Genero e salvo l'access token - - - - - - - - -
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
			"grant_type": "client_credentials",
			"client_id": client_id,
			"scope": scope,
			"access_token": access_token
		})
		.write()


	res.end( JSON.stringify({ "status": "ok", "token_type":"bearer", "access_token":access_token, "expires":config.access_token_expiration }) );
	return;

}




module.exports = {

	token_fx: function  (req, res, next){
			// Parso la query
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;

		// Prendo i parametri della query
		var grant_type = (req.query.grant_type || req.body.grant_type);					// Il tipo di riposta che il client si aspetta
		var client_id = (req.query.client_id || req.body.client_id);					// L'id del client
		//var client_secret = (req.query.client_secret || req.body.client_secret);		// Il secret del client
		//var redirect_uri = (req.query.redirect_uri || req.body.redirect_uri);			// L'url di callback del client (non usato nel flow client_credentials)
		//var code = (req.query.code || req.body.code);									// Stringa utilizzata come nonce dal client
		//var scope = (req.query.scope || req.body.scope);								// scope

		// Controllo che i parametri comuni siano stati forniti
		if (!grant_type || !client_id ){
			res.status(400);
			res.end( JSON.stringify({ "status": "error", "message": "sono richiesti grant_type, client_id" }) );
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
		/*if (app['grant_type'] != grant_type){
			res.status(400);
			res.end( JSON.stringify({ "status": "error", "message": "l\'applicazione con id: " + client_id + " prevede un tipo di autenticazione diverso (grant_type)" }) );
			return;
		}*/		// <- Commentata perchè non mi permette di gestire il caso refresh_token

		console.log("\033[0;35m[*] Client: " + client_id + " requested token (" + grant_type + ")\033[0m")

		// Scelgo flow
		switch(grant_type) {
			case "refresh_token": 			tk_refresh(req, res, next, app); break;				// flow refresh_token
			case "authorization_code": 		tk_flow_1(req, res, next, app); break;				// flow authorization_code_grant
			//case "implicit"				tk_flow_2(req, res, next, app); break;				// flow implicit_grant
			case "password": 				tk_flow_3(req, res, next, app); break;				// flow resource_owner_password_credentials_grant
			case "client_credentials": 		tk_flow_4(req, res, next, app); break;				// flow client_credentials_grant
		}
	}

};
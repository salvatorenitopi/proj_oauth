// Guida_1 http://www.bubblecode.net/en/2016/01/22/understanding-oauth2/
// Guida_2 https://aaronparecki.com/oauth-2-simplified/
// Guida_3 https://connect2id.com/products/server/docs/api/token
// Guida_4 https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2

// authorization_code_grant  					(authorization_code) 	https://www.oauth.com/oauth2-servers/access-tokens/authorization-code-request/
// implicit_grant 	/	Single-Page Apps		(implicit)
// resource_owner_password_credentials_grant 	(password)				https://www.oauth.com/oauth2-servers/access-tokens/password-grant/
// client_credentials_grant 					(client_credentials) 	https://www.oauth.com/oauth2-servers/access-tokens/client-credentials/

var express = require('express');
var sha512 = require('js-sha512');
var randomstring = require("randomstring");
var url = require('url');
var querystring = require('querystring');

var router = express.Router();
var fs = require('fs');

var config = require ('../config');


var oauth2_lib = require('../oauth2/oauth2_lib').oauth2_lib
var oauth2 = new oauth2_lib({crypt_key: config.oauth_hmac_crypt, sign_key: config.oauth_hmac_sign})

var authorization_lib = require('../oauth2/authorization_lib')
var token_lib = require('../oauth2/token_lib')


// DATABASE  - - - - - - - - - - - - - - - - - - - 

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// - - - - - - - - - - - - - - - - - - - - - - - - 


// ###################################################################################################
// Funzione di comunicazione fra authentication server e resource server


router.post(config.end_resource_server, function(req, res, next) {

	// AUTENTICAZIONE FRA authentication server E resource server

	var resource_server_id = req.get('resource_server_id');
	var resource_server_secret = req.get('resource_server_secret');

	if (!resource_server_id || !resource_server_secret){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "sono richiesti resource_server_id e resource_server_secret" }) );
		return;
	}

	if (config.oauth_resource_server_id != resource_server_id || config.oauth_resource_server_secret != resource_server_secret){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "resource_server_id o resource_server_secret non validi" }) );
		return;
	}

	// VERIFICA TOKEN - - - - - - - - - - - - - - - - - - - - - - -

	var access_token = req.body.access_token;
	var scope = req.body.scope;
	var grant_type = req.body.grant_type;

	//console.log(grant_type)
	//console.log(!grant_type)
	//console.log(grant_type != 'validate_scope')

	if (!grant_type || grant_type != 'validate_scope'){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "grant_type non valido" }) );
		return;
	}

	if (!access_token || !scope){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "sono richiesti access_token e scope" }) );
		return;
	}

	db.read()	// Refresho la cache
	var qtoken = db.get('authorizations')
		.find({ "access_token": access_token })
		.value()

	if (qtoken && oauth2.validateAccessToken (access_token, scope)){
		res.end ( JSON.stringify({ "status": "ok", "token_status": "ok", "owner":qtoken['owner'] }) );
		return;

	} else {
		res.status(400);
		res.end( JSON.stringify({ "status": "ok", "token_status": "rejected" }) );
		return;
	}
	
});


/*
curl --request POST \
	--url 'https://127.0.0.1:8000/oauth/resource_server' \
	--header 'content-type: application/json' \
	--header 'resource_server_id: oauth_resource_server' \
	--header 'resource_server_secret: bd2b1aaf7ef4f09be9f52ce2d8d599674d81aa9d6a4421696dc4d93dd0619d682ce56b4d64a9ef097761ced99e0f67265b5f76085e5b0ee7ca4696b2ad6fe2b2' \
	--data '{ "grant_type": "validate_scope", "access_token":"qRB4Q5VdjRVwZFZ1cxVWDpdB5wc=z4gP8MZl9c63b05ba51ed85b7b13dcac25f14df3629afb051c1ca2ae65bc81d11e035b27c5def34eda73de3516f2cede9daab8d9bdad61275a2b5484eacfce325c641dfc2e4b3b24d791c94d751d51edd31014fc", "scope":"read" }' \
	--insecure
*/


// ###################################################################################################
// Funzione di autorizzazione

router.all(config.end_authorize, function(req, res, next) {
	
	authorization_lib.authorize_fx(req, res, next);

});


// ###################################################################################################
// Funzione di generazione token

router.post(config.end_token, function(req, res, next) {
	
	token_lib.token_fx(req, res, next);

});




module.exports = router;
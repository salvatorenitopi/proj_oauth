var express = require('express');
var sha512 = require('js-sha512');
var randomstring = require("randomstring");
var url = require('url');
var https = require("https");

var router = express.Router();
var fs = require('fs');

var config = require ('../config');


// DATABASE  - - - - - - - - - - - - - - - - - - - 

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// - - - - - - - - - - - - - - - - - - - - - - - - 


router.post(config.end_resource, function(req, res){
	var access_token = ( req.get('access_token') || req.body.access_token );
	var req_query = req.body.req_query;		// Query per selezionare la risorsa

	if (!access_token || !req_query){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "access_token, req_query invalidi o mancanti" }) );
		return;
	}

	// Se i controlli vanno a buon fine passo tutto a "access_resource"
	access_resource (req, res, access_token, req_query);


});


/*
router.get(config.end_resource, function(req, res){
	var access_token = ( req.get('access_token') || req.query.access_token )
	var req_query = req.query.req_query;		// Query per selezionare la risorsa

	if (!access_token || !req_query){
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "access_token, req_query invalidi o mancanti" }) );
		return;
	}

	// Se i controlli vanno a buon fine passo tutto a "access_resource"
	access_resource (req, res, access_token, req_query);


});
/*


/*
curl --request POST \
	--url 'https://127.0.0.1:9000/resource' \
	--header 'content-type: application/json' \
	--data '{ "grant_type": "validate_token",  "access_token": "AAAAA", "req_query":"{\"action\":\"find\"}" }' \
	--insecure
*/

// ###################################################################################################

function allowed (req, res, owner, req_query){

	var jq = JSON.parse(req_query)

	console.log(jq)

	// Scelgo il corretto comportamento
	switch(jq['action']) {
		case "basic_find":
		case "find":
			db.read ()
			var result = db.get('resources')
				.filter({ "owner": owner })
				.find({ "key": jq.key })
				.value()

			console.log(result)

			res.end( JSON.stringify({ "status": "ok", "valore":result['valore'] }) );
			break;
			return;

		case "basic_assign":
		case "assign":
			db.read ()
			db.get('resources')
				.filter({ "owner": owner })
				.find({ "key": jq.key })
				.assign({ "key": jq.key, "valore": jq.valore})
				.write()

			res.end( JSON.stringify({ "status": "ok" }) );
			break;
			return;

		default: 				// Se la query non contiene il campo action o l'azione non è prevista
			res.status(400);
			res.end( JSON.stringify({ "status": "error", "message": "query non corretta" }) );
			return;
	}

	return;
	
}

function access_resource (req, res, access_token, req_query) {

	var scope = undefined
	var jreq_query = undefined

	try {
		jreq_query = JSON.parse(req_query);
	}
	catch(err){
		jreq_query = undefined;
	}

	if (!jreq_query){		// Se non riesco a parsare la query
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "req_query deve essere in formato json" }) );
		return;
	}


	// Scelgo il corretto scope per la query richiesta
	switch(jreq_query['action']) {
		case "basic_find": 					scope = "basic";		break;
		case "basic_assign": 				scope = "basic";		break;
		case "find": 						scope = "read";			break;
		case "filter": 						scope = "read";			break;
		case "push":						scope = "read,write";	break;
		case "assign": 						scope = "read,write";	break;
		case "remove": 						scope = "read,write";	break;

		default: 				// Se la query non contiene il campo action o l'azione non è prevista
			res.status(400);
			res.end( JSON.stringify({ "status": "error", "message": "query non corretta" }) );
			return;
	}


	var post_body = {
			"grant_type": "validate_scope",
			"access_token": access_token,
			"scope": scope
		}

	//var https = require("https");
	var options = {
		hostname: config.oauth_authorization_server_host,
		port: config.oauth_authorization_server_port,
		path: '/oauth/resource_server',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'resource_server_id': config.oauth_resource_server_id,
			'resource_server_secret': config.oauth_resource_server_secret
		}
	};

	var post_req = https.request(options, function(post_res) {
		//console.log('Status: ' + res.statusCode);
		//console.log('Headers: ' + JSON.stringify(res.headers));
		
		post_res.setEncoding('utf8');
		post_res.on('data', function (body) {
			
			var jdata = JSON.parse(body)
			if (jdata.status == "error"){
				res.end( JSON.stringify({ "status": "error", "message": jdata.message }) );

			} else {
				if (jdata.token_status == "ok" && jdata.owner){	// Se il token è valido
					allowed (req, res, jdata.owner, req_query);

				} else {							// Se il token non è valido
					res.end ( JSON.stringify({"status": "error", "message": "token non valido" }) );

				}

			}

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

}


module.exports = router;


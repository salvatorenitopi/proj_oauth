var express = require('express');
var sha512 = require('js-sha512');
var randomstring = require("randomstring");
var url = require('url');

var router = express.Router();
var fs = require('fs');

var config = require ('../config');


// DATABASE  - - - - - - - - - - - - - - - - - - - 

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// - - - - - - - - - - - - - - - - - - - - - - - - 


router.get(config.end_dashboard, function(req, res){
	if ((req.session.user && req.session.login && req.session.login === "YES")){		//Se l'utente è loggato

		db.read()	// Refresho la cache
		user_info = db.get('users')
			.find({ "username": req.session.user })
			.value()

		user_authorizations = db.get('authorizations')
			.filter({ "owner": req.session.user })
			.value()

		user_applications = db.get('applications')
			.filter({ "owner": req.session.user })
			.value()

		var json_sting = JSON.stringify( { 
			"user_info": user_info, 
			"user_authorizations": user_authorizations, 
			"user_applications":user_applications 
		} )


		res.render('dashboard', { "username": req.session.user, "json_payload": json_sting  });
	} else {
		res.writeHead(303, { Location: config.end_login });
		res.end();
	}

});

// - - - - - - - - - - - - - - - - - - - - - - - - 

router.post(config.end_update_user_info, function(req, res, next) {

	if (req.session.user && req.session.login && req.session.login === "YES"){		//Se l'utente è loggato
		var user = req.body.username;
		var pass = req.body.password;
		var email = req.body.email;

		if (!user || !pass || !email){
			res.end( JSON.stringify({ "status": "error", "message": "Parametri incompleti" }) );

		} else {

			var pass_hash = sha512(pass);

			db.read()	// Refresho la cache
			user_info = db.get('users')
				.find({ "username": req.session.user })
				.value()

			// Se i parametri sono immutati
			if (user_info['username'] === req.session.user && user_info['password'] === pass && user_info['email'] === email) {
				res.end( JSON.stringify({ "status": "error", "message": "Parametri identici ai precedenti" }) );

			} else {

				if (user_info['password'] === pass){				// Se la password è uguale alla precedente non la cambio

					db.read()	// Refresho la cache
					db.get('users')
						.find({ "username": req.session.user })
						.assign({ "email": email })
						.write()

					res.end( JSON.stringify({ "status": "ok" }) );

				} else {												// Se la password è DIVERSA dalla precedente non la cambio

					db.read()	// Refresho la cache
					db.get('users')
						.find({ "username": req.session.user })
						.assign({ "password": pass_hash, "email": email })
						.write()

					res.end( JSON.stringify({ "status": "ok" }) );

				}

			}
		}
	} else {
		// MANCA CODICE SE UTENTE NON LOGGATO
		// MANCA CODICE SE UTENTE NON LOGGATO
		// MANCA CODICE SE UTENTE NON LOGGATO
	}
});



router.post(config.end_remove_client, function(req, res, next) {
	
	if (req.session.user && req.session.login && req.session.login === "YES"){		//Se l'utente è loggato
		var client_id = req.body.client_id;

		if (!client_id){
			res.end( JSON.stringify({ "status": "error", "message": "Client id mancante" }) );

		} else {

			db.read()	// Refresho la cache
			applications = db.get('applications')
				.find({ "client_id": client_id })
				.value()

			// Se non l'applicazione esiste
			if (!applications){		
				res.end( JSON.stringify({ "status": "error", "message": "L'applicazione non esiste" }) );

			} else {
				db.read()	// Refresho la cache
				db.get('applications')
					.remove({ "client_id": client_id })
					.write()

				res.end( JSON.stringify({ "status": "ok" }) );
			}

		}

	} else {
		// MANCA CODICE SE UTENTE NON LOGGATO
		// MANCA CODICE SE UTENTE NON LOGGATO
		// MANCA CODICE SE UTENTE NON LOGGATO
	}
	
});


router.post(config.end_remove_authorization, function(req, res, next) {
	
	if (req.session.user && req.session.login && req.session.login === "YES"){		//Se l'utente è loggato
		var auth_id = req.body.auth_id;

		if (!auth_id){
			res.end( JSON.stringify({ "status": "error", "message": "Client id mancante" }) );

		} else {

			db.read()	// Refresho la cache
			authorization = db.get('authorizations')
				.find({ "auth_id": auth_id })
				.value()

			// Se non l'applicazione esiste
			if (!authorization){		
				res.end( JSON.stringify({ "status": "error", "message": "L'applicazione non esiste" }) );

			} else {
				db.read()	// Refresho la cache
				db.get('authorizations')
					.remove({ "auth_id": auth_id })
					.write()

				res.end( JSON.stringify({ "status": "ok" }) );
			}

		}

	} else {
		// MANCA CODICE SE UTENTE NON LOGGATO
		// MANCA CODICE SE UTENTE NON LOGGATO
		// MANCA CODICE SE UTENTE NON LOGGATO
	}
	
});




router.post(config.end_add_client, function(req, res, next) {
	
	if (req.session.user && req.session.login && req.session.login === "YES"){		//Se l'utente è loggato
		var owner = req.session.user;
		var client_id = req.body.client_id;
		var client_secret = req.body.client_secret;
		var client_name = req.body.client_name;
		var grant_type = req.body.grant_type;

		if (!owner || !client_id || !client_secret || !client_name || !grant_type){
			res.end( JSON.stringify({ "status": "error", "message": "Parametri incompleti" }) );

		} else {

			db.read()	// Refresho la cache
			applications = db.get('applications')
				.find({ "client_id": client_id })
				.value()

			// Se non l'applicazione esiste
			if (applications){		
				res.end( JSON.stringify({ "status": "error", "message": "L'applicazione con client_id: " + client_id + " esiste già" }) );

			} else {
				db.read()	// Refresho la cache
				db.get('applications')
					.push({ "owner": owner, 'client_name': client_name, 'client_id': client_id, 'client_secret': client_secret, 'grant_type': grant_type })
					.write()

				res.end( JSON.stringify({ "status": "ok" }) );
			}

		}

	} else {
		// MANCA CODICE SE UTENTE NON LOGGATO
		// MANCA CODICE SE UTENTE NON LOGGATO
		// MANCA CODICE SE UTENTE NON LOGGATO
	}
	
});


module.exports = router;
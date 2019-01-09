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


router.get(config.end_login, function(req, res){

	// Parso la query
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	var next_url = query.next;

	if (next_url){
		if (req.session.user && req.session.login && req.session.login === "YES"){		// Se l'utente è loggato
			res.writeHead(303, { Location: next_url });
			res.end();
		} else {																		// Se l'utente non è loggato
			res.render('login', { hidden_input: next_url });
		}

	} else {
		if (req.session.user && req.session.login && req.session.login === "YES"){		// Se l'utente è loggato
			res.writeHead(303, { Location: config.end_dashboard });
			res.end();
		} else {																		// Se l'utente non è loggato
			res.render('login', { hidden_input: undefined });
			//res.render('login', { hidden_input: undefined, oauth: true });
		}
	}

});




router.get(config.end_logout, function(req, res, next) {
	
	req.session.destroy();
	res.redirect(config.end_login);

});


//////////////////////////////////////////////////////////////////////////////////////////


function find_user(username) {
	
	db.read()	// Refresho la cache
	var q = db.get('users')
		.find({ "username": username })
		.value()

	return q

}



router.post(config.end_login, function(req, res, next) {
	var user = req.body.username;
	var pass = req.body.password;

	var pass_hash = sha512(pass);
	var user_dict = find_user(user);


	if ((user_dict) && (user_dict.username == user) && (user_dict.password == pass_hash)){

		req.session.user = user;
		req.session.login = "YES";

		req.session.user = user_dict.username;

		var next = req.body.next;

		if (next) {
			res.writeHead(303, {Location: next});
			res.end();

		} else {
			res.writeHead(303, { Location: config.end_dashboard });
			res.end();
		}
		

	} else {
		req.flash ('error_msg', 'Credenziali Errate');
		res.redirect(config.end_login);
	}
});




module.exports = router;


// curl --data "username=user&password=1234" https://127.0.0.1:8000/login --insecure
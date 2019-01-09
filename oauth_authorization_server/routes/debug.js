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


router.get(config.end_debug, function(req, res, next) {
	
	db.read()	// Refresho la cache
	json_sting = JSON.stringify( { "users": db.get('users'), "authorizations": db.get('authorizations'), "applications": db.get('applications') } )

	console.log(json_sting)
	res.render('debug', { json_payload: json_sting });

});


module.exports = router;
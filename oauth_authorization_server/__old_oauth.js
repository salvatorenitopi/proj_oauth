router.post(config.end_token, function(req, res, next) {

	fx_client_credentials_grant (req, res, next);
	
});


router.get(config.end_authorize, function(req, res, next) {

	// Parso la query
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	// Prendo i parametri della query
	var client_id = req.query.client_id;


	// Controllo che client_id sia stato fornito
	if (!client_id){
		res.status(400);
		res.render('error', {err_mess: 'Sono richiesti client_id, redirect_uri e scope'});
		return;
	}

	// Controllo che sia registrata l'applicazione con id client_id
	var app = find_client(client_id)
	if (!app) {
		res.status(400);
		res.render('error', {err_mess: 'L\'applicazione con id: ' + client_id + ' non è registrata.'});
		return;
	}

	// Scelgo il corretto "use case"
	switch(app['oauth_type']) {
		case "authorization_code_grant": 					fx_authorization_code_grant (req, res, next);
		case "implicit_grant": 								fx_implicit_grant (req, res, next);
		case "resource_owner_password_credentials_grant": 	resource_owner_password_credentials_grant (req, res, next);
		//case "client_credentials_grant": 					fx_client_credentials_grant (req, res, next);
		default:
			res.status(400);
			res.render('error', {err_mess: 'L\'applicazione con id: ' + client_id + ' non ha un oauth_type corretto.'});
			return;
	}


});


// - ! - ! - ! - ! - ! - ! - ! - ! - ! - ! - ! - ! - ! - ! - ! - ! - ! - ! - ! - !




function fx_authorization_code_grant (req, res, next){

}


function fx_implicit_grant (req, res, next){
	res.end ("implicit_grant")
}

function fx_password_grant (req, res, next){
	res.end ("resource_owner_password_credentials_grant")
}




function fx_client_credentials_grant (req, res, next){
	var grant_type = req.body.grant_type;
	var client_id = req.body.client_id;
	var client_secret = req.body.client_secret;
	var scope = req.body.scope;

	if (!grant_type || !client_id || !client_secret || !scope) {
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "Parametri incompleti" }) );
		return;
	}

	var app = find_client_by_credentials(client_id, client_secret)

	// Controllo che sia registrata l'applicazione con id client_id e secret client_secret
	if (!app) {
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "Applicazione non registrata o credenziali non corrette" }) );
		return;
	}

	// Controllo che l'app utilizzi il sistema di autenticazione giusto
	if (app['grant_type'] != 'client_credentials' || grant_type != 'client_credentials') {
		res.status(400);
		res.end( JSON.stringify({ "status": "error", "message": "L' Applicazione utilizza un protollo di autenticazione diverso" }) );
		return;
	}

	var token = oauth2.generateAccessToken ( {"grant_type": grant_type, "client_id": client_id, "user_id": "web_app", "client_secret": client_secret, "scope": scope } )

	db.read()	// Refresho la cache
	db.get('authorizations')
	.push({
		"owner": "web_app",
		"grant_type": grant_type,
		"client_id": client_id,
		"scope": scope,
		"token": token
	})
	.write()
	res.end( JSON.stringify({ "access_token": token, "token_type": "bearer", "expires_in": "1800", "scope": scope }) );

}
/*
curl --request POST \
	--url 'https://127.0.0.1:8000/oauth/token' \
	--header 'content-type: application/json' \
	--data '{ "grant_type": "client_credentials", "client_id": "root_app", "client_secret": "99adc231b045331e514a516b4b7680f588e3823213abe901738bc3ad67b2f6fcb3c64efb93d18002588d3ccc1a49efbae1ce20cb43df36b38651f11fa75678e8", "scope": "basic,read,write" }' \
	--insecure
*/



/*
router.get(config.end_authorize, function(req, res, next) {

	// Parso la query
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	
	// Prendo i parametri della query
	var client_id = req.query.client_id;
	var redirect_uri = req.query.redirect_uri;
	var scope = req.query.scope;

	// CONTROLLI -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  

	// Se mancano i parametri della query visualizza errore
	if (!client_id || !redirect_uri || !scope) {
		res.status(400);
		res.render('error', {err_mess: 'Sono richiesti client_id, redirect_uri e scope'});
		return;
	}

	// Controllo che sia presente almeno lo scope "basic"
	if(scope.search("basic") == -1) {
		res.status(400);
		res.render('error', {err_mess: 'Scope basic è richiesto'});
		return;
	}
	
	// Controllo che sia registrata l'applicazione con id client_id
	var app = find_client(client_id)
	if (!app) {
		res.status(400);
		res.render('error', {err_mess: 'L\'applicazione con id: ' + client_id + ' non è registrata.'});
		return;
	}

	// -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -


	var authorize_url = req.url;

	request_permission = ""
	if(scope.search("basic") != -1) { request_permission += '<input type="hidden" id="scope_basic" name="scope_basic" value="true">\
		<input type="checkbox" id="_scope_basic" name="_scope_basic" checked disabled/>\
			<label for="_scope_basic">\
				<p><b>Accesso alle informazioni di base:</b> Username e e-mail</p>\
			</label>\
		</input><br>'
	}

	if(scope.search("read") != -1) { request_permission += '<input type="checkbox" id="scope_read" name="scope_read" value="true" checked />\
			<label for="scope_read">\
				<p><b>Accesso in lettura alle informazioni complete:</b> Contenuti sul Resource Server</p>\
			</label>\
		</input><br>'
	}

	if(scope.search("write") != -1) { request_permission += '<input type="checkbox" id="scope_read" name="scope_write" value="true" checked />\
			<label for="scope_write">\
				<p><b>Accesso in scrittura alle informazioni complete:</b> Contenuti sul Resource Server</p>\
			</label>\
		</input><br>'
	}


	// Se l'utente è loggato procede direttamente al form di autorizzazione
	if(req.session.user && req.session.login && req.session.login === "YES") {
		res.render("authorize", { 
			"authorize_url": authorize_url,
			"request_permission": request_permission,
			"client_name": app['client_name']
		})

	// Se l'utente non è loggato, prima esegue il login e poi accede al form di autorizzazione
	} else {
		res.writeHead(303, {Location: '/login?next=' + encodeURIComponent(authorize_url)});
		res.end();
	}

	

});

// res.writeHead(303, {Location: '/login?next=' + encodeURIComponent("&x_user_id=" + oauth2.serialize_string(req.session.user))});
*/






router.post(config.end_authorize, function(req, res, next) {

	var uri = ~req.url.indexOf('?') ? req.url.substr(0, req.url.indexOf('?')) : req.url;

	var client_id = (req.query.client_id || req.body.client_id)
	var redirect_uri = (req.query.redirect_uri || req.body.redirect_uri)

	var x_user_id = (req.query.x_user_id || req.body.x_user_id);
	var auth_btn = req.body.auth_btn	//Bottone premuto allow || deny

	var scope_basic = req.body.scope_basic;
	var scope_read = req.body.scope_read;
	var scope_write = req.body.scope_write;

	console.log(scope_basic)
	console.log(scope_read)
	console.log(scope_write)

	res.end("OK")

	/*
	var url = redirect_uri;

	switch(response_type) {
		case 'code': url += '?'; break;
		case 'token': url += '#'; break;
		default:
			res.writeHead(400);
			res.render('error', {err_mess: 'Il campo response_type non è valido'});
	}

	if(auth_btn === 'allow') {
		if(response_type === 'token') {
			var user_id;

			try {
				user_id = oauth2.parse_string(x_user_id);
			} catch(e) {
				console.error('allow/token error', e.stack);
				res.writeHead(500);
				return res.end(e.message);
			}

			res.end (oauth2.generateAccessToken(client_id)

		
		}
	}
	*/


});
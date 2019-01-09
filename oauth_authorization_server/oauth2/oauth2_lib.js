/* oauth2 documentazione: https://tools.ietf.org/html/rfc6749.html */

var serializer = require('serializer');

var config = require ('../config');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// Classe + Costruttore
function oauth2_lib(crypt_key, sign_key) {

	// Inizializzazione di serializer (HMAC AES256)
		// crypt_key	-> chiave di cifratura
		// sign_key		-> firma digitale
	this.serializer = serializer.createSecureSerializer(crypt_key, sign_key);

	// c = this.serializer.stringify("prova")	-> cifratura
	// m = this.serializer.parse(s)				-> decifratura

	this.access_token_expiration = config.access_token_expiration;
	this.refresh_token_expiration = config.refresh_token_expiration;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

oauth2_lib.prototype.serialize_string = function(string) {
		var c = this.serializer.stringify(string)
		return c
};

oauth2_lib.prototype.parse_string = function(user_id, client_id, scope) {
		var m = this.serializer.parse(string)
		return m
};


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

oauth2_lib.prototype.generateAccessToken = function(prms) {
		// grant_type
		// code
		// redirect_uri
		// user_id
		// client_id
		// client_secret
		// scope		
		//		basic 	-> Acesso alle informazioni di base		(Obbligatorio)
		//		read 	-> Accesso alla informazioni complete
		//      write 	-> Modifica delle informazioni complete

		var token = {};
		
		//if (prms['grant_type'] != undefined)  token ['grant_type'] = prms['grant_type'];
		if (prms['code'] != undefined)  token ['code'] = prms['code'];
		//if (prms['redirect_uri'] != undefined)  token ['redirect_uri'] = prms['redirect_uri'];
		if (prms['user_id'] != undefined)  token ['user_id'] = prms['user_id'];
		if (prms['client_id'] != undefined)  token ['client_id'] = prms['client_id'];
		if (prms['client_secret'] != undefined)  token ['client_secret'] = prms['client_secret'];
		if (prms['scope'] != undefined)  token ['scope'] = prms['scope'];

		var now = (Math.floor(Date.now() / 1000));
		var expire = (now + this.access_token_expiration);

		token['expire'] = expire;

		var c = this.serializer.stringify(token);

		return c;

}; // Ritorna una stringa che viene utilizzata come "access token"




oauth2_lib.prototype.validateAccessToken = function(access_token, scope) {
		var m = this.serializer.parse(access_token);

		var now = (Math.floor(Date.now() / 1000));
		var expired = true;													// Verifica se l'access token è scaduto
		if ( now < m['expire'] ) { expired = false } else { expired = true }


		if ( m['scope'].includes(scope) && expired == false) {
			return true;
		} else {
			return false;
		}
};	// Ritorna vero se l'access token e lo scope sono validi




oauth2_lib.prototype.generateRefreshToken = function(access_token) {
		var m = this.serializer.parse(access_token);
		
		var refresh_token = {};

		var now = (Math.floor(Date.now() / 1000));
		var expire = (now + this.refresh_token_expiration);

		refresh_token ['client_id'] = m['client_id'];
		refresh_token ['expire'] = expire;

		var c = this.serializer.stringify( refresh_token );
		return c
};



oauth2_lib.prototype.refreshAccessToken = function(access_token, ref_access_token) {
		var m1 = this.serializer.parse(access_token);
		var m2 = this.serializer.parse(ref_access_token);

		var now = (Math.floor(Date.now() / 1000));
		var expired = true;													// Verifica se il refresh token è scaduto
		if ( now < m2['expire'] ) { expired = false } else { expired = true }
		

		if ( m1['client_id'] == m2['client_id'] && expired == false) {		// Se i due client id corrispondono e il refresh token non è scaduto
			var now = (Math.floor(Date.now() / 1000));
			var new_expire = now + this.access_token_expiration;

			m1 ['expire'] = new_expire;
			var c = this.serializer.stringify( m1 );
			console.log(c)
			return c

		} else {
			return undefined;
		}

};

/*

oauth2_lib.prototype.parseAccessToken = function(access_token) {
		var m = this.serializer.parse(access_token);
		return m;
};


oauth2_lib.prototype.validateToken = function(prms, access_token) {
		var m = this.serializer.parse(access_token);

		var now = (Math.floor(Date.now() / 1000));
		var expired = ( now + this.expiration > m['expire'] ) ? true : false;	// Verifica se il token è scaduto

		if ( prms['grant_type'] === m['grant_type'] && prms['client_id'] === m['client_id'] && scope === m['scope'] && expired === false) {
			return true;
		} else {
			return false;
		}
};
*/


/*
oauth2_lib.prototype.generateAuthorizationCode = function(client_id, user_id, scope) {

};	// Ritorna una stringa che viene utilizzata come "authorization code"


oauth2_lib.prototype.getAuthorizationCode = function(client_id, user_id, scope) {

};	// CONTROLLARE https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-getauthorizationcode
*/


exports.oauth2_lib = oauth2_lib;
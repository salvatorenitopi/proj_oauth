var config = {};

config.server_port = '8000';
config.cookie_key = '0ZCV$kE_PVpo-YRJh.C5F/ovg';


config.oauth_hmac_crypt = 'MpetZfi6yNJWnwWxC4r2HcpfpHoZLVGB'
config.oauth_hmac_sign = 	't7R6NsjynLWb8GZLVgGxGxaHnpik7Kxg';


config.oauth_resource_server_id = 'oauth_resource_server';
config.oauth_resource_server_secret = 'bd2b1aaf7ef4f09be9f52ce2d8d599674d81aa9d6a4421696dc4d93dd0619d682ce56b4d64a9ef097761ced99e0f67265b5f76085e5b0ee7ca4696b2ad6fe2b2';

config.access_token_expiration = 1800;			// 30 minuti
config.refresh_token_expiration = 3888000;		// 45 giorni

//////////// ENDPOINT ////////////

config.end_debug = '/debug';
config.end_login = '/login';
config.end_logout = '/logout';

config.end_dashboard = '/private/dashboard';
config.end_update_user_info = '/private/update_user_info';
config.end_remove_client = '/private/remove_client';
config.end_add_client = '/private/add_client';
config.end_remove_authorization = '/private/remove_authorization'

config.end_authorize = '/oauth/authorize';
config.end_token = '/oauth/token';

config.end_resource_server = '/oauth/resource_server';

//////////////////////////////////



module.exports = config;
var config = {};

config.server_port = '4444';
config.cookie_key = '0ZCV$kE_PVpo-YRJh.C5F/ovg';
config.webapi_secret = 'zVMEkMvyTJPNM3hD3XrZk04Yy41cuyGOchjfa1We0orL8tgEBRYS3LQhzqzm';


config.oauth_authorization_server_host = '85.255.3.144';
config.oauth_authorization_server_port = '8000';
config.oauth_resource_server_host = '85.255.3.144';
config.oauth_resoruce_server_port = '9000';


config.client_id = '44444444';
config.client_secret = 'b8474ff280f9a804057ce0b5055919345244f0abe0184a583d903fec09786913011ede0bd7b753b1866b1dc85bbfccf6844f49721f5dec27e506e5c5d2ffc216';
config.client_scope = 'basic,read,write';


//////////// ENDPOINT ////////////

config.end_login = '/login';
config.end_logout = '/logout';
config.end_callback = '/callback';

config.end_dashboard = '/private/dashboard';
config.end_get_resource = '/private/get_resource';

//////////////////////////////////

config.oauth_authorization_server_authorize_path = "/oauth/authorize"
config.oauth_authorization_server_authorize_end = "https://" + config.oauth_authorization_server_host + ":" + config.oauth_authorization_server_port + config.oauth_authorization_server_authorize_path

config.oauth_authorization_server_token_path = "/oauth/token"
config.oauth_authorization_server_token_end = "https://" + config.oauth_authorization_server_host + ":" + config.oauth_authorization_server_port + config.oauth_authorization_server_token_path


config.redirect_uri = "https://85.255.3.144:" + config.server_port + config.end_callback


config.oauth_resource_server_resource_path = "/resource"
config.oauth_resource_server_resource_end = "https://" + config.oauth_resource_server_host + ":" + config.oauth_resoruce_server_port + config.oauth_resource_server_resource_path

module.exports = config;
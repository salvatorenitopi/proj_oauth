var config = {};

config.server_port = '3333';
config.cookie_key = '0ZCV$kE_PVpo-YRJh.C5F/ovg';
config.webapi_secret = 'zVMEkMvyTJPNM3hD3XrZk04Yy41cuyGOchjfa1We0orL8tgEBRYS3LQhzqzm';


config.oauth_authorization_server_host = '85.255.3.144';
config.oauth_authorization_server_port = '8000';
config.oauth_resource_server_host = '85.255.3.144';
config.oauth_resoruce_server_port = '9000';


config.client_id = '33333333';
config.client_secret = '733c8373edc5d58c828d4050aa493529731547eeed2bb9c3ca57da790c61171446adf27ee828e7337791b59a91dff30e9de1ce878b725dc8a4622e1e68c63f07';
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
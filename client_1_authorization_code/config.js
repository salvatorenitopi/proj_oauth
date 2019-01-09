var config = {};

config.server_port = '1111';
config.cookie_key = '0ZCV$kE_PVpo-YRJh.C5F/ovg';
config.webapi_secret = 'zVMEkMvyTJPNM3hD3XrZk04Yy41cuyGOchjfa1We0orL8tgEBRYS3LQhzqzm';


config.oauth_authorization_server_host = '85.255.3.144';
config.oauth_authorization_server_port = '8000';
config.oauth_resource_server_host = '85.255.3.144';
config.oauth_resoruce_server_port = '9000';


config.client_id = '11111111';
config.client_secret = '62670d1e1eea06b6c975e12bc8a16131b278f6d7bcbe017b65f854c58476baba86c2082b259fd0c1310935b365dc40f609971b6810b065e528b0b60119e69f61';
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
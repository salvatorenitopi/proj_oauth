var config = {};

config.server_port = '2222';
config.cookie_key = '0ZCV$kE_PVpo-YRJh.C5F/ovg';
config.webapi_secret = 'zVMEkMvyTJPNM3hD3XrZk04Yy41cuyGOchjfa1We0orL8tgEBRYS3LQhzqzm';


config.oauth_authorization_server_host = '85.255.3.144';
config.oauth_authorization_server_port = '8000';
config.oauth_resource_server_host = '85.255.3.144';
config.oauth_resoruce_server_port = '9000';


config.client_id = '22222222';
config.client_secret = '1f86c769b319d953ab017153897f602b2fac6b73b4e64bf942085bd03c414c203c9030d47f33b937c9a3e30ed3764cf60eecbfd4e2284b736302fa837f8751c4';
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
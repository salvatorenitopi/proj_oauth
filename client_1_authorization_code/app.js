// https://expressjs.com/it/advanced/best-practice-security.html

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var session = require('express-session');
var flash = require('connect-flash');
var LokiStore = require('connect-loki')(session);
var randomstring = require("randomstring");


var config = require ('./config');


// Routes
var login = require('./routes/login');
var private = require('./routes/private');



var app = express();


// helmet
app.use(helmet());

// disable x-powered-by (unsecure header)
app.disable('x-powered-by');


// view engine setup
var exphbs = require('express-handlebars');
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// IGNORA CERTIFICATO SELF-SIGNED
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// GESTIONE DELLE SESSIONI

// https://www.codementor.io/emjay/how-to-build-a-simple-session-based-authentication-system-with-nodejs-from-scratch-6vn67mcy3

var expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); // 1 hour

var LokiStore_options = {};

app.use(session({
		store: new LokiStore(LokiStore_options),
		key: config.cookie_key,
		secret: randomstring.generate({ length: 32, charset: 'alphabetic' }),
		resave: false,
		saveUninitialized: false,
		cookie: {
				secure: true,
				httpOnly: true,
				expires: expiryDate
		}
}));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
		if (req.cookies.user_sid && !req.session.user) {
				res.clearCookie(config.cookie_key);        
		}
		next();
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 


// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});




app.use('/', login);
app.use('/', private);






// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	console.error(err.stack);

	// render the error page
	res.status(err.status || 500);
	res.send("{ \"status\": \"error\", \"message\":\"" + err.message + "\"}");
});


module.exports = app;

'use strict';

let express = require('express');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let cookieParser = require('cookie-parser');
let expressValidator = require('express-validator');
let bodyParser = require('body-parser');
let methodOverride = require('method-override');
let http = require('http');
let https = require('https');
let fs = require('fs');
let errorHandler = require('errorhandler');
let passport = require('passport');

// Final Route Handler
function finalRouteHandler(req, res, next) {
  if (!this.template) return next();
  this.template(req, res, next);
}

// Not Found Handler
function NotFoundHandler(err, req, res, next) {
  // Treat as 404
  if (~err.message.indexOf('not found')) return next();

  // Log it
  console.error(err.stack);

  // Error page
  res.status(500).render('500', {
    error: err.stack
  });
}

// 404 Error Handler
function FourOFourHandler(req, res) {
  res.status(404).render('404', {
    url: req.originalUrl,
    error: 'Not found'
  });
}

class ServerEngine {

  constructor() {
    this.app = null;
    this.db = null;
    this.clever = null;
  }

  destroy() {
    this.clever = null;
    this.db = null;
    this.app = null;
  }

  initApp() {

    let config = this.app.config = this.clever.config;
    let settings = this.app.settings = this.clever.settings;

    this.app.use(function(req,res,next){
      res.setHeader('X-Powered-By','Clever');
      next();
    });

    // The cookieParser should be above session
    this.app.use(cookieParser());

    // Request body parsing middleware should be above methodOverride
    this.app.use(expressValidator({ customValidators: {
      isArray: function(value) {
        return Array.isArray(value);
      }
    }});
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    this.app.use(methodOverride());

    // Express/Mongo session storage
    this.app.use(session({
      secret: config.sessionSecret,
      store: new MongoStore({
        mongooseConnection: this.db.connection,
        collection: config.sessionCollection
      }),
      cookie: config.sessionCookie,
      name: config.sessionName,
      resave: true,
      saveUninitialized: true
    }));

    this.app.use(passport.initialize());
    this.app.use(passport.session());

    this.clever.register('passport', passport);
    require(`${config.root}/config/express`)(this.app, this.db);
    return this.app;

  }

  beginBootstrap(cleverCoreInstance, database) {

    this.clever = cleverCoreInstance;
    this.db = database;
    let config = cleverCoreInstance.config;

    // Express settings
    let app = express();
    app.useStatic = function(a, b) {
      if('undefined' === typeof b) {
        this.use(express.static(a));
      } else {
        this.use(a,express.static(b));
      }
    };

    this.app = app;

    // Register app dependency
    cleverCoreInstance.register('app', this.initApp.bind(this));

    // Listen on http.port (or port as fallback for old configs)
    let httpServer = http.createServer(app);
    cleverCoreInstance.register('http', httpServer);
    httpServer.listen(config.http ? config.http.port : config.port, config.hostname);

    if (config.https && config.https.port) {

      let httpsOptions = {
        key: fs.readFileSync(config.https.ssl.key),
        cert: fs.readFileSync(config.https.ssl.cert)
      };

      let httpsServer = https.createServer(httpsOptions, app);
      cleverCoreInstance.register('https', httpsServer);
      httpsServer.listen(config.https.port);
    }

    cleverCoreInstance.name = config.app.name;
    cleverCoreInstance.app = app;

  }

  endBootstrap(callback) {

    // We are going to catch everything else here
    // this.app.route('*').get(finalRouteHandler.bind(this));

    // Assume "not found" in the error msgs is a 404. this is somewhat
    // silly, but valid, you can do whatever you like, set properties,
    // use instanceof etc.
    // this.app.use(NotFoundHandler);

    // Assume 404 since no middleware responded
    // this.app.use(FourOFourHandler);

    // Error handler - has to be last
    if (process.env.NODE_ENV === 'development') {
      // this.app.use(errorHandler());
    }

    callback(this);
  }

  static createEngine() {
    return new ServerEngine();
  }

}

module.exports = ServerEngine;

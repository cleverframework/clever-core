'use strict';

let CleverCore = require('./clever-core');

(require('./clever-route'))(CleverCore);
(require('./platform'))(CleverCore);
(require('./config'))(CleverCore);
(require('./database'))(CleverCore);
(require('./package'))(CleverCore);
(require('./server'))(CleverCore);

module.exports = CleverCore.getInstance();

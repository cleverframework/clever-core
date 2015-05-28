
const mongoose = require('mongoose');
const Setting = require('./lib/models/setting');

mongoose.connect('mongodb://localhost/testdb');

Setting
  .getSettings()
  .then(function(settings) {
    console.log(settings);
  });

/*

'use strict';

var _createClass = (function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || true;
            descriptor.configurable = true;
            if ('value' in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
})();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}

var o = {
    ok: function ok() {
        return 'ok';
    }
};

var O = (function() {
    function O() {
        _classCallCheck(this, O);
    }

    _createClass(O, [{
        key: 'ok',
        value: function ok() {
            return 'ok';
        }
    }]);

    return O;
})();

var oo = new O();

console.log(oo.__proto__);

*/

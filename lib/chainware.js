'use strict';

let Middleware = require('./middleware')

class Chainware {

  constructor() {
    this.middleware = new Middleware();
  }

  add(event, weight, func) {

    this.middleware[event].splice(weight, 0, {
      weight: weight,
      func: func
    });

    this.middleware[event].join();

    this.middleware[event].sort(function(a, b) {
      if (a.weight < b.weight) {
        a.next = b.func;
      } else {
        b.next = a.func;
      }
      return (a.weight - b.weight);
    });
  }

  before(req, res, next) {
    if (!this.middleware.before.length) return next();
    this.chain('before', 0, req, res, next);
  }

  after(req, res, next) {
    if (!this.middleware.after.length) return next();
    this.chain('after', 0, req, res, next);
  }

  chain(operator, index, req, res, next) {
    let args = [req, res,
      function() {
        if (this.middleware[operator][index + 1]) {
          this.chain('before', index + 1, req, res, next);
        } else {
          next();
        }
      }
    ];

    this.middleware[operator][index].func.apply(this, args);
  }
}

module.exports = Chainware;

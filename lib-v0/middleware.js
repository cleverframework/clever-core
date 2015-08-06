'use strict';

class Middleware {
  constructor() {
    this.before = [];
    this.after = [];
  }

  destroy() {
    this.before = null;
    this.after = null;
  }
}

module.exports = Middleware;

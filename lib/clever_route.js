'use strict';

class CleverRoute {
  constructor(router, admin, mountOnRoot) {
    this.router = router;
    this.admin = admin;
    this.mountOnRoot = mountOnRoot;
  }
}

module.exports = function(CleverCore) {
  CleverCore.prototype.CleverRoute = CleverRoute;
};

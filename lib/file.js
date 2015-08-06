'use strict';

class File {
  constructor(router, type, mountOnRoot) {
    this.router = router;
    this.type = type;
    this.mountOnRoot = mountOnRoot;
  }
}

module.exports = CleverRoute;

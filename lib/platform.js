'use strict';

class Platform {

  isWin() {
    //its always win32 even if its a x64 system
    return process.platform === 'win32';
  }

  isMac() {
    return process.platform === 'darwin';
  }

  isLinux() {
    return process.platform === 'linux';
  }

}

module.exports = function(cleverCoreInstance) {
  cleverCoreInstance.prototype.platform = new Platform();
};

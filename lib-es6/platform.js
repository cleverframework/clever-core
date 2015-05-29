'use strict';

class Platform {

  static isWin() {
    //its always win32 even if its a x64 system
    return process.platform === 'win32';
  }

  static isMac() {
    return process.platform === 'darwin';
  }

  static sLinux() {
    return process.platform === 'linux';
  }

}

module.exports = Platform;

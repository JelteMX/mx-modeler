'use strict';

const spawn = require('child_process').spawn;

class Runner {

  constructor() {
    this.MODELER_ARGS = '/file:{path}';
  }

  _spawn(exe, arg) {
    var child = spawn(exe, arg ? [arg] : [], {
      detached: true
    });
    child.unref();
    process.exit(0);
  }

  run(exe, file) {
    this._spawn(exe, file);
  }

  runVersionSelector(exe, file) {
    if (file) {
      var arg = this.MODELER_ARGS.replace('{path}', file);
      this._spawn(exe, arg);
    } else {
      this._spawn(exe, null);
    }

  }
}

module.exports = new Runner();

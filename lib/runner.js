'use strict';

var spawn = require('child_process').spawn;

var Runner = function () {
  this.MODELER_ARGS = "/file:{path}";
};

Runner.prototype._spawn = function (exe, arg) {
  var child = spawn(exe, [arg], {
    detached: true
  });
  child.unref();
  process.exit(0);
};

Runner.prototype.run = function (exe, file) {
  this._spawn(exe, file);
};

Runner.prototype.runVersionSelector = function (exe, file) {
  var arg = this.MODELER_ARGS.replace("{path}", file);
  this._spawn(exe, arg);
};

module.exports = new Runner();

'use strict';

var sqlite3 = require('sqlite3').verbose(),
    chalk = require('chalk');

var MPRChecker = function () {

};

MPRChecker.prototype.check = function (mprFile) {
  var db = new sqlite3.Database(mprFile),
      rows = [];

  db.serialize(function() {
    db.each("SELECT * FROM _MetaData LIMIT 1", function (err, row) {
      if (err) {
        console.log(chalk.red('Error reading .MPR file: ') + err.toString());
      } else {
        rows.push(row);
      }
    }, function () {
      if (rows.length === 1) {
        var metaData = rows[0];
        if (metaData._ProductVersion && metaData._BuildVersion) {
          var msg = [
            chalk.cyan(' Info:'),
            '',
            '    Modeler version: ' + chalk.cyan(metaData._ProductVersion),
            '    Build version:   ' + chalk.cyan(metaData._BuildVersion),
            ''
          ].join('\n');
          console.log(msg);
        } else {
          console.log(chalk.red('Error reading .MPR file, cannot find metadata'));
        }
      } else {
        console.log(chalk.red('Error reading .MPR file, cannot find version'));
      }
    });
  });

  db.close();

};

module.exports = new MPRChecker();

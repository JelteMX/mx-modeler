'use strict';

const sqlite3 = require('sqlite3').verbose();
const chalk = require('chalk');

const check = (mprFile) => {
  const db = new sqlite3.Database(mprFile);
  const rows = [];

  db.serialize(() => {
    db.each('SELECT * FROM _MetaData LIMIT 1', (err, row) => {
      if (err) {
        console.log(chalk.red('Error reading .MPR file: ') + err.toString());
      } else {
        rows.push(row);
      }
    }, () => {
      if (rows.length === 1) {
        const metaData = rows[0];
        if (metaData._ProductVersion && metaData._BuildVersion) {
          const msg = [
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
}

module.exports = {
  check
};

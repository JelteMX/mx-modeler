'use strict';

var optimist = require('optimist'),
    chalk = require('chalk'),
    _ = require('lodash'),
    updateNotifier = require('update-notifier'),
    path = require('path'),
    fs = require('fs'),
    currentFolder = path.resolve('./') + '/',
    pkg = require('./package.json'),
    versionSelector = require("node-mendix-modeler-path"),
    modelerPaths = require("./lib/modeler-paths"),
    mendixRunner = require("./lib/runner");

var banner = [
  '',
  chalk.bold.cyan('  __  ____   __') + '                    _      _             ',
  chalk.bold.cyan(' |  \\/  \\ \\ / /') + '                   | |    | |           ',
  chalk.bold.cyan(' | \\  / |\\ V /') + ' _ __ ___   ___   __| | ___| | ___ _ __  ',
  chalk.bold.cyan(' | |\\/| | > <') + ' | \'_ ` _ \\ / _ \\ / _\` |/ _ \\ |/ _ \\ \'__| ',
  chalk.bold.cyan(' | |  | |/ . \\') + '| | | | | | (_) | (_| |  __/ |  __/ |    ',
  chalk.bold.cyan(' |_|  |_/_/ \\_\\') + '_| |_| |_|\\___/ \\__,_|\\___|_|\\___|_|    ',
  '',
  ' Command-line client, version: ' + pkg.version,
  ' Issues? Please report them at : ' + chalk.cyan(pkg.bugs.url),
  ''
].join('\n');

var argv = optimist
  .usage(' Usage : ' + chalk.bold.cyan('mx-modeler [OPTIONS] [<file.mpk>]'))
  .boolean('u')
    .alias('u', 'update')
    .describe('u', 'Checks if there is an update for mx-modeler')
  .boolean('l')
    .alias('l', 'list')
    .describe('l', 'List all modeler versions')
  .string('v')
    .alias('v', 'version')
    .describe('v', 'Use a specific version to open the project. Usage: \'-v 6.0.0 <project.mpr>\'')
  .boolean('h')
    .alias('h', 'help')
    .describe('h', 'Shows this help screen')
  .argv;

var files = argv._;

var checkFile = function (filename) {
  var file = path.resolve(currentFolder, filename);

  try {
    var f = fs.statSync(file);
  } catch (e) {
    console.log(chalk.red(' Error: ') + 'Cannot find/read file ' + files[0] + '\n');
    process.exit(1);
  }

  if (path.parse(file).ext !== '.mpr' && path.parse(file).ext !== '.mpk'){
    console.log(chalk.red(' Error: ') + 'The specified file needs to be .mpr of .mpk, ' + files[0] + ' is not valid\n');
    process.exit(1);
  }

  return file;
}

// RUN THE CLIENT

console.log(banner);

if (versionSelector.err !== null) {
  // Versionselector cannot find association for .mpr files, which means Mendix is not installed or your not working on Windows
  console.log(chalk.red(' Error: ') + versionSelector.err + '\n');
  process.exit(1);
} else if (argv.update) {
  // CHECK FOR UPDATES
  console.log(chalk.cyan('\n Checking for an update'));
  updateNotifier({
    pkg: pkg,
    callback: function(err, update) {
      if (err) {
        console.log(chalk.red('\n Error checking the update : '), err, '\n');
      } else {
        if (update.latest !== update.current) {
          console.log(chalk.green(' Update available! Run ') + chalk.bold.cyan('npm update -g mx-modeler') + chalk.green(' to install version ') + chalk.bold.cyan(update.latest) + '\n');
        } else {
          console.log(chalk.green(' You are running the latest version :-)\n'));
        }
      }
      process.exit(0);
    }
  });
} else if (argv.list) {
  // SHOW A LIST
  if (modelerPaths.err !== null) {
    console.log(chalk.red(' Error: ') + modelerPaths.err + '\n');
    process.exit(1);
  } else if (modelerPaths.output && modelerPaths.output.modelers && modelerPaths.output.versions) {
    var msg = [
      ' The following Modeler versions are found: ',
      '',
      _.map(modelerPaths.output.versions, function (ver) { return '    ' + ver; }).join('\n'),
      ''
    ].join('\n');
    console.log(msg);
  }
} else if (argv.version && files.length === 1) {
  // RUN THE FILE WITH A SPECIFIC VERSION
  if (modelerPaths.err !== null) {
    console.log(chalk.red(' Error: ') + modelerPaths.err + '\n');
    process.exit(1);
  }
  if (modelerPaths.output && modelerPaths.output.versions && modelerPaths.output.modelers[argv.version]) {
    var modelerPath = modelerPaths.output.modelers[argv.version],
        file = checkFile(files[0]);
    if (file) {
      console.log(' Running ' + chalk.cyan(file) + ' on Modeler version ' + chalk.cyan(argv.version) + '\n');
      mendixRunner.run(modelerPath, file);
    }
  } else {
    console.log(chalk.red(' Error: ') + 'Cannot find specified version: ' + argv.version + '\n');
  }
} else if (argv.help/* || files.length !== 1*/) {
  console.log(optimist.help());
  process.exit(0);
} else {
  var file = checkFile(files[0]);
  if (file) {
    console.log(' Running ' + chalk.cyan(file) + '\n');
    mendixRunner.runVersionSelector(versionSelector.output.cmd, file);
  }
}

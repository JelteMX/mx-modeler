'use strict';

const path = require('path');
const fs = require('fs');

const optimist = require('optimist');
const chalk = require('chalk');
const _ = require('lodash');
const updateNotifier = require('update-notifier');
const versionSelector = require('node-mendix-modeler-path');

const currentFolder = path.resolve('./') + '/';
const pkg = require('./package.json');

const modelerPaths = require('./lib/modeler-paths');
const mendixRunner = require('./lib/runner');
const { check } = require('./lib/mpr-check');

const banner = [
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

const argv = optimist
  .usage(' Usage : ' + chalk.bold.cyan('mx-modeler [OPTIONS] [<file.mpk>]'))
  .boolean('u')
    .alias('u', 'update')
    .describe('u', 'Checks if there is an update for mx-modeler')
  .boolean('l')
    .alias('l', 'list')
    .describe('l', 'List all modeler versions')
  .boolean('c')
    .alias('c', 'check')
    .describe('c', 'Check the the modeler version for a .mpr file. Usage: \'-c <project.mpr>\'')
  .string('f')
    .alias('f', 'flags')
    .describe('f', 'Start the modeler with extra feature flags. Should not contain dashes(--) an comma separated. Usage: \'-a enable-jsactions,some-future-flag\'')
  .string('v')
    .alias('v', 'version')
    .describe('v', 'Use a specific version to open the project. Usage: \'-v 6.0.0 <project.mpr>\'')
  .boolean('h')
    .alias('h', 'help')
    .describe('h', 'Shows this help screen')
  .argv;

const files = argv._;

const checkFile = (filename, extensions) => {
  const file = path.resolve(currentFolder, filename);

  if (!extensions) {
    extensions = ['.mpr', '.mpk'];
  }

  try {
    const f = fs.statSync(file);
  } catch (e) {
    console.log(chalk.red(' Error: ') + 'Cannot find/read file ' + files[0] + '\n');
    process.exit(1);
  }

  if (extensions.indexOf(path.parse(file).ext) === -1){
    console.log(chalk.red(' Error: ') + 'The specified file needs to be of type ' + chalk.cyan(extensions.join('/')) + ', "' + files[0] + '" is not a valid file \n');
    process.exit(1);
  }

  return file;
};

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
    const msg = [
      ' The following Modeler versions are found: ',
      '',
      _.map(
        modelerPaths.output.versions,
        (ver) => { return '    ' + ver; }
      ).join('\n'),
      ''
    ].join('\n');
    console.log(msg);
  }
} else if (argv.help || files.length > 1) {
  // We do not have a file (or the arguments length !== 1, meaning multiple files)
  console.log(optimist.help());
  process.exit(0);
} else if (argv.version) {
  let featureFlags = [];

  if (argv.flags) {
    featureFlags = argv.flags.split(',').map(f => f && f.length ? '--' + f : null).filter(f => f !== null);
  }

  // RUN THE FILE WITH A SPECIFIC VERSION
  if (modelerPaths.err !== null) {
    console.log(chalk.red(' Error: ') + modelerPaths.err + '\n');
    process.exit(1);
  }

  if (!modelerPaths.output) {
    console.log(chalk.red(' Error: ') + 'I have no output of modelers, unexpected');
    process.exit(1);
  }

  const version = argv.version.split('.').length < 3 ? argv.version + '.' : argv.version;
  const filteredKeys = Object.keys(modelerPaths.output.modelers).filter(k => k.indexOf(version) !== -1);
  const filteredKey = filteredKeys.length === 1 ? filteredKeys[0] : null;

  if (filteredKeys.length > 1) {
    console.log(chalk.red(' Error: ') + 'I have multiple candidates, please specify: ' + filteredKeys.join(', ') + '\n');
  } else if (filteredKey !== null && modelerPaths.output.versions && modelerPaths.output.modelers[filteredKey]) {
    const modelerPath = modelerPaths.output.modelers[filteredKey];

    if (files[0]) {
      const file = checkFile(files[0]);
      if (file) {
        console.log(' Running ' + chalk.cyan(file) + ' on Modeler version ' + chalk.cyan(filteredKey) + '\n');
        mendixRunner.run(modelerPath, file, featureFlags);
      }
    } else {
      console.log(' Running Modeler version ' + chalk.cyan(filteredKey) + '\n');
      mendixRunner.run(modelerPath, null, featureFlags);
    }

  } else {
    console.log(chalk.red(' Error: ') + 'Cannot find specified version: ' + argv.version + '\n');
  }
} else if (argv.check && files.length === 1) {
  // Check an mpr file
  const file = checkFile(files[0], ['.mpr']);
  if (file) {
    console.log(' Checking the modeler version of ' + chalk.cyan(file) + '\n');
    check(file);
  }
} else {
  if (files[0]) {
    const file = checkFile(files[0]);
    if (file) {
      console.log(' Running ' + chalk.cyan(file) + '\n');
      mendixRunner.runVersionSelector(versionSelector.output.cmd, file);
    }
  } else {
    // We do not have a file (or the arguments length !== 1, meaning multiple files)
    console.log(optimist.help());
    process.exit(0);
  }
}

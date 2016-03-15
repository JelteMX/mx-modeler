/*jshint -W069 */
'use strict';

var fs = require('fs'),
    path = require('path'),
    os = require('os'),
    _ = require('lodash'),
    pad = require('pad');

var paths = {
	err: null,
	output: null
};

function sortVersion (a, b) {
  var left =  parseInt(_.map(a.split(/\./), function (v) { return pad(3, v, '0'); }).join(''), 10);
  var right = parseInt(_.map(b.split(/\./), function (v) { return pad(3, v, '0'); }).join(''), 10);
  return left - right;
}

function getDirectories(srcpath) {
  try {
    return fs.readdirSync(srcpath).filter(function(file) {
      return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
  } catch (e) {
    return null;
  }
}

function getFile(path) {
 try {
   return fs.statSync(path).isFile();
 } catch (e) {
   return false;
 }
}

function getMendixVersionsDirty(programFilesPath) {
  var MendixInstallPath = path.join(programFilesPath, '/Mendix/'),
      directories = getDirectories(MendixInstallPath),
      modelers = {},
      versions = [],
      versionTest = /\d+.\d+.\d+/;

  if (directories) {
    _.each(directories, function (directory) {
      var modelerPath = path.join(MendixInstallPath, directory, 'modeler/Modeler.exe');
      if (versionTest.test(directory) && getFile(modelerPath)) {
        modelers[directory] = modelerPath;
        versions.push(directory);
      }
    });
    if (!paths.output.modelers) {
      paths.output.modelers = {};
    }
    if (!paths.output.versions) {
      paths.output.versions = [];
    }
    paths.output.modelers = _.assign(paths.output.modelers, modelers);
    paths.output.versions = paths.output.versions.concat(versions).sort(sortVersion);
  }

  if (paths.output.versions.length === 0) {
    paths.err = 'Cannot find any Mendix version';
  }
}

function getDirty () {
  var programFilesPath = process.env['ProgramFiles'],
      programFilesPathX86 = process.env['ProgramFiles(x86)'];

  if (programFilesPath) {
    getMendixVersionsDirty(programFilesPath);
  }
  if (programFilesPathX86) {
    getMendixVersionsDirty(programFilesPathX86);
  }
}

function findPaths () {
  if (!process.env.LOCALAPPDATA) {
    paths.err = 'Cannot find Local data path (process environment variable LOCALAPPDATA)';
  } else {
    var localAppDataPath = process.env.LOCALAPPDATA,
        mendixLocalAppDataPathJSON = path.join(localAppDataPath, '/Mendix/versionSelector.json'),
        versionSelectorFile = false;

    try {
      var json = fs.readFileSync(mendixLocalAppDataPathJSON);
      versionSelectorFile = JSON.parse(json);
    } catch (err) {
      versionSelectorFile = false;
      paths.err = 'Cannot access/find ' + mendixLocalAppDataPathJSON + ' || Error:  ' + err.toString();
    }

    if (versionSelectorFile && versionSelectorFile.Associations) {
      paths.output = {};
      var modelers = _.transform(versionSelectorFile.Associations, function (result, value, key) {
        if (value.ModelerExePath) {
          result[key] = value.ModelerExePath;
        }
      });
      paths.output.modelers = modelers;
      paths.output.versions = Object.keys(modelers).sort(sortVersion);
    }

    if (paths.output.versions.length === 0) {
      // Version selector 4 does not use the json anymore, we'll go dirty checking
      getDirty();
    }
  }
}

if (os.platform() !== 'win32') {
	paths.err = 'Unfortunately this feature only works in Windows...';
} else {
	findPaths();
}

module.exports = paths;

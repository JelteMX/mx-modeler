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
    } catch (e) {
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
  }
}

if (os.platform() !== 'win32') {
	paths.err = 'Unfortunately this feature only works in Windows...';
} else {
	findPaths();
}

module.exports = paths;

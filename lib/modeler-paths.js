/*jshint -W069 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const _ = require('lodash');
const pad = require('pad');

const paths = {
	err: null,
	output: null
};

const sortVersion = (a, b) => {
  var left =  parseInt(_.map(a.split(/\./), function (v) { return pad(3, v, '0'); }).join(''), 10);
  var right = parseInt(_.map(b.split(/\./), function (v) { return pad(3, v, '0'); }).join(''), 10);
  return left - right;
}

const getDirectories = (srcpath) => {
  try {
    return fs.readdirSync(srcpath).filter((file) => {
      return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
  } catch (e) {
    return null;
  }
}

const getFile = (path) => {
 try {
   return fs.statSync(path).isFile();
 } catch (e) {
   return false;
 }
}

const getMendixVersionsDirty = (programFilesPath) => {
  const MendixInstallPath = path.join(programFilesPath, '/Mendix/');
  const directories = getDirectories(MendixInstallPath);
  const modelers = {};
  const versions = [];
  const versionTest = /\d+.\d+.\d+/;

  if (directories) {

    _.each(directories, (directory) => {
      const modelerPath = path.join(MendixInstallPath, directory, 'modeler/Modeler.exe');
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

const getDirty = () => {
  const programFilesPath = process.env['ProgramFiles'];
  const programFilesPathX86 = process.env['ProgramFiles(x86)'];

  if (programFilesPath) {
    getMendixVersionsDirty(programFilesPath);
  }
  if (programFilesPathX86) {
    getMendixVersionsDirty(programFilesPathX86);
  }
}

const findPaths = () => {
  if (!process.env.LOCALAPPDATA) {
    paths.err = 'Cannot find Local data path (process environment variable LOCALAPPDATA)';
  } else {
    const localAppDataPath = process.env.LOCALAPPDATA;
    const mendixLocalAppDataPathJSON = path.join(localAppDataPath, '/Mendix/versionSelector.json');

    let versionSelectorFile = false;

    try {
      const json = fs.readFileSync(mendixLocalAppDataPathJSON);
      versionSelectorFile = JSON.parse(json);
    } catch (err) {
      versionSelectorFile = false;
      paths.err = 'Cannot access/find ' + mendixLocalAppDataPathJSON + ' || Error:  ' + err.toString();
    }

    if (versionSelectorFile && versionSelectorFile.Associations) {
      paths.output = {};
      const modelers = _.transform(versionSelectorFile.Associations, (result, value, key) => {
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

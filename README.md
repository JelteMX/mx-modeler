# Mendix command-line tool for NodeJS [![npm version](https://badge.fury.io/js/mx-modeler.svg)](http://badge.fury.io/js/mx-modeler)

[![NPM](https://nodei.co/npm/mx-modeler.svg?downloads=true&stars=true)](https://nodei.co/npm/mx-modeler/)

**This tool is in beta**

> Start your Mendix projects from command-line.

## About

Starting your Mendix projects from the command-line. This tool obviously only works in Windows. Built and tested on Windows 7.

## Install

Make sure you have Node.JS installed.

Run:

```bash
	npm install mx-modeler -g
```

This will install the tool globally.

## Usage

Run it in your folder where you have your project file

```bash
	mx-modeler Project.mpr
```

## Further options

```
	> mx-modeler -h

    __  ____   __                    _      _
   |  \/  \ \ / /                   | |    | |
   | \  / |\ V / _ __ ___   ___   __| | ___| | ___ _ __
   | |\/| | > < | '_ ` _ \ / _ \ / _` |/ _ \ |/ _ \ '__|
   | |  | |/ . \| | | | | | (_) | (_| |  __/ |  __/ |
   |_|  |_/_/ \_\_| |_| |_|\___/ \__,_|\___|_|\___|_|

   Command-line client, version: 1.3.0
   Issues? Please report them at : https://github.com/JelteMX/mx-modeler/issues

   Usage : mx-modeler [OPTIONS] [<file.mpk>]

  Options:
    -u, --update   Checks if there is an update for mx-modeler
    -l, --list     List all modeler versions
    -c, --check    Check the the modeler version for a .mpr file
    -v, --version  Use a specific version to open the project. Usage: '-v 6.0.0 <project.mpr>'
    -h, --help     Shows this help screen

```

## License

The MIT License (MIT)

Copyright (c) 2016 J.W. Lagendijk <jelte.lagendijk@mendix.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

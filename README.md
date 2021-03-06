# babel-plugin-rn-platform-specific-extensions

[![NPM version](http://img.shields.io/npm/v/babel-plugin-rn-platform-specific-extensions.svg)](https://www.npmjs.org/package/babel-plugin-rn-platform-specific-extensions)
[![Build Status](https://travis-ci.org/shinken008/babel-plugin-rn-platform-specific-extensions.svg?branch=main)](https://travis-ci.org/shinken008/babel-plugin-rn-platform-specific-extensions)
[![Coverage Status](https://coveralls.io/repos/github/shinken008/babel-plugin-rn-platform-specific-extensions/badge.svg?branch=main)](https://coveralls.io/github/shinken008/babel-plugin-rn-platform-specific-extensions?branch=main)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)
[![Greenkeeper badge](https://badges.greenkeeper.io/shinken008/babel-plugin-rn-platform-specific-extensions.svg)](https://greenkeeper.io/)

Allow [react-native platform specific extensions](https://reactnative.dev/docs/platform-specific-code/#platform-specific-extensions) to be used for other file types than Javascript inspired by [react-native-platform-specific-extensions](https://github.com/kristerkari/babel-plugin-react-native-platform-specific-extensions).

Example:

`import styles from "./styles.css";`

* `styles.android.css` <- Android only
* `styles.ios.css` <- iOS only
* `styles.native.css` <- Both Android and iOS
* `styles.rn.css` <- rn only
* `styles.css` <- Default. Android, iOS and Web

## Usage

### Step 1: Install

```sh
yarn add --dev babel-plugin-rn-platform-specific-extensions
```

or

```sh
npm install --save-dev babel-plugin-rn-platform-specific-extensions
```

### Step 2: Configure `.babelrc`

You must give one or more file extensions inside an array in the plugin options.

```
{
  "presets": [
    "react-native"
  ],
  "plugins": [
    ["rn-platform-specific-extensions", {
      // default ["os", "native", "rn"]. 'os' includes 'ios' and 'andriod'
      "platforms": ["os", "native", "rn"],
      "extensions": [".css", ".scss", ".sass"],
      // default [".tsx", ".ts", ".jsx", ".js"]. Recommand custom config, should be prioritized by language
      "omitExtensions": [".tsx", ".ts", ".jsx", ".js"],
      "include": [
        "workspaceFolder/src/external",
        {
          // especially config, modify current file path
          'node_modules/metro/src/node-haste/DependencyGraph/assets/empty-module.js': 'entry path.js',
        }
      ],
    }]
  ]
}
```

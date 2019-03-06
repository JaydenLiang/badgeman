'use strict';
/**
 * Badgeman is a tool that generates a shields.io badge for a GitHub project.
 * Could append these badges to a specific line of a specific file.
 * It currently conforms to Semantic Versioning 2.0.0 (https://semver.org/#semantic-versioning-200)
 *
 * To install as a global package: run `npm i -g` on this package root.
 *
 * Usage: `run node . --help` on this package root for more information
 *
 * author: jliang01@fortinet.com
 */

/* eslint-disable no-unused-vars */
exports = module.exports;
const path = require('path'),
    fs = require('fs');

let _init = false;

const
    BADGE_KEY_CODESIZE = 'codesize',
    BADGE_KEY_PACKAGEVERSION = 'packageversion';

function readNpmPackage(filePath) {
    try {
        const content = fs.readFileSync(filePath).toString('utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('error occurs in readNpmPackage:',
            `file path: ${filePath}`,
            `error: ${JSON.stringify(error)}`);
    }
}

function getRealPath(packageRootPath) {
    const realPath = path.resolve(process.cwd(), packageRootPath);
    return realPath && realPath.indexOf(process.cwd()) === 0 && realPath;
}

function init() {
    if (!_init) {
        _init = true;
    }
    return _init;
}

class Badgeman {
    constructor() {
        this._workingPackageRootPath = null;
        this._workingPackageJsonPath = null;
        this._packageInfo = null;
        this._gitHubUserName = null;
        this._gitHubRepoNmae = null;
        this._markdown = false;
        this._badgesExpressions = new Map();
    }

    get workingPackageJsonPath() {
        return this._workingPackageJsonPath;
    }

    /**
     * Set the working directory of a given package
     * @param {PathLikeString} packageRootPath a real path to the package root directory
     * where the npm package.json is situated.
     * @returns {Verman} instance itself
     */
    set workingPackage(packageRootPath) {
        const realPath = getRealPath(packageRootPath);
        if (!realPath) {
            const errorMessage = 'error occurs in setWorkingPackage: ' +
            `${packageRootPath} is invalid or not in current working directory.`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
        this._workingPackageRootPath = realPath;
        this._workingPackageJsonPath = path.resolve(realPath, 'package.json');
        init(this);
        return this;
    }

    set markdown(bool) {
        this._markdown = !!bool;
    }

    /**
     * set the style from: plastic | flat | flat-square | for-the-badge | popout |
     * popout-square | social
     * @param {String} name the style name
     */
    set style(name) {
        this.applyStyle(name);
    }

    applyStyle(name) {
        if (name && name !== true && ['plastic', 'flat', 'flat-square', 'for-the-badge',
            'popout', 'popout-square', 'social'].includes(name.toString().trim())) {
            this._styleName = name.toString().trim();
            // apply style to all badges
        }
    }

    /**
     * Set the repo to create badges for
     * @param {String} user the GitHub user of a repo
     * @param {String} repo the repo name
     */
    setRepo(user, repo) {
        this._gitHubUserName = user;
        this._gitHubRepoNmae = repo;
    }

    addCodeSize(overrideOptions = null) {
        this._badgesExpressions.set(BADGE_KEY_CODESIZE,
            {exp: 'https://img.shields.io/github/package-json/v/{user}/{repo}.svg{parameters}',
                options: overrideOptions});
    }

    addPackageVersion(branch = null, overrideOptions = null) {
        let exp = branch ?
            `https://img.shields.io/github/package-json/v/{user}/{repo}/${branch}.svg{parameters}` :
            'https://img.shields.io/github/package-json/v/{user}/{repo}.svg{parameters}';
        this._badgesExpressions.set(BADGE_KEY_PACKAGEVERSION,
            {
                exp: exp,
                options: overrideOptions
            });
    }

    addCustomSimpleBadge(label, color) {

    }

    /**
     * Insert all badges to a file
     * @param {path-like-string} filePath the real path of the file to insert to
     * @param {Number} lineNum the line number to insert
     * @returns {Badgement} the badgeman object itself
     */
    insertTo(filePath, lineNum) {
        try {
            this._packageInfo.version = this._semver;
            fs.writeFileSync(path.resolve(this._workingPackageRootPath, 'package.json'),
                JSON.stringify(this._packageInfo, null, 4));
            return this;
        } catch (error) {
            console.error('error occurs in saveToNpmPackage:',
            `error: ${JSON.stringify(error)}`);
            throw error;
        }
    }
}

module.exports = Badgeman;

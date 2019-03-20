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
    fs = require('fs'),
    colors = require('colors/safe');

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
    if (!(realPath && realPath.indexOf(process.cwd()) === 0)) {
        throw new Error(`Invalid path. Path: ${packageRootPath} cannot be resolved to ` +
        `${process.cwd()}`);
    }
    return realPath && realPath.indexOf(process.cwd()) === 0 && realPath;
}

function init() {
    if (!_init) {
        _init = true;
    }
    return _init;
}

function getFullyQualifiedEndpoint(badgeman, badgeName) {
    return `${badgeman._endpointURL}/metadata/badges/${badgeName}`;
}

function findNextNewLine(lines, fromLine = 0) {
    let lineNum = fromLine;
    while (lines[lineNum].trim() !== '') {
        lineNum ++;
    }
    return lineNum;
}

const BADGE_COLOR = ['lightgrey', 'grey'];
const BADGE_STYLE = ['flat'];


function getBadgeColor(color) {
    return BADGE_COLOR.includes(color) ? color : BADGE_COLOR[0];
}

function getBadgeStyle(style) {
    return BADGE_STYLE.includes(style) ? style : BADGE_STYLE[0];
}

class Badge {
    constructor(label, defaultMessage = '') {
        this._label = label && (label !== true && label.toString().trim() || '');
        this._defaultMessage = defaultMessage &&
            (defaultMessage !== true && defaultMessage.toString().trim() || '');
    }

    static get COLOR_LIGHT_GREY() {
        return getBadgeColor('lightgrey');
    }
    static get COLOR_GREY() {
        return getBadgeColor('grey');
    }

    static get STYLE_FLAT() {
        return getBadgeStyle('flat');
    }
}

class CodeSizeBadge extends Badge {
    constructor(username, repoName, branchName = 'master', defaultMessage = '',
        style = Badge.STYLE_FLAT) {
        super('Code Size', defaultMessage);
        this._styleName = style;
        this._username = username;
        this._repoName = repoName;
        this._branchName = branchName;
    }

    toString() {
        return `[![${this._label}](https://img.shields.io/github/languages/code-size/` +
        `${this._username}/${this._repoName}.svg?` +
        `style=${this._styleName})](${this._defaultMessage})`;
    }
}

class RepoSizeBadge extends Badge {
    constructor(username, repoName, branchName = 'master', defaultMessage = '',
        style = Badge.STYLE_FLAT) {
        super('Code Size', defaultMessage);
        this._styleName = style;
        this._username = username;
        this._repoName = repoName;
        this._branchName = branchName;
    }

    toString() {
        return `[![${this._label}](https://img.shields.io/github/repo-size/` +
        `${this._username}/${this._repoName}.svg?` +
        `style=${this._styleName})](${this._defaultMessage})`;
    }
}

class PackageVersionBadge extends Badge {
    constructor(username, repoName, branchName = 'master', defaultMessage = '',
        style = Badge.STYLE_FLAT) {
        super('Code Size', defaultMessage);
        this._styleName = style;
        this._username = username;
        this._repoName = repoName;
        this._branchName = branchName;
    }

    toString() {
        return `[![${this._label}](https://img.shields.io/github/package-json/v/` +
        `${this._username}/${this._repoName}/${this._branchName}.svg?` +
        `style=${this._styleName})](${this._defaultMessage})`;
    }
}

class LatestTagBadge extends Badge {
    constructor(username, repoName, prerelease = false, defaultMessage = '',
        style = Badge.STYLE_FLAT) {
        super('Code Size', defaultMessage);
        this._styleName = style;
        this._username = username;
        this._repoName = repoName;
        this._prerelease = !!prerelease;
    }

    toString() {
        return `[![${this._label}](https://img.shields.io/github/tag` +
        `${this._prerelease ? '-pre' : ''}` +
        `/${this._username}/${this._repoName}.svg?` +
        `style=${this._styleName})](${this._defaultMessage})`;
    }
}

class CustomBadge extends Badge {
    constructor(endpointURL, label, defaultMessage = '', style = Badge.STYLE_FLAT) {
        super(label, defaultMessage);
        this._styleName = style;
        this._endpointURL = endpointURL;
    }

    static create(endpointURL, label, message, schema = null) {
        let badge = new CustomBadge(endpointURL, label, message);
        if (!schema) {
            badge.schema = CustomBadge.createSchema(label, message);
        } else {
            badge.schema = schema;
        }
        return badge;
    }

    static createGitHubEndpoint(username, repoName, branchName = 'master') {
        return `https://raw.githubusercontent.com/${username}/${repoName}/${branchName}`;
    }

    // eslint-disable-next-line max-params
    static createSchema(label, message,
        color = Badge.COLOR_LIGHT_GREY,
        labelColor = Badge.COLOR_GREY,
        style = Badge.STYLE_FLAT,
        isError = false, cacheSeconds = 300,
        namedLogo = 'none', logoSvg = 'none',
        logoColor = 'none', logoWidth = 'none', logoPosition = 'none') {
        let schema = {
            label: label,
            message: message,
            style: style ? style : Badge.STYLE_FLAT
        };

        if (color) {
            schema.color = color ? color : Badge.COLOR_LIGHT_GREY;
        }

        if (labelColor) {
            schema.labelColor = labelColor ? labelColor : Badge.COLOR_GREY;
        }

        if (isError) {
            schema.isError = true;
        }

        if (cacheSeconds && isNaN(cacheSeconds)) {
            schema.cacheSeconds = 300;
        } else if (!isNaN(cacheSeconds)) {
            schema.cacheSeconds = parseInt(cacheSeconds) > 0 ? parseInt(cacheSeconds) : 300;
        }

        if (namedLogo) {
            schema.namedLogo = namedLogo;
        }

        if (logoSvg) {
            schema.namedLogo = namedLogo;
        }
        if (logoColor) {
            schema.namedLogo = logoColor;
        }

        if (logoWidth) {
            schema.logoWidth = isNaN(logoWidth) ? 0 : parseInt(logoWidth);
        }

        if (logoPosition) {
            schema.logoPosition = isNaN(logoPosition) ? 0 : parseInt(logoPosition);
        }

        return schema;

    }

    get schema() {
        return this._schema;
    }

    /**
     * Endpoint schema
     * @param {SchemaObject} schema an endpoint schema object
     * @see https://shields.io/endpoint
     */
    set schema(schema) {
        this._schema = schema;
    }

    set endpointURL(url) {
        this._endpointURL = url;
    }

    get endpointURL() {
        return this._endpointURL;
    }

    toString(name = '') {
        if (!this._endpointURL) {
            throw new Error('no endpoint URL provided.');
        }
        return `[![${this._label}](https://img.shields.io/endpoint.svg?url=` +
        `${encodeURIComponent(getFullyQualifiedEndpoint(this, name))}` +
        `&style=${this._styleName})](${this._defaultMessage})`;
    }
}

class Badgeman {
    constructor(username, repoName, branchName = 'master') {
        this._workingPackageRootPath = null;
        this._workingPackageJsonPath = null;
        this._packageInfo = null;
        this._username = username;
        this._repoName = repoName;
        this._branchName = branchName;
        this._markdown = false;
        this._styleName = null;
        this._badgeMap = new Map();
    }

    static get SCHEMA_VERSION() {
        return 1;
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

    get style() {
        return this._styleName;
    }

    /**
     * set the style from: plastic | flat | flat-square | for-the-badge | popout |
     * popout-square | social
     * @param {String} name the style name
     */
    set style(name) {
        const styleName = getBadgeStyle(name);
        if (styleName !== name) {
            throw new Error('Style name not supported.');
        }
        this._styleName = styleName;
    }

    addBadge(badge, key = null) {
        if (!(badge instanceof Badge)) {
            throw new Error('Not a valid badge type:', JSON.stringify(badge));
        }
        const badgeName = typeof key === 'string' ? key : `badge-${this._badgeMap.size}`;
        this._badgeMap.set(badgeName, badge);
        return this._badgeMap.size;
    }

    saveMetadata() {
        // set the current work diectory as working package root path by default
        if (!this.workingPackage) {
            this.workingPackage = process.cwd();
        }
        // check the metadata folder
        const metadataPath = path.resolve(this._workingPackageRootPath, './metadata/badges');
        if (!fs.existsSync(metadataPath)) {
            fs.mkdirSync(metadataPath);
        }
        for (let [badgename, badge] of this._badgeMap) {
            let metadata;
            // only custom badge could use endpoint with metadata
            if (badge instanceof CustomBadge) {
                console.log(`badge meta data saved to: ${badgename}`,
                JSON.stringify(badge.schema, null, 4));
                fs.writeFileSync(path.resolve(metadataPath, badgename),
                JSON.stringify(badge.schema, null, 4));
            } else {
                console.log('skipp badge: ', JSON.stringify(badge.schema, null, 4));
            }
        }
    }

    toString(badgeName = null) {
        if (typeof badgeName === 'string' && this._badgeMap.has(badgeName)) {
            console.log(`get badge (key: ${badgeName})`);
            return this._badgeMap.get(badgeName).toString();
        } else {
            let badgeString = '';
            for (let [badgename, badge] of this._badgeMap) {
                console.log(`get badge (key: ${badgename})`);
                badgeString += `${badge.toString(badgename)} `;
            }
            return badgeString.trim();
        }
    }

    /**
     * Insert all badges to the README.md on the working directory.
     * If the first line is a header line (starts with #), insert after it.
     * Otherwise, insert to the first line
     */
    insertToReadMe(replace = true) {
        const badgemanInjectionIndicator = '[//]: # (inserted by Badgeman)';
        const readMePath = path.resolve(this._workingPackageRootPath, 'README.md');
        if (!fs.existsSync(readMePath)) {
            // eslint-disable-next-line max-len
            throw new Error(`README.md not found in directory: ${this._workingPackageRootPath}`);
        }
        // check if the first line is heading style
        const fileContent = fs.readFileSync(readMePath);
        // get the file content into line-by-line style
        let lines = fileContent.toString('utf-8').split('\n');
        // check for header
        if (Array.isArray(lines) && lines.length > 0) {
            // look for # XXXXX on the first line
            if (lines[0].indexOf('# ') === 0 && lines[1] === '') {
                // this README was injected the badeges by Badgeman
                if (lines[2] === badgemanInjectionIndicator) {
                    // if replace the previous badges
                    if (replace) {
                        lines[3] = this.toString();
                    } else {
                        lines[3] += ` ${this.toString()}`;
                    }
                } else {
                    // this README was not injected the badges by Badgeman yet
                    // insert 1 blank line, 1 badgemanInjectionIndicator line, and the badges
                    lines.splice(1, 0, '', badgemanInjectionIndicator, this.toString());
                }
            }
        }
        fs.writeFileSync(readMePath, lines.join('\n'));
    }
}

module.exports = {
    Badgeman: Badgeman,
    Badge: Badge,
    CodeSizeBadge: CodeSizeBadge,
    RepoSizeBadge: RepoSizeBadge,
    PackageVersionBadge: PackageVersionBadge,
    LatestTagBadge: LatestTagBadge,
    CustomBadge: CustomBadge
};

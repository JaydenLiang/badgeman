#!/usr/bin/env node
'use strict';

/* eslint-disable max-len */
const program = require('commander');
const Verman = require('./index.js');
const colors = require('colors/safe');
const exec = require('child_process').exec;

const verman = new Verman();

function execCmd(cmd, cwd = process.cwd(), options) {
    return new Promise((resolve, reject) => {
        console.log(`run command:${cmd} on dir: ${cwd}`);
        exec(cmd, { cwd: cwd}, (error, stdout, stderr) => {
            if (error) {
                if (options && !options.supressError) {
                    console.error(`exec error: ${error}`);
                } else {
                    reject(error);
                }
            }
            if (stdout && options && options.printStdout) {
                console.log(`stdout: ${stdout}`);
            }
            if (stderr && options && options.printStderr) {
                console.log(`stderr: ${stderr}`);
            }
            resolve(stdout || stderr);
        });
    }).catch(err => {
        console.log(err.toString());
    });

}

async function addGitTag(version, message, dryRun = false) {
    const cmd = `git tag -a ${version} -m ${JSON.stringify(message)}`;
    if (dryRun) {
        console.log(colors.yellow('[dry-run]'), cmd);
    } else {
        await execCmd(cmd);
    }
}
function main() {
    if (program.package && program.package !== true) {
        verman.workingPackage = program.package;
    } else {
        verman.workingPackage = process.cwd();
    }

    const semver = verman.semver;

    verman.bump({LEVEL: program.bump, PRERELEASE: program.prerelease});

    console.log(`Version: ${semver} -> ${verman._semver}`);

    if (program.save) {
        if (!program.dryRun) {
            verman.saveToNpmPackage();
        }
        console.log(`${program.dryRun ? colors.yellow('[dry-run] ') :
            ''}Version saved to package file:${verman.workingPackageJsonPath}`);
    }

    if (program.gitTag && program.gitTag !== true) {
        addGitTag(verman.semver, program.gitTag, program.dryRun).catch(e => {
            throw e;
        });
    }
}

program.on('--help', function() {
    if (program.rawArgs.length > 2 && program.rawArgs[3]) {
        switch (program.rawArgs[3].trim()) {
            case 'bump':
                console.log();
                console.log(colors.yellow('Help for --bump:'));
                console.log(`Increment the specific version level by ${colors.blue(1)}. Only one version level may be specified.`);
                console.log();
                console.log(colors.yellow('Usage:'), '--bump [level]');
                console.log();
                console.log('Only these string type values are accepted to level:',
                    colors.blue('major'), ',', colors.blue('minor'), ',', `${colors.blue('patch')}; its default value is ${colors.blue('patch')}.`);
                console.log();
                console.log(colors.yellow('Behaviours when the --prerelease option isn\'t given:'));
                console.log(colors.blue('major'), `: Increment major version by ${colors.blue(1)}; also removes the prerelease identifier if bumping from a prerelease version.`);
                console.log(colors.blue('minor'), `: Increment minor version by ${colors.blue(1)}; also removes the prerelease identifier if bumping from a prerelease version.`);
                console.log(colors.blue('patch'), `: Increment patch version by ${colors.blue(1)}; also removes the prerelease identifier if bumping from a prerelease version.`);
                console.log();
                console.log(colors.yellow('Behaviours when using --bump along with --prerelease option:'));
                console.log('Behaviours are similar to the non-prerelease behaviours above but each bumping turns the version into a prerelease version as well.');
                console.log('See help of --prerelease for more information.');
                break;
            case 'prerelease':
                console.log();
                console.log(colors.yellow('Help for --prerelease:'));
                console.log(`Increment the ${colors.blue('prerelease')} version by ${colors.blue(1)}. Or turns a non-prerelease version into the specific ${colors.blue('prerelease')} version.`);
                console.log();
                console.log(colors.yellow('Usage:'), '--prerelease [identifier]');
                console.log(`${colors.blue('Identifier')} defaults to based on the current prerelease version.`);
                console.log(`String type values are accepted to ${colors.blue('identifier')}; Must specify an ${colors.blue('identifier')} to turn a non-prerelease version into a prerelease version. ` +
                `Providing this option on a non-prerelease version without specifying an ${colors.blue('identifier')} causes this option to be ignored.`);
                console.log(colors.yellow('Behaviours:'));
                console.log(`Giving a boolean ${colors.blue('true')} or giving the same ${colors.blue('identifier')} on a prerelease version, it increments the current ${colors.blue('prerelease')} version by ${colors.blue(1)}. If a different prerelease ${colors.blue('identifier')} is specified, it uses the new ${colors.blue('identifier')} and resets the prerelease version to ${colors.blue(0)}.`);
                console.log();
                break;
            case 'package':
                console.log();
                console.log(colors.yellow('Help for --package:'));
                console.log('Specify the directory for the npm package to work on. Default is the current working directory. Directory could be full real path or relative path to the current working directory. Only the current working directory and its sub directories can be accepted.');
                console.log();
                console.log(colors.yellow('Usage:'), '--package [directory]');
                break;
            case 'dry-run':
                console.log();
                console.log(colors.yellow('Help for --dry-run:'));
                console.log('Instead of updating the package files, it displays the new version.');
                console.log();
                console.log(colors.yellow('Usage:'), '--dry-run');
                console.log('This option doesn\'t take any parameter.');
                break;
            case 'git-tag':
                console.log();
                console.log(colors.yellow('Help for --git-tag:'));
                console.log('Automatically create an annotated git tag with the latest version and a tag message.');
                console.log();
                console.log(colors.yellow('Usage:'), '--git-tag <message>');
                console.log();
                console.log('A string type value is accepted to message. The message parameter is required if given this option.');
                break;
            default:
        }
    }
});

program.version(require('./package.json').version).usage('[options]')
.option('-b, --bump [level=major|minor|patch]', `Level (string type, value of major, minor, patch, prerelease) is optional and defaults to ${colors.blue('patch')}. Increment the specific version level by ${colors.blue(1)}. See more information by ${colors.yellow('--help bump')}`)
.option('-p, --prerelease [identifier]', `Identifier (string type) is optional for prerelease version but required for non-prerelease version. Turn current version into a prerelease with the given ${colors.blue('identifier')} and bump the version level accordingly. See more information by ${colors.yellow('--help prerelease')}`)
.option('-k, --package [path-to-package-directory]', 'Set the path to the package to work with. Can only work within the current working directory and any sub directoy. Defaults to the package on the current working directory.')
.option('-s, --save', 'Save new version to the npm package file on the specified directory. Defaults to current working directory.')
.option('--dry-run', 'Instead of making real change, it displays the new version.')
.option('-t, --git-tag <message>', 'automatically create a git tag with the latest version. The message is required for this options.');

program.parse(process.argv);

main();

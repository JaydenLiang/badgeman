'use strict';

const Bman = require('./index');
const
    username = 'JaydenLiang',
    repoName = 'badgeman',
    branchName = 'develop';
const bman = new Bman.Badgeman(username, repoName);

bman.addBadge(new Bman.CodeSizeBadge(username, repoName));
bman.addBadge(new Bman.RepoSizeBadge(username, repoName));
bman.addBadge(new Bman.LatestTagBadge(username, repoName));
bman.addBadge(Bman.CustomBadge.create(
    Bman.CustomBadge.createGitHubEndpoint(username, repoName, branchName),
    'hello', 'custom message'));
bman.saveMetadata();
bman.insertToReadMe();

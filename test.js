'use strict';

const Bman = require('./index');
const
    username = 'fortinet',
    repoName = 'fortigate-autoscale';
const bman = new Bman.Badgeman(username, repoName);

bman.addBadge(new Bman.CodeSizeBadge(username, repoName));
bman.addBadge(new Bman.RepoSizeBadge(username, repoName));
bman.addBadge(new Bman.LatestTagBadge(username, repoName));
bman.addBadge(Bman.CustomBadge.create('https://jbt.github.io/markdown-editor/',
'hello', 'custom message'));
bman.saveMetadata();
bman.insertToReadMe();

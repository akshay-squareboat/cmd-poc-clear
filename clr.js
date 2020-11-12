#!/usr/bin/env node

var program = require('commander');
var script = require('./script');

program.command('init').action((options) => {
  script.initProcess();
});

program.command('ls projects').action((options) => {
  script.projectListing();
});

program
  .command('posts')
  .description('List of all posts')
  .option('-n, --number <int>', 'specify number of stories')
  .action(function (options) {
    var count = options.number || 20;
    script.listAllData(count);
  });

program
  .command('post')
  .description('Show post details')
  .option('-id, --id <int>', 'specify number of stories')
  .action(function (options) {
    var id = options.id || 1;
    script.PostDetail(id);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  // Show help by default
  program.outputHelp();
}

"use strict";

const readline = require('readline-sync');
const path = require('path');
const execFile = require('child_process').execFile;

process.env.PATH += pathAppendFormatted();
function pathAppendFormatted(){
  return (/^win/.test(process.platform) ? ";" : ":") +
    path.join(__dirname, "node_modules/phantomjs-prebuilt/lib/phantom/bin");
}

(function getInfo(cb) {
  let url, hasRange, range=[];
  url =  readline.question("What comic url would you like to access?\n");
  hasRange = readline.question("Would you like to specify a range for the chapters you're viewing?\n");
  if(hasRange === 'y' || hasRange === 'yes'){
    range = readline.question("Set your first and last chapter in the format '1,42'\n").split(",").map(num => parseInt(num));
    if(range.length !== 2){
      console.error("invalid format used");
      process.exit();
    }
  }
  cb(url, range);
}(startScraper))

function startScraper(url, range) {
  const scraperProcess = execFile('node', [
    './node_modules/casperjs/bin/casperjs.js',
    './scraper.js',
    `--url=${url}`,
    `--range=${JSON.stringify(range)}`
  ],(error, stdout, stderr) => {
    if(error){
      return console.error(stderr);
    }
    console.log(stdout);
  });

  scraperProcess.stdin.pipe(process.stdin);
  scraperProcess.stdout.pipe(process.stdout);
  scraperProcess.stderr.pipe(process.stderr);
}

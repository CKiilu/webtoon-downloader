"use strict";

const readline = require('readline-sync');
const path = require('path');
const execFile = require('child_process').execFile;
const fs = require('fs');
const binaryPath = {
  default: "node_modules/phantomjs-prebuilt/lib/phantom/bin",
  alternative: "node_modules/phantomjs-prebuilt/bin"
};
const urlFormat = /.*webtoons\.com\/en\/[^\/]+\/[^\/]+\/list\?title_no=[\d]+/;
process.env.PATH += pathAppendFormatted();
function pathAppendFormatted(){
  return (/^win/.test(process.platform) ? ";" : ":") +
    path.join(__dirname, (fs.existsSync(binaryPath.default) ? binaryPath.default : binaryPath.alternative));
}
function getURL(url) {
  return "http://www."+/webtoons.*/.exec(url || readline.question("What comic url would you like to access?\n"))[0]
}
function getRange() {
  let r = readline.question("Set your first and last chapter in the format '1,42'\n").split(",").map(num => parseInt(num));
  if(range.length !== 2){
    console.error("invalid format used");
    process.exit();
  }
  return r;
}
function getInfo(options) {
  options = options || {};
  let promptRange, range, url, pagination;
  range = options.range || [];
  url =  getURL(options.url);
  pagination = options.pagination || {};
  while(!urlFormat.test(url)){
    console.log(`Invalid url entered. \n\tFormat is ${urlFormat}.`);
    url =  getURL();
  }
  promptRange = options.promptRange || readline.question("Would you like to specify a range for the chapters you're viewing?\n");
  if(promptRange === 'y' || promptRange === 'yes'){
    range = getRange();
    while(range[0] > range[1]){
      range = getRange();
    }
  }
  startScraper(url, range, pagination);
}

function startScraper(url, range, pagination) {
  const scraperProcess = execFile('node', [
    './node_modules/casperjs/bin/casperjs.js',
    './scraper.js',
    `--url=${url}`,
    `--range=${JSON.stringify(range)}`,
    `--pagination=${JSON.stringify(pagination)}`,
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

module.exports = getInfo;

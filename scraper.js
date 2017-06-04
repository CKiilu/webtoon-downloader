const casper = require('casper').create();
var title, pagination;
var urls = [];
const options = casper.cli.options;
const range = JSON.parse(options.range);
const paginationRange = JSON.parse(options.pagination);
const reverseLinks = Boolean(paginationRange && paginationRange.fromFirst);

function getLinks(){
  var pageNo = this.getCurrentUrl().match(/page=([\d]+)/);
  this.echo("Getting links from page "+(pageNo ? pageNo[1] : 1));
  this.echo(this.getCurrentUrl());
  var l = this.getElementsInfo(".detail_lst ul li > a")
    .map(function (el) {
      return el.attributes.href;
    });
  if(reverseLinks){
    [].unshift.apply(urls, l);
  } else {
    [].push.apply(urls, l);
  }
}
function chapterTitle() {
  var ep = this.fetchText(".subj_info h1").replace(".", "");
  this.echo("Downloading "+ep+" of the comic "+title);
  return "comics/"+title+"/"+ep+".png";
}

function getPages() {
  var page = this.getCurrentUrl();
  var url = /.*\.com/.exec(page)[0];
  pagination = this.getElementsInfo("div.paginate a")
    .map(function (el) {
      return  url + el.attributes.href;
    });
  pagination[0] = page;
  if(paginationRange){
    if(paginationRange.fromFirst){
      pagination.reverse();
    }
    if(paginationRange.range.constructor === Array){
      pagination = (paginationRange.length === 1)
        ? pagination.slice(paginationRange.range[0])
        : pagination.slice(paginationRange.range[0], paginationRange.range[1]);
    }
  }
}

casper.on("log", function (e) {
  this.echo(e.message);
});

casper.start(options.url, function() {
  this.echo("Starting scraper");
  title = this.fetchText(".detail_header .info h1.subj").split("\n")[0];
  getPages.call(this);
});
casper.then(function () {
  this.each(pagination, function (self, link, i) {
    self.thenOpen(link, getLinks.bind(self));
  });
});
casper.then(function () {
  urls.reverse();
  if(range.length===2){
    urls = urls.slice(range[0]-1, range[1]);
  }
});

casper.then(function () {
  var waitTime = 60000;
  this.each(urls, function (self,link,i) {
    self.thenOpen(link, function () {
      this.echo("Loading from > "+link);
      this.waitUntilVisible("#_imageList", function () {
        var scroll = 0;
        var scrollHeight = this.evaluate(function () {
          return document.body.scrollHeight;
        });
        var scrollDirection = 1;
        this.waitFor(function () {
          this.scrollTo(0, (scroll += 50 * scrollDirection));
          if(scroll > scrollHeight){
            scrollDirection = -1;
          }
          if(scroll < 0){
            scrollDirection = 1;
          }
          return this.evaluate(function () {
            return [].slice.call(document.querySelectorAll("#_imageList img")).every(function (el) {
              console.log(el.src);
              console.log(el.complete);
              return el.complete && el.src !== "http://webtoons.static.naver.net/image/bg_transparency.png";
            });
          });
        }, function () {
          this.captureSelector(chapterTitle.call(this), "#_imageList");
          this.echo("Finished Download")
        }, null, waitTime);
      }, null, waitTime);
    });
  });
});

casper.run();

const casper = require('casper').create();
var title, pagination;
var urls = [];
const options = casper.cli.options;
const range = JSON.parse(options.range);

function getLinks(i){
  this.echo("Getting links from page "+(i+1));
  var l = this.getElementsInfo(".detail_lst ul li > a")
    .map(function (el) {
      return el.attributes.href;
    });
  [].push.apply(urls, l);
}
function chapterTitle(num) {
  var ep = this.fetchText(".subj_info h1").replace(".", "");
  this.echo("Downloading chapter "+num+" of the comic "+title);
  return "comics/"+title+"/"+ep+".png";
}

function getPages() {
  var url = /.*\.com/.exec(this.getCurrentUrl())[0];
  pagination = this.getElementsInfo("div.paginate a").slice(1)
    .map(function (el) {
      return  url + el.attributes.href;
    });
}

casper.on("log", function (e) {
  this.echo(e.message);
});

casper.start(options.url, function() {
  this.echo("Starting scraper");
  title = this.fetchText(".detail_header .info h1.subj").split("\n")[0];
  getPages.call(this);
  getLinks.call(this,0);
});
casper.then(function () {
  this.each(pagination, function (self, link, i) {
    self.thenOpen(link, getLinks.bind(self, i+1));
  });
});
casper.then(function () {
  urls.reverse();
  if(range.length===2){
    urls = urls.slice(range[0]-1, range[1]);
  }
})

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
              return el.complete && el.src !== "http://webtoons.static.naver.net/image/bg_transparency.png";
            });
          });
        }, function () {
          this.captureSelector(chapterTitle.call(this, /episode_no=([\d]+)/.exec(link)[1]), "#_imageList");
          this.echo("Finished Download")
        }, null, waitTime);
      }, null, waitTime);
    });
  });
});

casper.run();

const input = require('./input');

const testUrl = "www.webtoons.com/en/thriller/bastard/list?title_no=485";
console.log("Starting test");
input({
  url: testUrl,
  range: [1,3],
  get promptRange(){
    return (this.range && this.range.constructor === Array && this.range.length > 0)
      ? 'n'
      : 'y';
  },
  pagination: {
    fromFirst: true,
    range: [0,1]
  }
})

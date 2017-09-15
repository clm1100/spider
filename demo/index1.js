var Crawler = require("crawler");

var c = new Crawler({
    maxConnections : 100,
    forceUTF8:true,
  // incomingEncoding: 'gb2312',
    // This will be called for each crawled page
    callback : function (error, result, done) {
      var $ = result.$;
      var urls = $('#list a');
      console.log(urls)
      done();
    }
});

c.queue('http://www.biquku.com/0/330/');
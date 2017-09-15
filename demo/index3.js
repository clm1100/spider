var Crawler = require("crawler");
// 请求某一章节的函数；
function one(chapter,callback){
  c.queue([{
    uri: 'http://www.biquku.com/0/330/' + chapter.num + '.html',
    forceUTF8:true,
    // The global callback won't be called
    callback: function (error, result, done1) {
    	var $ = result.$;
        var content = $('#content').html();
        console.log(content);
        // 注意执行完成后执行一个回调;这个done1和done不一样;
        done1();
        // 这个callback是执行请求urls完成后的回调;
        callback();
    }
  }]);
}

var current_book = { }
var c = new Crawler({
	// 最大并发数量，每次最多发送多少个请求；
    maxConnections : 100,
    forceUTF8:true,
  	// incomingEncoding: 'gb2312',
    // This will be called for each crawled page
    callback : function (error, result, done) {
    var $ = result.$;
    var urls = $('#list a');
      current_book.title = $('#maininfo h1').text()
      current_book.author = $('#info p').eq(0).text()
      current_book.update_time = $('#info p').eq(2).text()
      current_book.latest_chapter = $('#info p').eq(3).html()
      current_book.intro = $('#intro').html()
      current_book.chapters = [];

      for(var i = 0; i< urls.length; i++){
        var url = urls[i]
        var _url = $(url).attr('href')+"";
        var num = _url.replace('.html','');
        var title = $(url).text();
        current_book.chapters.push({
          num: num,
          title: title,
          url: _url
        })
      }
      // 在获取章节后 在去获取具体某一章节;
      one(current_book.chapters[4],done);
      one({num:"333",title:"xxx",url:"333"},done)
    }
});

c.queue('http://www.biquku.com/0/330/');
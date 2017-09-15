var Crawler = require("crawler");
// 定义一个对象保存获取的数据;

// current_book 数据结构如下：
// 
// current_book = {
// 	title:"XXX",
// 	author:"XXX",
// 	update_time:"XXX",
// 	latest_chapter:"XXX",
// 	intro:"XXX",
// 	chapters:[ 
// 		{num:"xxx",url:"xxx",title:"xxx"},
// 		{...},
// 		{...} 
// 		],
// 	}
 

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
     // console.log(urls)
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
      console.log(current_book);
      done()
    }
});

c.queue('http://www.biquku.com/0/330/');
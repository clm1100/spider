var Crawler = require("crawler");
var utils = require('./utils')
var current_book = { }

var c = new Crawler({
    maxConnections : 100,
    forceUTF8:true,
  // incomingEncoding: 'gb2312',
    // This will be called for each crawled page
    callback : function (error, result, done) {
      var $ =  result.$;
      var urls = $('#list a');      
      utils.mkdir('0/330'); 
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
      done();

      utils.write_config(current_book);

      one(current_book.chapters);
      console.log("执行到这里");
    }});



function one(chapters){
  // 调整参数
  var arr = chapters.map(function(chapter,i){
    return {
      uri: 'http://www.biquku.com/0/330/' + chapter.num + '.html',
      forceUTF8:true,
      // The global callback won't be called
      callback: function (error, result, done) {
        var $ = result.$;
        var content = $('#content').html();
        console.log(content)
        utils.write_chapter(chapter, content,done);
      }
    }
  });
  c.queue(arr);
}

function start(){
  c.queue('http://www.biquku.com/0/330/');
}

start()
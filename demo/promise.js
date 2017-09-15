var Crawler = require("crawler");
var utils = require('./utils')
var current_book = { }

var c = new Crawler({
  maxConnections : 100,
  forceUTF8:true,
});


/*

封装的请求每一章节的函数
 */

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

/*
用promise封装的生成文件的 promise
 */
var p1 = new Promise(function(relove,reject){
utils.mkdir('0/330',relove); 
}).then(function(data){
  console.log(data);
})

/*
用promise封装的 请求列表的promise
 */
var p = new Promise(function(relove,reject){
    c.queue({
    url:'http://www.biquku.com/0/330/',
    callback:function (error, result, done) {
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
        relove(current_book);
        done();
      }
  });
});

/*
封装的流程promise
 */

p1.then(function(){return p}).then(function(data){
    return new Promise(function(relove,reject){
      utils.write_config(data,relove);
    })
  }).then(function(data){
    console.log(data);
    one(data.chapters);
  })
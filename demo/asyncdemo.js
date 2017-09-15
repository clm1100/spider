var cheerio     = require('cheerio');
var superagent1 = require('superagent');
var eventproxy  = require('eventproxy');
var async       = require('async');
var utils       = require('./utils');
var install     = require('superagent-charset');
var fs		     = require('fs');
var superagent  = install(superagent1);
var current_book = {};
var error_list = [];
var n=1;
superagent.get('http://www.biquku.com/0/330/').charset('gbk')
    .end(function (err, sres) {
      // 常规的错误处理
      if (err) {
        console.log(err);
      }
      // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
      var $ = cheerio.load(sres.text);
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
      console.log(current_book.chapters.length);

      async.mapLimit(current_book.chapters, 200, function (url, callback) {
		  fetchUrl(url, callback);
		}, function (err, result) {
		  console.log('final:');
		  console.log(error_list);
		});
    });

function fetchUrl(url, callback){
	console.log(n++);
	if(n==1637){
		console.log(error_list)
	}
	superagent.get('http://www.biquku.com/0/330/' + url.num + '.html').charset('gbk').end(function(err,res){
		var timer = setTimeout(function(){
			callback(null);
		},500);
		if(!err){
			clearTimeout(timer)
			if(res){	
			if(res.text){
				var $ = cheerio.load(res.text);
				var content = $('#content').html();
				fs.writeFile('dist/0/330/' + url.num + '.html', content, function (err) {
				    if (err) throw err;
				    callback(null);
				  });

				}
			}else{
				error_list.push(url);
				callback(null);
			}
		}else{
			clearTimeout(timer)
			callback(null);
		}
		
	})
}
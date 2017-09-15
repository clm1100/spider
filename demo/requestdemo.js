var cheerio     = require('cheerio');
var superagent1 = require('superagent');
var eventproxy  = require('eventproxy');
var async       = require('async');
var utils       = require('./utils');
var install     = require('superagent-charset');
var fs		    = require('fs');
var superagent  = install(superagent1);
var rp          = require('request-promise');
var iconv       = require('iconv-lite');

var current_book = {};
var error_list = [];
var n=1;
rp({encoding: null,
    url: 'http://www.biquku.com/0/330/'})
    .then(function (sres) {
      var str = iconv.decode(sres, 'gbk'); 
      var $ = cheerio.load(str);
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
      console.log(current_book.chapters);

      async.mapLimit(current_book.chapters, 200, function (url, callback) {
		  fetchUrl(url, callback);
		}, function (err, result) {
		  console.log('final:');
		  console.log(error_list);
		});
    });

function fetchUrl(url, callback){
	console.log(n++);

	rp({
		url:'http://www.biquku.com/0/330/' + url.num + '.html',
		encoding:null
	}).then(function(res){
		// console.log(n++);
		res = iconv.decode(res, 'gbk'); 
		var $ = cheerio.load(res);
		var content = $('#content').html();
		fs.writeFile('dist/0/330/' + url.num + '.html', content, function (err) {
		    if (err) throw err;
		    // callback(null);
		  });
		callback(null);
	}).catch(function(){
		// console.log(n++);
		callback();
	})
}
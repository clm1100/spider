var cheerio = require('cheerio');
var superagent1 = require('superagent');
var eventproxy = require('eventproxy');
var _ = require("lodash");
var async1 = require('async');
var install = require('superagent-charset');
var fs = require('fs');
var superagent = install(superagent1);
var current_book = {};
var error_list = [];
var n = 1;

function fetchUrl(url, callback, arr) {
	superagent
		.get('http://www.biquku.com/0/330/' + url.num + '.html')
		.charset('gbk')
		.timeout({
	    response: 1000,  // Wait 5 seconds for the server to start sending,
	    deadline: 30000, // but allow 1 minute for the file to finish loading.
	  	})
		.end(function(err, res) {
			if(!err&&!!res.text){
				var $ = cheerio.load(res.text);
				var content = $('#content').html();
				fs.writeFile(
				'dist/0/330/' + url.num + '.html',
				content,
				function(err) {
					console.log(n++);
					callback();
				});
			}else{
				arr.push(url);
				callback();
			}
		})
}


let gfun = async function() {
	var arr = await new Promise(function(resolve, reject) {
		superagent
			.get('http://www.biquku.com/0/330/')
			.charset('gbk')
			.end(function(err, sres) {
				if (err) {
					console.log(err, "superagent的数据列表错误");
				}
				var $ = cheerio.load(sres.text);
				var urls = $('#list a');

				current_book.title = $('#maininfo h1').text()
				current_book.author = $('#info p').eq(0).text()
				current_book.update_time = $('#info p').eq(2).text()
				current_book.latest_chapter = $('#info p').eq(3).html()
				current_book.intro = $('#intro').html()
				current_book.chapters = [];

				for (var i = 0; i < urls.length; i++) {
					var url = urls[i]
					var _url = $(url).attr('href') + "";
					var num = _url.replace('.html', '');
					var title = $(url).text();
					current_book.chapters.push({
						num: num,
						title: title,
						url: _url
					})
				}
				resolve(current_book.chapters);
			});
	});
	// var arr1 = _.chunk(arr, 300);
	// var l = arr1.length;
	return arr;

}

gfun().then(function(data){
	var arr = data;
	bibao(arr)(100);

});

var bibao = function(arr){

	return function add(t){
		var aar = arr.splice(0,t);
		async1.mapLimit(aar, 100, function(url, callback) {
			fetchUrl(url, callback, arr);
		}, function(err, result) {
			if (arr.length < t) {
				console.log('final:');
			} else {
				add(t);
				console.log("完成到第", t, "组")
			}
		});

	}
}

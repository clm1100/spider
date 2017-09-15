> nodejs爬虫教程


# 爬去首页获取全部章节列表
+ 目标网址：http://www.biquku.com/0/330/
+ 技术选型
  - crawler 地址：https://www.npmjs.com/package/crawler

## 获取首页页面dom
测试demo：

~~~
var Crawler = require("crawler");
<!-- 配置crawler,注意获取dom对象，是挂载到result.$上面的 -->
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
~~~


## 获取首页页面的章节列表：

 **demo2**:
   
~~~
var Crawler = require("crawler");
// 定义一个对象保存获取的数据;
/*
current_book 数据结构如下：
current_book = {
    title:"XXX",
    author:"XXX",
    update_time:"XXX",
    latest_chapter:"XXX",
    intro:"XXX",
    chapters:[ 
        {num:"xxx",url:"xxx",title:"xxx"},
        {...},
        {...} 
        ],
    }
 */

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
~~~

每一个章节的url拿到了，下面就是请求每个章节的数据了；


## 爬取某一章


分析一下url的地址：

>第一章 北灵院 http://www.biquku.com/0/330/153065.html
>和之前的地址的差别是什么呢？
>首页 http://www.biquku.com/0/330 是一样的，只不过多了一个文件名称;
>153065.html章节地址

思路如下：
chapters: 
[ { num: '153064', title: '第一章已发。', url: '153064.html' }...]
也就是说 url 即是章节地址，剩下的就拼接起来就好了。
~~~
function one(chapter){
  console.log(chapter)
  c.queue([{
    uri: 'http://www.biquku.com/0/330/' + chapter.num + '.html',
    forceUTF8:true,
    // The global callback won't be called
    callback: function (error, result, done) {
        var $ = result.$;
        var content = $('#content').html();
        console.log(content);
        done();
    }
  }]);
}
~~~

将这个函数集成到index2.js中，也就是index3.js;
执行一下index3.js看有什么效果；
结果为打印某一章节的数据；
示例代码：

~~~
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
      one(current_book.chapters[4],done)
    }
});

c.queue('http://www.biquku.com/0/330/');
~~~

## 总结


爬取一本书的流程


- 先获取列表
- 再去获取章节

*技能*

node-crawler 爬取，发送http请求，是基于request模块的


node-crawler有2种用法：
 + c.queue方法如无callback，走全局的callback，这是获取列表的时候的用法
 + c.queue方法如有callback，走自己的callback，这是获取章节的用法
我们的做法：
最小化问题，先关注爬取一本书的流程
 +爬取一本书的流程中的列表
 +爬取一本书的流程中的章节
在这个过程中，我们可以很好的学习crawler和jquery的dom操作，知识点整体来说比较少，更加容易学习。

下面，爬取的信息咋办呢？见下一章。
# 爬去章节内容；
首先大家考虑一个问题，上节解决的是爬取问题，已经可以成功取到信息了，那么如何处理爬取到的信息呢？
**缓存设计：使用dist目录**
爬取的信息有2种处理办法
 + 写到文件里，核心是文字，爬取下来是html，直接静态化是比较好的
 + 那么书的简介和章节呢？这部分可能是动态的
    -生成book.json
    -保存到数据库
综合来看，写文件肯定是最简单的办法。为了便于大家学习，我们从简，少给大家挖坑，简单粗暴点。
## 创建目录
 先想想，如果是多本书，多个分类存比较好呢？
+ dist
    - 330 大主宰
    - 0 玄幻
这样的结构是不是会更清楚，更加灵活？
创建多级目录,比如dist/0/330

推荐使用 ** mkdirp** 模块;

示例代码：

```

function mkdir(folder){
  var mkdirp = require('mkdirp'); 
  mkdirp('dist/' + folder, function (err) {
      if (err) console.error(err)
      else console.log('pow!')
  });
}

mkdir('i am mkdir folder')
```

## 写文件
~~~
var fs = require('fs')

function write_chapter(chapter, content){
  content = content.replace('[笔趣库手机版 m.biquku.com]', '')
  
  fs.writeFile('dist/i am mkdir folder/' + chapter + '.html', content, function (err) {
    if (err) throw err;
    console.log('It\'s saved!');
  });
}

var content = "章节内容"
write_chapter('1', content);
~~~

## 写json文件
示例代码：
~~~
var fs = require('fs')

function write_json(book){
  var content =  JSON.stringify(book, null, 4); // Indented 4 spaces
  
  fs.writeFile('dist/i am mkdir folder/book.json', content, function (err) {
    if (err) throw err;
    console.log('It\'s saved!');
  });
}

var book = { 
  title: '大主宰',
  author: '作    者：天蚕土豆',
  update_time: '更新时间：2016-07-10',
  latest_chapter: '最新章节',
  chapters: 
   [ { num: '153064', title: '第一章已发。', url: '153064.html' },
     { num: '153065', title: '第一章 北灵院', url: '153065.html' },
     { num: '153066', title: '第二章 被踢出灵路的少年', url: '153066.html' },
     { num: '153067', title: '第三章 牧域', url: '153067.html' },
  { num: '153068', title: '第四章 大浮屠诀', url: '153068.html' }
  ]
};
write_json(book)
~~~

## 将方法抽到utils.js里
~~~
var fs = require('fs')
var debug = require('debug')('crawler')

exports.mkdir = function(folder){
  var mkdirp = require('mkdirp');
    
  mkdirp('dist/' + folder, function (err) {
      if (err) console.error(err)
      else debug('pow!')
  });
}

exports.write_chapter = function(chapter, content){
  // content = content.replace('[笔趣库手机版 m.biquku.com]', '')
  
  fs.writeFile('dist/0/330/' + chapter.num + '.html', content, function (err) {
    if (err) throw err;
    debug('It\'s saved!');
  });
}

exports.write_config = function(book){
  var content =  JSON.stringify(book, null, 4); // Indented 4 spaces
  fs.writeFile('dist/0/330/book.json', content, function (err) {
    if (err) throw err;
    debug('It\'s saved!');
  });
}
~~~

*注意区分exports.xxx和module.exports即可。*

代码里有3处用法：

~~~
utils.mkdir(‘0/330’);
utils.write_config(current_book);
utils.write_chapter(chapter, content);

~~~

## 总结
本章主要对获取的数据进行缓存操作，没有用到数据库，而是直接存储到了，文件中，
+ 直接写入文件中，
+ 写入json中
+ 创建目录结构
最终代码


~~~
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
~~~

# 用promise优化代码：

新建promise

~~~
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
~~~


# 编写小说阅读器
之前我们通过爬取和缓存，可以获得book.json和章节信息。
~~~
{
    "title": "大主宰",
    "author": "作    者：天蚕土豆",
    "update_time": "更新时间：2016-07-10",
    "latest_chapter": "最新章节......",
    "chapters": [
        {
            "num": "153064",
            "title": "第一章已发。",
            "url": "153064.html"
        },
        {
            "num": "153065",
            "title": "第一章 北灵院",
            "url": "153065.html"
        },
        {
            "num": "153066",
            "title": "第二章 被踢出灵路的少年",
            "url": "153066.html"
        },
        {
            "num": "153067",
            "title": "第三章 牧域",
            "url": "153067.html"
        },
        {
            "num": "153068",
            "title": "第四章 大浮屠诀",
            "url": "153068.html"
        }
    ]
}
~~~

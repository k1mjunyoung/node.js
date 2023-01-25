// nodejs module
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

// database
var mysql      = require('mysql');
var config     = require('./lib/mysqlConfig');

var db = mysql.createConnection({
  host     : config.host,
  user     : config.user,
  password : config.password,
  database : config.database
});
db.connect(); // 실제 접속

// custom module(모듈화)
var template = require('./lib/template.js');

var app = http.createServer(function(request,response){
    var _url = request.url;
    // 쿼리 값
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    console.log(pathname);
    // 홈페이지
    if(pathname === '/'){
      if(queryData.id === undefined){
        /*
        fs.readdir('./data', function(error, filelist){
          // 프로필 요소들
          var title = '홍길동';
          var job = '대학생'
          var description = '안녕하세요 홍길동입니다.';
          var youtube = `DhXO4d6m6f4`;
          var tel = '010-0000-0000'
          var email = 'example@sch.ac.kr'
          var address = '순천향대학교 공과대학'
          var list = template.list(filelist);
          // Read
          var html = template.html(title, list,
            `
            <h2>${title}</h2>
            <h3>${job}</h3>
            </div>${description}</div>
            </div><iframe width="560" height="315" src="https://www.youtube.com/embed/${youtube}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
            <div>${tel}</div>
            <div>${email}</div>
            <div>${address}</div>
            `,
            `<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(html);
        })
        */
       db.query(`SELECT * FROM test`, function(error, authors){
        console.log(authors);

        var title = `${authors[0].name}`;
        var job = '대학생';
        var description = '안녕하세요 홍길동입니다.';
        var youtube = `DhXO4d6m6f4`;
        var tel = '010-0000-0000';
        var email = 'example@sch.ac.kr';
        var address = '순천향대학교 공과대학';
        var list = template.list(authors);
        var html = template.html(title, list,
          `
          <h2>${title}</h2>
          <h3>${job}</h3>
          </div>${description}</div>
          </div><iframe width="560" height="315" src="https://www.youtube.com/embed/${youtube}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
          <div>${tel}</div>
          <div>${email}</div>
          <div>${address}</div>
          `,
          `<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(html);
       });
       db.end();
      } else {
          fs.readdir('./data', function(error, filelist){
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
              var title = queryData.id;
              var sanitizedTitle = sanitizeHtml(title);
              var sanitizedDescription = sanitizeHtml(description, {
                // 허용할 html 태그를 인자로
                allowedTags: ['h1']
              });
              var list = template.list(filelist); 
              var html = template.html(sanitizedTitle, list,
                `
                <h2>${sanitizedTitle}</h2>
                <div>${sanitizedDescription}</div>
                `,
                // 글 생성, 업데이트, 삭제 링크
                `<a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>
                `
              );
              response.writeHead(200);
              response.end(html);
            });
          });
        };
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var youtube = '';
        var address = '';
        var list = template.list(filelist);
        var html = template.html(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p><textarea name="description" placeholder="description"></textarea></p>
            <p><input type="submit"></p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        console.log(post.title);
        // 파일 쓰기
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          // 리디렉션
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        });
      });
    } else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist); 
          var html = template.html(title, list,
            `<form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p><textarea name="description" placeholder="description">${description}</textarea></p>
              <p><input type="submit"></p>
            </form>`,
            // 글 생성, 수정 부분
            `<a href="/create">create</a>
            <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        console.log(post);
        fs.rename(`data/${id}`, `data/${title}`, function(error){
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            // 리디렉션
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
          });
        });
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var filteredId = path.parse(id).base;
        fs.unlink(`data/${filteredId}`, function(error){
          // 리디렉션
          response.writeHead(302, {Location: `/`});
          response.end();
        })
        });
      } else {
      response.writeHead(404);
      response.end('Not found');
    }
});

app.listen(3000);

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

// main
var app = http.createServer(function(request,response){
    var _url = request.url;
    // 쿼리 값
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    console.log(pathname);
    // 홈페이지
    if(pathname === '/'){
      if(queryData.id === undefined){
       // 홈페이지
       db.query(`SELECT * FROM test`, function(error, test){
        var title = `홈`;
        var description = 'QR코드 기반 명함서비스';
        var list = template.list(test);
        var html = template.html(title, list,
          `
          <h3>${description}</h3>
          <a href="/create">create</a>
          `
          );
        response.writeHead(200);
        response.end(html);
       });
      } else {
          db.query(`SELECT * FROM test`, function(error, tests){
            if(error){
              throw error;
            }
            db.query(`SELECT * FROM test WHERE id = ?`,[queryData.id], function(error2, test){
              if(error2){
                throw error2;
              }
              var title = test[0].name;
              var job = test[0].job;
              var description = test[0].intro;
              var youtube = test[0].youtube;
              var tel = test[0].tel;
              var email = test[0].email;
              var address = test[0].address;
              var list = template.list(tests);
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
                `<a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="delete">
                </form>
                `);
              response.writeHead(200);
              response.end(html);
              });
            });
          }
    } else if(pathname === '/create'){
      db.query(`SELECT * FROM test`, function(error, tests){
        var title = `마당발`;
        var list = template.list(tests);
        var html = template.html(title, list,
          `
          <form action="/create_process" method="post">
            <p><input type="text" name="name" placeholder="name"></p>
            <p><input type="text" name="job" placeholder="job"></p>
            <p><textarea name="intro" placeholder="intro"></textarea></p>
            <p><input type="text" name="youtube" placeholder="youtube"></p>
            <p><input type="text" name="tel" placeholder="tel"></p>
            <p><input type="text" name="email" placeholder="email"></p>
            <p><input type="text" name="address" placeholder="address"></p>
            <p><input type="text" name="username" placeholder="username"></p>
            <p><input type="submit"></p>
          </form>
          `,
          `<a href="/create">create</a>`
          );
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
          db.query(`
            INSERT INTO test (name, job, intro, youtube, tel, email, address, username, created)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?,NOW())
            `,
            [post.name, post.job, post.intro, post.yotube, post.tel, post.email, post.address, post.username],
            function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/?id=${result.insertId}`});
              response.end();
            }
          )
        }
      );
    } else if(pathname === '/update'){
      db.query(`SELECT * FROM test`, function(error, tests){
        if(error){
          throw error;
        }
        db.query(`SELECT * FROM test WHERE id = ?`,[queryData.id], function(error2, test){
        if(error2){
          throw error2;
        }
          var list = template.list(tests);
          var html = template.html(test[0].name, list,
            `<form action="/update_process" method="post">
              <input type="hidden" name="id" value="${test[0].id}">
              <p><input type="text" name="name" placeholder="name" value="${test[0].name}"></p>
              <p><input type="text" name="job" placeholder="job" value="${test[0].job}"></p>
              <p><textarea name="intro" placeholder="intro">${test[0].intro}</textarea></p>
              <p><input type="text" name="youtube" placeholder="youtube" value="${test[0].youtube}"></p>
              <p><input type="text" name="tel" placeholder="tel" value="${test[0].tel}"></p>
              <p><input type="text" name="email" placeholder="email" value="${test[0].email}"></p>
              <p><input type="text" name="address" placeholder="address" value="${test[0].address}"></p>
              <p><input type="text" name="username" placeholder="username" value="${test[0].username}"></p>
              <p><input type="submit"></p>
            </form>`,
            // 글 생성, 수정 부분
            `<a href="/create">create</a>
            <a href="/update?id=${test[0].id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
      // 
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
        body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        db.query('UPDATE test SET name=?, job=?, intro=?, youtube=?, tel=?, email=?, address=?, username=? WHERE id=?', [post.name, post.job, post.intro, post.youtube, post.tel, post.email, post.address, post.username, post.id], function(error, result){
          response.writeHead(302, {Location: `/?id=${post.id}`});
          response.end();
        })
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
        db.query('DELETE FROM test WHERE id = ?', [post.id], function(error, result){
          if(error){
            throw error;
          }
          response.writeHead(302, {Location: `/`});
          response.end();
        });
        });
    } else {
    response.writeHead(404);
    response.end('Not found');
  }
});

app.listen(3000);

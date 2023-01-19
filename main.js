var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

// refactoring(tamplate 객체화)
var template = {
  html: function(title, list, body, control){
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },
  list: function(filelist){
    var list = '<ul>';
    var i = 0;
    while(i < filelist.length){
      list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  }
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    // 쿼리 값
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    console.log(pathname);
    // 홈페이지
    if(pathname === '/'){
      if(queryData.id === undefined){
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
      // 
      } else {
          fs.readdir('./data', function(error, filelist){
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
              var title = queryData.id;
              var list = template.list(filelist); 
              var html = template.html(title, list,
                `
                <h2>${title}</h2>
                <div>${description}</div>
                `,
                // 글 생성, 업데이트, 삭제 링크
                `<a href="/create">create</a>
                <a href="/update?id=${title}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <input type="submit" value="delete">
                </form>
                `
              );
              response.writeHead(200);
              response.end(html);
            });
          });
        }
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
      })
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
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
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
        fs.unlink(`data/${id}`, function(error){
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
module.exports = {
    html: function(title, list, body, control = null){
      if(control === null){
        return `
      <!doctype html>
      <html lang="ko">
      <head>
        <title>마당발 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">마당발</a></h1>
        ${list}
        ${body}
      </body>
      </html>
      `;
      } else {
      return `
      <!doctype html>
      <html lang="ko">
      <head>
        <title>마당발 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">마당발</a></h1>
        ${list}
        ${control}
        ${body}
      </body>
      </html>
      `;
      }
    },
    list: function(authors){
      var list = '<ul>';
      var i = 0;
      while(i < authors.length){
        list = list + `<li><a href="/?id=${authors[i].id}">${authors[i].name}</a></li>`;
        i = i + 1;
      }
      list = list+'</ul>';
      return list;
    }
}




module.exports = {
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




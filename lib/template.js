module.exports = {
    html: function(title, list, body, control = null){
      if(control === null){
        return `
        <!doctype html>
        <html lang="ko">
        <head>
            <title>마당발 - ${title}</title>
            <meta charset="utf-8">
            <link rel="stylesheet" href="css/bootstrap-5.3.0-alpha1-dist/css/bootstrap.min.css">
            <link rel="stylesheet" href="css/main.css">
        </head>
        <body>
            <div class="container">
                <header>
                    <h1 class="text-center"><a href="/">마당발</a></h1>
                </header>
                ${list}
                ${body}
            </div>
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




var fs = require('fs');
fs.readFile('nodejs/sample.txt', 'utf8', function(err, data){
console.log(data);
});
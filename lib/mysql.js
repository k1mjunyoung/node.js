var mysql      = require('mysql');
var config     = require('./mysqlConfig');

var connection = mysql.createConnection({
  host     : config.host,
  user     : config.user,
  password : config.password,
  database : config.database
});
 
connection.connect();
 
connection.query('SELECT * FROM test', function (error, results, fields) {
  if (error){
    console.log(error);
  }
  console.log(results);
});
 
connection.end();
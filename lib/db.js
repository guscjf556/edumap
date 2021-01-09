
var mysql = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost' ,
  user     : 'root',
  password : 'uf8829ZI@!',
  database : 'schoolplant',
  port     : 3306
})
db.connect();


module.exports = db;

var mysql = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost' ,
  user     : 'ubuntu',
  password : 'uf8829ZI@!',
  database : 'schoolplant'
})
db.connect();


module.exports = db;
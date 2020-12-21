
var mysql = require('mysql');
var db = mysql.createConnection({
  host     : 'palnt2.c8a3jrpe1lpn.ap-northeast-2.rds.amazonaws.com' ,
  user     : 'jungsik',
  password : 'wjdtlr813',
  database : 'school_plant',
  port     : 3306
})
db.connect();


module.exports = db;
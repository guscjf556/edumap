const db = require('./db');
const bcrypt = require('bcrypt');
module.exports =  function (app){
 
//papssport 불러오기
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

//passport 관련 설치
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.query('SELECT * FROM user WHERE id = ?',[id],function(err, result){
    if(err) throw ('mysql 에러');
    var user = result[0];
    done(null, user);
  })
});

//passport 직접적으로 사용 로컬전략

passport.use(new LocalStrategy({
  usernameField : 'email',
  passwordField : 'pw'
},
  function(email, password, done) {
    db.query('SELECT * FROM user WHERE email = ?',[email],function(err,user){
      if (err) throw err
      if(user[0]){
        bcrypt.compare(password, user[0].pwd, function(err, _result){
          if(_result){
            return done(null, user[0]);
          }else{
            return done(null, false, {message : '비밀번호가 틀립니다.'})
          }
        })
      }else{
        return done(null, false, {message : '아이디가 없습니다.'})
      }
    }) 
  }
));

//passport가 로그인을 처리하는 과정
app.post('/u/login_process',
  passport.authenticate('local', { successRedirect: '/o',
                                   failureRedirect: '/u/login', 
                                   failureFlash: true}));

return passport;
}







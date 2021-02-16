const express = require('express');
const router = express.Router();
const template = require('../components/template');
const register = require('../components/register');
const db = require('../lib/db');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { dequeue } = require('jquery');

module.exports = function(passport){

//로그인 화면
router.get('/login', function(req, res) {
  var fmsg = req.flash();
  var feedback = '';
  if(fmsg.error){
    feedback = fmsg.error[0];
  }
  html = template.HTML(`
    <div class="container mt-5">
    <h1 class="display-4 d-flex justify-content-center text-success">로그인</h1>
    <div class="card" style="width: 80%;margin: auto">
    <div class="card-body">
      <p class="card-text">
        <small class="text-danger">${feedback}</small>
        <form action = "/u/login_process" method = "post">
          <div class="form-group">
            <label for="email">아이디</label>
            <input type="text" class="form-control" id="email" name="email" aria-describedby="emailHelp">
          </div>
          <div class="form-group">
            <label for="pw">비밀번호</label>
            <input type="password" class="form-control" id="pw" name="pw">
          </div>
          <div class="d-flex justify-content-center">
            <input type="submit" class="btn btn-success" value="로그인">
          </div>
        </form>
      </p>
    </div>
    </div>
    `)
  res.send(html);
});

//passport가 로그인을 처리하는 과정
router.post('/login_process', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {return next(err);}
    if (!user) { return res.redirect('/u/login')}
    req.logIn(user, (err) => {
      if(err) { return next(err); }
      console.log("login => ", new Date().toLocaleString('ko-Kr'), " ", user.displayName);
      return res.redirect(req.cookies.url);
    });
  }) (req, res, next);
});

// 회원가입
router.get('/register', function(req, res) {
  html = template.HTML(register);
  res.send(html);
});

//회원가입 과정 각종 검증이 필요하다.(ex. email들어가서 인증을 받아야 권한 풀어주기, 중복되는 아이디 있는가 검증)
router.post('/register_process', function (req, res, next) {
  fs.writeFile('test.txt', req.body.email, function(err){
    if (err) throw err;
  });
  var email =req.body.email;
  var pwd = req.body.pwd;
  var pwd2 = req.body.pwd2;
  var displayName = req.body.displayName;
  if(pwd !== pwd2){
    req.flash('error', '비밀번호가 같지 않습니다.')
    res.redirect('/u/register');
  }
  else{
    bcrypt.hash(pwd, 10, function (err, hash){
      db.query('INSERT INTO user (email, pwd, displayName) VALUES(?, ?, ?)',[email, hash, displayName], function(err, result){
        if(err) throw err;
        db.query('SELECT * FROM user ORDER BY userID DESC LIMIT 1', function(err, result){
          if(err) throw err;
          req.login(result[0], function(err){
            if(err) throw err;
            return res.redirect('/o');
          })
        })
      });
    })
    
  }
})

//로그아웃
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/o')
});

return router;
};
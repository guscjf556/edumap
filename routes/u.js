var express = require('express');
var router = express.Router();
var template = require('../lib/template');
var db = require('../lib/db');
var fs = require('fs');
const bcrypt = require('bcrypt');
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
            <label for="email">이메일</label>
            <input type="email" class="form-control" id="email" name="email" aria-describedby="emailHelp">
          </div>
          <div class="form-group">
            <label for="pw">비밀번호</label>
            <input type="password" class="form-control" id="pw" name="pw">
          </div>
          <div class="d-flex justify-content-center">
            <button type="submit" class="btn btn-success">로그인</button>
          </div>
        </form>
      </p>
    </div>
    </div>
    `)
  res.send(html);
});

//passport가 로그인을 처리하는 과정
router.post('/login_process',
  passport.authenticate('local', { 
    successRedirect: '/o',
    failureRedirect: '/u/login', 
    failureFlash: true}));

// 회원가입
router.get('/register', function(req, res) {
  var fmsg = req.flash();
  var feedback = '';
  if(fmsg.error){
    feedback = fmsg.error[0];
  }
  html = template.HTML(`
    <div style= "color:red">${feedback}</div>
    <div class="container mt-5">
      <h1 class="display-4 d-flex justify-content-center text-success">회원가입</h1>
      <p class="lead d-flex justify-content-center">아래의 정보를 입력해주세요.</p>
      <div class="card" style="width: 80%;margin: auto">
      <div class="card-body">
        <p class="card-text">
          <form id="form_register" action = "/u/register_process" method = "post" onsubmit="return isValid()">
            <div class="form-group">
              <label for="email">이메일 주소</label>
              <input type="email" class="form-control" id="email" name="email" aria-describedby="emailHelp" required pattern="^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$">
              <small id="emailHelp" class="form-text text-muted">이메일 주소를 적어주세요.</small>
            </div>
            <div class="form-group">
              <label for="pwd">비밀번호</label>
              <input type="password" class="form-control" id="pwd" name="pwd" aria-describedby="pwdHelp" required pattern="^[0-9a-zA-Z]+$">
              <small id="pwdHelp" class="form-text text-muted">'영문 대/소문자'와 '숫자'만 사용 가능합니다(특수기호 사용 불가능).</small>
            </div>
            <div class="form-group">
              <label for="pwd2">비밀번호 확인</label>
              <input type="password" class="form-control" id="pwd2" name="pwd2" aria-describedby="pwd2Help" required pattern="^[0-9a-zA-Z]+$">
              <small id="pwd2Help" class="form-text text-muted"></small>
            </div>
            <div class="form-group">
              <label for="displayName">별명</label>
              <input type="text" class="form-control" id="displayName" name="displayName" aria-describedby="displayNameHelp" required pattern="^[0-9a-zA-z가-힣]+$">
              <small id="displayNameHelp" class="form-text text-muted">'영문 대/소문자'와 '숫자'만 사용 가능합니다(특수기호 사용 불가능)</small>
            </div>
            <button type="submit" class="btn btn-success">회원가입</button>
          </form>
        </p>
      </div> 
    </div>

    <script>
      function isValid(){
        var form_register = document.getElementById('form_register');
        var pwd1 = form_register.pwd.value;
        var pwd2 = form_register.pwd2.value;
        var pw1_regex = /^[0-9a-zA-z]+$/;

        if(!pw1_regex.test(pwd1)){
          var pwdHelp = document.getElementById('pwdHelp');
          pwdHelp.classList.remove('text-muted');
          pwdHelp.classList.add('text-danger');
          pwdHelp.style.fontWeight = "bold";
          return false;
        }

        if(pwd1 !== pwd2){
          var pwd2Help = document.getElementById('pwd2Help');
          pwd2Help.innerHTML = "비밀번호가 일치하지 않습니다.";
          pwd2Help.classList.remove('text-muted');
          pwd2Help.classList.add('text-danger');
          pwd2Help.style.fontWeight = "bold";
          return false;

        };
        return true;
      }
    </script>
    `)
  res.send(html);
});

//회원가입 과정 각종 검증이 필요하다.(ex. email들어가서 인증을 받아야 권한 풀어주기, 중복되는 아이디 있는가 검증)
router.post('/register_process', function (req, res, next) {
  fs.writeFile('test.txt', req.body.email, function(err){
    if (err) return console.log(err);
    console.log(req.body);
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
        db.query('SELECT * FROM user ORDER BY id DESC LIMIT 1', function(err, result){
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
}

  

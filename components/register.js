const register =  `
    <div class="container mt-5">
      <h1 class="display-4 d-flex justify-content-center text-success">회원가입</h1>
      <p class="lead d-flex justify-content-center">아래의 정보를 입력해주세요.</p>
      <div class="card" style="width: 80%;margin: auto">
      <div class="card-body">
        <p class="card-text">
          <form id="form_register" action = "/u/register_process" method = "post" onsubmit="return isValid()">
            <div class="form-group">
              <label for="email">아이디</label>
              <input type="text" class="form-control" id="user_id" name="email" aria-describedby="emailHelp" required>
              <small id="duplicateCheckResult" class="form-text"></small>
              <small id="emailHelp" class="form-text text-muted">한글과 띄어쓰기는 사용할 수 없습니다.</small>
            </div>
            <div class="form-group">
              <label for="pwd">비밀번호</label>
              <input type="password" class="form-control" id="pwd" name="pwd" aria-describedby="pwdHelp" required>
              <small id="pwdHelp" class="form-text text-muted">한글과 띄어쓰기는 사용할 수 없습니다.</small>
              <div>
                <small class="text-warning">⚠️이 사이트의 보안은 강하지 않습니다. 평소에 쓰는 비밀번호는 사용하지 말아주세요.</small>
              </div>
            </div>
            <div class="form-group">
              <label for="pwd2">비밀번호 확인</label>
              <input type="password" class="form-control" id="pwd2" name="pwd2" aria-describedby="pwd2Help" required>
              <small id="pwd2Help" class="form-text text-muted"></small>
            </div>
            <div class="form-group">
              <label for="displayName">별명</label>
              <input type="text" class="form-control" id="displayName" name="displayName" aria-describedby="displayNameHelp" required>
              <small id="displayNameHelp" class="form-text text-muted">한글 사용 가능</small>
            </div>
            <input type="submit" class="btn btn-success d-block w-100" value="회원가입">
          </form>
        </p>
      </div> 
    </div>

    <script>
      let didCheck = false;
      const form_register = document.getElementById('form_register');
      const emailHelp = document.getElementById('emailHelp');
      const pwd1 = form_register.pwd.value;
      const pwd2 = form_register.pwd2.value;
      const whitespace = /\\s/g;
      const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

      function isValid(){


        if(koreanRegex.test(pwd1) || whitespace.test(pwd1)){
          var pwdHelp = document.getElementById('pwdHelp');
          pwdHelp.classList.remove('text-muted');
          pwdHelp.classList.add('text-danger');
          pwdHelp.style.fontWeight = "bold";
          pwdHelp.previousElementSibling.value = "";
          return false;
        }

        if(pwd1 !== pwd2){
          var pwd2Help = document.getElementById('pwd2Help');
          pwd2Help.innerHTML = "비밀번호가 일치하지 않습니다.";
          pwd2Help.classList.remove('text-muted');
          pwd2Help.classList.add('text-danger');
          pwd2Help.style.fontWeight = "bold";
          pwd2Help.previousElementSibling.value = "";
          return false;

        };
        if(didCheck === true) { return true };
        return false;
      }

      $('#user_id').change((e) => {
        if(koreanRegex.test(e.target.value) || whitespace.test(e.target.value)){
          e.target.value = "";
          emailHelp.classList.remove('text-muted');
          emailHelp.classList.add('text-danger');
          emailHelp.style.fontWeight = "bold";
          $('#duplicateCheckResult').html('');
          didCheck = false;
          return;
        }
        emailHelp.classList.remove('text-danger');
        emailHelp.classList.add('text-muted');
        emailHelp.style.fontWeight = "normal";

        $.ajax({
          url: '/o/check-duplicate-id',
          type: 'post',
          data: { id: e.target.value },
          success: function(res){
            if(!res){
              $('#duplicateCheckResult').html('<span class="text-success">사용 가능한 아이디입니다.</span>');
              didCheck = true;
            }
            else {
              $('#duplicateCheckResult').html('<span class="text-danger">이미 가입한 아이디입니다. 다른 아이디를 사용해 주세요.</span>');
              e.target.value = "";
              didCheck = false;
            }
          },
        });
      });
    </script>
  `

module.exports = register;
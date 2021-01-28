//유효성검증, 중복 방지 메커니즘 필요
const render =`
  <div class="container mt-5">
    <h1 class="display-4 d-flex justify-content-center text-success">프로젝트 만들기</h1>
    <p class="lead d-flex justify-content-center">아래의 정보를 입력해주세요.</p>
    <div class="card" style="width: 80%;margin: auto">
    <div class="card-body">
      <div class="card-text">
        <form id="createProjectForm" action = "/u/create-project-process" method = "post" onsubmit="return isValid()">
          <div class="form-group">
            <label for="projectTitle">프로젝트 이름</label>
            <input type="text" class="form-control" id="projectTitle" name="projectTitle" pattern="^[0-9a-zA-Z가-힣()-_]+$" required>
            <small class="form-text text-muted">프로젝트명을 적어주세요.</small>
          </div>
          <div class="form-group">
            <label for="projectDescription">프로젝트 소개</label>
            <textarea class="form-control" id="projectDescription" name="projectDescription" required row="3"></textarea>
          </div>
          <div class="form-group">
            <label for="projectPasscode">프로젝트 가입 코드<span class="text-danger">('," 사용불가)</span></label>
            <input type="text" class="form-control" id="projectPasscode" name="projectPasscode" required pattern="^[0-9a-zA-Z~!@#$%^&*()-_=+|[]{};:,.<>/?]+$">
            <small class="form-text text-muted">다른 사용자의 프로젝트 가입 시 필요한 코드입니다. 이 코드는 암호화되지 않습니다. 개인적인 비밀번호를 사용하지 말아주세요.</small>
          </div>
          <div class="form-group">
            <label for="pwd2">비밀번호 확인</label>
            <input type="password" class="form-control" id="projectPasscodeConfirm" name="projectPasscodeConfirm" required pattern="^[0-9a-zA-Z~!@#$%^&*()-_=+|[]{};:,.<>/?]+$">
          </div>
          <button type="submit" class="btn btn-success w-100">프로젝트 만들기</button>
        </form>
      </div>
    </div> 
  </div>
`

module.exports = render;
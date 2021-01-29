//가입되어 있으면 이미 가입되어 있다고 메시지 띄우기
const render = `
    <div class="container mt-5">
    <h1 class="display-4 d-flex justify-content-center text-success">프로젝트 가입</h1>
    <div class="card" style="width: 80%;margin: auto">
    <div class="card-body">
      <p class="card-text">
        <form action = "/o/join-project-process" method = "post">
          <div class="form-group">
            <label for="projectPasscode">프로젝트 가입 코드</label>
            <input type="text" class="form-control" id="projectPasscode" name="projectPasscode">
            <small class="form-text text-muted">프로젝트 관리자에게 받은 가입 코드를 입력하세요.</small>
          </div>
          <div class="d-flex justify-content-center">
            <input type="submit" class="btn btn-success" value="프로젝트 가입">
          </div>
        </form>
      </p>
    </div>
    </div>
    `

module.exports = render;
const render = `
    <div class="container mt-5">
    <h1 class="display-4 d-flex justify-content-center text-success">프로젝트 가입</h1>
    <div class="card" style="width: 80%;margin: auto">
    <div class="card-body">
      <p class="card-text">
        <form action = "/u/join-project-process" method = "post">
          <div class="form-group">
            <label for="projectPasscode">프로젝트 가입 코드</label>
            <input type="text" class="form-control" id="projectPasscode" name="projectPasscode">
            <small class="form-text text-muted">프로젝트 관리자에게 받은 가입 코드를 입력하세요.</small>
          </div>
          <div class="d-flex justify-content-center">
            <button type="submit" class="btn btn-success">로그인</button>
          </div>
        </form>
      </p>
    </div>
    </div>
    `

module.exports = render;
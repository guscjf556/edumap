const updateProject = (projectInfo) => {
  const render = `
  <div class="container mt-5">
    <h1 class="display-4 d-flex justify-content-center text-success">프로젝트 수정</h1>
    <p class="lead d-flex justify-content-center">아래의 정보를 입력해주세요.</p>
    <div class="card" style="width: 80%;margin: auto">
    <div class="card-body">
      <div class="card-text">
        <form id="createProjectForm" action = "/o/update-project-process" method = "post">
          <div class="form-group">
            <label for="projectTitle">프로젝트 이름</label>
            <input type="text" class="form-control" id="projectTitle" name="projectTitle" pattern="^.+$" value="${projectInfo.project_title}" required>
            <small class="form-text text-muted">프로젝트명을 적어주세요.</small>
          </div>
          <div class="form-group">
            <label for="projectDescription">프로젝트 소개</label>
            <textarea class="form-control" id="projectDescription" name="projectDescription" row="3">${projectInfo.project_description}</textarea>
          </div>
          <div>
            <p>프로젝트 입장 코드</p>
            <p id="duplicateCheckResult" class="form-text text-primary">${projectInfo.project_passcode}</p>
            <small class="form-text text-muted">프로젝트 입장 코드는 수정할 수 없습니다.</small>
          </div>
          <input type="hidden" name="originalProjectTitle" value="${projectInfo.project_title}">
          <input type="submit" class="btn btn-success w-100" value="프로젝트 수정">
        </form>
        <form action="/o/delete-project" method="post">
          <input type="hidden" name="projectId" value = "${projectInfo.project_id}">
          <button type="button" class="btn btn-danger btn-sm d-block ml-auto my-3" onclick="showDeleteModal()">삭제하기</button>
          <!-- 삭제하기 경고 모달 -->
          <div class="modal fade" id="modal-deletePost" role="dialog" tabindex="-1">
            <div class="modal-dialog  modal-dialog-centered">
              <div class="modal-content text-center">
                <div class="modal-header">
                  <h5 class="modal-title">삭제</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <p>프로젝트를 삭제하시겠습니까?<br>삭제하면 되돌릴 수 없습니다.</p>
                </div>
                <div class="modal-footer">
                  <input type="submit" class="btn btn-sm btn-danger" value="삭제">
                  <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">취소</button>
                </div>
              </div>
            </div>
          </div> 
        </form>
        <script>
        function showDeleteModal(){
          $('#modal-deletePost').modal('show');
        }
        </script>
      </div>
    </div> 
  </div>
  <script>
  const checkDuplicatePasscode = () => {
    const projectPasscode = $('#projectPasscode').val()
    $.ajax({
      url: '/o/check-duplicate-passcode',
      type: 'post',
      data: { passcode: projectPasscode },
      success: function(res){
        if(!res){
          $('#duplicateCheckResult').html('<span class="text-success">사용 가능한 코드입니다.</span>');
        }
        else {
          $('#duplicateCheckResult').html('<span class="text-danger">다른 코드를 사용해 주세요.</span>');
        }
      },
    });
  }
  </script>
  `
  return render
}

module.exports = updateProject;
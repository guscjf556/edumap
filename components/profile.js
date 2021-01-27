const profile = (userInfo, userProjectsInfo) => {
  let cardContainer = ""
  if(userProjectsInfo) {
    cardContainer += `
    <div class="container">
      <div class="row row-cols-1">
    `;

    for(const projectInfo of userProjectsInfo){
      cardContainer += `
      <div class="col">
        <div class="card border rounded-lg shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-dark font-weight-bolder">${projectInfo.project_title}</h5>
            <p class="card-text">
            <a href="/u/${projectInfo.project_id}" id="${projectInfo.project_id}" class="btn btn-sm btn-success text-decoration-none">입장하기</a>
            <button class="btn btn-sm btn-danger" onclick="quitProject(this);">탈퇴하기</button>
            </p>
          </div>
        </div>
      </div>
      `;
    }
    cardContainer += `
      </div>
    </div>
    `
  }
  else { 
    const cardContainer = `
    <div class="text-center">
      <h4>현재 참여 중인 프로젝트가 없습니다.</h4>
    </div>
    ` 
  }; 
  
  const render = `
  <div class="container">
    <div>내 별명: ${userInfo.displayName}</div>
    <div>
      <form action="/u/nickname-change-process" method="post">
        <input type="text" name="nickname">
        <input type="submit">
      </form>
    </div>
  </div>
  <div class="container">
    <div>
      <div>
        내가 참여한 프로젝트
      </div>
      <div>
        ${cardContainer}
      </div>
      <div>
        <button onclick="location.replace('/u/join-project')">프로젝트 가입하기</button>
        <button onclick="location.replace('/u/create-project')">프로젝트 만들기</button>
      </div>
    <div>
  </div>
  <script>
  const quitProject = (target) => {
    const project_id = target.previousElementSibling.id;
    $.ajax({
      url: '/u/quit-project-process/' + project_id,
      type: 'post',
      success: function(){
        location.reload();
      },
    });
  }
  </script>
  `
  return render
};

module.exports = profile;
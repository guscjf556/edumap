const profile = (userInfo, myProjectsInfo, userProjectsInfo) => {
  //내가 만든 프로젝트 렌더
  let myProjects = "";
  if(myProjectsInfo) {
    myProjects += `
    <div class="row row-cols-1">
    `;

    for(const myProject of myProjectsInfo){
      myProjects += `
      <div class="col my-1">
        <div class="card border rounded-lg shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-dark font-weight-bolder">${myProject.project_title}</h5>
            <p class="card-text">
            <a href="/o/project/${myProject.project_id}" id="${myProject.project_id}" class="btn btn-sm btn-success text-decoration-none">입장하기</a>
            <a href="/o/update-project/${myProject.project_id}" id="${myProject.project_id}" class="btn btn-sm btn-warning text-decoration-none">정보 보기/수정</a>
            </p>
          </div>
        </div>
      </div>
      `;
    }
    myProjects += `
    </div>
    `
  }
  else { 
    myProjects = `
    <div class="row row-cols-1">
      <div class="text-center">내가 만든 프로젝트가 없습니다.</div>
    </div>
    ` 
  }; 
  
  //내가 가입한 프로젝트 렌더
  let projectsIJoined = `<div class="row row-cols-1">`;
  if(userProjectsInfo) {
    for(const projectInfo of userProjectsInfo){
      if(parseInt(projectInfo.project_manager) === parseInt(userInfo.userID)){
        continue;
      }
      projectsIJoined += `
      <div class="col my-1">
        <div class="card border rounded-lg shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-dark font-weight-bolder">${projectInfo.project_title}</h5>
            <p class="card-text">
            <p>관리자: ${projectInfo.displayName}</p>
            <a href="/o/project/${projectInfo.project_id}" id="${projectInfo.project_manager}" class="btn btn-sm btn-success text-decoration-none">입장하기</a>
            <button class="btn btn-sm btn-danger" onclick="quitProject(this);">탈퇴하기</button>
            </p>
          </div>
        </div>
      </div>
      `;
    }
  };

  if(projectsIJoined === `<div class="row row-cols-1">`){
    projectsIJoined += `<div class="text-center">현재 가입한 프로젝트가 없습니다.</div>`
  }
  
  projectsIJoined +=`</div>`
  
  const render = `
  <div class="container">
    <div class="container border rounded-lg my-2">
      <div class="my-2">
        <h5>별명 바꾸기</h5>
        <div> 내 별명: <span class="text-success">${userInfo.displayName}</span></div>
        <form class="row" action="/o/nickname-change-process" method="post">
          <div class="col-1"></div>
          <input class="form-control col-7" type="text" name="nickname">
          <input class="btn btn-sm btn-secondary col-3" type="submit" value="(으)로 바꾸기">
          <div class="col-1"></div>
        </form>
      </div>
    </div>
    <div class="container my-2">
      <div class="row border rounded-lg">
        <div class="col-12 my-2">
          <div class="my-1">
            <h5 class="d-inline-block">내가 만든 프로젝트</h5><button class="btn btn-sm btn-secondary d-inline-block float-right" onclick="location.replace('/o/create-project')">프로젝트 만들기</button>
          </div>
          <div>
            ${myProjects}
          </div>
        </div>
        <div class="col-12 my-2">
          <div class="my-1">
            <h5 class="d-inline-block">내가 참여한 프로젝트</h5><button class="btn btn-sm btn-secondary d-inline-block float-right" onclick="location.replace('/o/join-project')">프로젝트 가입하기</button>
          </div>
          <div>
            ${projectsIJoined}
          </div>
        </div>
      </div>
    </div>
  </div>
  <script>
  const quitProject = (target) => {
    const project_id = target.previousElementSibling.id;
    $.ajax({
      url: '/o/quit-project-process/' + project_id,
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
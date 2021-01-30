const db = require("./db")

module.exports = {
    IsOwner : function (req){
        if(req.user){
          return true;
        }else{
          return false;
        }
      },
  StatusUI: function (req, res) {
    if (this.IsOwner(req, res)) {
      db.query("SELECT project_id FROM projects_members WHERE user_id = ?", [req.user.userID], (err, result) => {
        if (err) throw err;
        let projectsListRender = "";
        if (result[0]) {
          let userProjectIds = [];
          result.forEach(row => userProjectIds.push(row.project_id));
          db.query("SELECT projects.project_id, projects.project_manager, projects.project_title, user.displayName FROM projects LEFT JOIN user ON projects.project_manager = user.userID WHERE projects.project_id IN (?)", [userProjectIds], (err, result) => {
            if (err) throw err;
            const userProjectsInfo = result;
            for (const userProject of userProjects) {
              projectsListRender += `<a class="dropdown-item" href="/o/project/${userProject.project_id}">${userProject.project_title}</a>`
            }
          })
        }
        else {
          projectsListRender = "<div>가입한 프로젝트가 없습니다.</div>";
        }

        const authStatusUI = `
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink1" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            내 프로젝트
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
            ${projectsListRender}
          </div>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink2" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            내정보
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
            <a class="dropdown-item" href="/o/profile">프로필</a>
            <a class="dropdown-item" href="/o/user">내가 올린 사진</a>
            <a class="dropdown-item" href="/map/user">내가 만든 지도</a>
          </div>
        </li>
        <li class="nav-item" >
          <a href="/o/profile" id="loginCheck" class="nav-link text-dark">${req.user.displayName}</a>
        </li>
        <li class="nav-item" >
          <a class="nav-link" href="/u/logout"> | 로그아웃</a>
        </li>`
        return authStatusUI
      });
    };   
  },
  updateHide: function(req, result){
    if(req.user && req.user.userID == result[0].userID){
      return 'submit'
    }else{
      return 'hidden'
    }
  }
}


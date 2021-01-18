module.exports ={
    IsOwner : function (req){
        if(req.user){
          return true;
        }else{
          return false;
        }
      },
    StatusUI: function(req, res){
        if(this.IsOwner(req, res)){
          authStatusUI = `
            <li>
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                내정보
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
              <a class="dropdown-item" href="/o/user">내가 올린 사진</a>
              <a class="dropdown-item" href="/map/user">내가 만든 지도</a>
              </div>
            </li>
            <li class="nav-item" >
              <a id="loginCheck" class="nav-link">${req.user.displayName}</a>
            </li>
            <li class="nav-item" >
              <a class="nav-link" href="/u/logout"> | 로그아웃</a>
            </li>`
          return authStatusUI
        }
      },
    updateHide: function(req, result){
      if(req.user && req.user.id == result[0].user_id){
        return 'submit'
      }else{
        return 'hidden'
      }
    }
    }


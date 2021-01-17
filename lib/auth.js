module.exports ={
    IsOwner : function (req){
        if(req.user){
          return true;
        }else{
          return false;
        }
      },
    StatusUI: function(req, res){
        var authStatusUI = '<li class="nav-item"><a class="nav-link" href="/u/login">login </a></li><li class="nav-item" ><a class="nav-link" href="/u/register"> | 회원가입</a></li>'
        if(this.IsOwner(req, res)){
          authStatusUI = `<li class="nav-item" ><a id="loginCheck" class="nav-link">${req.user.displayName}</a></li><li class="nav-item" ><a class="nav-link" href="/u/logout"> | 로그아웃</a></li>`
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


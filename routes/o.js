var express = require("express");
var router = express.Router();
var multer = require("multer");
var template = require("../components/template");
var fs = require("fs");
var db = require("../lib/db");
const mapMaker = require("../lib/mapMaker");
const sharp = require('sharp');
const newsFeed = require('../components/newsFeed');
const post = require('../components/post');
const profile = require('../components/profile');
const createProject = require('../components/createProject');
const joinProject = require('../components/joinProject');
const updateProject = require('../components/updateProject');

//멀터 설정 어디에 사진파일을 저장할지
var _storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    !fs.existsSync(`public/images/${req.user.userID}`) && fs.mkdirSync(`public/images/${req.user.userID}`);
    cb(null, `public/images/${req.user.userID}`);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
var upload = multer({ storage: _storage });

// 기본템플릿
var template = require("../components/template.js");
var auth = require("../lib/auth");
const { isBuffer } = require("util");

//개인별 데이터
router.get("/user", (req, res) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/o/notLogin");
    return false;
  }
  db.query(
    "SELECT * FROM topic WHERE topic.userID = ? ",
    [req.user.userID],
    function (err, result) {
      if (err) throw err;
      const body = newsFeed(result);
      const html = template.HTML(body, auth.StatusUI(req, res));
      res.send(html);
    }
  );
});

//로그인 안되었을시
router.get("/notLogin", (req, res) => {
  const html = template.HTML(
    `
  로그인을 해야 이용할 수 있습니다.<br>
  <a href = "/u/login">로그인하기</a><br>
  <a href = "/o">홈으로 돌아가기</a>
  `,
    auth.StatusUI(req, res)
  );
  res.send(html);
});

// 카드 및 첫화면
router.get("/", (req, res) => {
  res.cookie("url", req.originalUrl);
  db.query("SELECT * FROM topic ORDER BY id DESC", (err, result) => {
    const body = newsFeed(result);
    var html = template.HTML(body, auth.StatusUI(req, res));
    res.send(html);
  });
});

//생성
router.get("/create", (req, res) => {
  res.cookie("url", req.originalUrl);
  if (!req.user) {
    res.redirect("/u/login");
    return
  }
  db.query("SELECT projects.project_id, projects.project_title FROM projects LEFT JOIN projects_members ON projects.project_id = projects_members.project_id WHERE projects_members.user_id = ?", [req.user.userID], (err, result) => {
    const projectsIJoined = result;
    const html = template.HTML(template.create(projectsIJoined), auth.StatusUI(req, res));
    res.send(html);
  })
  
});

//생성_과정
let image_array = upload.fields([
  { name: "o_image_1", maxCount: 1 },
  { name: "o_image_2", maxCount: 1 },
  { name: "o_image_3", maxCount: 1 },
  { name: "o_image_4", maxCount: 1 },
  { name: "o_image_5", maxCount: 1 },
]);
router.post("/create_process", image_array, function (req, res, next) {
  (async() => {
    !fs.existsSync(`public/compressed-images/${req.user.userID}`) && fs.mkdirSync(`public/compressed-images/${req.user.userID}`);
    for(let i = 0; i<5; i++){
      if(req.files[`o_image_${i+1}`]===undefined){
        continue;
      }
      await sharp(req.files[`o_image_${i + 1}`][0].path)
        .resize(500, 500, {
          fit: sharp.fit.contain,
          withoutEnlargement: false,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .withMetadata()
        .toFile(`public/compressed-images/${req.user.userID}/${req.files[`o_image_${i + 1}`][0].filename}`)
        fs.unlink(req.files[`o_image_${i+1}`][0].path, (err) => {
          if(err)throw err;
        })
      }
    res.redirect('/o');
  })();
  var images = [];
  for (var i = 1; i < 6; i++) {
    if (req.files[`o_image_${i}`] === undefined) {
      images.push(null);
    } else {
      //현철: 여기도 임의로 경로를 수정했습니다.
      var imagePath = `compressed-images/${req.user.userID}/${req.files[`o_image_${i}`][0].filename}`
      images.push(imagePath);
    }
  }
  db.query(
    "INSERT INTO topic (o_name, description, created, o_image_1, o_image_2, o_image_3, o_image_4, o_image_5, userID, Lat, Lng, project_id) VALUES (?, ?, ?, ?, ?, ? , ? , ?, ?, ?, ?, ?)",
    [
      req.body.o_name,
      req.body.o_memo,
      req.body.o_time,
      images[0],
      images[1],
      images[2],
      images[3],
      images[4],
      req.user.userID,
      req.body.Lat,
      req.body.Lng,
      req.body.project_id
    ],
    function (err, result) {
      if (err) throw err;
    }
  );
});

//  글 수정하기
router.post("/update/:postId", (req, res) => {
  if(!req.user){
    res.redirect(req.cookies.url);
    return;
  }
  var postId = req.params.postId;
  db.query("SELECT * FROM topic WHERE id=?", [postId], function (err, result) {
    if(err) throw err;
    const postData = result;
    db.query("SELECT projects.project_id, projects.project_title FROM projects LEFT JOIN projects_members ON projects.project_id = projects_members.project_id WHERE projects_members.user_id = ?", [req.user.userID], (err, result) => {
      const projectsIJoined = result;
      const html = template.HTML(template.revise(postId, postData, projectsIJoined), auth.StatusUI(req, res));
      res.send(html);
    })
  });
});



// 글 수정하기 process
router.post("/update_process", image_array, (req, res, next) => {
  //현철: 여기도 생성하기 페이지와 같이 압축하는 비동기를 앞으로 빼놨고, 압축 과정이 끝나면 리다이렉트 되도록 했습니다.
  
  (async() => {
    for(let i = 0; i<5; i++){
      if(req.files[`o_image_${i+1}`] === undefined){
        continue;
      }
        await sharp(req.files[`o_image_${i+1}`][0].path)
        .resize(500, 500, {
          fit: sharp.fit.contain,
          withoutEnlargement: false,
          background : {r:255, g:255, b:255, alpha: 1}
        })
        .withMetadata()
        .toFile(`public/compressed-images/${req.user.userID}/${req.files[`o_image_${i+1}`][0].filename}`);
        fs.unlink(req.files[`o_image_${i+1}`][0].path, (err) => {
          if(err)throw err;
        })
      }
    res.redirect('/o');
  })();

  //추가되거나 변경된 파일의 경로가 담긴 배열 생성
  var images = [];
  for (var i = 1; i < 6; i++) {
    if (req.files[`o_image_${i}`] == undefined) {
      images.push(null);
    } else {
      var imagePath = `compressed-images/${req.user.userID}/${req.files[`o_image_${i}`][0].filename}`
      images.push(imagePath);
    }
  }
  db.query("SELECT o_image_1, o_image_2, o_image_3, o_image_4, o_image_5 FROM topic WHERE id = ?", [req.body.topic_id], (err, result) => {
    //현철: 데이터베이스에 저장된 사진의 기존 경로가 담긴 배열 생성
    const imgPath = Object.values(result[0])
    //현철: 수정을 통해 받아온 파일이 없다면(null), 기존 저장된 파일의 경로를 images 배열에 입력
    for(let i = 0; i < images.length; i++){
      if(!images[i]){
        images[i] = imgPath[i];
      }
    }
    const revisedPost = req.body;
    const o_name = revisedPost.o_name;
    const description = revisedPost.o_memo;
    const created = revisedPost.o_time;
    const Lat = revisedPost.Lat;
    const Lng = revisedPost.Lng;
    const topic_id = revisedPost.topic_id;
    const project_id = revisedPost.project_id;
    db.query(
      "UPDATE topic SET o_name = ? , description = ?,  created = ?, o_image_1 = ?, o_image_2= ?, o_image_3 = ?, o_image_4 = ?, o_image_5 = ?, Lat = ?, Lng = ?, project_id = ? WHERE id = ?",
      [
        o_name, 
        description, 
        created, 
        images[0],
        images[1],
        images[2],
        images[3],
        images[4],
        Lat,
        Lng,
        project_id,
        topic_id
      ],
      (err, result) => {
        if (err) throw err;
      }
    );
  })
});

// 글 삭제하기
router.post("/delete", (req, res) => {
  db.query(
    "SELECT o_image_1, o_image_2, o_image_3, o_image_4, o_image_5 FROM topic WHERE id = ?",[req.body.o_id],function (err, result) {
      if (err) throw err;
        for(let i = 0; i < 5; i++){
          if(result[0][`o_image_${i+1}`]===null){
            continue;
          }
          fs.unlink(`public/${result[0][`o_image_${i+1}`]}`, (err) => {
            if(err)throw err;
          })
        }
        db.query("DELETE FROM topic WHERE id = ?", [req.body.o_id]),
        function (err, result) {
          if (err) throw err;
        };
        db.query("DELETE FROM Comments WHERE PostID = ?", [req.body.o_id], (err, result) => {if (err) throw err});
    }
  );
  res.redirect("/o");
});


// 상세보기
router.get("/post/:postId", (req, res) => {
  res.cookie("url", req.originalUrl);
  const postId = req.params.postId;
  db.query(
    "SELECT Comments.*, user.displayName FROM Comments LEFT JOIN user ON Comments.commentUserID = user.userID WHERE Comments.postID = ?", [postId], (err, commentsData) => {
      if(err) throw err;
      db.query(
        "SELECT * FROM topic LEFT JOIN user ON topic.userID = user.userID WHERE topic.id = ?",
        [postId],
        (err, result) => {
          if(err) throw err
          if(!result[0]){
            res.redirect('/o');
            return;
          }
          const postData = result[0];
          const body = post(postData, commentsData, req);
          const html = template.HTML(body, auth.StatusUI(req, res));
          res.send(html);
        }
      );
    }
  )
});

//댓글 업로드 작업
router.post("/comment-process/:postID", (req, res) => {
  const postID = parseInt(req.params.postID);
  const userID = req.user.userID;
  const content = req.body.commentContent;
  db.query("INSERT INTO Comments (PostID, CommentUserID, Content) VALUE (?, ?, ?)", [postID, userID, content], (err, result) => {
    if (err) throw err;
    db.query("SELECT Comments.*, user.displayName FROM Comments LEFT JOIN user ON Comments.commentUserID = user.userID WHERE postID = ?", [postID], (err, comments) => {
      if (err) throw err;
      for(let i = 0; i < comments.length; i++){
        comments[i].Created = comments[i].Created.toLocaleString('ko-KR');
      }
      res.send(comments);
    })
  });
})

//댓글 지우기 작업
router.post("/delete-comment-process/:comment_id", (req, res) => {
  const comment_id = parseInt(req.params.comment_id);
  db.query("DELETE FROM Comments WHERE comment_id=?", [comment_id], err => {
    if(err) throw err;
    res.send("success");
  });
})

//프로필 페이지
router.get('/profile', (req, res) => {
  res.cookie("url", req.originalUrl);
  if(!req.user){
    res.redirect("/u/login");
    return
  }
  const userInfo = req.user;
  db.query("SELECT project_id, project_title FROM projects WHERE project_manager = ?", [req.user.userID], (err, result) => {
    const myProjectsInfo = result[0] ? result : null;
    let userProjectsInfo;
    db.query("SELECT project_id FROM projects_members WHERE user_id = ?", [userInfo.userID], (err, result) => {
      if(err) throw err;
      if(result[0]){
        let userProjectIds = [];
        result.forEach(row => userProjectIds.push(row.project_id));
        db.query("SELECT projects.project_id, projects.project_manager, projects.project_title, user.displayName FROM projects LEFT JOIN user ON projects.project_manager = user.userID WHERE projects.project_id IN (?)", [userProjectIds], (err, result) => {
          if(err) throw err;
          userProjectsInfo = result;
          const html = template.HTML(profile(userInfo, myProjectsInfo, userProjectsInfo),auth.StatusUI(req, res));
          res.send(html);
        });
      }
      else {
        const html = template.HTML(profile(userInfo, myProjectsInfo, userProjectsInfo),auth.StatusUI(req, res));
        res.send(html);
      };
    });  
  });
});

//별명 변경 작업
router.post('/nickname-change-process', (req, res) => {
  const newNickname = req.body.nickname;
  db.query("UPDATE user SET displayName = ? WHERE userID = ?", [newNickname, req.user.userID], (err) => {
    if(err) throw err;
  })
  res.redirect('/o/profile');
})

//프로젝트 생성 페이지
router.get('/create-project', (req, res) => {
  if(!req.user){
    res.redirect('/o/profile');
  }
  else{
    res.send(template.HTML(createProject, auth.StatusUI(req, res)));
  }
})

//프로젝트 생성 작업
router.post('/create-project-process', (req, res) => {
  const projectTitle = req.body.projectTitle;
  const projectPasscode = req.body.projectPasscode;
  const projectDescription = req.body.projectDescription;
  db.query("INSERT INTO projects (project_manager, project_title, project_passcode, project_description) VALUES (?, ?, ?, ?)", [req.user.userID, projectTitle, projectPasscode, projectDescription], (err) => {
    if(err) throw err;
    db.query("SELECT project_id FROM projects WHERE project_passcode = ?", [projectPasscode], (err, result) => {
      if(err) throw err;
      const projectId = result[0].project_id;
      db.query("INSERT INTO projects_members (project_id, user_id) VALUES (?, ?)", [projectId, req.user.userID], (err) => {
        if(err) {
          console.log(err);
        }
        res.redirect('/o/profile');
      });
    });
  });
});

//프로젝트 가입 페이지
router.get('/join-project', (req, res) => {
  if(!req.user){
    res.redirect('/o/profile');
  }
  else{
    res.send(template.HTML(joinProject,auth.StatusUI(req, res)));
  }
})

//프로젝트 가입 작업
router.post('/join-project-process', (req, res) => {
  const projectPasscode = req.body.projectPasscode;
  db.query("SELECT project_id FROM projects WHERE project_passcode = ?", [projectPasscode], (err, result) => {
    if(err) throw err;
    const projectId = result[0].project_id;
    db.query("INSERT INTO projects_members (project_id, user_id) VALUES (?, ?)", [projectId, req.user.userID], (err) => {
      if(err) {
        console.log(err);
      }
      res.redirect('/o/profile');
    })
  })
});

//프로젝트 탈퇴 페이지
router.post('/quit-project-process/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  db.query("DELETE FROM projects_members WHERE project_id = ? AND user_id = ?", [projectId, req.user.userID], (err) => {
    if(err) throw err;
    res.redirect('/o/profile');
  });
})

//프로젝트 페이지
router.get('/project/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  if(!req.user) {
    res.redirect('/o');
    return;
  } 
  db.query("SELECT project_id FROM projects_members WHERE user_id = ?", [req.user.userID], (err, result) => {
    if(err) throw err;
    const checkMembership = result.some((project) => {
      return project.project_id === parseInt(projectId)
    });
    if(!checkMembership) {
      res.redirect('/o');
    }
    else {
      db.query("SELECT * FROM topic WHERE project_id = ? ORDER BY id DESC", [projectId], (err, result) => {
        const body = newsFeed(result);
        var html = template.HTML(body, auth.StatusUI(req, res));
        res.send(html);
      });
    };
  })
});

//프로젝트 생성 시 중복 확인 작업
router.post('/check-duplicate-passcode', (req, res) => {
  const passcode = req.body.passcode;
  db.query("SELECT * FROM projects WHERE project_passcode = ?", [passcode], (err, result) => {
    if(err) throw err;
    if(result[0]){ res.send(true); } else { res.send(false) };
  })
})

//프로젝트 수정 페이지
router.get('/update-project/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  db.query("SELECT * FROM projects WHERE project_id = ?", [projectId], (err, result) => {
    if(err) throw err;
    if(req.user?.userID === result[0].project_manager){
      res.send(template.HTML(updateProject(result[0]), auth.StatusUI(req, res)))
    }
    else {
      res.redirect('/o')
    }
  })
})

//프로젝트 수정 작업
router.post('/update-project-process', (req, res) => {
  const projectTitle = req.body.projectTitle;
  const projectDescription = req.body.projectDescription;
  const originalProjectTitle = req.body.originalProjectTitle;
  db.query("UPDATE projects SET project_title = ?, project_description = ? WHERE project_title= ?", [projectTitle, projectDescription, originalProjectTitle], (err) => {
    if(err) throw err;
    res.redirect('/o/profile');
  })
})

//프로젝트 삭제
router.post('/delete-project', (req, res) => {
  const projectId = req.body.projectId;
  db.query("DELETE FROM projects WHERE project_id = ?", [projectId], (err) => {
    if(err) throw err;
    db.query("DELETE FROM projects_members WHERE project_id = ?", [projectId], (err) => {
      if(err) throw err;
      res.redirect('/o/profile');
    })
  })
})

//네비게이션바 프로젝트 목록 불러오기 AJAX
router.post('/get-navbar-project-list-process/:userId', (req, res) => {
  const userId = req.body.userId;
  db.query("SELECT projects.project_id, projects.project_title FROM projects LEFT JOIN projects_members ON projects.project_id = projects_members.project_id WHERE projects_members.user_id = ?", [userId], (err, result) => {
    if(err) throw err;
    let render = "";
    if(result[0]){
      for(const project of result) {
        render += `<a href="/o/project/${project.project_id}" class="dropdown-item">${project.project_title}</a>`
      };
    }
    else {
      render += `<div class="dropdown-item"><small>가입한 프로젝트가 없습니다.</small></div>`;
    }
    
    res.send(render);
  });
});

module.exports = router;

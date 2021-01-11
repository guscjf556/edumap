var express = require("express");
var router = express.Router();
var multer = require("multer");
var template = require("../components/template.js");
var fs = require("fs");
var db = require("../lib/db");
const mapMaker = require("../lib/mapMaker");
const sharp = require('sharp');
const newsFeed = require('../components/newsFeed');
const post = require('../components/post');


//멀터 설정 어디에 사진파일을 저장할지
var _storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    !fs.existsSync(`public/images/${req.user.id}`) && fs.mkdirSync(`public/images/${req.user.id}`);
    cb(null, `public/images/${req.user.id}`);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
var upload = multer({ storage: _storage });

// 기본템플릿
var template = require("../components/template.js");
var auth = require("../lib/auth");

//개인별 데이터
router.get("/user", (req, res) => {
  if (!auth.IsOwner(req, res)) {
    res.redirect("/o/notLogin");
    return false;
  }
  db.query(
    "SELECT * FROM topic WHERE topic.user_id = ? ",
    [req.user.id],
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
  db.query("SELECT * FROM topic ORDER BY id DESC", (err, result) => {
    const body = newsFeed(result);
    var html = template.HTML(body, auth.StatusUI(req, res));
    res.send(html);
  });
});

//생성
router.get("/create", (req, res) => {
  
  if (!auth.IsOwner(req, res)) {
    res.redirect("/o");
    return false;
  }
  const html = template.HTML(template.create(), auth.StatusUI(req, res));
  res.send(html);
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
  //현철: 비동기이고, 압축이 시간이 걸려서 앞으로 빼놨고 압축이 끝나면 /o로 리다이렉트 되게 했습니다.
  (async() => {
    !fs.existsSync(`public/compressed-images/${req.user.id}`) && fs.mkdirSync(`public/compressed-images/${req.user.id}`);
    for(let i = 0; i<5; i++){
      if(req.files[`o_image_${i+1}`]===undefined){
        continue;
      }
        await sharp(req.files[`o_image_${i+1}`][0].path)
        .resize(500, 500, {
          fit: sharp.fit.contain,
          withoutEnlargement: false,
          background : {r:255, g:255, b:255, alpha: 1}
        })
        .toFile(`public/compressed-images/${req.user.id}/${req.files[`o_image_${i+1}`][0].filename}`);
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
      var imagePath = `compressed-images/${req.user.id}/${req.files[`o_image_${i}`][0].filename}`
      images.push(imagePath);
    }
  }
  db.query(
    "INSERT INTO topic (o_name, description, created, o_image_1, o_image_2, o_image_3, o_image_4, o_image_5, user_id, Lat, Lng) VALUES (?, ?, ?, ?, ?, ? , ? , ?, ?, ?, ?)",
    [
      req.body.o_name,
      req.body.o_memo,
      req.body.o_time,
      images[0],
      images[1],
      images[2],
      images[3],
      images[4],
      req.user.id,
      req.body.Lat,
      req.body.Lng,
    ],
    function (err, result) {
      if (err) throw err;
    }
  );
});

//  글 수정하기
router.post("/update/:pageId", (req, res) => {
  var pageId = req.params.pageId;
  db.query("SELECT * FROM topic WHERE id=?", [pageId], function (err, result) {
    var html = template.HTML(template.revise(pageId, result), auth.StatusUI(req, res));
    res.send(html);
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
          background : {r:220, g:220, b:220, alpha: 1}
        })
        .toFile(`public/compressed-images/${req.user.id}/${req.files[`o_image_${i+1}`][0].filename}`);
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
      var imagePath = `compressed-images/${req.user.id}/${req.files[`o_image_${i}`][0].filename}`
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
    var revisedPost = req.body;
    var o_name = revisedPost.o_name;
    var description = revisedPost.o_memo;
    var created = revisedPost.o_time;
    var Lat = revisedPost.Lat;
    var Lng = revisedPost.Lng;
    var topic_id = revisedPost.topic_id;
    db.query(
      "UPDATE topic SET o_name = ? , description = ?,  created = ?, o_image_1 = ?, o_image_2= ?, o_image_3 = ?, o_image_4 = ?, o_image_5 = ?, Lat = ?, Lng = ? WHERE id = ?",
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
    }
  );
  res.redirect("/o");
});

// 상세보기
router.get("/:pageId", (req, res) => {
  var pageId = req.params.pageId;
  db.query(
    "SELECT * FROM topic LEFT JOIN user ON topic.user_id = user.id WHERE topic.id = ?",
    [pageId],
    (err, result) => {
      const body = post(result, req, auth);
      const html = template.HTML(body, auth.StatusUI(req, res));
      res.send(html);
    }
  );
});

module.exports = router;

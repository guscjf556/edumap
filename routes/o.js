var express = require("express");
var router = express.Router();
var multer = require("multer");
var template = require("../lib/template.js");
var fs = require("fs");
var db = require("../lib/db");
const mapMaker = require("../lib/mapMaker");
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const path = require('path');

//멀터 설정 어디에 사진파일을 저장할지
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //현철: 임의로 멀터 파일 저장 경로를 수정했습니다. 필요에 맞게 다시 변경 부탁드려요!
    cb(null, `public/images/${req.user.id}/`);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
var upload = multer({ storage: _storage });

// 기본템플릿
var template = require("../lib/template.js");
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
      function cardList(id, title, description, imagePath) {
        return `
          <div>
            <a href="/o/${id}" class="text-decoration-none">
              <div class="card border-0 rounded-lg">
                <img src="../${imagePath}" class="card-img-top w-100" alt="card image cap">
                  <div class="card-body">
                    <h5 class="card-title text-dark font-weight-bolder">${title}</h5>
                    <p class="card-text text-dark">${description}</p>
                  </div>
              </div>
            </a>
          </div>
    `;
      }
      var card_list = '<div class="card-columns my-3">';
      var i = 0;
      while (i < result.length) {
        var o_id = result[i].id;
        var imagePath = result[i].o_image_1;
        var card_o_name = result[i].o_name;
        var description = result[i].description;
        card_list =
          card_list + cardList(o_id, card_o_name, description, imagePath);
        i = i + 1;
      }
      var card_list = card_list + "</div>";
      var html = template.HTML(card_list, auth.StatusUI(req, res));
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
  db.query("SELECT * FROM topic ORDER BY id DESC", function (err, result) {
    const result_string = JSON.stringify(result);
    const card_list = `
    <div class="container" style = "margin-top:20px">
      <div id="card-cols" class="card-columns my-3">
      </div>
    </div>
    <script>
      //브라우저에서 데이터를 조작할 수 있도록 postData 변수 생성
      //예상되는 문제: 데이터가 많아지면 불러와서 변수에 담는 데 시간 소요, 일단 100개만 select하고 필요할 때 새롭게 100개를 받아오는 방식으로 수정 필요할 듯 
      const postData = ${result_string};
      let postCounter = 10
      function cardList(id, title, description, imagePath) {
        return '<div class="shadow-sm"><a href="/o/' + id + '" class="text-decoration-none"><div class="card border-0 rounded-lg"><img src="../' + imagePath + '" class="card-img-top w-100" alt="card image cap"><div class="card-body"><h5 class="card-title text-dark font-weight-bolder">' + title + '</h5><p class="card-text text-dark">' + description + '</p></div></div></a></div>';
      };
      //첫 게시물 일단 10개만 뜨도록(개수는 postCounter로 수정 가능)
      var card_list = '';
      var i = 0;
      while (i < postCounter && postData[i]) {
        var o_id = postData[i].id;
        var imagePath = postData[i].o_image_1;
        var card_o_name = postData[i].o_name;
        var description = postData[i].description;
        card_list = card_list + cardList(o_id, card_o_name, description, imagePath);
        i = i + 1;
      }
      document.getElementById("card-cols").innerHTML = card_list;

      //무한스크롤(스크롤 끝까지 내리면 10개씩 새로 뜨도록)
      window.onscroll = function(){
        if(window.scrollY + document.documentElement.clientHeight === document.documentElement.scrollHeight){
          for(var i = postCounter; i < postCounter + 10; i++){
            if(postData[i]){
              var o_id = postData[i].id;
              var imagePath = postData[i].o_image_1;
              var card_o_name = postData[i].o_name;
              var description = postData[i].description;
              card_list = card_list + cardList(o_id, card_o_name, description, imagePath);
            }
          }
        document.getElementById("card-cols").innerHTML = card_list;
        postCounter += 10;
        }
      }
    </script>
    `;
    var html = template.HTML(card_list, auth.StatusUI(req, res));
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
    const files = await imagemin(
        //현철: 아래 경로도 임의로 수정했습니다.
        [`public/images/${req.user.id}/*.{jpg,png}`],
        {
          destination: `public/images/${req.user.id}`,
          plugins: [imageminMozjpeg({quality: 20}),
          imageminPngquant({quality: [0.3, 0.4]})
          ]
        }
    );
    res.redirect('/o');
  })();
  var images = [];
  for (var i = 1; i < 6; i++) {
    if (req.files[`o_image_${i}`] === undefined) {
      images.push(null);
    } else {
      //현철: 여기도 임의로 경로를 수정했습니다.
      var imagePath = `images/${req.user.id}/${req.files[`o_image_${i}`][0].filename}`
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
    const files = await imagemin(
        [`public/images/${req.user.id}/*.{jpg,png}`],
        {
          destination: `public/images/${req.user.id}`,
          plugins: [imageminMozjpeg({quality: 20}),
          imageminPngquant({quality: [0.3, 0.4]})
          ]
        }
    );
    res.redirect(`/o/${req.body.topic_id}`);
  })();

  //추가되거나 변경된 파일의 경로가 담긴 배열 생성
  var images = [];
  for (var i = 1; i < 6; i++) {
    if (req.files[`o_image_${i}`] == undefined) {
      images.push(null);
    } else {
      var imagePath = `images/${req.user.id}/${req.files[`o_image_${i}`][0].filename}`
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
    "SELECT o_image_1, o_image_2, o_image_3, o_image_4, o_image_5 FROM topic WHERE id = ?",
    [req.body.o_id],
    function (err, result) {
      if (err) throw err;
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
    function (err, result) {
      var str = "";
      var carouselIndicators = "";
      var imageNum = Object.keys(result[0]).length;
      var imageArray = Object.values(result[0]);
      var carouselIndicatorsHowMany = 1;
      for (var i = 5; i < 9; i++) {
        if (imageArray[i] === null) {
          continue;
        } else {
          carouselIndicators =
            carouselIndicators +
            `<li data-target="#carouselPost" data-slide-to="${carouselIndicatorsHowMany}"></li>`;
          carouselIndicatorsHowMany += 1;
          var str =
            str +
            '<div class="carousel-item"' +
            ">" +
            '<img src="../' +
            imageArray[i] +
            '" class="d-block w-100" alt="' +
            i +
            '"' +
            ">" +
            `</div>`;
        }
      }
      var date = result[0].created.toLocaleDateString('ko-KR');
      var koreanDate = ["년 ", "월 "];
      for (var i = 0; i < 2; i++) {
        date = date.replace("-", koreanDate[i]);
      }
      date = date + "일";
      const LatLng = `${result[0].Lat},${result[0].Lng}`;
      var html = template.HTML( 
        `
      <div class="container">
      <h1>${result[0].o_name}</h1>
      <div class="row row-cols-1 row-cols-md-2">
        <div class = "col">
        <div id="carouselPost" class="carousel slide" data-ride="carousel"   >
          <ol class="carousel-indicators">
            <li data-target="#carouselPost" data-slide-to="0" class="active"></li>
            ${carouselIndicators}
          </ol>
            <div class="carousel-inner">
            <div class="carousel-item active"  >
              <img src="../${
                result[0].o_image_1
              }" class="d-block w-100" alt="1">
            </div>
            ${str}
          </div>
          <a class="carousel-control-prev" href="#carouselPost" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
          </a>
          <a class="carousel-control-next" href="#carouselPost" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
          </a>
          </div>
          <h4>${result[0].displayName} <small class="text-muted">${result[0].description}</small></h4>
          <p>${date}</p>
        </div>
        <hr class="d-md-none">
        <div class ="col">
          <div id="mapContainer">
          <h5>관찰 위치</h5>
          ${mapMaker.move(
            "height:10rem;pointer-events: none",
            3,
            `${LatLng}`,
            `{
            content: '<div><a href="/o/${result[0].id}" target = "_blank">${result[0].o_name}</a></div>', 
            latlng: new kakao.maps.LatLng(${result[0].Lat}, ${result[0].Lng})
        }`
          )}
          </div>
          <form action = "/o/update/${pageId}" method = "post">
            <input type = "hidden" class="form-control" id="o_id" name = "o_id"  value = "${pageId}">
            <input type = "${auth.updateHide(req, result)}" class="btn btn-dark" value ="수정하기">
          </form>
        </div>
      </div>
      </div>
      <script>
        if(${result[0].Lat}===0){
        document.querySelector('#mapContainer').style.display="none"
        }
      </script>
    `,
        auth.StatusUI(req, res)
      );
      res.send(html);
    }
  );
});

module.exports = router;

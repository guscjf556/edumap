var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var multer  = require('multer')
var template = require('../lib/template.js');
var fs = require('fs');
var db = require('../lib/db');

//멀터 설정 어디에 사진파일을 저장할지
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/')
  },
  filename: function (req, file, cb) {
    cb(null,Date.now() + '_' + file.originalname)
  }
})
var upload = multer({ storage: _storage })


// 기본템플릿
var template = require('../lib/template.js');
var auth = require('../lib/auth');

//개인별 데이터
router.get('/user', (req, res) => {
  if(!auth.IsOwner(req,res)){
    res.redirect('/o');
    return false;
  }
  db.query('SELECT * FROM topic WHERE topic.user_id = ? ',[req.user.id], function(err, result){
    if(err)throw err;
    function cardList(id,title,description,imagePath){
        return `
            <div class="d-inline-block">
              <a href="/o/${id}">
                <div>
                  <img src="../${imagePath}" alt="card image cap">
                    <div>
                      <h5>${title}</h5>
                      <p>${description}</p>
                    </div>
                </div>
              </a>
            </div>
      `;
      }
    var card_list = '';
      var i = 0;
      while(i < result.length){
        var o_id = result[i].id;
        var imagePath =result[i].o_image_1;
        var card_o_name = result[i].o_name;
        var description = result[i].description;
        card_list = card_list + cardList(o_id, card_o_name,description,imagePath);
        i = i + 1;
      }
      // var card_list = card_list + '</div>';
      var html = template.HTML(card_list, auth.StatusUI(req, res));
      res.send(html);
  });
});

// 카드 및 첫화면
router.get('/', (req, res) => {
    db.query('SELECT * FROM topic', function(err, result){
      function cardList(id,title,description,imagePath){
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
        while(i < result.length){
          var o_id = result[i].id;
          var imagePath =result[i].o_image_1;
          var card_o_name = result[i].o_name;
          var description = result[i].description;
          card_list = card_list + cardList(o_id, card_o_name,description,imagePath);
          i = i + 1;
        }
        var card_list = card_list + '</div>';
        var html = template.HTML(card_list, auth.StatusUI(req, res));
        res.send(html);
    });
  });


  //생성
router.get('/create', (req,res)=>{
  if(!auth.IsOwner(req,res)){
    res.redirect('/o');
    return false;
  }
  const html = template.HTML(template.create(),auth.StatusUI(req, res));
  res.send(html);
});


//생성_과정
let image_array = upload.fields([
  { name: 'o_image_1', maxCount: 1},
  { name: 'o_image_2', maxCount: 1},
  { name: 'o_image_3', maxCount: 1},
  { name: 'o_image_4', maxCount: 1},
  { name: 'o_image_5', maxCount: 1},
])
router.post('/create_process', image_array,function (req, res, next) {
  var images = []
  for(var i = 1; i < 6; i++){
    if (req.files[`o_image_${i}`] == undefined){
      images.push(null);
    }
    else{
      images.push(req.files[`o_image_${i}`][0].path.slice(7))
    }
  }
  db.query('INSERT INTO topic (o_name, description, created, o_image_1, o_image_2, o_image_3, o_image_4, o_image_5, user_id, Lat, Lng) VALUES (?, ?, ?, ?, ?, ? , ? , ?, ?, ?, ?)',
  [req.body.o_name, req.body.o_memo, req.body.o_time, images[0], images[1], images[2], images[3], images[4], req.user.id,  req.body.Lat, req.body.Lng],function(err, result){
    if(err)throw err;
  })

  res.redirect('/o');
})



//  글 수정하기
router.post('/update/:pageId', (req, res) => {
  var pageId = req.params.pageId;
  db.query('SELECT * FROM topic WHERE id=?', [pageId],function(err, result){
      var html =template.HTML(`
      <form action = "/o/update_process" method = "post">
      <div class=search_filter>
        <input type="hidden" name="topic_id" value="${result[0].id}">
        <input type="hidden" name="user_id" value="${result[0].user_id}">
        <span class=search_plant> (식물 이름 선택 필터)</span>
        <sapn class=search_habitat> (서식지 선택 필터)</span>
        <label for="freeName">자유이름: </label>
        <input type="text" id="freeName" name="o_name" placeholder="자유이름" value="${result[0].o_name}" required>
      </div>
      <div class=upload>
        <div class=upload_picture>
        <label for="picture">사진: 이부분은 구현이 안되어있음 이미지 임시저장 및 프론트엔드 작업필요</label>
        <input type="file" id="picture" name="picture" value = "이부분은 현재 구현이 안되어 있습니다.이미지 임시저장이 필요합니다.">
        </div>
        <span class = upload_time>
          <label for="observeTime">관찰시간: </label>
          <input id="observeTime" name ="created" type="datetime-local" value = "${result[0].created}" required>
        </span>
        <span class = upload_location>
          (관찰위치 구현): ㅁㅁ
          <label for="private">비공개</label>
          <input id = "private" name = "private "type="checkbox">
        </span>
      </div>
      <div class = upload_memo> 
      <label for="observeMemo">관찰메모: </label>
      <textarea id="observeMemo" name="description" placeholder="관찰한 내용을 입력하세요.">${result[0].description}</textarea>
      </div>
            <input type="submit" value = "수정하기">
      </form>
      <form action = "/o/delete" method = "post">
        <input type = "hidden" name = "o_id"  value = "${pageId}">
        <input type = "submit" value ="삭제하기">
      </form>

      `,auth.StatusUI(req, res)
      );
      res.send(html);
    });
  })

  // 글 수정하기 process
  router.post('/update_process', (req, res) => {
    var post = req.body;
    var o_name = post.o_name;
    var created = post.created;
    var description = post.description;
    var topic_id = post.topic_id
    db.query('UPDATE topic SET o_name = ? , description = ?,  created = ? WHERE id = ?', [o_name, description, created, topic_id], (err, result) =>{
      if(err)throw err;
      res.redirect(`/o/${topic_id}`);
    })
  });

// 글 삭제하기
router.post('/delete', (req, res) => {
  db.query('SELECT * FROM topic WHERE id = ?',[req.body.o_id],function(err, result){
    if(err)throw err;
    var imageNum = Object.keys(result[0]).length;
    var imageArray = Object.values(result[0])
    for(var i = 4; i < imageNum-1; i ++){
      if(imageArray[i] === null){
        break;
      }
      fs.unlinkSync(`public/${imageArray[i]}`)
      }
    db.query('DELETE FROM topic WHERE id = ?',[req.body.o_id]),function(err, result){
      if(err)throw err;
    }
  });
    res.redirect('/o');
});


// 상세보기
router.get('/:pageId' , (req, res) => {
  var pageId = req.params.pageId;
  db.query('SELECT * FROM topic LEFT JOIN user ON topic.user_id = user.id WHERE topic.id = ?',[pageId],function(err, result){
    var str = ""
    var carouselIndicators=""
    var imageNum = Object.keys(result[0]).length ;
    var imageArray = Object.values(result[0])
    var carouselIndicatorsHowMany = 1;
    for(var i = 5; i < 9; i ++){
      if(imageArray[i] === null){
        continue;
      }
      else {
        carouselIndicators = carouselIndicators + `<li data-target="#carouselPost" data-slide-to="${carouselIndicatorsHowMany}"></li>`
        carouselIndicatorsHowMany += 1;
        var str = str + '<div class="carousel-item"' + '>' +
        '<img src="../'+ imageArray[i]  +'" class="d-block w-100" alt="'+ i + '"' + '>' + 
        `</div>`
      }
    }
    var date = result[0].created.toLocaleDateString();
    var koreanDate = ["년 ", "월 "];
    for(var i = 0; i < 2; i++){
      date = date.replace('-', koreanDate[i]);
    }
    date = date + "일";
    
      var html = template.HTML(`
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
              <img src="../${result[0].o_image_1}" class="d-block w-100" alt="1">
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
        </div>
        <div class ="col">
          <h4>${result[0].displayName} <small class="text-muted">${result[0].description}</small></h4>
          <p>${date}</p>
          <form action = "/o/update/${pageId}" method = "post">
            <input type = "hidden" name = "o_id"  value = "${pageId}">
            <input type = "${auth.updateHide(req,result)}" value ="수정하기">
          </form>
        </div>
      </div>
    `,auth.StatusUI(req, res));
    res.send(html);
    });
  });

  module.exports = router;
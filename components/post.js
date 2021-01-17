const mapMaker = require('../lib/mapMaker');
const comments = require('../components/comments');

const post = (dbQueryResult, commentsData, req, auth) => {
  //debug
  console.log("postComponent: ", commentsData);
  const postId = req.params.postId
  //캐러셀
  let str = "";
  let carouselContainer = ""
  var imageArray = Object.values(dbQueryResult[0]).slice(4, 9);
  for (var i = 0; i < 5; i++) {
    if (imageArray[i] === null) {
      continue;
    } else {
      carouselContainer += `<div class="item"><img src="/${imageArray[i]}"></div>`
    }
  }

  //날짜 형식
  var date = dbQueryResult[0].created.toLocaleDateString('ko-KR');
  var koreanDate = ["년 ", "월 ", "일"];
      for (var i = 0; i < 3; i++) {
        date = date.replace(".", koreanDate[i]);
      }
  const LatLng = `${dbQueryResult[0].Lat},${dbQueryResult[0].Lng}`;

  const render = `
    <div class="container my-3">
    <div class="d-flex justify-content-between">
      <h1>${dbQueryResult[0].o_name}</h1>
      <form action="/o/update/${postId}" method="post">
        <input type="hidden" class="form-control" id="o_id" name="o_id"  value="${postId}">
        <input type="${auth.updateHide(req, dbQueryResult)}" class="btn btn-dark" value="수정하기">
      </form>
    </div>
    <div class="row row-cols-1 row-cols-md-2">
      <div class = "col">
        <div class="owl-carousel owl-theme">
          ${carouselContainer}
        </div>
      </div>
      <br>
    </div>
      <div class ="col">
        <h4>${dbQueryResult[0].displayName} <small class="text-muted">${dbQueryResult[0].description}</small></h4>
        <p>${date}</p>
        <div id="commentWrapper">
        <div id="comments">
          ${comments(commentsData)}
        </div>
        <form class="row"id="form" >
          <textarea class="form-control col-10" id="commentContent" name="commentContent" rows="1"></textarea>
          <input class="form-control d-none" id="submit" type="submit" value="게시">
          <label for="submit" class="form-label col-2 align-middle">게시</label>
        </form>
      </div>
      <br>
        <div id="mapContainer">
        <h5>관찰 위치</h5>
        ${mapMaker.move(
          "height:10rem",
          3,
          `${LatLng}`,
          `{
          content: '<div><a href="/o/${dbQueryResult[0].id}" target = "_blank">${dbQueryResult[0].o_name}</a></div>', 
          latlng: new kakao.maps.LatLng(${dbQueryResult[0].Lat}, ${dbQueryResult[0].Lng})
      }`
        )}
        </div>
      </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>      
      <script>
      !${auth.IsOwner(req)} && document.querySelector('#form').classList.add("d-none");

      $('#form').submit(function(e){
        e.preventDefault();
        $.ajax({
          url: '/o/comment-process/${postId}',
          type: 'post',
          data: $(this).serializeArray(),
          success: function(updatedCommentsData){
            console.log("updatedCommentsData: ", updatedCommentsData);
            let render = "";
            for(let i = 0; i < updatedCommentsData.length; i++){
              render += 
              '<span class="badge badge-dark">' + 
              updatedCommentsData[i].displayName +
              '</span> ' + 
              '<span>' +
              updatedCommentsData[i].Content +                
              '</span><br>' +
              '<span><small>' +
              updatedCommentsData[i].Created.toLocaleString("ko-KR") +
              '</small></span><br>'                
            };
            //debug
            console.log("commentsComponentsRender: ", render);
            $('#comments').html(render);
            $('#commentContent').html("");
          },
        });
      });
    <!-- owl.carousel 작동 코드 -->
    //<script src="/jquery/jquery.min.js"></script>
    <script src="/owlcarousel/owl.carousel.min.js"></script>
    <script>
    $('.owl-carousel').owlCarousel({
      items: 1,
      loop:false,
      margin:10,
      nav:true,
    })
    </script>
    <script>
      if(${dbQueryResult[0].Lat}==="0"){
      document.querySelector('#mapContainer').style.display="none"
      }
    </script>
  `

  return render
};

module.exports = post;


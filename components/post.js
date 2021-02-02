const mapMaker = require('../lib/mapMaker');
const comments = require('../components/comments');

const post = (postData, commentsData, req) => {
  const postId = req.params.postId
  //캐러셀
  let str = "";
  let carouselContainer = ""
  var imageArray = Object.values(postData).slice(4, 9);
  for (var i = 0; i < 5; i++) {
    if (imageArray[i] === null) {
      continue;
    } else {
      carouselContainer += `<div class="item"><img src="/${imageArray[i]}"></div>`
    }
  }

  //날짜 형식
  var date = postData.created.toLocaleDateString('ko-KR');
  var koreanDate = ["년 ", "월 ", "일"];
      for (var i = 0; i < 3; i++) {
        date = date.replace(".", koreanDate[i]);
      }
  const LatLng = `${postData.Lat},${postData.Lng}`;

  let buttonType = ""
  if(req.user?.userID === postData.userID){
    buttonType = "submit";
  }
  else{
    buttonType = "hidden";
  }

  const render = `
    <div class="container my-3">
      <div class="row row-cols-1 row-cols-md-2">
        <div class = "col my-3">
          <div class="d-flex justify-content-between">
            <h1>${postData.o_name}</h1>
            <form action="/o/update/${postId}" method="post">
              <input type="hidden" class="form-control" id="o_id" name="o_id"  value="${postId}">
              <input type="${buttonType}" class="btn btn-dark" value="수정하기">
            </form>
          </div>
          <div class="owl-carousel owl-theme">
            ${carouselContainer}
          </div>
          <div class="mt-3">
            <h4>${postData.displayName} <small class="text-muted">${postData.description}</small></h4>
            <p>${date}</p>
          </div>
          <div id="commentWrapper">
            <h5>댓글</h5>
            <div id="comments">
              ${comments(commentsData, req)}
            </div>
          </div>
        </div>
        <div class="col">
          <div id="mapContainer">
          <h5>관찰 위치</h5>
          ${mapMaker.move(
            "height:10rem",
            3,
            `${LatLng}`,
            `{
            content: '<div><a href="/o/post/${postData.id}" target = "_blank">${postData.o_name}</a></div>', 
            latlng: new kakao.maps.LatLng(${postData.Lat}, ${postData.Lng})
            }`
          )}
          </div>
        </div>
      </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>      
    <!-- owl.carousel 작동 코드 -->
    <script src="/owlcarousel/owl.carousel.min.js"></script>
    <script>
    $('.owl-carousel').owlCarousel({
      items: 1,
      loop:false,
      margin:10,
      nav:true,
    })

    if(${postData.Lat}=="0"){
    document.querySelector('#mapContainer').style.display="none"
    }
    </script>
  `

  return render
};

module.exports = post;


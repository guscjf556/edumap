const { query } = require("../lib/db");

module.exports = {
  HTML: function (
    body,
    authStatusUI = '<li class="nav-item" ><a id="loginCheck" class="nav-link text-dark" href="/u/login">로그인</a></li> <li class="nav-item"><a class="nav-link" href="/u/register">회원가입</a></li>'
  ) {
    return ` 
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
        <link href='https://fonts.googleapis.com/css?family=Nanum Gothic' rel='stylesheet' type='text/css'>
        <link href='https://fonts.googleapis.com/css?family=Arvo' rel='stylesheet' type='text/css'>
        <link href='https://fonts.googleapis.com/css?family=Do Hyeon' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href="/stylesheets/layout.css">
        <link rel="stylesheet" href="/owlcarousel/assets/owl.carousel.min.css" />
        <link rel="stylesheet" href="/owlcarousel/assets/owl.theme.default.min.css" />
        <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>      
        <title>edumap</title>
        <style>
        </style>
      </head>
      <body class="bg-light">
        <nav class="navbar navbar-expand-lg navbar-dark bg-success">
          <div class="container">
            <a class="navbar-brand" href="/o" style="font-family:Arvo"><img src="/icon/plant_image.png" style="width:2rem;heigth:2rem"> edumap</a>
            <button type="button" class="btn btn-sm btn-primary d-inline-block fw-bolder" onclick="showModal();">
            <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" fill="currentColor" class="bi bi-plus text-light" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
            관찰올리기
            </button>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavDropdown">
              <ul class="navbar-nav">
                <li class="nav-item">
                  <a class="nav-link" href="/o">식물관찰<span class="sr-only">(current)</span> </a>
                </li>
                <li class="nav-item" >
                  <a class="nav-link" href="/map">지도</a>
                </li>
                ${authStatusUI}
              </ul>
            </div>
          </div>
        </nav>
          ${body}
      <!-- 모달 컴포넌트 -->
      <div class="modal fade" id="myModal" role="dialog" tabindex="-1">
        <div class="modal-dialog  modal-dialog-centered">
          <div class="modal-content text-center">
            <div class="modal-header">
              <h5 class="modal-title">관찰 기록하기</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <p>로그인이 필요한 기능입니다.<br>로그인하시겠습니까?</p>
            </div>
            <div class="modal-footer">
              <a href="/o/create" class="btn btn-sm btn-success">로그인</a>
              <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">취소</button>
            </div>
          </div>
        </div>
      </div> 
      <script>
      function showModal(){
        var loginCheck = document.getElementById('loginCheck').innerText;
        if(loginCheck === "로그인"){
          $('#myModal').modal('show')
        }
        else{
          window.location.href = "/o/create"
        }
      };

      $(() => {
        const navbarProjectList = document.getElementById('navbarProjectList');
        const userId = navbarProjectList.firstElementChild.id;
        $.ajax({
          url: '/o/get-navbar-project-list-process/' + userId,
          data: {userId: userId},
          type: 'post',
          success: function(data){
            if(data){
              $('#navbarProjectList').html(data);
            }
          }
        });
      });
      </script>
        <!-- 여기는 bootstrap-->
      <script src="https://cdn.jsdelivr.net/npm/bs-custom-file-input/dist/bs-custom-file-input.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script>
      </body>
      </html>
    `;
  },

  //create
  create: function (projectsIJoined) {
    function imageFormMaker() {
      var imageForms = "";
      var categories = ["전체<small class='badge badge-success'>필수</small>", "잎", "꽃", "줄기", "열매"];
      imageForms += `
        <div>
            <div class="col text-center">
              <input type="file" class="form-control-file d-none" id="o_image_${1}" name="o_image_${1}" accept="image/*" onchange="image${1}();" required>
              <label for="o_image_${1}"><img id="imageResult${1}" src="/data/photoUploadRequired.png" alt="" class="img-fluid img-thumbnail d-block" style="max-width:150px;max-height:150px;image-orientation: from-image;">${
        categories[0]
      }</label>
            </div>
          </div>
        `;
      for (var i = 2; i < 6; i++) {
        imageForms += `
          <div>
            <div class="col text-center">
              <input type="file" class="form-control-file d-none" id="o_image_${i}" name="o_image_${i}" accept="image/*" onchange="image${i}();" >
              <label for="o_image_${i}"><img id="imageResult${i}" src="/data/photoUpload.png" alt="" class="img-fluid img-thumbnail d-block" style="max-width:150px;max-height:150px;image-orientation: from-image;">${
          categories[i - 1]
        }</label>
            </div>
          </div>
          `;
      }
      return imageForms;
    }

    function previewJS() {
      var previewBlocks = "";
      for (var i = 1; i < 6; i++) {
        previewBlocks += `
          function image${i}(){
            var image = document.querySelector('#o_image_${i}');
            var reader = new FileReader();
            var imageContainer = document.getElementById('imageResult${i}')
            reader.onload = function(e) {
              imageContainer.src = e.target.result;
            }
            reader.readAsDataURL(image.files[0]);
          }
          `;
      }
      return previewBlocks;
    }

    const selectFormMaker = (projectsIJoined) => {
      let render = `
      <select class="form-select" name="project_id" aria-label="Default select example">
        <option value="0" selected>프로젝트 선택 안함</option>
      `
      if(projectsIJoined){
        for(const project of projectsIJoined){
          render += `
          <option value="${project.project_id}">${project.project_title}</option>
          `
        } 
      }

      render += `
      </select>
      `

      return render;
    }

    return `
      <div class="container mt-5">
      <div class="card mx-auto w-80">
      <div class="card-body">
        <h4 class="card-title text-bold">관찰 정보</h4>
        <div class="card-text">
          <form action = "/o/create_process" id="form" method = "post" enctype="multipart/form-data">
            <div class="form-group">
              <label for="project_title" class="text-success">프로젝트 선택</label>
              ${selectFormMaker(projectsIJoined)}
              <small id="o_name_help" class="form-text text-muted">관찰을 올릴 프로젝트를 선택해주세요(필수X)</small>
            </div>
            <div class="form-group">
              <label for="o_name" class="text-success">나무 이름</label>
              <input type="text" class="form-control" id="o_name" name="o_name" placeholder="자유이름" aria-describedby="o_name_help" required>
              <small id="o_name_help" class="form-text text-muted">발견한 식물의 이름을 자유롭게 적어주세요.</small>
            </div>
            <h6 class="text-success">식물 사진</h6>
            <div class="container">
              <div class="row d-flex justify-content-around">
              ${imageFormMaker()}
              </div>
            </div>
            <div class="row row-cols-1 row-cols-lg-2">
            <div class="col">
            <div class="form-group">
              <label for="o_time" class="text-success">관찰 날짜/시각</label>
              <input type="datetime-local" class="form-control" id="o_time" name="o_time" aria-describedby="o_time_help" value="" required>
              <small id="o_time_help" class="form-text text-muted" >식물을 발견한 날짜와 시각을 입력하세요.</small>
            </div>
            </div>
            <div class="col">
            <div class="mb-3">
              <p class="text-success">관찰 위치<p>
              <div id="map" class="shadow w-100" style="height:300px;"></div>
            </div>
            </div>
            </div>
            <div class="form-group">
              <label for="o_memo" class="text-success">관찰 메모</label>
              <textarea class="form-control" id="o_memo" name="o_memo" placeholder="메모" rows="3" aria-describedby="o_memo_help"></textarea>
              <small id="o_memo_help" class="form-textarea">식물을 관찰한 내용을 자유롭게 적으세요.</small>
            </div>
            <!--요거 위도와 경도는 숨겨야함!!-->
            <div style="display:none">
            <div><input type="text" id="Lat" name="Lat" value='0' ></div>
            <div><input type="text" id="Lng" name="Lng" value='0' ></div>
            </div>
            <button type="submit" class="btn btn-success w-100 d-block">올리기</button>
          </form>
        </div>
      </div>
    </div>
    <!-- 로딩 모달 -->
    <div id="loaderModal" class="modal fade" role="dialog" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-center">
        서버 업로드 중입니다. 잠시만 기다려 주세요(1분 이내)
          <div class="modal-body d-flex justify-content-center">
            <div class="spinner-grow text-primary"></div> 
            <div class="spinner-grow text-success"></div> 
            <div class="spinner-grow text-info"></div> 
            <div class="spinner-grow text-warning"></div> 
            <div class="spinner-grow text-danger"></div> 
            <div class="spinner-grow text-secondary"></div> 
            <div class="spinner-grow text-dark"></div> 
          </div>
        </div>
      </div>
    </div>
      <script>
        ${previewJS()}
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().substring(0, 16);
        document.getElementById('o_time').value = localISOTime;
      </script>
      <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=a7fd34e10758c080bae3559c743126f9"></script>
      <script>
      var imageSrc = '../icon/school_plant2.png', // 마커이미지의 주소입니다    
              imageSize = new kakao.maps.Size(30, 30), // 마커이미지의 크기입니다
              imageOption = {offset: new kakao.maps.Point(15, 25)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
              var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
      var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
          mapOption = { 
              center: new kakao.maps.LatLng(36.615622, 127.484948), // 지도의 중심좌표
              level: 3 // 지도의 확대 레벨
          };
  
      var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다
      
      // 지도에 마우스를 올리면 손가락 모양이 뜨게 함    
      map.setCursor('pointer');

      // 지도를 클릭한 위치에 표출할 마커입니다
      var marker = new kakao.maps.Marker({ 
          // 지도 중심좌표에 마커를 생성합니다 
          position: map.getCenter() ,
          image : markerImage
      }); 
      // 지도에 마커를 표시합니다
      marker.setMap(map);
  
      // 지도에 클릭 이벤트를 등록합니다
      // 지도를 클릭하면 마지막 파라미터로 넘어온 함수를 호출합니다
      kakao.maps.event.addListener(map, 'click', function(mouseEvent) {        
          
  
          // 클릭한 위도, 경도 정보를 가져옵니다 
          var latlng = mouseEvent.latLng; 
          
          // 마커 위치를 클릭한 위치로 옮깁니다
          marker.setPosition(latlng);
          
          document.querySelector('#Lat').setAttribute('value', latlng.Ma);
          document.querySelector('#Lng').setAttribute('value', latlng.La);
  
      });
      $('#form').submit(function(e){
        e.preventDefault();
        Document.getElementsByTagName
        $('#loaderModal').modal('show')
        $.ajax({
          url: '/o/create_process',
          type: 'post',
          data: new FormData(this),
          processData: false,
          contentType: false,
          success: function(){
            window.location.replace("/o")
          }
        })
      })
      </script>
    `;
  },

  //revise
  revise: function (postId,queryResult,projectsIJoined) {
    let imgURI = [];
    for(let i = 1; i < 6; i++){
      let img = queryResult[0]["o_image_" + i];
      if(img){
        imgURI.push("/" + img);
      }
      else {
        imgURI.push("/data/photoUpload.png");
      }
    }
    function imageFormMaker() {
      var imageForms = "";
      var categories = ["전체<small class='badge badge-success'>필수</small>", "잎", "꽃", "줄기", "열매"];
      /* imageForms += `
        <div>
            <div class="col text-center">
              <input type="file" class="form-control-file d-none" id="o_image_${1}" name="o_image_${1}" accept="image/*" onchange="image${1}();">
              <label for="o_image_${1}"><img id="imageResult${1}" src="${imgURI[0]}" alt="" class="img-fluid img-thumbnail d-block" style="min-width:150px;height:150px;">${categories[0]}</label>
            </div>
          </div>
        `; */
      for (var i = 1; i < 6; i++) {
        imageForms += `
          <div>
            <div class="col text-center">
              <input type="file" class="form-control-file d-none" id="o_image_${i}" name="o_image_${i}" accept="image/*" onchange="image${i}();" >
              <label for="o_image_${i}"><img id="imageResult${i}" src="${imgURI[i-1]}" class="img-fluid img-thumbnail d-block" style="min-width:150px;height:150px;">${
          categories[i - 1]
        }</label>
            </div>
          </div>
          `;
      }
      return imageForms;
    }
    
    /* function setDefaultUploadImage(){
      let code = "";
      for(let i = 2; i < 6; i++){
        // let imgURI = document.querySelector('#imageResult${i}').src
        code += `
        if(document.querySelector('#imageResult${i}').src === "null"){
          document.querySelector('#imageResult${i}').src = "/data/photoUpload.png"
        }; 
        `
      }
      return code;
    } */
    function previewJS() {
      
      var previewBlocks = "";
      for (var i = 1; i < 6; i++) {
        previewBlocks += `
          function image${i}(){
            var image = document.querySelector('#o_image_${i}');
            var reader = new FileReader();
            var imageContainer = document.getElementById('imageResult${i}')
            reader.onload = function(e) {
              imageContainer.src = e.target.result;
            }
            reader.readAsDataURL(image.files[0]);
          }
          `;
      }
      return previewBlocks;
    }

    const selectFormMaker = (projectsIJoined) => {
      let render = `
      <select class="form-select" name="project_id" aria-label="Default select example">
        <option value="" selected>없음</option>
      `
      if(projectsIJoined){
        for(const project of projectsIJoined){
          render += `
          <option value="${project.project_id}">${project.project_title}</option>
          `
        } 
      }

      render += `
      </select>
      `

      return render;
    }

    return `
      <div class="container mt-5">
      <div class="card mx-auto w-80">
      <div class="card-body">
        <h4 class="card-title text-bold">관찰 정보 수정하기</h4>
        <div class="card-text">
          <form action="/o/update_process" id="form" method="post" enctype="multipart/form-data">
            <input type="hidden" name="topic_id" value="${queryResult[0].id}">
            <div class="form-group">
              <label for="project_title" class="text-success">프로젝트 선택</label>
              ${selectFormMaker(projectsIJoined)}
              <small id="o_name_help" class="form-text text-muted">관찰을 올릴 프로젝트를 선택해주세요(필수X)</small>
            </div>
            <div class="form-group">
              <label for="o_name" class="text-success">나무 이름</label>
              <input type="text" class="form-control" id="o_name" name="o_name" value="${queryResult[0].o_name}" aria-describedby="o_name_help" required>
              <small id="o_name_help" class="form-text text-muted">발견한 식물의 이름을 자유롭게 적어주세요.</small>
            </div>
            <h6 class="text-success">식물 사진</h6>
            <div class="container">
              <div class="row d-flex justify-content-around">
              ${imageFormMaker()}
              </div>
            </div>
            <div class="row row-cols-1 row-cols-lg-2">
              <div class="col">
                <div class="form-group">
                  <label for="o_time" class="text-success">관찰 날짜/시각</label>
                  <input type="datetime-local" class="form-control" id="o_time" name="o_time" value="${queryResult[0].created.toISOString().substring(0, 16)}" aria-describedby="o_time_help" required>
                  <small id="o_time_help" class="form-text text-muted">식물을 발견한 날짜와 시각을 입력하세요.</small>
                </div>
              </div>
              <div class="col">
                <div id = "mapContainer" class="mb-3">
                  <p class="text-success">관찰 위치</p>
                  <div id="map" class="shadow w-100" style="height:300px;"></div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="o_memo" class="text-success">관찰 메모</label>
              <textarea class="form-control" id="o_memo" name="o_memo"  rows="3" aria-describedby="o_memo_help">${queryResult[0].description}</textarea>
              <small id="o_memo_help" class="form-textarea">식물을 관찰한 내용을 자유롭게 적으세요.</small>
            </div>
            <!--요거 위도와 경도는 숨겨야함!!-->
            <div style="display:none">
              <div><input type="text" id="Lat" name="Lat" value='0' ></div>
              <div><input type="text" id="Lng" name="Lng" value='0' ></div>
            </div>
            <input type="submit" class="btn btn-success d-block w-100" value="수정하기">
          </form>
          <!-- 삭제하기 폼 -->
          <form action="/o/delete" method="post">
            <input type="hidden" name="o_id" value = "${postId}">
            <button type="button" class="btn btn-danger btn-sm d-block ml-auto my-3" onclick="showDeleteModal()">삭제하기</button>
            <!-- 삭제하기 경고 모달 -->
            <div class="modal fade" id="modal-deletePost" role="dialog" tabindex="-1">
                <div class="modal-dialog  modal-dialog-centered">
                  <div class="modal-content text-center">
                    <div class="modal-header">
                      <h5 class="modal-title">삭제</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <p>게시물을 삭제하시겠습니까?<br>삭제하면 되돌릴 수 없습니다.</p>
                    </div>
                    <div class="modal-footer">
                      <input type="submit" class="btn btn-sm btn-danger" value="삭제">
                      <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">취소</button>
                    </div>
                  </div>
                </div>
              </div> 
          </form>
        </div>
      </div>
    </div>
    </div>
    <!-- 로딩 모달 -->
    <div id="loaderModal" class="modal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-center">
        서버 업로드 중입니다. 잠시만 기다려 주세요(1분 이내)
          <div class="modal-body d-flex justify-content-center">
            <div class="spinner-grow text-primary"></div> 
            <div class="spinner-grow text-success"></div> 
            <div class="spinner-grow text-info"></div> 
            <div class="spinner-grow text-warning"></div> 
            <div class="spinner-grow text-danger"></div> 
            <div class="spinner-grow text-secondary"></div> 
            <div class="spinner-grow text-dark"></div> 
          </div>
        </div>
      </div>
    </div>
      <script>
        ${previewJS()}
        function showDeleteModal(){
          $('#modal-deletePost').modal('show');
        }
      </script>
      <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=a7fd34e10758c080bae3559c743126f9"></script>
      <script>
      var imageSrc = '/icon/school_plant2.png', // 마커이미지의 주소입니다    
              imageSize = new kakao.maps.Size(30, 30), // 마커이미지의 크기입니다
              imageOption = {offset: new kakao.maps.Point(15, 25)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
              var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
      var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
          mapOption = { 
              center: new kakao.maps.LatLng(36.615622, 127.484948), // 지도의 중심좌표
              level: 3 // 지도의 확대 레벨
          };
  
      var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다
      
      // 지도에 마우스를 올리면 손가락 모양이 뜨게 함    
      map.setCursor('pointer');
  
      // 지도를 클릭한 위치에 표출할 마커입니다
      var marker = new kakao.maps.Marker({ 
          // 지도 중심좌표에 마커를 생성합니다 
          position: new kakao.maps.LatLng(${queryResult[0].Lat}, ${queryResult[0].Lng}),
          image : markerImage
      }); 
      // 지도에 마커를 표시합니다
      marker.setMap(map);
  
      // 지도에 클릭 이벤트를 등록합니다
      // 지도를 클릭하면 마지막 파라미터로 넘어온 함수를 호출합니다
      kakao.maps.event.addListener(map, 'click', function(mouseEvent) {        
          
  
          // 클릭한 위도, 경도 정보를 가져옵니다 
          var latlng = mouseEvent.latLng; 
          
          // 마커 위치를 클릭한 위치로 옮깁니다
          marker.setPosition(latlng);
          
          document.querySelector('#Lat').setAttribute('value', latlng.Ma);
          document.querySelector('#Lng').setAttribute('value', latlng.La);
  
      });
      $('#form').submit(function(e){
        e.preventDefault();
        $('#loaderModal').modal('show')
        $.ajax({
          url: '/o/update_process',
          type: 'post',
          data: new FormData(this),
          processData: false,
          contentType: false,
          success: function(){
            window.location.replace("/o")
          }
        })
      })
    </script>
    `;
  }
};

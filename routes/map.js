var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
const auth = require('../lib/auth');
const db = require('../lib/db');

function mapMarker(result){

  return `<div id="map" style="width:100%;height:700px;"></div>
  <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=a7fd34e10758c080bae3559c743126f9"></script>
  <script>
  var mapContainer = document.getElementById('map'), // 지도를 표시할 div  
      mapOption = { 
          center: new kakao.maps.LatLng(36.61627945400168, 127.48231129764879), // 지도의 중심좌표
          level: 12 // 지도의 확대 레벨
      };


      var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다
   
      // 마커를 표시할 위치와 내용을 가지고 있는 객체 배열입니다 
      var positions = [${result}];
      //마커 이미지
      var imageSrc = '../images/plant_image.png', // 마커이미지의 주소입니다    
        imageSize = new kakao.maps.Size(20, 20), // 마커이미지의 크기입니다
        imageOption = {offset: new kakao.maps.Point(15, 15)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
        var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
      for (var i = 0; i < positions.length; i ++) {
        // 마커를 생성합니다
        var marker = new kakao.maps.Marker({
            map: map, // 마커를 표시할 지도
            position: positions[i].latlng, // 마커의 위치
            image : markerImage
        });
        // 마커에 표시할 인포윈도우를 생성합니다 
        var infowindow = new kakao.maps.InfoWindow({
            content: positions[i].content, // 인포윈도우에 표시할 내용
            removeable : true
        });
        // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
        // 이벤트 리스너로는 클로저를 만들어 등록합니다 
        // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
        var clickStatus = false;
        kakao.maps.event.addListener(marker, 'click', makeOverListener(map, marker, infowindow));
        kakao.maps.event.addListener(map, 'click', makeOutListener(infowindow));
    }
    // 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
    function makeOverListener(map, marker, infowindow) {
        return function() {
            infowindow.open(map, marker);
        };
    }
    // 인포윈도우를 닫는 클로저를 만드는 함수입니다 
    function makeOutListener(infowindow) {
        return function() {
            infowindow.close();
        };
    }
    </script>`
    }
    
    router.get('/', (req,res)=>{
      db.query('SELECT id, o_name, Lat, Lng FROM topic', (err, result)=>{
        if(err)throw err
        console.log(result);
        var position = [];
        for(var i =0; i<result.length; i++){
          if(result[i].Lat===null&&result[i].Lng===null){
            continue;
          }else{
            position.push(
              `{
                content: '<div><a href="/o/${result[i].id}" target = "_blank">${result[i].o_name}</a></div>', 
                latlng: new kakao.maps.LatLng(${result[i].Lat}, ${result[i].Lng})
            }`
            )
          }
        }
        const html = template.HTML(mapMarker(position), auth.StatusUI(req,res))
        res.send(html);
    })

    })

    module.exports = router;   

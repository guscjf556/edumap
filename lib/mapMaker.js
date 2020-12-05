const mapMaker = {
    move : function (size, level,center, result){
        return `<div id="map" style="${size}"></div>
        <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=a7fd34e10758c080bae3559c743126f9"></script>
        <script>
        var mapContainer = document.getElementById('map'), // 지도를 표시할 div  
            mapOption = { 
                center: new kakao.maps.LatLng(${center}), // 지도의 중심좌표
                level: ${level} // 지도의 확대 레벨
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
    },
    static : function (size, level,center){
        return `
        <!-- 이미지 지도를 표시할 div 입니다 -->
        <div id="staticMap" style="${size}"></div>    

        <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=a7fd34e10758c080bae3559c743126f9"></script>
        <script>
        // 이미지 지도에서 마커가 표시될 위치입니다 
        var markerPosition  = new kakao.maps.LatLng(${center}); 

        // 이미지 지도에 표시할 마커입니다
        // 이미지 지도에 표시할 마커는 Object 형태입니다
        var marker = {
            position: markerPosition
        };

        var staticMapContainer  = document.getElementById('staticMap'), // 이미지 지도를 표시할 div  
            staticMapOption = { 
                center: new kakao.maps.LatLng(${center}), // 이미지 지도의 중심좌표
                level: ${level}, // 이미지 지도의 확대 레벨
                marker: marker // 이미지 지도에 표시할 마커 
            };    

        // 이미지 지도를 생성합니다
        var staticMap = new kakao.maps.StaticMap(staticMapContainer, staticMapOption);
        </script>
        `
    }
}
    

    
module.exports = mapMaker;
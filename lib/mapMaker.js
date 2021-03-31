const mapMaker = {
    move : function (size, level,center, result){
        return `
        <div id="map" class="w-100 shadow-sm rounded-lg" style="${size}"></div>
        
        <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=31315423266b80e40912de6b591c6087"></script>
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
            var imageSrc = '/icon/school_plant2.png', // 마커이미지의 주소입니다    
            imageSize = new kakao.maps.Size(40, 40), // 마커이미지의 크기입니다
            imageOption = {offset: new kakao.maps.Point(20, 40)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
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
                    removable : true
                });
                var clickStatus = false;
                kakao.maps.event.addListener(marker, 'click', makeOverListener(map, marker, infowindow));
                kakao.maps.event.addListener(infowindow, 'click', makeOutListener(infowindow));
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
}
    

    
module.exports = mapMaker;
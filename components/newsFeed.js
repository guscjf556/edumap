const newsFeed = (dbQueryResult) => {
  const result_string = JSON.stringify(dbQueryResult);
  const  render = `
  <div class="container my-3">
    <div id="card-cols" class="card-columns my-3"></div>
    <button class="btn btn-outline-dark d-block mx-auto" onclick="loadMore();">더보기</button>
  </div>
  <script>
    //브라우저에서 데이터를 조작할 수 있도록 postData 변수 생성
    //예상되는 문제: 데이터가 많아지면 불러와서 변수에 담는 데 시간 소요, 일단 100개만 select하고 필요할 때 새롭게 100개를 받아오는 방식으로 수정 필요할 듯 
    const postData = ${result_string};
    let postCounter = 10
    function cardList(id, title, description, imagePath) {
      return '<a href="/o/post/' + id + '" class="text-decoration-none"><div class="card border-0 rounded-lg shadow-sm"><img src="/' + imagePath + '" class="card-img-top w-100 img-thumbnail" alt="card image cap"><div class="card-body"><h5 class="card-title text-dark font-weight-bolder">' + title + '</h5><p class="card-text text-dark">' + description + '</p></div></div></a>';
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
    function loadMore(){
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
  </script>
  `;

  return render
}

module.exports = newsFeed;
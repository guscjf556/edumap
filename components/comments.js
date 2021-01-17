const comments = (commentsData) => {
  let render = "";
  for(let i = 0; i < commentsData.length; i++){
    render += `
    <span class="badge badge-dark">${commentsData[i].displayName}</span> 
    <span>${commentsData[i].Content}</span><br>
    <span><small>${commentsData[i].Created.toLocaleString("ko-KR")}</small></span><br>
    `
  }
  //debug
  console.log("commentsComponentsRender: ", render);
  return render;
}

module.exports = comments;
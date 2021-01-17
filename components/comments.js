const comments = (commentsData) => {
  let render = "";
  for(let i = 0; i < commentsData.length; i++){
    render += `<span class="badge badge-dark">${commentsData[i].CommentUserID}</span> <span>${commentsData[i].Content}</span><br>`
  }
  //debug
  console.log("commentsComponentsRender: ", render);
  return render;
}

module.exports = comments;
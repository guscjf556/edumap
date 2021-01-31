const comments = (commentsData, req) => {
  let render = "";
  for(let i = 0; i < commentsData.length; i++){
    render += `
    <div class="row my-1" id="${commentsData[i].comment_id}">
      <div class="col-10">
        <div class="row">
          <div class="col-12">
            <span class="text-break badge badge-pill badge-secondary">${commentsData[i].displayName}</span>
            <span class="text-break">${commentsData[i].Content}</span></div>
          </div>
          <div class="col-12">
            <small class="text-secondary">${commentsData[i].Created.toLocaleString("ko-KR")}</small>
          </div>
        </div>
    `;
    if(req.user && req.user.userID === commentsData[i].CommentUserID){
      render += `
      <div class="col-2">
        <button class="btn btn-sm btn-warning float-right" onclick="deleteComment(this);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      </div>
      `
    };
    render +=`
    </div>
    `;
  };
  render += `
  <script>
    function deleteComment(elem){
      const comment_id = elem.parentNode.parentNode.id;
      $.ajax({
        url: '/o/delete-comment-process/' + comment_id,
        type: 'post',
        success: function(){
          location.reload();
        },
      });
    }
  </script>
  `

  return render;
}

module.exports = comments;
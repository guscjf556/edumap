const profile = (userInfo) => {
  const render = `
  <div class="container">
    <div>내 별명: ${userInfo.displayName}</div>
    <div>
      <form action="/u/nickname-change-process" method="post">
        <input type="text" name="nickname">
        <input type="submit">
      </form>
    </div>
  </div>
  `
  return render
};

module.exports = profile;
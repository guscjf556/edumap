const express = require('express') ;
const app = express();
const port = 3000 ;
const bodyParser = require('body-parser');
const oRouter = require('./routes/o');
const mapRouter = require('./routes/map');
const session = require('express-session');


  
//정적파일, 바디파서, 세션 app에 설치
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'jsdnaskgl',
    resave: false,
    saveUninitialized: true,
    //store : new FileStore,
    cookie : false 
  }));

// passport는 세션이 필요해서 세션밑으로 가야하고 uRouter는 passport가 필요해서 passport 밑으로 가야함 리펙토링
  const passport = require('./lib/passport')(app);
  const uRouter = require('./routes/u')(passport);

  



// 라우터 사용 o --> observation 관찰과 관련된것 묶어놓음
app.use('/o', oRouter);
app.use('/u', uRouter);
app.use('/map', mapRouter);


app.listen(port, () => {});
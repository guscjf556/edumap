var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
const auth = require('../lib/auth');
const db = require('../lib/db');
const mapMarker =require('../lib/mapMaker');



//공용맵
router.get('/', (req,res)=>{
  db.query('SELECT id, o_name, Lat, Lng FROM topic', (err, result)=>{
    if(err)throw err
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
    const html = template.HTML(mapMarker.move('width:100%;height:700px;',12,'36.61627945400168, 127.48231129764879', position), auth.StatusUI(req,res))
    res.send(html);
})
})


//개인지도
router.get('/user', (req,res)=>{
    if(!auth.IsOwner(req,res)){
      res.redirect('/o/notLogin');
      return false;
    }
  db.query('SELECT id, o_name, Lat, Lng FROM topic WHERE user_id = ?',[req.user.id], (err, result)=>{
    if(err)throw err
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
    const html = template.HTML(mapMarker.move('width:100%;height:700px;',12,'36.61627945400168, 127.48231129764879', position), auth.StatusUI(req,res))
    res.send(html);
})
})
    module.exports = router;   

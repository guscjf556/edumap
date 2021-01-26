const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const fs = require('fs');
const path = require('path');


//이거는 예시파일 리펙토링못하고 o.js에 생성과정에 그냥 직접넣었음 나중에 리펙토링 할 수 있으면 리펙토링해야함


const destination = '../compressed-images';
(async() => {
    const files = await imagemin(
        ['../images/*.{jpg,png}'],
        {
          destination: destination,
          plugins: [imageminMozjpeg({quality: 20}),
          imageminPngquant({quality: [0.3, 0.4]})
          ]
        }
    );
      
      fs.readdir(directory, (err, files) => {
          if (err) throw err;
      
          for (const file of files) {
          fs.unlink(path.join(directory, file), err => {
              if (err) throw err;
          });
          }
      });
  })();



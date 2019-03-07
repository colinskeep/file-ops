const part = require('./part.js');
const fs = require('fs');
const path = require('path');
const walk = function(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results)
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk('Z:/CBS Pictures/', function(err, results) {
  if (err) throw err;
  let count = 0;
  for (var i = 0; i < results.length; i++) {
    let stripped = results[i].replace(/-0[0-9].jpg/g,'').replace(/.*\\/,'').replace('.jpg','');
    let fileEnding = results[i].replace(/.*\\/,'');
    if(part.indexOf(stripped) > -1 ){
      //match found -> check if file exists -> create file and move image
      if(!fs.existsSync(`D:/S3 Uploads/${stripped}`)) {
        fs.mkdirSync(`D:/S3 Uploads/${stripped}`, 0744);
        fs.copyFile(results[i], `D:/S3 Uploads/${stripped}/${fileEnding}`, (err) => {
          if (err) throw err;
          console.log(results[i], 'was copied to', `D:/S3 Uploads/${stripped}/${fileEnding}`);
        });
      }
      else if(fs.existsSync(`D:/S3 Uploads/${stripped}`)) {
        fs.copyFile(results[i], `D:/S3 Uploads/${stripped}/${fileEnding}`, (err) => {
          if (err) throw err;
          console.log(results[i], 'was copied to', `D:/S3 Uploads/${stripped}/${fileEnding}`);
        })
      }
    }
    if (i == results.length - 1) {
      console.log('done');
    }
  }
});

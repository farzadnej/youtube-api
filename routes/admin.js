var express = require('express');
var router = express.Router();
var path = require('path');

var json2csv = require('json2csv');
var User = require("../models/user");

var fse = require('fs-extra'); 
var mkdirp = require('mkdirp');



/* GET users listing. */
router.get('/config', function(req, res, next) {
	//res.sendFile('../views/config.html' , { root : __dirname});
	res.sendFile(path.join(__dirname, '../views', 'config.html'));
});

router.get('/stats', function(req, res, next) {
	//res.sendFile('../views/config.html' , { root : __dirname});
	fse.emptyDirSync('temp/csvexport');
	res.sendFile(path.join(__dirname, '../views', 'stats.html'));
});

router.get('/csvfiles', function(req, res, next) {

	/*const dir = '/temp/csvexport'
	fse.ensureDir(dir, err => {
	console.log(err) // => null
  // dir has now been created, including the directory it is to be placed in
})*/


    
	var fields = [
  'row',
  'userID',
  'email',
  'session',
  'video',
  'time',
  'searchTerm',
  'videoUrl',
  'videoDuration',
  'q300Acceptibility',
  'q300Quality',
  'q300Compare',
  'q300Duration',
  'q301Acceptibility',
  'q301Quality',
  'q301Compare',
  'q301Duration',
  'blockAcceptibility',
  'blockQuality',
  'blockqDuration',
  'sessionAcceptibility',
  'sessionQuality',
  'sessionqDuration',
  'ip',
  'date'
	];
	var stats = '';

	User.aggregate(
    [ 
        { "$group": { 
             "_id": null,  
             "all": { "$addToSet": "$username" }
        }
        }
    ],  function(err,results) {
    	//console.log('aggregated',results);
           // Process results

           for(var usn of results[0].all) {
     
           	//console.log('loop',usn);

           	User.find({username:usn}, function (err, user) { 
           		//console.log('user',usn);
        
        if (err) {
        return res.json({success: false, msg: 'could not read user database.'});
      }

      stats = user[0].statistics;
      //console.log(stats);
    

	  var csv = json2csv({ data: stats, fields: fields });
	  const fileam = 'temp/csvexport/'+user[0].username +'.csv';
	  fse.outputFileSync(fileam, csv);

	  //res.set("Content-Disposition", "attachment;filename="+username+".csv");
	  //res.set("Content-Type", "application/octet-stream");
	  //res.send(csv);
    });

           }

          setTimeout(zipFiles, 5000);

          function zipFiles(){

          	res.zip({
        files: [
            { content: 'These files are stats for different users',      //options can refer to [http://archiverjs.com/zip-stream/ZipStream.html#entry](http://archiverjs.com/zip-stream/ZipStream.html#entry) 
                 name: 'meta',
                 mode: 0755,
              comment: 'commentsForStat',
                 date: new Date(),
                 type: 'file' },
            { path: path.join(__dirname, '/../temp/csvexport'), name: 'csvexport' }    //or a folder 
        ],
        filename: 'stats.zip'
    });
          }


        }
);
    
	
});

module.exports = router;

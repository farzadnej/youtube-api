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
		'searchTerm',
        'vidAcceptibility',
        'vidQuality',
        'videoUrl',
        'videoDuration',
        'vidCompare',
        'blockAcceptibility',
        'blockQuality',
        'sessionAcceptibility',
        'sessionQuality',
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
    	console.log('aggregated',results);
           // Process results

           for(var usn of results[0].all) {
     
           	console.log('loop',usn);

           	User.find({username:usn}, function (err, user) { 
           		console.log('user',usn);
        
        if (err) {
        return res.json({success: false, msg: 'could not read user database.'});
      }

      stats = user[0].statistics;
    

	  var csv = json2csv({ data: stats, fields: fields });
	  const fileam = 'temp/csvexport/'+user[0].username +'.csv';
	  fse.outputFile(fileam, csv, err => {
	  console.log(err) // => null
	  console.log('file save',user[0].username + ' saved');

	});

	  //res.set("Content-Disposition", "attachment;filename="+username+".csv");
	  //res.set("Content-Type", "application/octet-stream");
	  //res.send(csv);
    });

           }
        }
);

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






	


	var example =
    [ { 'searchTerm': 'video',
    'vidAcceptibility': '1',
    'vidQuality': '3',
    'videoUrl': 'https://www.youtube.com/watch?v=8tLopqeL9s8',
    'videoDuration': '84',
    'vidCompare': '1',
    'blockAcceptibility': '',
    'blockQuality': '',
    'sessionAcceptibility': '',
    'sessionQuality': '',
    'ip': '',
    'date': '2017-11-05T20:37:02.156Z',
    '_id': '59ff766ee397fb9241516426',
    'row': '1' },
  { 'searchTerm': '',
    'vidAcceptibility': '',
    'vidQuality': '',
    'videoUrl': '',
    'videoDuration': '',
    'vidCompare': '',
    'blockAcceptibility': '',
    'blockQuality': '',
    'sessionAcceptibility': '',
    'sessionQuality': '',
    'ip': '',
    'date': '2017-11-05T20:37:02.166Z',
    '_id': '59ff766ee397fb9241516427',
    'row': '2' }
  
  ];
    
	
});

module.exports = router;

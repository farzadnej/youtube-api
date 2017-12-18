var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Book = require("../models/book");

var csv = require('fast-csv');
var Config = require("../models/config");

'use strict';
const nodemailer = require('nodemailer');


router.post('/signup', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Please pass username and password.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});

router.post('/signin', function(req, res) {
  console.log(req.clientIp);
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.sign(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token, ip: req.clientIp});
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

router.post('/book', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.body);
    var newBook = new Book({
      title: req.body.title
    });

    newBook.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Save book failed.'});
      }
      res.json({success: true, msg: 'Successful created new book.'});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});



router.post('/updateold', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.user);
    //var eybaba = {row:"5", blockQuestionaire:"5PP",vidQuestionaire:'55PP',SessionQuestionaire:'555'};
   //User.findOneAndUpdate({_id:req.user._id, "statistics.row": req.body.statistics.row }, {$push: {"statistics.$": req.body.statistics}}, {new: true, upsert: true}, function (err, user) {
   User.findOneAndUpdate({_id:req.user._id}, {$push: {"statistics": req.body.statistics}}, {new: true, upsert: true}, function (err, user) { 
        
        if (err) {
        return res.json({success: false, msg: 'adding row failed.'});
      }
      res.json({success: true, msg: 'Successfully added row.', user: user});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }

    });






router.put('/updateold', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.user);
    //var eybaba = {row:"5", blockQuestionaire:"5PP",vidQuestionaire:'55PP',SessionQuestionaire:'555'};
   //User.findOneAndUpdate({_id:req.user._id, "statistics.row": req.body.statistics.row }, {$push: {"statistics.$": req.body.statistics}}, {new: true, upsert: true}, function (err, user) {
   // W User.findOneAndUpdate({_id:req.user._id}, {$push: {"statistics": eybaba}}, {new: true, upsert: true}, function (err, user) { 
   //working User.findOneAndUpdate({_id:req.user._id, "statistics.row": eybaba.row}, {$set: {"statistics.$.blockQuestionaire": eybaba.blockQuestionaire}}, {new: true, upsert: true}, function (err, user) { 
    //User.findOneAndUpdate({_id:req.user._id, "statistics.row": eybaba.row}, {$set: {"statistics.$": eybaba}}, {new: true, upsert: true}, function (err, user) {    
     User.findOneAndUpdate({_id:req.user._id, "statistics.row": req.body.statistics.row}, {$set: {"statistics.$": req.body.statistics}}, {new: true, upsert: true}, function (err, user) {   
        if (err) {
        return res.json({success: false, msg: 'user update failed.'});
      }
      res.json({success: true, msg: 'Successfully updated user.', user: user});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }

    });


router.post('/update', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.user);
    User.findOne({_id:req.user._id, "statistics.row": req.body.statistics.row}, {"statistics.row.$": true}, function (err, first) { 
        if (err) {
        return res.json({success: false, msg: 'user update failed.'});
      }
      if (first != null){
        temp = first.statistics;
        bufferAlaki = temp[0];
        buffer = Object.assign(bufferAlaki.toObject(),req.body.statistics);
        User.findOneAndUpdate({_id:req.user._id, "statistics.row": req.body.statistics.row}, {$set: {"statistics.$": buffer}}, {new: true, upsert: true}, function (err, second) {   
        if (err) {
        return res.json({success: false, msg: 'user update failed.'});
      }
      res.json({success: true, msg: 'Successfully updated user.', second: second});
    });

      } else{
        buffer = Object.assign({},req.body.statistics);
        User.findOneAndUpdate({_id:req.user._id}, {$push: {"statistics": req.body.statistics}}, {new: true, upsert: true}, function (err, newRow) { 
        
        if (err) {
        return res.json({success: false, msg: 'adding row failed.'});
      }
      hala = Object.assign({},newRow.toObject());
      res.json({success: true, msg: 'Successfully added row.', newRow: hala});
    });

      }
      });
      //buffer.searchTerm = req.body.statistics.searchTerm;
      /*Object.keys(req.body.statistics).forEach(function(key) {
        var reqHolder = req.body.statistics;
        if (reqHolder[key] !== null) {
          buffer[key] = reqHolder[key];
        }
      });*/
    
     
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }

    });




router.post('/updatePhase', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.user);
    User.findOneAndUpdate({_id:req.user._id}, {$set:{phase:req.body.phase}},function (err, user) { 
        if (err) {
        return res.json({success: false, msg: 'user update failed.'});
      }
      if (user != null){
        //user.phase = req.body.phase;
        res.json({success: true, msg: 'Successfully updated user.', phase: user.phase});
    } 
  });
  }
  else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }

    });


router.get('/getPhase', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log('phase');
    User.findOne({_id:req.user._id}, function (err, user) { 
        if (err) {
          console.log('phase1');
        return res.json({success: false, msg: 'user phase getting failed.'});
      }
      if (user != null){
        console.log('phase2');
        res.json({success: true, msg: 'Successfully got phase.', phase: user.phase});
    } 
  });
  }
  else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }

    });






router.post('/config', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  
  var configFile = req.files.file;

  var configs = [];
    
  csv
   .fromString(configFile.data.toString(), {
     headers: true,
     ignoreEmpty: true
   })
   .on("data", function(data){
     data['_id'] = new mongoose.Types.ObjectId();
     
     configs.push(data);
   })
   .on("end", function(){
     Config.create(configs, function(err, documents) {
      if (err) throw err;
      
      res.send(configs.length + ' video configs have been successfully uploaded.');
     });
   });
});


router.get('/config', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.user);
    Config.find({"email": req.user.username}, function (err, config) {   
        if (err) {
        return res.json({success: false, msg: 'getting config failed.'});
      }
      res.json({success: true, msg: 'Successfully got config.', config: config});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }

    });



router.get('/reset', function(req, res) {


// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'peter.hartoo17@gmail.com',
        pass: 'qwertyuiop9'
    }
});

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Please" <farzad85@yahoo.com>', // sender address
        to: 'farzadn2i@yahoo.com', // list of receivers
        subject: 'time ✔', // Subject line
        text: 'HWhere are you?', // plain text body
        html: '<b>u there?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
});



      res.json('');
});




router.get('/book', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  console.log(token);
  console.log('req', req.user);
  if (token) {
    Book.find(function (err, books) {
      if (err) return next(err);
      //res.send('It worked! User id is: ' + req.user._id + '.');
      res.json(books);
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;

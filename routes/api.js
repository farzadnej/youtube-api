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
var Questionaire = require("../models/questionaire");

'use strict';
const nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');


router.post('/signup', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Please pass username and password.'});
  } else {
    

     Config.find({"email": req.body.username}, function (err, config) {   
        if (err) {
        return res.json({success: false, msg: 'getting config failed when signing up. Try again'});
      }
      if (!config.length){
        return res.json({success: false, msg: 'Your username is not yet set up.'});

      } else {

      var newUser = new User({
      username: req.body.username,
      password: req.body.password,
      experimentStart:config[0]['experimentStart']
    });

      newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.', config: config});
    });
}
    });

    


  }
});

router.post('/signin', function(req, res) {
  //console.log(req.clientIp);
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
          if (user.isInactive) {
            res.status(401).send({success: false, msg: 'User Not eligible for more sessions! You did not complete the 3 sessions/week.'});

          } else if (user.sessionTimes && new Date() - user.sessionTimes[user.sessionTimes.length -1] < 1000 * 24 * 60 * 60){
            res.status(401).send({success: false, msg: 'Not 24 hours passed since your last session.'});
          } else if (user.sessionTimes &&  
            user.sessionTimes.length >= (Math.floor((new Date() - new Date(user.experimentStart +'T00:00:01')) / (1000 * 60 * 60 * 24 * 7)) + 1) * 3 ) {

            res.status(401).send({success: false, msg: 'More than 3 sessions/week is not allowed.'});

          } else {
            // if user is found and password is right create a token
            var token = jwt.sign(user, config.secret);
            // return the information including token as JSON
            res.json({success: true, token: 'JWT ' + token, ip: req.clientIp});
            
          }


          
        } else {
          res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});






router.post('/resetpass', function(req, res) {
  var randID = Math.random().toString();
  User.findOneAndUpdate({username:req.body.username}, {$set:{randID: randID}},function (err, user) { 
        if (err) {
        return res.json({success: false, msg: 'pass reset failed.'});
      }
      if (user != null){
        
        //user.phase = req.body.phase;
        sendResetEmail(randID, req.body.username);
        res.json({success: true, msg: 'Successfully reset password.', password: randID});
    } else {
      res.json({success: false, msg: 'Not allowed to reset password.'});
    }
  });
            });





router.post('/sendSessionEmail', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    //console.log(req.user);
    User.findOne({_id:req.user._id},function (err, user) { 
        if (err) {
        return res.json({success: false, msg: 'session email failed.'});
      }
      if (user != null){
        var remainingSessions = calcSessionsLeft(user);
        sendSessionEmail(remainingSessions, user.username);
        res.json({success: true, msg: 'Successfully sent email.'});
    } 
  });
  }
  else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }

    });



router.post('/updatepass', function(req, res) {
 

  bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return res.json({success: false, msg: 'error creating salt.'});
            }
            bcrypt.hash(req.body.password, salt, null, function (err, hash) {
                if (err) {
                    return res.json({success: false, msg: 'error creating hash.'});
                }
                User.findOneAndUpdate({username:req.body.username, randID: req.body.randID}, {$set:{password:hash}},function (err, user) { 
        if (err) {
        return res.json({success: false, msg: 'user pass update failed.'});
      }
      if (user != null){
        
        //user.phase = req.body.phase;
        res.json({success: true, msg: 'Successfully updated user password.', password: hash});
    } else {
      res.json({success: false, msg: 'Not allowed to change password.'});
    }
  });
            });
        });

});


router.post('/updatePhase', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    //console.log(req.user);
    User.findOneAndUpdate({_id:req.user._id}, {$set:{phase:req.body.phase}, $push: {sessionTimes: new Date() }},function (err, user) { 
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
    //console.log('phase');
    User.findOne({_id:req.user._id}, function (err, user) { 
        if (err) {
          //console.log('phase1');
        return res.json({success: false, msg: 'user phase getting failed.'});
      }
      if (user != null){
        //console.log('phase2');
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
    //console.log(req.user);
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


router.post('/activateuser', function(req, res) {
  User.findOneAndUpdate({username:req.body.username}, {$set:{isInactive: false}},function (err, user) { 
        if (err) {
        return res.json({success: false, msg: 'could not activate user.'});
      }
      if (user != null){
        res.json({success: true, msg: 'Successfully activated user.'});
    } else {
      res.json({success: false, msg: 'No such user.'});
    }
  });
            });





router.post('/questionaire', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  
  var questionFile = req.files.file;

  var questions = [];
    
  csv
   .fromString(questionFile.data.toString(), {
     headers: true,
     ignoreEmpty: true
   })
   .on("data", function(data){
     data['_id'] = new mongoose.Types.ObjectId();
     
     questions.push(data);
   })
   .on("end", function(){
     Questionaire.create(questions, function(err, documents) {
      if (err) throw err;
      
      res.send(questions.length + ' questionaire has been successfully uploaded.');
     });
   });
});


router.get('/questionaire', passport.authenticate('jwt', { session: false}),function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    //console.log(req);
    console.log(req.query.qType);
    Questionaire.find({"qType":req.query.qType}, function (err, questionaires) {   
        if (err) {
        return res.json({success: false, msg: 'getting questionaires failed.'});
      }
      res.json({success: true, msg: 'Successfully got questionaires.', questionaires: questionaires});
    });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }

    });




router.post('/update', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    //console.log(req.user);
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
      //Object.keys(req.body.statistics).forEach(function(key) {
        //var reqHolder = req.body.statistics;
        //if (reqHolder[key] !== null) {
          //buffer[key] = reqHolder[key];
        //}
      //});
    
     
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
        user: 'imlresearchuoft@gmail.com',
        pass: 'Markchignell'
    }
});

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Please" ', // sender address
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
        //console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
});



      res.json('');
});






sendResetEmail = function(randID, to) {


// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'imlresearchuoft@gmail.com',
        pass: 'Markchignell'
    }
});

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"YouTube IML Experiment" <imlresearchuoft@gmail.com>', // sender address
        to: to, // list of receivers
        subject: 'YouTube IML Experiment Password Reset', // Subject line
        text: 'Click:' + 'http://localhost:4200/password-update/'+ randID.toString(), // plain text body
        html: 'Click the link to reset your password: <br>  <a href=' +
        'http://www.imlresearch.com/password-update/'+ randID + '>password reset link</a> <br>  <b>Thanks</b>'// html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        //console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
});
};



calcSessionsLeft = function(user){

  if ((user.sessionTimes.length % 3) !== 0 ){

    var remainingSessions = 3 - (user.sessionTimes.length % 3);
  } else {
    var remainingSessions = 0;
  }
  return remainingSessions        

}

sendSessionEmail = function(remainingSessions, to) {


// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'imlresearchuoft@gmail.com',
        pass: 'Markchignell'
    }
});

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Youtube Experiment" <imlresearchuoft@gmail.com>', // sender address
        to: to, // list of receivers
        subject: 'Session Complete', // Subject line
        text: 'Not important.', // plain text body
        html: '<b>You have completed this session and you would have '+ remainingSessions +
        ' sessions left in this week. <br> You can log back in in 24 hours in order to finish them (if you have sessions left for this week).<br> Thanks.</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        //console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
});
};



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



/*
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
*/

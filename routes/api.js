var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Book = require("../models/book");

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



router.post('/update', passport.authenticate('jwt', { session: false}), function(req, res) {
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






router.put('/update', passport.authenticate('jwt', { session: false}), function(req, res) {
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

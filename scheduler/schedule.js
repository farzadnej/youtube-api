var schedule = require('node-schedule');
var User = require("../models/user");
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'imlresearchuoft@gmail.com',
        pass: 'Markchignell'
    }
});



var monday = schedule.scheduleJob('0 0 6 * * 1', function(){
  console.log('Monday, 6AM!');
  User.find({isInactive: false}, function (err, users) { 

  	users.forEach(function(user){
  		mondayEmail(user.username);
  		console.log(user.username);});
        
  });
});


var wedAndThurs = schedule.scheduleJob('0 0 6 * * 3-4', function(fireDate){
  console.log('Wednesday & Thursday, 6AM!');
  User.find({isInactive: false}, function (err, users) { 

  	users.forEach(function(user){
  		if ((user.sessionTimes.length % 3 ) < 1){
  		wedAndThursEmail(user.username);
  		console.log(user.username);
  		}
  	});
  	

        
  });
});

var FriAndSat = schedule.scheduleJob('0 0 6 * * 5-6', function(fireDate){
  console.log('Friday & Saturday, 6AM!');
  User.find({isInactive: false}, function (err, users) { 

    users.forEach(function(user){
      if ((user.sessionTimes.length % 3 ) < 2){
      FriAndSatEmail(user.username);
      console.log(user.username);
      }
    });
    

        
  });
});

var weekSweep = schedule.scheduleJob('0 1 0 * * 1', function(fireDate){
  console.log('WeekSweep!', fireDate.getHours(), fireDate);
  User.find({isInactive: false}, function (err, users) { 

  	users.forEach(function(user){

  		var experimentStart = new Date(user.experimentStart +'T00:00:01');
        if (fireDate > experimentStart){
        	var NoWeeksPassed = Math.floor((fireDate - experimentStart) / (1000 * 60 * 60 * 24 * 7));
        	console.log(NoWeeksPassed);
        	if (user.sessionTimes.length < NoWeeksPassed * 3){
  			user.isInactive = true;
        excludeEmail(user.username);
  			user.save(function(err){
  				if(err) {
  					console.error('ERROR!');
  				}
  			});
  			console.log(user.username);
  		}


        }
  		
  	});
        
  });
});


function mondayEmail(user){

	nodemailer.createTestAccount((err, account) => {

    // create reusable transporter object using the default SMTP transport
    

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Youtube Experiment" <imlresearchuoft@gmail.com>', // sender address
        to: user, // list of receivers
        subject: 'Reminder ✔', // Subject line
        text: 'you are eligible to start the 3 trials in this week.', // plain text body
        html: '<b>you are eligible to start the 3 trials in this week</b>' // html body
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

}


function wedAndThursEmail(user){

	nodemailer.createTestAccount((err, account) => {

    // create reusable transporter object using the default SMTP transport
    

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Youtube Experiment Reminder" <imlresearchuoft@gmail.com>', // sender address
        to: user, // list of receivers
        subject: 'Reminder ✔', // Subject line
        text: 'This is not important.', // plain text body
        html: 'Hello, <br> <br>This is a reminder that <b>you have not yet completed any session this week. </b> Please make sure you complete it as soon as possible.<br><br><br>Thanks'
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

}

function FriAndSatEmail(user){

  nodemailer.createTestAccount((err, account) => {

    // create reusable transporter object using the default SMTP transport
    

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Youtube Experiment Reminder" <imlresearchuoft@gmail.com>', // sender address
        to: user, // list of receivers
        subject: 'Reminder ✔', // Subject line
        text: 'This is not important.', // plain text body
        html: 'Hello, <br> <br>This is a reminder that <b>you have not yet started your next session. </b> Please make sure you complete it as soon as possible.<br><br><br>Thanks'
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

}


function excludeEmail(user){

  nodemailer.createTestAccount((err, account) => {

    // create reusable transporter object using the default SMTP transport
    

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Youtube Experiment" <imlresearchuoft@gmail.com>', // sender address
        to: user, // list of receivers
        subject: 'Exclusion from Experiment', // Subject line
        text: 'This is not important.', // plain text body
        html: '<b>You did not complete 3 sessions this week, unfortunately you are excluded from the experiment.</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
});

}








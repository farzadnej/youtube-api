var express = require('express');
var router = express.Router();
var path = require('path');

/* GET users listing. */
router.get('/config', function(req, res, next) {
	//res.sendFile('../views/config.html' , { root : __dirname});
	res.sendFile(path.join(__dirname, '../views', 'config.html'));
}


);

module.exports = router;

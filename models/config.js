var mongoose = require('mongoose');

var configSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	userID: {
		type: String,
	},
	email: {
		type: String,
	},
	experimentStart: {
		type: String,
	},
	seqNo: {
		type: String,
	},
	session: {
		type: String,
	},
	block: {
		type: String,
	},
	video: {
		type: String,
	},
	startSessionQuestionaire: {
		type: String,
	},
	sessionQuestionaire: {
		type: String,
	},
	blockQuestionaire: {
		type: String,
	},
	videoQuestionaire: {
		type: String,
	},
	videoState: {
		type: String,
	},
	min: {
		type: String,
	},
	max: {
		type: String,
	},
	R: {
		type: String,
	},
	F1: {
		type: String,
	},
	D1: {
		type: String,
	},
	F2: {
		type: String,
	},
	D2: {
		type: String,
	},
	F3: {
		type: String,
	},
	D3: {
		type: String,
	},
	F4: {
		type: String,
	},
	D4: {
		type: String,
	},
	F5: {
		type: String,
	},
	D5: {
		type: String,
	},
	F6: {
		type: String,
	},
	D6: {
		type: String,
	},
	F7: {
		type: String,
	},
	D7: {
		type: String,
	},
	F8: {
		type: String,
	},
	D8: {
		type: String,
	},
	F9: {
		type: String,
	},
	D9: {
		type: String,
	},
	F10: {
		type: String,
	},
	D10: {
		type: String,
	}

});

var Config = mongoose.model('Config', configSchema);

module.exports = Config;
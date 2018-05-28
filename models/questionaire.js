var mongoose = require('mongoose');

var questionaireSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	qType: {
		type: String,
	},
	qNumber: {
		type: String,
	},
	question: {
		type: String,
	},
	textarea: {
		type: String,
	},
	a: {
		type: String,
	},
	b: {
		type: String,
	},
	c: {
		type: String,
	},
	d: {
		type: String,
	},
	e: {
		type: String,
	}

});

var Questionaire = mongoose.model('Questionaire', questionaireSchema);

module.exports = Questionaire;
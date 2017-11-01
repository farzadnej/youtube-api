var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatSchema = new Schema({
  row: {
    type: String,
    required: true
  },
  vidQuestionaire: {
        type: String,
        default: ""
    },
  blockQuestionaire: {
        type: String,
        default: ""
    },
   SessionQuestionaire: {
        type: String,
        default: ""
    },
    ExperimentQuestionaire: {
        type: String,
        default: ""
    },

    date: { 
    	type: Date,
    	default: Date.now
    }
  
});

module.exports = mongoose.model('Stat', StatSchema);

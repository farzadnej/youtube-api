var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
  username: {
        type: String,
        unique: true,
        required: true
    },
  password: {
        type: String,
        required: true
    },
    randID: {
        type: String,
        default: "1"
    },

  phase: {
        type: String,
        required: true,
        default: "1"
    },
   data: {
        type: String
    },
    statistics: 
    [{
        row: {
            type: String,
            required: true
        },
        userID: {
            type: String,
            default: ""
        },
        email: {
            type: String,
            default: ""
        },
        session: {
            type: String,
            default: ""
        },
        video: {
            type: String,
            default: ""
        },
        time: {
            type: String,
            default: ""
        },
        searchTerm: {
            type: String,
            default: ""
        },
        nextTime: {
            type: String,
            default: ""
        },
        submitTime: {
            type: String,
            default: ""
        },
        focusedUser: {
            type: String,
            default: ""
        },
        quality: {
            type: String,
            default: ""
        },
        q300Acceptibility: {
            type: String,
           default: ""
        },
        q300Quality: {
            type: String,
           default: ""
        },
         q300Compare: {
          type: String,
           default: ""
        },
        q300Duration: {
            type: String,
           default: ""
        },
        q301Acceptibility: {
            type: String,
           default: ""
        },
        q301Quality: {
            type: String,
           default: ""
        },
         q301Compare: {
          type: String,
           default: ""
        },
        q301Duration: {
            type: String,
           default: ""
        },
        videoUrl: {
            type: String,
            default: ""
        },
        videoDuration: {
            type: String,
            default: ""
        },
        blockAcceptibility: {
            type: String,
           default: ""
        },
        blockQuality: {
            type: String,
           default: ""
        },
        blockqDuration: {
            type: String,
           default: ""
        },
        sessionAcceptibility: {
            type: String,
           default: ""
        },
        sessionQuality: {
            type: String,
           default: ""
        },
        sessionqDuration: {
            type: String,
           default: ""
        },
        ip: {
            type: String,
           default: ""
        },
        date: { 
            type: Date,
            default: Date.now
    },
        startQ1: {
            type: String,
           default: ""
        },
        startQ2: {
            type: String,
           default: ""
        },
        startQ3: {
          type: String,
           default: ""
        },
        startQ4: {
          type: String,
           default: ""
        },
        startQ5: {
          type: String,
           default: ""
        },
        startQ6: {
          type: String,
           default: ""
        },
        startQ7: {
          type: String,
           default: ""
        },
        startQ8: {
          type: String,
           default: ""
        },
        startQ9: {
          type: String,
           default: ""
        },
        startQ10: {
          type: String,
           default: ""
        },
        startQduration: {
            type: String,
           default: ""
        },
        videoQ1: {
            type: String,
           default: ""
        },
        videoQ2: {
            type: String,
           default: ""
        },
        videoQ3: {
          type: String,
           default: ""
        },
        videoQ4: {
          type: String,
           default: ""
        },
        videoQ5: {
          type: String,
           default: ""
        },
        videoQ6: {
          type: String,
           default: ""
        },
        videoQ7: {
          type: String,
           default: ""
        },
        videoQ8: {
          type: String,
           default: ""
        },
        videoQ9: {
          type: String,
           default: ""
        },
        videoQ10: {
          type: String,
           default: ""
        },
        videoQduration: {
            type: String,
           default: ""
        },
        blockQ1: {
            type: String,
           default: ""
        },
        blockQ2: {
            type: String,
           default: ""
        },
        blockQ3: {
          type: String,
           default: ""
        },
        blockQ4: {
          type: String,
           default: ""
        },
        blockQ5: {
          type: String,
           default: ""
        },
        blockQ6: {
          type: String,
           default: ""
        },
        blockQ7: {
          type: String,
           default: ""
        },
        blockQ8: {
          type: String,
           default: ""
        },
        blockQ9: {
          type: String,
           default: ""
        },
        blockQ10: {
          type: String,
           default: ""
        },
        blockQduration: {
            type: String,
           default: ""
        },
        sessionQ1: {
            type: String,
           default: ""
        },
        sessionQ2: {
            type: String,
           default: ""
        },
        sessionQ3: {
          type: String,
           default: ""
        },
        sessionQ4: {
          type: String,
           default: ""
        },
        sessionQ5: {
          type: String,
           default: ""
        },
        sessionQ6: {
          type: String,
           default: ""
        },
        sessionQ7: {
          type: String,
           default: ""
        },
        sessionQ8: {
          type: String,
           default: ""
        },
        sessionQ9: {
          type: String,
           default: ""
        },
        sessionQ10: {
          type: String,
           default: ""
        },
        sessionQduration: {
            type: String,
           default: ""
        }
    
    }],
    sessionTimes: [ Date ],

    isInactive: {
        type: Boolean,
        required: true,
        default: false
    },
    experimentStart:{
      type: String,
      required: true
    }


});

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);

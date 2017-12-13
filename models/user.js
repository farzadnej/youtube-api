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
    }
    
    }]

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

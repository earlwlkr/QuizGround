var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    creator: {
        id:             String,
        firstName:      String,
        lastNameName:   String,
        joinDate:       Date,
        avatar:         String
    },
    createdAt:         Date,
    question: {
        type:       String,
        required:   true
    },
    answer:             String,
    imageSource:        String,
    type:               String,
    rating:             Number,
    votes:              Number,
    choices: [{
        content:        String,
        correct:        Boolean,
        imageSource:    String,
        type:           String
    }],
    comments: [{
        content:        String,
        creator: {
            id:         String,
            firstName:      String,
            lastNameName:   String,
            joinDate:       Date,
            avatar:         String
        }
    }]
});

module.exports = mongoose.model('Quiz', schema);

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
    answer: {
        type:       String,
        required:   true
    },
    type:               String,
    rating:             Number,
    votes:              Number,
    options: [{
        content:        String,
        correct:        Boolean,
        type:           String
    }],
    comments: [{
        content:        String,
        creator: {
            id:         String,
            name:       String,
            joinDate:   Date,
            avatar:     String
        }
    }]
});

module.exports = mongoose.model('Quiz', schema);

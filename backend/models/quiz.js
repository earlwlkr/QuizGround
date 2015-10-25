var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/quizground');

var schema = new Schema({
    creator: {
        id:             String,
        name:           String,
        joinDate:       Date,
        avatar:         String
    },
    created_at:         Date,
    question:           String,
    answer:             String,
    type:               String,
    rating:             Number,
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

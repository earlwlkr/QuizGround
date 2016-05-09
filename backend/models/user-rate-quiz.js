var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    userId: String,
    quizId: String,
    rating: String,
    createdAt: Date
});

module.exports = mongoose.model('UserRateQuiz', schema);

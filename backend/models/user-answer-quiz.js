var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    userId: String,
    quizId: String,
    count: Number,
    correct: Boolean,
    question: String,
    userAnswer: String,
    userChoices: [Boolean],
    createdAt: Date
});

module.exports = mongoose.model('UserAnswerQuiz', schema);

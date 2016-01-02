var express = require('express');
var router = express.Router();
var oauth2 = require('../oauth2');

var Quiz = require('../models/quiz');
var User = require('../models/user');

function getQuizFromRequestBody(requestBody, done) {
    var quiz = requestBody;
    // Convert to correct Date format
    if (quiz.createdAt) {
        quiz.createdAt = new Date(quiz.createdAt);
    } else {
        quiz.createdAt = new Date();
    }

    User.findById(quiz.creator.id, function (err, creator) {
        if (err) {
            return done(err, null);
        }

        quiz.creator = creator;
        return done(null, new Quiz(quiz));
    });
}

module.exports = function (io) {
    router.route('/')
        // Get all quizzes.
        .get(function (req, res) {
            Quiz.find(function (err, results) {
                if (err) {
                    return res.status(400).send(err);
                }

                res.json(results);
            });
        })
        // Create a quiz.
        .post(oauth2.isAuthenticated, function (req, res) {
            getQuizFromRequestBody((req.body), function (err, quiz) {
                if (err) {
                    return res.status(400).send(err);
                }

                quiz.save(function (err) {
                    if (err) {
                        return res.status(400).send(err);
                    }
                    var resultQuiz = {
                        _id: quiz._id,
                        question: quiz.question,
                        created_at: quiz.createdAt
                    };
                    io.emit('quizzes:new', resultQuiz);
                    res.json({message: 'Quiz created!'});
                });
            });
        });

    // Routing for /quizzes/:id
    router.route('/:id')
        // Get quiz info by id.
        .get(function (req, res) {
            Quiz.findOne({_id: req.params.id}, function (err, quiz) {
                if (err) {
                    return res.status(400).send(err);
                }
                res.json(quiz);
            });
        })
        // Update quiz info.
        .put(oauth2.isAuthenticated, function (req, res) {
            getQuizFromRequestBody((req.body), function (err, quiz) {
                if (err) {
                    return res.status(400).send(err);
                }

                Quiz.findOneAndUpdate(
                    {_id: req.params.id},
                    quiz,
                    function (err) {
                        if (err) {
                            return res.status(400).send(err);
                        }
                        res.json({message: 'Quiz modified!'});
                    }
                );
            });

        })
        // Delete quiz.
        .delete(oauth2.isAuthenticated, function (req, res) {
            Quiz.findOneAndRemove({_id: req.params.id}, function (err) {
                if (err) {
                    return res.status(400).send(err);
                }
                res.json({message: 'Quiz deleted!'});
            });
        });
    return router;
};
